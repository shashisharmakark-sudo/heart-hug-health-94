import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import {
  ShieldAlert, Heart, Baby, Accessibility, Flower2, AlertTriangle,
  User, Phone, Mail, Sparkles, Check, ChevronRight, ChevronLeft, Save,
  BellRing, Volume2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";

export const Route = createFileRoute("/_authenticated/emergency-care")({
  component: EmergencyCare,
});

type Category = "elder" | "child" | "pregnant" | "emergency";

const CATEGORIES: { value: Category; label: string; desc: string; icon: any; tint: string }[] = [
  { value: "elder",     label: "Elder care",     desc: "Senior with chronic or mobility needs", icon: Accessibility, tint: "from-sky-200 to-blue-200" },
  { value: "child",     label: "Child care",     desc: "Pediatric care for a minor",            icon: Baby,          tint: "from-pink-200 to-rose-200" },
  { value: "pregnant",  label: "Pregnant woman", desc: "Prenatal & high-priority maternal care", icon: Flower2,      tint: "from-fuchsia-200 to-pink-200" },
  { value: "emergency", label: "Emergency patient", desc: "Acute / urgent monitoring needed",   icon: AlertTriangle, tint: "from-rose-200 to-red-200" },
];

const RELATIONS = ["Spouse", "Parent", "Child", "Sibling", "Friend", "Caregiver", "Other"];

function EmergencyCare() {
  const { user } = useAuth();
  const [step, setStep] = useState(0);
  const [busy, setBusy] = useState(false);
  const [enter, setEnter] = useState(false);
  const [form, setForm] = useState({
    category: "" as Category | "",
    blood_group: "",
    conditions: "",
    notes: "",
    guardian_name: "",
    guardian_relation: "",
    guardian_phone: "",
    guardian_email: "",
    secondary_guardian_name: "",
    secondary_guardian_phone: "",
    alert_popups: true,
    alert_sound: true,
  });

  useEffect(() => { setEnter(true); }, []);
  useEffect(() => { setEnter(false); const id = setTimeout(() => setEnter(true), 30); return () => clearTimeout(id); }, [step]);

  // Load existing
  useEffect(() => {
    if (!user) return;
    (async () => {
      const { data } = await (supabase as any).from("emergency_profiles")
        .select("*").eq("user_id", user.id).maybeSingle();
      if (data) setForm((f) => ({ ...f, ...data }));
    })();
  }, [user]);

  const valid0 = !!form.category;
  const valid1 = form.guardian_name.trim().length > 1 && form.guardian_phone.trim().length >= 7;

  const next = () => {
    if (step === 0 && !valid0) return toast.error("Pick a care category 🌸");
    if (step === 1 && !valid1) return toast.error("Guardian name & phone are required");
    setStep((s) => Math.min(3, s + 1));
  };
  const prev = () => setStep((s) => Math.max(0, s - 1));

  const submit = async () => {
    if (!user) return;
    if (!valid0 || !valid1) return toast.error("Please complete required fields");
    setBusy(true);
    const { error } = await (supabase as any).from("emergency_profiles").upsert({
      user_id: user.id,
      ...form,
      category: form.category,
    }, { onConflict: "user_id" });
    setBusy(false);
    if (error) return toast.error("Couldn't save", { description: error.message });
    toast.success("Emergency profile saved — we've got you 💙");
    setStep(3);
  };

  return (
    <div className="relative mx-auto w-full max-w-4xl px-4 py-10 md:py-14">
      {/* Floating decorative blobs */}
      <div className="pointer-events-none absolute -top-10 -left-20 h-72 w-72 rounded-full bg-blossom/40 blur-3xl animate-blob" />
      <div className="pointer-events-none absolute -bottom-20 -right-10 h-72 w-72 rounded-full bg-bloom/20 blur-3xl animate-blob" />

      <header className="relative">
        <span className="inline-flex items-center gap-2 rounded-full bg-gradient-blossom px-3 py-1 text-xs font-medium text-ink shadow-petal animate-floaty">
          <ShieldAlert className="h-3.5 w-3.5" /> Priority care
        </span>
        <h1 className="mt-4 font-display text-4xl font-semibold md:text-5xl">
          <span className="shimmer-text">Emergency care plan</span>
        </h1>
        <p className="mt-2 max-w-2xl text-muted-foreground">
          For elders, children, pregnant women & emergency patients. Add a trusted
          guardian — we'll keep them one tap away on every reminder pop-up.
        </p>

        {/* Step dots */}
        <div className="mt-6 flex items-center gap-2">
          {[0,1,2,3].map((i) => (
            <div key={i} className={`step-dot ${i <= step ? "active" : ""}`} />
          ))}
          <span className="ml-3 text-xs text-muted-foreground">Step {Math.min(step + 1, 4)} of 4</span>
        </div>
      </header>

      <div className={`relative mt-8 rounded-3xl border border-border/60 bg-card/90 p-6 shadow-soft backdrop-blur transition-all duration-500 ${enter ? "opacity-100 translate-y-0" : "opacity-0 translate-y-3"}`}>
        {/* STEP 0 — category */}
        {step === 0 && (
          <section>
            <h2 className="font-display text-xl font-semibold text-ink">Who needs this plan?</h2>
            <p className="mt-1 text-sm text-muted-foreground">We tailor reminders & guardian alerts to this category.</p>
            <div className="mt-5 grid gap-4 sm:grid-cols-2">
              {CATEGORIES.map((c) => {
                const active = form.category === c.value;
                return (
                  <button
                    key={c.value}
                    type="button"
                    onClick={() => setForm({ ...form, category: c.value })}
                    className={`group relative overflow-hidden rounded-2xl border p-5 text-left transition-all hover-lift ${
                      active ? "border-primary bg-gradient-blossom shadow-petal" : "border-border bg-card hover:border-primary/40"
                    }`}
                  >
                    <div className={`absolute -right-6 -top-6 h-24 w-24 rounded-full bg-gradient-to-br ${c.tint} opacity-60 blur-xl transition-transform group-hover:scale-125`} />
                    <div className="relative flex items-start gap-3">
                      <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-bloom text-primary-foreground shadow-petal">
                        <c.icon className="h-5 w-5" />
                      </span>
                      <div>
                        <p className="font-display text-base font-semibold text-ink">{c.label}</p>
                        <p className="mt-0.5 text-xs text-muted-foreground">{c.desc}</p>
                      </div>
                      {active && <Check className="absolute right-0 top-0 h-5 w-5 text-primary" />}
                    </div>
                  </button>
                );
              })}
            </div>
          </section>
        )}

        {/* STEP 1 — guardian */}
        {step === 1 && (
          <section>
            <h2 className="font-display text-xl font-semibold text-ink">Trusted guardian</h2>
            <p className="mt-1 text-sm text-muted-foreground">Their number rides along with every reminder pop-up — one tap to call.</p>

            <div className="mt-5 grid gap-4 md:grid-cols-2">
              <Field icon={User}  label="Full name *" v={form.guardian_name} on={(v) => setForm({ ...form, guardian_name: v })} placeholder="e.g. Aarav Mehta" />
              <Field icon={Phone} label="Phone *"     v={form.guardian_phone} on={(v) => setForm({ ...form, guardian_phone: v })} placeholder="+91…" type="tel" />
              <div>
                <Label className="text-sm">Relation</Label>
                <div className="mt-1.5 flex flex-wrap gap-2">
                  {RELATIONS.map((r) => {
                    const a = form.guardian_relation === r;
                    return (
                      <button key={r} type="button" onClick={() => setForm({ ...form, guardian_relation: r })}
                        className={`rounded-full border px-3 py-1.5 text-xs transition hover-lift ${a ? "border-primary bg-primary text-primary-foreground shadow-petal" : "border-border bg-card hover:bg-secondary"}`}>
                        {r}
                      </button>
                    );
                  })}
                </div>
              </div>
              <Field icon={Mail} label="Email (optional)" v={form.guardian_email} on={(v) => setForm({ ...form, guardian_email: v })} type="email" placeholder="guardian@email.com" />
            </div>

            <div className="mt-6 rounded-2xl border border-dashed border-border/80 bg-secondary/40 p-4">
              <p className="text-xs font-medium text-ink">Backup contact (optional)</p>
              <div className="mt-3 grid gap-4 md:grid-cols-2">
                <Field icon={User}  label="Name"  v={form.secondary_guardian_name}  on={(v) => setForm({ ...form, secondary_guardian_name: v })} />
                <Field icon={Phone} label="Phone" v={form.secondary_guardian_phone} on={(v) => setForm({ ...form, secondary_guardian_phone: v })} type="tel" />
              </div>
            </div>
          </section>
        )}

        {/* STEP 2 — medical + alerts */}
        {step === 2 && (
          <section className="space-y-6">
            <div>
              <h2 className="font-display text-xl font-semibold text-ink">A few medical notes</h2>
              <p className="mt-1 text-sm text-muted-foreground">Optional, but helpful for the doctor & responder.</p>
              <div className="mt-5 grid gap-4 md:grid-cols-2">
                <div>
                  <Label className="text-sm">Blood group</Label>
                  <div className="mt-1.5 flex flex-wrap gap-2">
                    {["A+","A-","B+","B-","AB+","AB-","O+","O-"].map((b) => {
                      const a = form.blood_group === b;
                      return (
                        <button key={b} type="button" onClick={() => setForm({ ...form, blood_group: b })}
                          className={`rounded-full border px-3 py-1.5 text-xs font-medium transition hover-lift ${a ? "border-primary bg-gradient-bloom text-primary-foreground shadow-petal" : "border-border bg-card hover:bg-secondary"}`}>
                          {b}
                        </button>
                      );
                    })}
                  </div>
                </div>
                <Field label="Known conditions" v={form.conditions} on={(v) => setForm({ ...form, conditions: v })} placeholder="e.g. diabetes, asthma" />
                <div className="md:col-span-2">
                  <Field label="Notes for the responder" v={form.notes} on={(v) => setForm({ ...form, notes: v })} placeholder="Allergies, recent meds, anything important…" />
                </div>
              </div>
            </div>

            <div>
              <h2 className="font-display text-xl font-semibold text-ink">Alerts & pop-ups</h2>
              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                <Toggle icon={BellRing} title="In-app pop-ups" desc="Show a gentle modal when a reminder is due."
                  v={form.alert_popups} on={(v) => setForm({ ...form, alert_popups: v })} />
                <Toggle icon={Volume2} title="Soft alert tone" desc="Play a short, calm chime with each pop-up."
                  v={form.alert_sound} on={(v) => setForm({ ...form, alert_sound: v })} />
              </div>
            </div>
          </section>
        )}

        {/* STEP 3 — confirmation */}
        {step === 3 && (
          <section className="text-center">
            <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-3xl bg-gradient-bloom text-primary-foreground shadow-petal animate-pulse-ring">
              <Heart className="h-9 w-9" fill="currentColor" />
            </div>
            <h2 className="mt-5 font-display text-3xl font-semibold text-ink">You're covered 💙</h2>
            <p className="mt-2 text-muted-foreground">
              We'll surface a soft pop-up at every reminder, with <span className="font-semibold text-ink">{form.guardian_name || "your guardian"}</span> one tap away.
            </p>
            <div className="mx-auto mt-6 grid max-w-md gap-2 text-left">
              <Summary k="Category" v={CATEGORIES.find((c) => c.value === form.category)?.label ?? "—"} />
              <Summary k="Guardian" v={`${form.guardian_name}${form.guardian_relation ? ` · ${form.guardian_relation}` : ""}`} />
              <Summary k="Phone" v={form.guardian_phone} />
              {form.blood_group && <Summary k="Blood group" v={form.blood_group} />}
            </div>
            <Button onClick={() => setStep(0)} variant="outline" className="mt-6 rounded-full">
              <Sparkles className="mr-1 h-4 w-4" /> Edit plan
            </Button>
          </section>
        )}

        {/* Nav */}
        {step < 3 && (
          <div className="mt-8 flex items-center justify-between">
            <Button variant="ghost" onClick={prev} disabled={step === 0} className="rounded-full">
              <ChevronLeft className="mr-1 h-4 w-4" /> Back
            </Button>
            {step < 2 ? (
              <Button onClick={next} className="rounded-full bg-gradient-bloom px-5 shadow-petal hover:opacity-95">
                Continue <ChevronRight className="ml-1 h-4 w-4" />
              </Button>
            ) : (
              <Button onClick={submit} disabled={busy} className="rounded-full bg-gradient-bloom px-5 shadow-petal hover:opacity-95">
                <Save className="mr-1 h-4 w-4" /> {busy ? "Saving…" : "Save plan"}
              </Button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

function Field({ label, v, on, type = "text", placeholder, icon: Icon }: { label: string; v: string; on: (s: string) => void; type?: string; placeholder?: string; icon?: any }) {
  return (
    <div>
      <Label className="text-sm">{label}</Label>
      <div className="relative mt-1.5">
        {Icon && <Icon className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />}
        <Input type={type} value={v} onChange={(e) => on(e.target.value)} placeholder={placeholder}
          className={Icon ? "pl-9" : ""} />
      </div>
    </div>
  );
}

function Toggle({ icon: Icon, title, desc, v, on }: { icon: any; title: string; desc: string; v: boolean; on: (b: boolean) => void }) {
  return (
    <button type="button" onClick={() => on(!v)}
      className={`flex items-start gap-3 rounded-2xl border p-4 text-left transition hover-lift ${v ? "border-primary bg-gradient-blossom shadow-petal" : "border-border bg-card"}`}>
      <span className={`flex h-10 w-10 items-center justify-center rounded-xl ${v ? "bg-gradient-bloom text-primary-foreground" : "bg-secondary text-ink"}`}>
        <Icon className="h-5 w-5" />
      </span>
      <div className="flex-1">
        <p className="font-medium text-ink">{title}</p>
        <p className="text-xs text-muted-foreground">{desc}</p>
      </div>
      <span className={`mt-1 h-5 w-9 rounded-full p-0.5 transition ${v ? "bg-primary" : "bg-border"}`}>
        <span className={`block h-4 w-4 rounded-full bg-white shadow transition ${v ? "translate-x-4" : ""}`} />
      </span>
    </button>
  );
}

function Summary({ k, v }: { k: string; v: string }) {
  return (
    <div className="flex items-center justify-between rounded-xl border border-border/60 bg-card px-4 py-2">
      <span className="text-xs uppercase tracking-wider text-muted-foreground">{k}</span>
      <span className="text-sm font-medium text-ink">{v}</span>
    </div>
  );
}
