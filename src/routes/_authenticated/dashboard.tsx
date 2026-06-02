import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo } from "react";
import { Sparkles, Heart, Sun, Stethoscope, UserRound, Users, Salad, Search } from "lucide-react";
import { ReminderCard } from "@/components/ReminderCard";
import { NotificationPrompt } from "@/components/NotificationPrompt";
import { useReminders, useReminderNotifications, warmGreeting, warmSubline } from "@/lib/reminders";
import { Progress } from "@/components/ui/progress";
import { useAuth } from "@/hooks/use-auth";
import { useRole, setRoleForUser } from "@/lib/role";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/dashboard")({
  component: Dashboard,
});

function Dashboard() {
  const { user } = useAuth();
  const { role, hasProfile, loading, refresh } = useRole();
  const navigate = useNavigate();

  useEffect(() => {
    if (loading || !role) return;
    if (hasProfile === false) {
      navigate({ to: role === "patient" ? "/onboarding-patient" : "/onboarding-doctor", replace: true });
    }
  }, [loading, role, hasProfile, navigate]);

  if (loading) return <div className="p-8 text-muted-foreground">Loading your space…</div>;

  if (!role) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-12">
        <h1 className="font-display text-3xl font-semibold text-ink">Pick how you'll use Petal</h1>
        <p className="mt-2 text-muted-foreground">You can change this later from settings.</p>
        <div className="mt-8 grid gap-4 md:grid-cols-2">
          {([
            { r: "patient", icon: UserRound, t: "I'm a Patient", d: "Track care, find doctors, AI diet chart." },
            { r: "doctor", icon: Stethoscope, t: "I'm a Doctor", d: "Treat patients, prescribe & set reminders." },
          ] as const).map((o) => (
            <button key={o.r} onClick={async () => {
              if (!user) return;
              await setRoleForUser(user.id, o.r);
              toast.success("Welcome aboard 🌸");
              await refresh();
            }} className="hover-lift rounded-3xl border border-border/60 bg-card p-6 text-left shadow-petal">
              <o.icon className="h-6 w-6 text-primary" />
              <p className="mt-3 font-display text-xl font-semibold text-ink">{o.t}</p>
              <p className="text-sm text-muted-foreground">{o.d}</p>
            </button>
          ))}
        </div>
      </div>
    );
  }

  if (hasProfile === false) return <div className="p-8 text-muted-foreground">Taking you to onboarding…</div>;

  return role === "patient" ? <PatientDashboard /> : <DoctorDashboard />;
}

function PatientDashboard() {
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
            <div className="inline-flex items-center gap-2 rounded-full bg-gradient-blossom px-3 py-1 text-xs font-medium text-ink shadow-petal">
              <Sun className="h-3.5 w-3.5" /> Today, gently
            </div>
            <h1 className="mt-4 font-display text-4xl font-semibold text-ink md:text-5xl">{greeting}</h1>
            <p className="mt-3 text-base text-muted-foreground md:text-lg">{subline}</p>
            <div className="mt-4"><NotificationPrompt /></div>
          </div>
          <div className="w-full max-w-xs rounded-2xl bg-gradient-blossom p-5 shadow-petal">
            <div className="flex items-center justify-between text-sm">
              <span className="flex items-center gap-1.5 font-medium text-ink">
                <Heart className="h-4 w-4 text-primary" fill="currentColor" /> Today's care
              </span>
              <span className="text-ink/70">{completedToday}/{total}</span>
            </div>
            <Progress value={pct} className="mt-3 h-2 bg-white/60" />
          </div>
        </div>
      </section>

      <div className="mt-8 grid gap-4 md:grid-cols-3">
        <Link to="/find-doctor" className="hover-lift rounded-2xl border border-border/60 bg-card p-5 shadow-petal">
          <Search className="h-5 w-5 text-primary" />
          <p className="mt-2 font-display text-lg font-semibold text-ink">Find a doctor</p>
          <p className="text-sm text-muted-foreground">Smart-matched to you.</p>
        </Link>
        <Link to="/diet-chart" className="hover-lift rounded-2xl border border-border/60 bg-gradient-bloom p-5 text-primary-foreground shadow-petal">
          <Salad className="h-5 w-5" />
          <p className="mt-2 font-display text-lg font-semibold">Generate my diet chart</p>
          <p className="text-sm text-primary-foreground/90">AI-personalised to your condition.</p>
        </Link>
        <Link to="/medicines" className="hover-lift rounded-2xl border border-border/60 bg-card p-5 shadow-petal">
          <Sparkles className="h-5 w-5 text-primary" />
          <p className="mt-2 font-display text-lg font-semibold text-ink">My medicines</p>
          <p className="text-sm text-muted-foreground">Your private cabinet.</p>
        </Link>
      </div>

      <section className="mt-10">
        <header className="mb-4 flex items-center justify-between">
          <h2 className="font-display text-2xl font-semibold text-ink">Up next</h2>
          <span className="text-sm text-muted-foreground">{upcoming.length} waiting</span>
        </header>
        {upcoming.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-primary/30 bg-card/60 p-8 text-center">
            <Sparkles className="mx-auto h-6 w-6 text-primary" />
            <p className="mt-3 font-display text-lg text-ink">All cared for today</p>
          </div>
        ) : (
          <div className="grid gap-3">
            {upcoming.map((r) => <ReminderCard key={r.id} reminder={r} onToggle={toggleComplete} />)}
          </div>
        )}
      </section>

      {completed.length > 0 && (
        <section className="mt-10">
          <h2 className="mb-4 font-display text-2xl font-semibold text-ink">Small wins ✨</h2>
          <div className="grid gap-3">
            {completed.map((r) => <ReminderCard key={r.id} reminder={r} onToggle={toggleComplete} />)}
          </div>
        </section>
      )}
    </div>
  );
}

function DoctorDashboard() {
  return (
    <div className="mx-auto max-w-5xl px-4 py-10 md:py-14">
      <header>
        <div className="inline-flex items-center gap-2 rounded-full bg-gradient-ink px-3 py-1 text-xs font-medium text-primary-foreground shadow-petal">
          <Stethoscope className="h-3.5 w-3.5" /> Clinical Intelligence
        </div>
        <h1 className="mt-4 font-display text-4xl font-semibold text-ink">Welcome back, doctor</h1>
        <p className="mt-2 text-muted-foreground">Your patients are gently waiting.</p>
      </header>

      <div className="mt-8 grid gap-4 md:grid-cols-2">
        <Link to="/my-patients" className="hover-lift rounded-3xl border border-border/60 bg-card p-6 shadow-petal">
          <Users className="h-6 w-6 text-primary" />
          <p className="mt-3 font-display text-xl font-semibold text-ink">My patients</p>
          <p className="text-sm text-muted-foreground">Open a profile to prescribe & set reminders.</p>
        </Link>
        <Link to="/my-doctor-card" className="hover-lift rounded-3xl border border-border/60 bg-gradient-bloom p-6 text-primary-foreground shadow-petal">
          <Sparkles className="h-6 w-6" />
          <p className="mt-3 font-display text-xl font-semibold">My doctor card</p>
          <p className="text-sm text-primary-foreground/90">How patients see you.</p>
        </Link>
      </div>
    </div>
  );
}
