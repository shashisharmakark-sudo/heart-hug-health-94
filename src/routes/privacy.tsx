import { createFileRoute } from "@tanstack/react-router";
import { Shield, Lock, Heart } from "lucide-react";

export const Route = createFileRoute("/privacy")({
  component: PrivacyPage,
});

function PrivacyPage() {
  const items = [
    { icon: Lock, title: "Yours alone", body: "Your reminders are kept on this device. We don't peek, ever." },
    { icon: Shield, title: "No tracking", body: "No analytics, no profiling, no shared health data. Just you and your care." },
    { icon: Heart, title: "Always gentle", body: "If you miss a reminder, we'll never scold. Tomorrow is always a fresh start." },
  ];
  return (
    <div className="mx-auto w-full max-w-3xl px-4 py-12 md:px-8">
      <header className="text-center">
        <h1 className="font-display text-4xl font-semibold text-foreground">Privacy, with care</h1>
        <p className="mt-3 text-muted-foreground">
          Your wellbeing is delicate. We treat your data the same way.
        </p>
      </header>

      <div className="mt-10 grid gap-4">
        {items.map((it) => (
          <div key={it.title} className="flex gap-4 rounded-2xl border border-border/60 bg-card p-5 shadow-petal">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-blossom">
              <it.icon className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h3 className="font-display text-lg font-semibold text-foreground">{it.title}</h3>
              <p className="mt-1 text-sm text-muted-foreground">{it.body}</p>
            </div>
          </div>
        ))}
      </div>

      <p className="mt-10 text-center text-sm text-muted-foreground">
        If you'd ever like to clear your data, you can do it from your browser at any time 💙
      </p>
    </div>
  );
}
