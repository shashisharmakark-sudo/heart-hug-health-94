import { createFileRoute, useParams } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Pill, Bell, Trash2 } from "lucide-react";

export const Route = createFileRoute("/_authenticated/patient/$id")({
  component: PatientDetail,
});

function PatientDetail() {
  const { id } = useParams({ from: "/_authenticated/patient/$id" });
  const { user } = useAuth();
  const [profile, setProfile] = useState<any>(null);
  const [meds, setMeds] = useState<any[]>([]);
  const [rems, setRems] = useState<any[]>([]);
  const [med, setMed] = useState({ name: "", dosage: "", instructions: "" });
  const [rem, setRem] = useState({ title: "", time: "09:00", detail: "" });

  const load = async () => {
    const [{ data: p }, { data: m }, { data: r }] = await Promise.all([
      supabase.from("patient_profiles").select("*").eq("user_id", id).maybeSingle(),
      supabase.from("medicines").select("*").eq("patient_id", id).eq("prescribed_by", user!.id).eq("is_active", true),
      supabase.from("reminders").select("*").eq("patient_id", id).eq("prescribed_by", user!.id).eq("is_active", true),
    ]);
    setProfile(p); setMeds(m ?? []); setRems(r ?? []);
  };

  useEffect(() => { if (user) load(); /* eslint-disable-next-line */ }, [user, id]);

  const addMed = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!med.name.trim() || !user) return;
    const { error } = await supabase.from("medicines").insert({
      user_id: user.id, patient_id: id, prescribed_by: user.id,
      name: med.name, dosage: med.dosage || null, instructions: med.instructions || null,
    });
    if (error) return toast.error("Couldn't prescribe", { description: error.message });
    setMed({ name: "", dosage: "", instructions: "" });
    toast.success("Prescription added");
    load();
  };

  const addRem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!rem.title.trim() || !user) return;
    const { error } = await supabase.from("reminders").insert({
      user_id: user.id, patient_id: id, prescribed_by: user.id,
      title: rem.title, detail: rem.detail || "Take care 🌸",
      time_of_day: `${rem.time}:00`, kind: "medication",
    });
    if (error) return toast.error("Couldn't add reminder", { description: error.message });
    setRem({ title: "", time: "09:00", detail: "" });
    toast.success("Reminder set");
    load();
  };

  if (!profile) return <div className="p-8 text-muted-foreground">Loading…</div>;

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 md:py-12">
      <header className="rounded-3xl border border-border/60 bg-card p-6 shadow-petal">
        <h1 className="font-display text-3xl font-semibold text-ink">{profile.full_name}</h1>
        <p className="mt-1 text-sm text-muted-foreground">{profile.age ? `${profile.age}y · ` : ""}{profile.gender ?? ""} · {profile.phone ?? "no phone"}</p>
        {profile.condition && <p className="mt-3 text-sm"><span className="font-semibold">Condition:</span> {profile.condition}</p>}
        {profile.allergies && <p className="text-sm"><span className="font-semibold">Allergies:</span> {profile.allergies}</p>}
        {profile.emergency_needed && (
          <p className="mt-2 inline-flex items-center gap-1 rounded-full bg-primary px-3 py-1 text-xs font-medium text-primary-foreground">Priority care: {profile.emergency_category}</p>
        )}
      </header>

      <div className="mt-8 grid gap-6 md:grid-cols-2">
        <section className="rounded-3xl border border-border/60 bg-card p-6 shadow-petal">
          <h2 className="font-display text-lg font-semibold text-ink">Prescribe medicine</h2>
          <form onSubmit={addMed} className="mt-3 space-y-3">
            <div><Label>Name</Label><Input className="mt-1" value={med.name} onChange={(e) => setMed({ ...med, name: e.target.value })} required /></div>
            <div><Label>Dosage</Label><Input className="mt-1" value={med.dosage} onChange={(e) => setMed({ ...med, dosage: e.target.value })} placeholder="e.g. 500mg twice daily" /></div>
            <div><Label>Instructions</Label><Input className="mt-1" value={med.instructions} onChange={(e) => setMed({ ...med, instructions: e.target.value })} /></div>
            <Button type="submit" className="w-full rounded-full bg-gradient-bloom shadow-petal">Prescribe</Button>
          </form>
          <div className="mt-5 space-y-2">
            {meds.map((m) => (
              <div key={m.id} className="flex items-start gap-3 rounded-xl border border-border bg-card p-3">
                <Pill className="mt-0.5 h-4 w-4 text-primary" />
                <div className="flex-1"><p className="font-medium text-ink">{m.name}</p>
                  {m.dosage && <p className="text-xs text-muted-foreground">{m.dosage}</p>}
                </div>
                <button onClick={async () => { await supabase.from("medicines").update({ is_active: false }).eq("id", m.id); load(); }}>
                  <Trash2 className="h-4 w-4 text-muted-foreground hover:text-destructive" />
                </button>
              </div>
            ))}
          </div>
        </section>

        <section className="rounded-3xl border border-border/60 bg-card p-6 shadow-petal">
          <h2 className="font-display text-lg font-semibold text-ink">Set a reminder</h2>
          <form onSubmit={addRem} className="mt-3 space-y-3">
            <div><Label>Title</Label><Input className="mt-1" value={rem.title} onChange={(e) => setRem({ ...rem, title: e.target.value })} required /></div>
            <div><Label>Time</Label><Input className="mt-1" type="time" value={rem.time} onChange={(e) => setRem({ ...rem, time: e.target.value })} /></div>
            <div><Label>Detail</Label><Input className="mt-1" value={rem.detail} onChange={(e) => setRem({ ...rem, detail: e.target.value })} /></div>
            <Button type="submit" className="w-full rounded-full bg-gradient-bloom shadow-petal">Add reminder</Button>
          </form>
          <div className="mt-5 space-y-2">
            {rems.map((r) => (
              <div key={r.id} className="flex items-start gap-3 rounded-xl border border-border bg-card p-3">
                <Bell className="mt-0.5 h-4 w-4 text-primary" />
                <div className="flex-1"><p className="font-medium text-ink">{r.title}</p>
                  <p className="text-xs text-muted-foreground">at {r.time_of_day?.slice(0, 5)}</p>
                </div>
                <button onClick={async () => { await supabase.from("reminders").update({ is_active: false }).eq("id", r.id); load(); }}>
                  <Trash2 className="h-4 w-4 text-muted-foreground hover:text-destructive" />
                </button>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
