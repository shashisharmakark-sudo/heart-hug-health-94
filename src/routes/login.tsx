import { createFileRoute, Link, useNavigate, useSearch } from "@tanstack/react-router";
import { useEffect, useState, type FormEvent } from "react";
import { Heart, UserRound, Stethoscope } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable";
import { useAuth } from "@/hooks/use-auth";

export const Route = createFileRoute("/login")({
  validateSearch: (s: Record<string, unknown>) => ({ role: (s.role as string) === "doctor" ? "doctor" : "patient" }),
  component: LoginPage,
});

function LoginPage() {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const { role } = useSearch({ from: "/login" });
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (isAuthenticated) navigate({ to: "/dashboard", replace: true });
  }, [isAuthenticated, navigate]);

  const handleEmail = async (e: FormEvent) => {
    e.preventDefault();
    setBusy(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setBusy(false);
    if (error) return toast.error("We couldn't sign you in", { description: error.message });
    toast.success("Welcome back 🌸");
    navigate({ to: "/dashboard", replace: true });
  };

  const handleGoogle = async () => {
    setBusy(true);
    const res = await lovable.auth.signInWithOAuth("google", { redirect_uri: window.location.origin + "/dashboard" });
    if (res.error) { setBusy(false); toast.error("Google sign-in didn't work"); }
  };

  return (
    <AuthShell title="Welcome back 🌸" subtitle="Sign in to your Petal portal.">
      <div className="mb-6">
        <p className="mb-3 text-center text-xs font-semibold uppercase tracking-wider text-ink">Step 1 · Who's signing in?</p>
        <div className="grid grid-cols-2 gap-3">
          <Link to="/login" search={{ role: "patient" }} className={`hover-lift flex flex-col items-center gap-1.5 rounded-2xl border p-4 text-center transition ${role === "patient" ? "border-primary bg-gradient-blossom text-ink shadow-petal" : "border-border bg-card text-muted-foreground"}`}>
            <UserRound className="h-6 w-6" />
            <span className="text-sm font-semibold">Login as Patient</span>
          </Link>
          <Link to="/login" search={{ role: "doctor" }} className={`hover-lift flex flex-col items-center gap-1.5 rounded-2xl border p-4 text-center transition ${role === "doctor" ? "border-primary bg-gradient-ink text-primary-foreground shadow-petal" : "border-border bg-card text-muted-foreground"}`}>
            <Stethoscope className="h-6 w-6" />
            <span className="text-sm font-semibold">Login as Doctor</span>
          </Link>
        </div>
        <p className="mt-3 text-center text-xs font-semibold uppercase tracking-wider text-ink">Step 2 · Your credentials</p>
      </div>

      <form onSubmit={handleEmail} className="space-y-4">
        <div>
          <Label htmlFor="email">Email</Label>
          <Input id="email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} className="mt-1.5" />
        </div>
        <div>
          <div className="flex items-center justify-between">
            <Label htmlFor="password">Password</Label>
            <Link to="/forgot-password" className="text-xs text-primary hover:underline">Forgot?</Link>
          </div>
          <Input id="password" type="password" required value={password} onChange={(e) => setPassword(e.target.value)} className="mt-1.5" />
        </div>
        <Button type="submit" disabled={busy} className="w-full rounded-full bg-gradient-bloom shadow-petal hover:opacity-95">
          {busy ? "A moment…" : `Sign in as ${role}`}
        </Button>
      </form>

      <div className="my-5 flex items-center gap-3 text-xs text-muted-foreground">
        <div className="h-px flex-1 bg-border" /> or <div className="h-px flex-1 bg-border" />
      </div>

      <Button type="button" variant="outline" onClick={handleGoogle} disabled={busy} className="w-full rounded-full">
        Continue with Google
      </Button>

      <p className="mt-6 text-center text-sm text-muted-foreground">
        New here? <Link to="/signup" search={{ role }} className="font-medium text-primary hover:underline">Create your space</Link>
      </p>
    </AuthShell>
  );
}

export function AuthShell({ title, subtitle, children }: { title: string; subtitle: string; children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <div className="mb-6 flex flex-col items-center text-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-bloom shadow-petal">
            <Heart className="h-5 w-5 text-primary-foreground" fill="currentColor" />
          </div>
          <h1 className="mt-4 font-display text-3xl font-semibold text-ink">{title}</h1>
          <p className="mt-1 text-sm text-muted-foreground">{subtitle}</p>
        </div>
        <div className="rounded-3xl border border-border/60 bg-card/80 p-6 shadow-soft backdrop-blur md:p-8">
          {children}
        </div>
      </div>
    </div>
  );
}
