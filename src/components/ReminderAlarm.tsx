import { useEffect, useRef, useState } from "react";
import { Bell, BellRing, Check, Clock, PhoneCall, X } from "lucide-react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useReminders, type Reminder } from "@/lib/reminders";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";

interface Emergency {
  guardian_name: string;
  guardian_phone: string;
  category: string;
  alert_sound: boolean;
  alert_popups: boolean;
}

/**
 * Mounts globally for authenticated users. Schedules in-app pop-ups for today's
 * remaining reminders. If the user is on an emergency plan, also shows a
 * one-tap "Call guardian" button and (optionally) a soft alert tone.
 */
export function ReminderAlarm() {
  const { user } = useAuth();
  const { reminders, toggleComplete, reload } = useReminders();
  const [active, setActive] = useState<Reminder | null>(null);
  const [emergency, setEmergency] = useState<Emergency | null>(null);
  const timersRef = useRef<number[]>([]);

  useEffect(() => {
    if (!user) return;
    (async () => {
      const { data } = await (supabase as any)
        .from("emergency_profiles")
        .select("guardian_name,guardian_phone,category,alert_sound,alert_popups")
        .eq("user_id", user.id)
        .maybeSingle();
      setEmergency(data ?? null);
    })();
  }, [user]);

  useEffect(() => {
    timersRef.current.forEach((t) => window.clearTimeout(t));
    timersRef.current = [];
    const today = new Date().toISOString().slice(0, 10);
    const now = Date.now();
    reminders.forEach((r) => {
      if (r.completedOn === today) return;
      const [h, m] = r.time.split(":").map(Number);
      const when = new Date(); when.setHours(h, m, 0, 0);
      const ms = when.getTime() - now;
      if (ms <= 0 || ms > 24 * 60 * 60 * 1000) return;
      const id = window.setTimeout(() => {
        setActive(r);
        if (emergency?.alert_sound !== false) playChime();
      }, ms);
      timersRef.current.push(id);
    });
    return () => { timersRef.current.forEach((t) => window.clearTimeout(t)); };
  }, [reminders, emergency]);

  const close = () => setActive(null);
  const done = async () => {
    if (active) await toggleComplete(active.id);
    await reload();
    close();
  };
  const snooze = () => {
    if (!active) return;
    const id = window.setTimeout(() => setActive(active), 10 * 60 * 1000);
    timersRef.current.push(id);
    close();
  };

  return (
    <Dialog open={!!active} onOpenChange={(o) => !o && close()}>
      <DialogContent className="border-primary/40 bg-gradient-to-br from-card to-secondary/40 p-0 overflow-hidden">
        <div className="relative px-6 pt-6 pb-2">
          <div className="absolute -top-10 -right-10 h-32 w-32 rounded-full bg-bloom/20 blur-2xl animate-blob" />
          <div className="absolute -bottom-12 -left-12 h-32 w-32 rounded-full bg-blossom/40 blur-2xl animate-blob" />
          <div className="relative flex items-center gap-3">
            <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-bloom text-primary-foreground shadow-petal animate-pulse-ring">
              <BellRing className="h-6 w-6" />
            </span>
            <div>
              <p className="text-xs uppercase tracking-wider text-muted-foreground">Gentle reminder</p>
              <h2 className="font-display text-2xl font-semibold text-ink">{active?.title}</h2>
            </div>
          </div>
          <p className="relative mt-3 text-sm text-muted-foreground">{active?.detail}</p>
          <p className="relative mt-1 inline-flex items-center gap-1.5 text-xs text-ink"><Clock className="h-3 w-3" /> {active?.time}</p>
        </div>

        {emergency && (
          <div className="mx-6 mt-2 rounded-2xl border border-primary/40 bg-gradient-blossom p-3 shadow-sky">
            <p className="text-xs font-medium text-ink">Guardian on file</p>
            <p className="mt-0.5 text-sm font-semibold text-ink">{emergency.guardian_name}</p>
            <a href={`tel:${emergency.guardian_phone}`} className="mt-2 inline-flex items-center gap-1.5 rounded-full bg-gradient-bloom px-3 py-1.5 text-xs font-medium text-primary-foreground shadow-petal hover-lift">
              <PhoneCall className="h-3 w-3" /> Call {emergency.guardian_phone}
            </a>
          </div>
        )}

        <div className="flex items-center justify-end gap-2 px-6 py-4">
          <Button variant="outline" onClick={snooze} className="rounded-full">
            <Bell className="mr-1 h-4 w-4" /> Snooze 10 min
          </Button>
          <Button onClick={done} className="rounded-full bg-gradient-bloom shadow-petal hover:opacity-95">
            <Check className="mr-1 h-4 w-4" /> Mark done
          </Button>
          <button onClick={close} className="absolute right-3 top-3 rounded-full p-1 text-muted-foreground hover:bg-secondary">
            <X className="h-4 w-4" />
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function playChime() {
  try {
    const Ctx = (window.AudioContext || (window as any).webkitAudioContext);
    if (!Ctx) return;
    const ctx = new Ctx();
    const o = ctx.createOscillator(); const g = ctx.createGain();
    o.type = "sine"; o.frequency.value = 880;
    g.gain.value = 0.0001;
    o.connect(g).connect(ctx.destination);
    o.start();
    g.gain.exponentialRampToValueAtTime(0.15, ctx.currentTime + 0.05);
    g.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.9);
    o.stop(ctx.currentTime + 1);
  } catch {/* ignore */}
}
