import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import { Heart, Stethoscope, UserRound, Sparkles, ShieldCheck } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";

export const Route = createFileRoute("/")({
  component: Landing,
});

function Landing() {
  const { isAuthenticated, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && isAuthenticated) navigate({ to: "/dashboard", replace: true });
  }, [loading, isAuthenticated, navigate]);

  return (
    <div className="min-h-screen px-4 py-10 md:py-16">
      <div className="mx-auto max-w-5xl">
        <header className="flex flex-col items-center text-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-bloom shadow-petal">
            <Heart className="h-6 w-6 text-primary-foreground" fill="currentColor" />
          </div>
          <h1 className="mt-5 font-display text-4xl font-semibold text-ink md:text-5xl">
            Petal Health Portal
          </h1>
          <p className="mt-3 max-w-xl text-muted-foreground">
            Personal Health Mapping for patients. Clinical Intelligence Profiling for doctors.
            Smart matching, gentle reminders, AI-personalised care.
          </p>
        </header>

        <div className="mt-12 grid gap-6 md:grid-cols-2">
          <Link to="/login" search={{ role: "patient" } as never}
            className="hover-lift group block rounded-3xl border border-border/60 bg-card/90 p-8 shadow-soft backdrop-blur">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-blossom">
              <UserRound className="h-6 w-6 text-ink" />
            </div>
            <h2 className="mt-5 font-display text-2xl font-semibold text-ink">I'm a Patient</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Map your health, get matched with the right doctor, track medicines & generate your personalised diet chart.
            </p>
            <p className="mt-5 inline-flex items-center gap-1 text-sm font-medium text-primary group-hover:underline">
              Continue as patient →
            </p>
          </Link>

          <Link to="/login" search={{ role: "doctor" } as never}
            className="hover-lift group block rounded-3xl border border-border/60 bg-gradient-ink p-8 text-primary-foreground shadow-soft">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary shadow-petal">
              <Stethoscope className="h-6 w-6 text-primary-foreground" />
            </div>
            <h2 className="mt-5 font-display text-2xl font-semibold">I'm a Doctor</h2>
            <p className="mt-2 text-sm text-primary-foreground/80">
              Build your Clinical Intelligence Profile, get matched with patients who fit your style, and care for each one personally.
            </p>
            <p className="mt-5 inline-flex items-center gap-1 text-sm font-medium text-primary-foreground/95 group-hover:underline">
              Continue as doctor →
            </p>
          </Link>
        </div>

        <div className="mt-12 grid gap-4 md:grid-cols-3">
          {[
            { icon: Sparkles, t: "Smart matching", d: "Personality + specialty + urgency scored together." },
            { icon: Heart, t: "Personal reminders", d: "Doctors prescribe; patients get gentle pop-ups." },
            { icon: ShieldCheck, t: "Private by default", d: "Your data is yours. Always." },
          ].map((f) => (
            <div key={f.t} className="rounded-2xl border border-border/60 bg-card/70 p-5 shadow-petal backdrop-blur">
              <f.icon className="h-5 w-5 text-primary" />
              <p className="mt-2 font-display font-semibold text-ink">{f.t}</p>
              <p className="text-sm text-muted-foreground">{f.d}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
