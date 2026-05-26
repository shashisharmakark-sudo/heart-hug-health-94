import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState, type FormEvent } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable";
import { AuthShell } from "./login";

export const Route = createFileRoute("/signup")({
  component: SignupPage,
});

function SignupPage() {
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    if (password.length < 8) return toast.error("Please use at least 8 characters 💙");
    setBusy(true);
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: window.location.origin,
        data: { full_name: name },
      },
    });
    setBusy(false);
    if (error) return toast.error("We couldn't create your space", { description: error.message });
    toast.success("Your space is ready 🌸", { description: "Welcome to Petal." });
    navigate({ to: "/", replace: true });
  };

  const handleGoogle = async () => {
    setBusy(true);
    const res = await lovable.auth.signInWithOAuth("google", { redirect_uri: window.location.origin });
    if (res.error) {
      setBusy(false);
      toast.error("Google sign-in didn't work");
    }
  };

  return (
    <AuthShell title="Create your space 🌸" subtitle="A gentle home for your daily care.">
      <form onSubmit={submit} className="space-y-4">
        <div>
          <Label htmlFor="name">Your name</Label>
          <Input id="name" required value={name} onChange={(e) => setName(e.target.value)} className="mt-1.5" />
        </div>
        <div>
          <Label htmlFor="email">Email</Label>
          <Input id="email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} className="mt-1.5" />
        </div>
        <div>
          <Label htmlFor="password">Password</Label>
          <Input id="password" type="password" required minLength={8} value={password} onChange={(e) => setPassword(e.target.value)} className="mt-1.5" />
          <p className="mt-1 text-xs text-muted-foreground">At least 8 characters.</p>
        </div>
        <Button type="submit" disabled={busy} className="w-full rounded-full bg-gradient-bloom shadow-petal hover:opacity-95">
          {busy ? "Creating…" : "Create my space"}
        </Button>
      </form>

      <div className="my-5 flex items-center gap-3 text-xs text-muted-foreground">
        <div className="h-px flex-1 bg-border" /> or <div className="h-px flex-1 bg-border" />
      </div>

      <Button type="button" variant="outline" onClick={handleGoogle} disabled={busy} className="w-full rounded-full">
        Continue with Google
      </Button>

      <p className="mt-6 text-center text-sm text-muted-foreground">
        Already with us? <Link to="/login" className="font-medium text-primary hover:underline">Sign in</Link>
      </p>
    </AuthShell>
  );
}
