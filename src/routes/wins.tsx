import { createFileRoute } from "@tanstack/react-router";
import { Sparkles, Heart } from "lucide-react";
import { useReminders } from "@/lib/reminders";

export const Route = createFileRoute("/wins")({
  component: WinsPage,
});

function WinsPage() {
  const { completed, completedToday, total, hydrated } = useReminders();
  if (!hydrated) return <div className="p-8 text-muted-foreground">A moment…</div>;

  return (
    <div className="mx-auto w-full max-w-3xl px-4 py-12 md:px-8">
      <div className="rounded-3xl bg-gradient-bloom p-8 text-center shadow-soft">
        <Sparkles className="mx-auto h-7 w-7 text-primary-foreground" />
        <h1 className="mt-3 font-display text-4xl font-semibold text-primary-foreground">Small wins, big love</h1>
        <p className="mt-2 text-primary-foreground/90">
          {completedToday === 0
            ? "Today is open and waiting — no pressure, no rush."
            : `${completedToday} of ${total} cared for today. That's beautiful.`}
        </p>
      </div>

      <section className="mt-8 space-y-3">
        {completed.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-primary/30 bg-card/60 p-10 text-center">
            <Heart className="mx-auto h-6 w-6 text-primary" fill="currentColor" />
            <p className="mt-3 font-display text-lg text-foreground">Your wins will gather here 🌸</p>
            <p className="mt-1 text-sm text-muted-foreground">
              Tick a reminder when you're ready — we'll cheer for you.
            </p>
          </div>
        ) : (
          completed.map((r) => (
            <div key={r.id} className="flex items-center gap-4 rounded-2xl border border-border/60 bg-card p-4 shadow-petal">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-blossom">
                <Heart className="h-4 w-4 text-primary" fill="currentColor" />
              </div>
              <div className="flex-1">
                <p className="font-medium text-foreground">{r.title}</p>
                <p className="text-xs text-muted-foreground">{r.time} · cared for today</p>
              </div>
              <span className="text-xs font-medium text-primary">✓ done with love</span>
            </div>
          ))
        )}
      </section>
    </div>
  );
}
