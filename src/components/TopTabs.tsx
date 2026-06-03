import { Link, useRouterState } from "@tanstack/react-router";
import { Home, Bell, Sparkles, Shield, Pill, Search, Salad, Users, UserRound, ShieldAlert } from "lucide-react";
import { useRole } from "@/lib/role";

const PATIENT = [
  { title: "Dashboard", url: "/dashboard", icon: Home },
  { title: "Find a doctor", url: "/find-doctor", icon: Search },
  { title: "Medicines", url: "/medicines", icon: Pill },
  { title: "Reminders", url: "/reminders", icon: Bell },
  { title: "Emergency care", url: "/emergency-care", icon: ShieldAlert },
  { title: "Diet chart", url: "/diet-chart", icon: Salad },
  { title: "Small wins", url: "/wins", icon: Sparkles },
  { title: "Privacy", url: "/privacy", icon: Shield },
];

const DOCTOR = [
  { title: "Dashboard", url: "/dashboard", icon: Home },
  { title: "My patients", url: "/my-patients", icon: Users },
  { title: "My profile", url: "/onboarding-doctor", icon: UserRound },
  { title: "Privacy", url: "/privacy", icon: Shield },
];

export function TopTabs() {
  const { role } = useRole();
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const items = role === "doctor" ? DOCTOR : PATIENT;

  return (
    <nav className="w-full overflow-x-auto border-b border-border/60 bg-card/60 backdrop-blur">
      <ul className="mx-auto flex w-max min-w-full items-center gap-1 px-3 py-2">
        {items.map((it) => {
          const active = pathname === it.url;
          return (
            <li key={it.url}>
              <Link
                to={it.url}
                className={`group inline-flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-sm font-medium transition-all hover:-translate-y-0.5 ${
                  active
                    ? "bg-gradient-bloom text-primary-foreground shadow-petal"
                    : "text-muted-foreground hover:bg-secondary hover:text-ink"
                }`}
              >
                <it.icon className="h-3.5 w-3.5" />
                <span className="whitespace-nowrap">{it.title}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
