import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState, type FormEvent } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { AuthShell } from "./login";

export const Route = createFileRoute("/reset-password")({
  component: ResetPage,
});

function ResetPage() {
  const navigate = useNavigate();
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    if (password.length < 8) return toast.error("Please use at least 8 characters 💙");
    setBusy(true);
    const { error } = await supabase.auth.updateUser({ password });
    setBusy(false);
    if (error) return toast.error("Couldn't update your password", { description: error.message });
    toast.success("All set — welcome back 🌸");
    navigate({ to: "/", replace: true });
  };

  return (
    <AuthShell title="Set a new password" subtitle="Take a breath. We've got you.">
      <form onSubmit={submit} className="space-y-4">
        <div>
          <Label htmlFor="password">New password</Label>
          <Input id="password" type="password" required minLength={8} value={password} onChange={(e) => setPassword(e.target.value)} className="mt-1.5" />
        </div>
        <Button type="submit" disabled={busy} className="w-full rounded-full bg-gradient-bloom shadow-petal">
          {busy ? "Saving…" : "Save new password"}
        </Button>
      </form>
    </AuthShell>
  );
}
