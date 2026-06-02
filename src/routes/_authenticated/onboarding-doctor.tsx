import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { DOCTOR_QUESTIONS, SPECIALTIES, CORE_FIELDS } from "@/lib/questions";
import { setRoleForUser } from "@/lib/role";

export const Route = createFileRoute("/_authenticated/onboarding-doctor")({
  component: OnboardingDoctor,
});

const COLORS = ["sky", "rose", "violet", "amber", "emerald"];

function OnboardingDoctor() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    full_name: (user?.user_metadata?.full_name as string) ?? "",
    specialty: "General Physician",
    qualifications: "",
    experience_years: "",
    languages: "English",
    clinic_address: "",
    fee: "",
    bio: "",
    avatar_color: "sky",
  });
  const [cores, setCores] = useState<string[]>([]);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [busy, setBusy] = useState(false);

  const toggleCore = (c: string) =>
    setCores((p) => (p.includes(c) ? p.filter((x) => x !== c) : [...p, c]));

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    if (!form.full_name.trim() || !form.specialty) return toast.error("Name and specialty needed");
    setBusy(true);
    await setRoleForUser(user.id, "doctor");
    const { error } = await supabase.from("doctor_profiles").upsert({
      user_id: user.id,
      full_name: form.full_name.trim(),
      specialty: form.specialty,
      qualifications: form.qualifications || null,
      experience_years: parseInt(form.experience_years || "0"),
      languages: form.languages.split(",").map((s) => s.trim()).filter(Boolean),
      clinic_address: form.clinic_address || null,
      fee: form.fee ? parseFloat(form.fee) : null,
      core_fields: cores,
      answers,
      avatar_color: form.avatar_color,
      bio: form.bio || null,
    });
    setBusy(false);
    if (error) return toast.error("Couldn't save", { description: error.message });
    toast.success("Your Doctor Card is live ✨");
    navigate({ to: "/dashboard", replace: true });
  };

  return (
    <div className="mx-auto max-w-3xl px-4 py-10 md:py-14">
      <div className="inline-flex items-center gap-2 rounded-full bg-gradient-ink px-3 py-1 text-xs font-medium text-primary-foreground shadow-petal">Clinical Intelligence Profiling</div>
      <h1 className="mt-4 font-display text-4xl font-semibold text-ink">Build your Doctor Card</h1>
      <p className="mt-2 text-muted-foreground">This is how patients find and match with you.</p>

      <form onSubmit={submit} className="mt-8 space-y-8">
        <section className="rounded-3xl border border-border/60 bg-card p-6 shadow-petal">
          <h2 className="font-display text-lg font-semibold text-ink">About you</h2>
          <div className="mt-4 grid gap-4 md:grid-cols-2">
            <div><Label>Full name</Label><Input className="mt-1.5" value={form.full_name} onChange={(e) => setForm({ ...form, full_name: e.target.value })} required /></div>
            <div><Label>Specialty</Label>
              <select value={form.specialty} onChange={(e) => setForm({ ...form, specialty: e.target.value })} className="mt-1.5 flex h-9 w-full rounded-md border border-input bg-transparent px-3 text-sm shadow-sm">
                {SPECIALTIES.map((s) => <option key={s}>{s}</option>)}
              </select>
            </div>
            <div><Label>Qualifications</Label><Input className="mt-1.5" placeholder="MBBS, MD…" value={form.qualifications} onChange={(e) => setForm({ ...form, qualifications: e.target.value })} /></div>
            <div><Label>Years of experience</Label><Input className="mt-1.5" type="number" value={form.experience_years} onChange={(e) => setForm({ ...form, experience_years: e.target.value })} /></div>
            <div><Label>Languages (comma-separated)</Label><Input className="mt-1.5" value={form.languages} onChange={(e) => setForm({ ...form, languages: e.target.value })} /></div>
            <div><Label>Consultation fee</Label><Input className="mt-1.5" type="number" value={form.fee} onChange={(e) => setForm({ ...form, fee: e.target.value })} /></div>
            <div className="md:col-span-2"><Label>Clinic address</Label><Input className="mt-1.5" value={form.clinic_address} onChange={(e) => setForm({ ...form, clinic_address: e.target.value })} /></div>
            <div className="md:col-span-2"><Label>Short bio</Label><Input className="mt-1.5" value={form.bio} onChange={(e) => setForm({ ...form, bio: e.target.value })} placeholder="A line patients will see on your card" /></div>
            <div className="md:col-span-2">
              <Label>Card accent</Label>
              <div className="mt-2 flex gap-2">
                {COLORS.map((c) => (
                  <button key={c} type="button" onClick={() => setForm({ ...form, avatar_color: c })}
                    className={`h-8 w-8 rounded-full border-2 ${form.avatar_color === c ? "border-ink" : "border-transparent"} bg-${c}-300`} style={{ background: cssFor(c) }} />
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className="rounded-3xl border border-border/60 bg-card p-6 shadow-petal">
          <h2 className="font-display text-lg font-semibold text-ink">Your core fields</h2>
          <div className="mt-3 flex flex-wrap gap-2">
            {CORE_FIELDS.map((c) => {
              const active = cores.includes(c);
              return (
                <button type="button" key={c} onClick={() => toggleCore(c)}
                  className={`rounded-full border px-3 py-1.5 text-sm ${active ? "border-primary bg-primary text-primary-foreground" : "border-border bg-card hover:bg-secondary"}`}>
                  {c}
                </button>
              );
            })}
          </div>
        </section>

        <section className="rounded-3xl border border-border/60 bg-card p-6 shadow-petal">
          <h2 className="font-display text-lg font-semibold text-ink">Your style</h2>
          <div className="mt-4 space-y-5">
            {DOCTOR_QUESTIONS.map((q) => (
              <div key={q.key}>
                <p className="text-sm font-medium text-ink">{q.q}</p>
                <div className="mt-2 flex flex-wrap gap-2">
                  {q.options.map((o) => {
                    const active = answers[q.key] === o.value;
                    return (
                      <button type="button" key={o.value} onClick={() => setAnswers({ ...answers, [q.key]: o.value })}
                        className={`rounded-full border px-3 py-1.5 text-sm ${active ? "border-primary bg-primary text-primary-foreground" : "border-border bg-card hover:bg-secondary"}`}>
                        {o.label}
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </section>

        <Button type="submit" disabled={busy} className="w-full rounded-full bg-gradient-bloom shadow-petal hover:opacity-95">
          {busy ? "Saving…" : "Publish my Doctor Card"}
        </Button>
      </form>
    </div>
  );
}

function cssFor(c: string) {
  const map: Record<string, string> = {
    sky: "linear-gradient(135deg,#bae6fd,#0284c7)",
    rose: "linear-gradient(135deg,#fecdd3,#e11d48)",
    violet: "linear-gradient(135deg,#ddd6fe,#7c3aed)",
    amber: "linear-gradient(135deg,#fde68a,#d97706)",
    emerald: "linear-gradient(135deg,#a7f3d0,#059669)",
  };
  return map[c] || map.sky;
}
