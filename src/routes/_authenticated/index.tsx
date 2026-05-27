import { createFileRoute } from "@tanstack/react-router";
import { useMemo } from "react";
import { Sparkles, Heart, Sun } from "lucide-react";
import { ReminderCard } from "@/components/ReminderCard";
import { NotificationPrompt } from "@/components/NotificationPrompt";
import { useReminders, useReminderNotifications, warmGreeting, warmSubline } from "@/lib/reminders";
import { Progress } from "@/components/ui/progress";
import { useAuth } from "@/hooks/use-auth";

export const Route = createFileRoute("/_authenticated/")({
  component: Today,
});

function Today() {
  const { user } = useAuth();
  const { reminders, hydrated, toggleComplete, upcoming, completed, completedToday, total } = useReminders();
  useReminderNotifications(reminders);

  const name = (user?.user_metadata?.full_name as string | undefined)?.split(" ")[0];
  const greeting = useMemo(() => warmGreeting(name), [name]);
  const subline = warmSubline(completedToday, total);
  const pct = total ? Math.round((completedToday / total) * 100) : 0;

  if (!hydrated) return <div className="p-8 text-muted-foreground">Getting your space ready…</div>;

  return (
    <div className="mx-auto w-full max-w-5xl px-4 py-8 md:px-8 md:py-12">
      <section className="overflow-hidden rounded-3xl border border-border/60 bg-card/80 p-6 shadow-soft backdrop-blur md:p-10">
        <div className="flex flex-wrap items-start justify-between gap-6">
          <div className="max-w-xl">
            <div className="inline-flex items-center gap-2 rounded-full bg-gradient-blossom px-3 py-1 text-xs font-medium text-foreground/70 shadow-petal">
              <Sun className="h-3.5 w-3.5" /> Today, gently
            </div>
            <h1 className="mt-4 font-display text-4xl font-semibold text-foreground md:text-5xl">{greeting}</h1>
            <p className="mt-3 text-base text-muted-foreground md:text-lg">{subline}</p>
            <div className="mt-4"><NotificationPrompt /></div>
          </div>
          <div className="w-full max-w-xs rounded-2xl bg-gradient-blossom p-5 shadow-petal">
            <div className="flex items-center justify-between text-sm">
              <span className="flex items-center gap-1.5 font-medium text-foreground">
                <Heart className="h-4 w-4 text-primary" fill="currentColor" /> Today's care
              </span>
              <span className="text-foreground/70">{completedToday}/{total}</span>
            </div>
            <Progress value={pct} className="mt-3 h-2 bg-white/60" />
            <p className="mt-3 text-xs text-foreground/70">
              {pct === 100 ? "All loved on. Rest is part of healing too." : "No pressure — your pace is the right pace."}
            </p>
          </div>
        </div>
      </section>

      <section className="mt-10">
        <header className="mb-4 flex items-center justify-between">
          <h2 className="font-display text-2xl font-semibold text-foreground">Up next</h2>
          <span className="text-sm text-muted-foreground">{upcoming.length} waiting softly</span>
        </header>
        {upcoming.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-primary/30 bg-card/60 p-8 text-center">
            <Sparkles className="mx-auto h-6 w-6 text-primary" />
            <p className="mt-3 font-display text-lg text-foreground">Every reminder cared for today 🌸</p>
            <p className="mt-1 text-sm text-muted-foreground">You showed up. That's the whole thing.</p>
          </div>
        ) : (
          <div className="grid gap-3">
            {upcoming.map((r) => <ReminderCard key={r.id} reminder={r} onToggle={toggleComplete} />)}
          </div>
        )}
      </section>

      {completed.length > 0 && (
        <section className="mt-10">
          <header className="mb-4 flex items-center justify-between">
            <h2 className="font-display text-2xl font-semibold text-foreground">Small wins ✨</h2>
            <span className="text-sm text-muted-foreground">{completed.length} today</span>
          </header>
          <div className="grid gap-3">
            {completed.map((r) => <ReminderCard key={r.id} reminder={r} onToggle={toggleComplete} />)}
          </div>
        </section>
      )}

      <p className="mt-12 text-center text-xs text-muted-foreground">
        Always private, always yours 💙
      </p>
      <span className="hidden">{reminders.length}</span>
    </div>
  );
}
