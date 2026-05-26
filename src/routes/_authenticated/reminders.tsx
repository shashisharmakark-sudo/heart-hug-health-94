import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ReminderCard } from "@/components/ReminderCard";
import { kindMeta, useReminders, type ReminderKind } from "@/lib/reminders";

export const Route = createFileRoute("/_authenticated/reminders")({
  component: RemindersPage,
});

function RemindersPage() {
  const { reminders, hydrated, toggleComplete, add, remove } = useReminders();
  const [title, setTitle] = useState("");
  const [detail, setDetail] = useState("");
  const [time, setTime] = useState("09:00");
  const [kind, setKind] = useState<ReminderKind>("medication");

  if (!hydrated) return <div className="p-8 text-muted-foreground">A moment…</div>;

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    add({ title: title.trim(), detail: detail.trim() || "A gentle nudge from us 💙", time, kind });
    toast.success("Lovely — your reminder is set 🌸");
    setTitle(""); setDetail(""); setTime("09:00"); setKind("medication");
  };

  return (
    <div className="mx-auto w-full max-w-5xl px-4 py-8 md:px-8 md:py-12">
      <header className="mb-8">
        <h1 className="font-display text-4xl font-semibold text-foreground">Your reminders</h1>
        <p className="mt-2 text-muted-foreground">Add anything that helps you feel cared for.</p>
      </header>

      <form onSubmit={submit} className="mb-10 rounded-3xl border border-border/60 bg-card/80 p-6 shadow-petal backdrop-blur">
        <h2 className="font-display text-lg font-semibold text-foreground">Add a new reminder</h2>
        <div className="mt-4 grid gap-4 md:grid-cols-2">
          <div className="md:col-span-2">
            <Label htmlFor="title">What is it?</Label>
            <Input id="title" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. Evening blood pressure meds" className="mt-1.5" required />
          </div>
          <div className="md:col-span-2">
            <Label htmlFor="detail">A kind note (optional)</Label>
            <Input id="detail" value={detail} onChange={(e) => setDetail(e.target.value)} placeholder="e.g. With a small snack" className="mt-1.5" />
          </div>
          <div>
            <Label htmlFor="time">When?</Label>
            <Input id="time" type="time" value={time} onChange={(e) => setTime(e.target.value)} className="mt-1.5" />
          </div>
          <div>
            <Label>Type of care</Label>
            <Select value={kind} onValueChange={(v) => setKind(v as ReminderKind)}>
              <SelectTrigger className="mt-1.5"><SelectValue /></SelectTrigger>
              <SelectContent>
                {Object.entries(kindMeta).map(([k, m]) => (
                  <SelectItem key={k} value={k}>{m.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        <div className="mt-5 flex justify-end">
          <Button type="submit" className="rounded-full bg-gradient-bloom px-5 shadow-petal hover:opacity-95">
            <Plus className="mr-1 h-4 w-4" /> Add reminder
          </Button>
        </div>
      </form>

      <div className="grid gap-3">
        {reminders.map((r) => (
          <div key={r.id} className="group relative">
            <ReminderCard reminder={r} onToggle={toggleComplete} />
            <button onClick={() => { remove(r.id); toast("Removed — no judgment 💙"); }} aria-label="Remove" className="absolute right-3 top-3 z-10 rounded-full bg-card/80 p-1.5 text-muted-foreground opacity-0 backdrop-blur transition hover:text-destructive group-hover:opacity-100">
              <Trash2 className="h-3.5 w-3.5" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
