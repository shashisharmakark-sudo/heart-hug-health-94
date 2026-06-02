import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { matchDoctors } from "@/lib/matching";
import { DoctorCard } from "@/components/DoctorCard";
import { SPECIALTIES } from "@/lib/questions";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/find-doctor")({
  component: FindDoctor,
});

function FindDoctor() {
  const { user } = useAuth();
  const [doctors, setDoctors] = useState<any[]>([]);
  const [patient, setPatient] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [specFilter, setSpecFilter] = useState<string>("All");
  const [minExp, setMinExp] = useState<number>(0);
  const [query, setQuery] = useState("");

  useEffect(() => {
    if (!user) return;
    (async () => {
      const [{ data: docs }, { data: prof }] = await Promise.all([
        supabase.from("doctor_profiles").select("*"),
        supabase.from("patient_profiles").select("*").eq("user_id", user.id).maybeSingle(),
      ]);
      setDoctors(docs ?? []);
      setPatient(prof);
      setLoading(false);
    })();
  }, [user]);

  const results = useMemo(() => {
    const filtered = doctors.filter((d) =>
      (specFilter === "All" || d.specialty === specFilter) &&
      (d.experience_years ?? 0) >= minExp &&
      (!query || d.full_name.toLowerCase().includes(query.toLowerCase()) || d.core_fields?.some((c: string) => c.toLowerCase().includes(query.toLowerCase())))
    );
    return matchDoctors(patient ?? { answers: {} }, filtered);
  }, [doctors, specFilter, minExp, query, patient]);

  const requestConsultation = async (doctorId: string) => {
    if (!user) return;
    const { error } = await supabase.from("consultations").upsert(
      { patient_id: user.id, doctor_id: doctorId },
      { onConflict: "patient_id,doctor_id" }
    );
    if (error) return toast.error("Couldn't request", { description: error.message });
    toast.success("Consultation requested 🌸");
  };

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 md:py-12">
      <header>
        <h1 className="font-display text-4xl font-semibold text-ink">Find your doctor</h1>
        <p className="mt-2 text-muted-foreground">Sorted by how well they match your health map.</p>
      </header>

      <div className="mt-6 flex flex-wrap gap-3 rounded-2xl border border-border/60 bg-card p-4 shadow-petal">
        <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search name or condition…"
          className="flex-1 min-w-[200px] rounded-md border border-input bg-transparent px-3 py-1.5 text-sm" />
        <select value={specFilter} onChange={(e) => setSpecFilter(e.target.value)}
          className="rounded-md border border-input bg-transparent px-3 py-1.5 text-sm">
          <option>All</option>
          {SPECIALTIES.map((s) => <option key={s}>{s}</option>)}
        </select>
        <select value={minExp} onChange={(e) => setMinExp(parseInt(e.target.value))}
          className="rounded-md border border-input bg-transparent px-3 py-1.5 text-sm">
          {[0, 2, 5, 10, 20].map((n) => <option key={n} value={n}>{n}+ years exp</option>)}
        </select>
      </div>

      {loading ? (
        <p className="mt-10 text-muted-foreground">Finding doctors…</p>
      ) : results.length === 0 ? (
        <div className="mt-10 rounded-2xl border border-dashed border-primary/30 bg-card/60 p-10 text-center">
          <p className="font-display text-lg text-ink">No doctors yet</p>
          <p className="text-sm text-muted-foreground">Doctors will appear here as they sign up.</p>
        </div>
      ) : (
        <div className="mt-6 grid gap-5 md:grid-cols-2">
          {results.map((r) => (
            <DoctorCard key={r.doctor.user_id} doc={r.doctor} score={r.score} reasons={r.reasons}
              onAction={() => requestConsultation(r.doctor.user_id)} actionLabel="Request consultation" />
          ))}
        </div>
      )}
    </div>
  );
}
