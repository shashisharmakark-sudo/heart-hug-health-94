import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { Users, AlertCircle } from "lucide-react";

export const Route = createFileRoute("/_authenticated/my-patients")({
  component: MyPatients,
});

function MyPatients() {
  const { user } = useAuth();
  const [rows, setRows] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    (async () => {
      const { data: cons } = await supabase.from("consultations").select("patient_id,status,created_at").eq("doctor_id", user.id);
      const ids = (cons ?? []).map((c) => c.patient_id);
      if (!ids.length) { setRows([]); setLoading(false); return; }
      const { data: profs } = await supabase.from("patient_profiles").select("*").in("user_id", ids);
      setRows((profs ?? []).map((p) => ({ ...p, status: cons?.find((c) => c.patient_id === p.user_id)?.status })));
      setLoading(false);
    })();
  }, [user]);

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 md:py-12">
      <header>
        <h1 className="font-display text-4xl font-semibold text-ink">Your patients</h1>
        <p className="mt-2 text-muted-foreground">Each person, their own care plan.</p>
      </header>

      {loading ? (
        <p className="mt-10 text-muted-foreground">Loading…</p>
      ) : rows.length === 0 ? (
        <div className="mt-10 rounded-2xl border border-dashed border-primary/30 bg-card/60 p-10 text-center">
          <Users className="mx-auto h-6 w-6 text-primary" />
          <p className="mt-3 font-display text-lg text-ink">No patients yet</p>
          <p className="text-sm text-muted-foreground">They'll show up here when they request a consultation.</p>
        </div>
      ) : (
        <div className="mt-6 grid gap-3 md:grid-cols-2">
          {rows.map((p) => (
            <Link to="/patient/$id" params={{ id: p.user_id }} key={p.user_id}
              className="hover-lift rounded-2xl border border-border/60 bg-card p-5 shadow-petal">
              <div className="flex items-start justify-between">
                <div>
                  <p className="font-display text-lg font-semibold text-ink">{p.full_name}</p>
                  <p className="text-sm text-muted-foreground">{p.age ? `${p.age}y · ` : ""}{p.gender ?? ""}</p>
                  {p.condition && <p className="mt-1 text-sm text-ink/80">{p.condition}</p>}
                </div>
                {p.emergency_needed && (
                  <span className="inline-flex items-center gap-1 rounded-full bg-primary px-2 py-0.5 text-[11px] font-medium text-primary-foreground">
                    <AlertCircle className="h-3 w-3" /> Priority
                  </span>
                )}
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
