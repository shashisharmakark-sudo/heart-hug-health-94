import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Plus, Trash2, Pill } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";

export const Route = createFileRoute("/_authenticated/medicines")({
  component: MedicinesPage,
});

interface Medicine {
  id: string;
  name: string;
  dosage: string | null;
  instructions: string | null;
  expires_on: string | null;
}

function MedicinesPage() {
  const { user } = useAuth();
  const [items, setItems] = useState<Medicine[]>([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ name: "", dosage: "", instructions: "", expires_on: "" });

  const load = async () => {
    const { data, error } = await supabase
      .from("medicines")
      .select("id,name,dosage,instructions,expires_on")
      .eq("is_active", true)
      .order("created_at", { ascending: false });
    if (error) toast.error("Couldn't load your medicines");
    setItems((data as Medicine[]) ?? []);
    setLoading(false);
  };

  useEffect(() => { if (user) load(); }, [user]);

  const add = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim() || !user) return;
    const { error } = await supabase.from("medicines").insert({
      user_id: user.id,
      name: form.name.trim(),
      dosage: form.dosage.trim() || null,
      instructions: form.instructions.trim() || null,
      expires_on: form.expires_on || null,
    });
    if (error) return toast.error("Couldn't save", { description: error.message });
    toast.success("Added to your cabinet 🌸");
    setForm({ name: "", dosage: "", instructions: "", expires_on: "" });
    load();
  };

  const remove = async (id: string) => {
    const { error } = await supabase.from("medicines").update({ is_active: false }).eq("id", id);
    if (error) return toast.error("Couldn't remove");
    toast("Removed gently 💙");
    load();
  };

  return (
    <div className="mx-auto w-full max-w-5xl px-4 py-8 md:px-8 md:py-12">
      <header className="mb-8">
        <h1 className="font-display text-4xl font-semibold text-foreground">Your medicines</h1>
        <p className="mt-2 text-muted-foreground">A private little cabinet — only you can see it.</p>
      </header>

      <form onSubmit={add} className="mb-10 rounded-3xl border border-border/60 bg-card/80 p-6 shadow-petal backdrop-blur">
        <h2 className="font-display text-lg font-semibold text-foreground">Add a medicine</h2>
        <div className="mt-4 grid gap-4 md:grid-cols-2">
          <div className="md:col-span-2">
            <Label htmlFor="name">Name</Label>
            <Input id="name" required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="mt-1.5" placeholder="e.g. Amoxicillin" />
          </div>
          <div>
            <Label htmlFor="dosage">Dosage</Label>
            <Input id="dosage" value={form.dosage} onChange={(e) => setForm({ ...form, dosage: e.target.value })} className="mt-1.5" placeholder="e.g. 500mg, 1 tablet" />
          </div>
          <div>
            <Label htmlFor="expires">Expires on (optional)</Label>
            <Input id="expires" type="date" value={form.expires_on} onChange={(e) => setForm({ ...form, expires_on: e.target.value })} className="mt-1.5" />
          </div>
          <div className="md:col-span-2">
            <Label htmlFor="instr">Instructions (optional)</Label>
            <Input id="instr" value={form.instructions} onChange={(e) => setForm({ ...form, instructions: e.target.value })} className="mt-1.5" placeholder="e.g. With food, twice a day" />
          </div>
        </div>
        <div className="mt-5 flex justify-end">
          <Button type="submit" className="rounded-full bg-gradient-bloom px-5 shadow-petal hover:opacity-95">
            <Plus className="mr-1 h-4 w-4" /> Add medicine
          </Button>
        </div>
      </form>

      {loading ? (
        <p className="text-muted-foreground">A moment…</p>
      ) : items.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-primary/30 bg-card/60 p-10 text-center">
          <Pill className="mx-auto h-6 w-6 text-primary" />
          <p className="mt-3 font-display text-lg text-foreground">Your cabinet is empty 🌸</p>
          <p className="mt-1 text-sm text-muted-foreground">Add your first medicine above whenever you're ready.</p>
        </div>
      ) : (
        <div className="grid gap-3">
          {items.map((m) => (
            <div key={m.id} className="flex items-start gap-4 rounded-2xl border border-border/60 bg-card p-5 shadow-petal">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-blossom">
                <Pill className="h-5 w-5 text-primary" />
              </div>
              <div className="flex-1">
                <h3 className="font-display text-lg font-semibold text-foreground">{m.name}</h3>
                {m.dosage && <p className="text-sm text-muted-foreground">{m.dosage}</p>}
                {m.instructions && <p className="mt-1 text-sm text-foreground/80">{m.instructions}</p>}
                {m.expires_on && <p className="mt-1 text-xs text-muted-foreground">Expires {m.expires_on}</p>}
              </div>
              <button onClick={() => remove(m.id)} aria-label="Remove" className="text-muted-foreground transition hover:text-destructive">
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
