import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

const inputSchema = z.object({
  goal: z.string().optional(),
});

export const generateDietChart = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) => inputSchema.parse(input))
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;

    const [{ data: profile }, { data: meds }] = await Promise.all([
      supabase.from("patient_profiles").select("*").eq("user_id", userId).maybeSingle(),
      supabase.from("medicines").select("name,dosage,instructions").eq("patient_id", userId).eq("is_active", true),
    ]);

    if (!profile) throw new Error("Complete your patient profile first.");

    const apiKey = process.env.LOVABLE_API_KEY;
    if (!apiKey) throw new Error("AI is not configured.");

    const prompt = `Create a personalised 1-day diet chart for a patient.
Profile:
- Name: ${profile.full_name}
- Age: ${profile.age ?? "n/a"}, Gender: ${profile.gender ?? "n/a"}
- Condition / disease: ${profile.condition ?? "none stated"}
- Allergies: ${profile.allergies ?? "none stated"}
- Goal: ${data.goal ?? "improve overall wellbeing"}
Current medicines:
${(meds ?? []).map((m) => `- ${m.name} ${m.dosage ?? ""} ${m.instructions ?? ""}`).join("\n") || "- none"}

Return STRICT JSON with this shape (no markdown):
{
  "summary": "1-2 sentence overview tailored to the condition",
  "hydration": "daily water target",
  "avoid": ["food1","food2"],
  "meals": [
    {"slot":"Early morning (7am)","items":["..."],"why":"..."},
    {"slot":"Breakfast (8-9am)","items":["..."],"why":"..."},
    {"slot":"Mid-morning (11am)","items":["..."],"why":"..."},
    {"slot":"Lunch (1pm)","items":["..."],"why":"..."},
    {"slot":"Evening (4-5pm)","items":["..."],"why":"..."},
    {"slot":"Dinner (7-8pm)","items":["..."],"why":"..."},
    {"slot":"Before bed (10pm)","items":["..."],"why":"..."}
  ],
  "tips": ["tip1","tip2","tip3"]
}`;

    const res = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${apiKey}` },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: "You are a clinical nutritionist. Always reply with valid JSON only." },
          { role: "user", content: prompt },
        ],
      }),
    });

    if (!res.ok) {
      const text = await res.text();
      throw new Error(`AI error: ${res.status} ${text.slice(0, 200)}`);
    }
    const json = await res.json();
    const content: string = json.choices?.[0]?.message?.content ?? "{}";
    const cleaned = content.replace(/^```json\s*|\s*```$/g, "").trim();
    try {
      return { chart: JSON.parse(cleaned) };
    } catch {
      return { chart: { summary: cleaned, meals: [], tips: [], avoid: [], hydration: "" } };
    }
  });
