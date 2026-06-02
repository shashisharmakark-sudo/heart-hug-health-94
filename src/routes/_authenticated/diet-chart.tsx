import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { generateDietChart } from "@/lib/diet-chart.functions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Salad, Droplet, Ban, Sparkles } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/diet-chart")({
  component: DietChart,
});

function DietChart() {
  const gen = useServerFn(generateDietChart);
  const [goal, setGoal] = useState("");
  const [chart, setChart] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const run = async () => {
    setLoading(true);
    try {
      const res = await gen({ data: { goal } });
      setChart(res.chart);
    } catch (e: any) {
      toast.error("Couldn't generate", { description: e.message });
    } finally { setLoading(false); }
  };

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 md:py-12">
      <header>
        <div className="inline-flex items-center gap-2 rounded-full bg-gradient-bloom px-3 py-1 text-xs font-medium text-primary-foreground shadow-petal">
          <Sparkles className="h-3.5 w-3.5" /> AI-personalised
        </div>
        <h1 className="mt-3 font-display text-4xl font-semibold text-ink">Your diet chart</h1>
        <p className="mt-2 text-muted-foreground">Built from your profile, condition and current prescriptions.</p>
      </header>

      <div className="mt-6 flex flex-wrap items-end gap-3 rounded-2xl border border-border/60 bg-card p-4 shadow-petal">
        <div className="flex-1 min-w-[220px]">
          <label className="text-sm font-medium text-ink">Specific goal (optional)</label>
          <Input className="mt-1" value={goal} onChange={(e) => setGoal(e.target.value)} placeholder="e.g. lower sugar, build energy" />
        </div>
        <Button onClick={run} disabled={loading} className="rounded-full bg-gradient-bloom shadow-petal">
          {loading ? "Crafting…" : "Generate my chart"}
        </Button>
      </div>

      {chart && (
        <div className="mt-8 space-y-6">
          {chart.summary && (
            <div className="rounded-3xl border border-border/60 bg-gradient-blossom p-5 shadow-petal">
              <p className="font-display text-lg text-ink">{chart.summary}</p>
              {chart.hydration && <p className="mt-2 text-sm text-ink/80"><Droplet className="inline h-4 w-4 mr-1" />{chart.hydration}</p>}
            </div>
          )}

          {chart.meals?.length > 0 && (
            <div className="grid gap-3">
              {chart.meals.map((m: any, i: number) => (
                <div key={i} className="rounded-2xl border border-border/60 bg-card p-5 shadow-petal">
                  <div className="flex items-center gap-2">
                    <Salad className="h-4 w-4 text-primary" />
                    <p className="font-display text-lg font-semibold text-ink">{m.slot}</p>
                  </div>
                  <ul className="mt-2 list-disc pl-6 text-sm text-ink">
                    {(m.items ?? []).map((it: string, j: number) => <li key={j}>{it}</li>)}
                  </ul>
                  {m.why && <p className="mt-2 text-xs text-muted-foreground italic">Why: {m.why}</p>}
                </div>
              ))}
            </div>
          )}

          {chart.avoid?.length > 0 && (
            <div className="rounded-2xl border border-primary/40 bg-card p-5 shadow-petal">
              <p className="font-display font-semibold text-ink"><Ban className="inline h-4 w-4 mr-1 text-primary" /> Avoid</p>
              <div className="mt-2 flex flex-wrap gap-2">
                {chart.avoid.map((a: string) => <span key={a} className="rounded-full bg-secondary px-3 py-1 text-xs text-secondary-foreground">{a}</span>)}
              </div>
            </div>
          )}

          {chart.tips?.length > 0 && (
            <div className="rounded-2xl border border-border/60 bg-gradient-blossom p-5 shadow-petal">
              <p className="font-display font-semibold text-ink">Gentle tips</p>
              <ul className="mt-2 list-disc pl-6 text-sm text-ink">
                {chart.tips.map((t: string, i: number) => <li key={i}>{t}</li>)}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
