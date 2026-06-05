import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { supabaseAdmin } from "@/integrations/supabase/client.server";

const inputSchema = z.object({
  role: z.enum(["patient", "doctor"]),
});

// Assigns the initial role for the authenticated user. Only allows patient/doctor
// (never admin), and only if the user has no role yet — preventing privilege escalation.
export const assignInitialRole = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) => inputSchema.parse(input))
  .handler(async ({ data, context }) => {
    const { userId } = context;

    const { data: existing } = await supabaseAdmin
      .from("user_roles")
      .select("role")
      .eq("user_id", userId)
      .maybeSingle();

    if (existing) {
      return { role: existing.role as "patient" | "doctor", assigned: false };
    }

    const { error } = await supabaseAdmin
      .from("user_roles")
      .insert({ user_id: userId, role: data.role });

    if (error) throw new Error(error.message);
    return { role: data.role, assigned: true };
  });
