import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { PATIENT_QUESTIONS, EMERGENCY_CATEGORIES } from "@/lib/questions";
import { setRoleForUser } from "@/lib/role";

export const Route = createFileRoute("/_authenticated/onboarding-patient")({
  component: OnboardingPatient,
});

function OnboardingPatient() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    full_name: (user?.user_metadata?.full_name as string) ?? "",
    age: "", gender: "", address: "", phone: "",
    condition: "", allergies: "",
    emergency_needed: false, emergency_category: "",
  });
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [busy, setBusy] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    if (!form.full_name.trim()) return toast.error("We need your name 🌸");
    setBusy(true);
    await setRoleForUser(user.id, "patient");
    const { error } = await supabase.from("patient_profiles").upsert({
      user_id: user.id,
      full_name: form.full_name.trim(),
      age: form.age ? parseInt(form.age) : null,
      gender: form.gender || null,
      address: form.address || null,
      phone: form.phone || null,
      condition: form.condition || null,
      allergies: form.allergies || null,
      emergency_needed: form.emergency_needed,
      emergency_category: form.emergency_needed ? form.emergency_category || null : null,
      answers,
    });
    setBusy(false);
    if (error) return toast.error("Couldn't save", { description: error.message });
    toast.success("Your health map is ready 🌸");
    navigate({ to: "/dashboard", replace: true });
  };

  return (
    <div className="mx-auto max-w-3xl px-4 py-10 md:py-14">
      <div className="inline-flex items-center gap-2 rounded-full bg-gradient-blossom px-3 py-1 text-xs font-medium text-ink shadow-petal">Personal Health Mapping</div>
      <h1 className="mt-4 font-display text-4xl font-semibold text-ink">Tell us about you</h1>
      <p className="mt-2 text-muted-foreground">Helps us match you with the doctor who'll truly help.</p>

      <form onSubmit={submit} className="mt-8 space-y-8">
        <section className="rounded-3xl border border-border/60 bg-card p-6 shadow-petal">
          <h2 className="font-display text-lg font-semibold text-ink">Basics</h2>
          <div className="mt-4 grid gap-4 md:grid-cols-2">
            <Field label="Full name" v={form.full_name} on={(v) => setForm({ ...form, full_name: v })} required />
            <Field label="Age" type="number" v={form.age} on={(v) => setForm({ ...form, age: v })} />
            <Select label="Gender" v={form.gender} on={(v) => setForm({ ...form, gender: v })}
              opts={["", "Female", "Male", "Non-binary", "Prefer not to say"]} />
            <Field label="Phone" v={form.phone} on={(v) => setForm({ ...form, phone: v })} />
            <div className="md:col-span-2">
              <Field label="Address" v={form.address} on={(v) => setForm({ ...form, address: v })} />
            </div>
            <div className="md:col-span-2">
              <Field label="Current condition / disease" v={form.condition} on={(v) => setForm({ ...form, condition: v })} placeholder="e.g. diabetes, hypertension, asthma" />
            </div>
            <div className="md:col-span-2">
              <Field label="Allergies (if any)" v={form.allergies} on={(v) => setForm({ ...form, allergies: v })} />
            </div>
          </div>
        </section>

        <section className="rounded-3xl border border-border/60 bg-card p-6 shadow-petal">
          <h2 className="font-display text-lg font-semibold text-ink">A few quick questions</h2>
          <p className="text-sm text-muted-foreground">So our AI can match you with the right doctor.</p>
          <div className="mt-5 space-y-5">
            {PATIENT_QUESTIONS.map((q) => (
              <div key={q.key}>
                <p className="text-sm font-medium text-ink">{q.q}</p>
                <div className="mt-2 flex flex-wrap gap-2">
                  {q.options.map((o) => {
                    const active = answers[q.key] === o.value;
                    return (
                      <button type="button" key={o.value} onClick={() => setAnswers({ ...answers, [q.key]: o.value })}
                        className={`rounded-full border px-3 py-1.5 text-sm transition ${active ? "border-primary bg-primary text-primary-foreground shadow-petal" : "border-border bg-card hover:bg-secondary"}`}>
                        {o.label}
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="rounded-3xl border border-primary/40 bg-gradient-blossom p-6 shadow-sky">
          <h2 className="font-display text-lg font-semibold text-ink">Emergency support</h2>
          <label className="mt-3 flex items-center gap-3 text-sm text-ink">
            <input type="checkbox" checked={form.emergency_needed}
              onChange={(e) => setForm({ ...form, emergency_needed: e.target.checked })}
              className="h-4 w-4 accent-primary" />
            I need priority / emergency care
          </label>
          {form.emergency_needed && (
            <div className="mt-4">
              <p className="text-sm font-medium text-ink">Which best describes you?</p>
              <div className="mt-2 flex flex-wrap gap-2">
                {EMERGENCY_CATEGORIES.map((c) => {
                  const active = form.emergency_category === c.value;
                  return (
                    <button type="button" key={c.value} onClick={() => setForm({ ...form, emergency_category: c.value })}
                      className={`rounded-full border px-3 py-1.5 text-sm transition ${active ? "border-primary bg-primary text-primary-foreground" : "border-border bg-card"}`}>
                      {c.label}
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </section>

        <Button type="submit" disabled={busy} className="w-full rounded-full bg-gradient-bloom shadow-petal hover:opacity-95">
          {busy ? "Saving…" : "Save & continue"}
        </Button>
      </form>
    </div>
  );
}

function Field({ label, v, on, type = "text", required, placeholder }: { label: string; v: string; on: (s: string) => void; type?: string; required?: boolean; placeholder?: string }) {
  return (
    <div>
      <Label>{label}</Label>
      <Input className="mt-1.5" type={type} value={v} onChange={(e) => on(e.target.value)} required={required} placeholder={placeholder} />
    </div>
  );
}
function Select({ label, v, on, opts }: { label: string; v: string; on: (s: string) => void; opts: string[] }) {
  return (
    <div>
      <Label>{label}</Label>
      <select value={v} onChange={(e) => on(e.target.value)} className="mt-1.5 flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm">
        {opts.map((o) => <option key={o} value={o}>{o || "Select…"}</option>)}
      </select>
    </div>
  );
}
