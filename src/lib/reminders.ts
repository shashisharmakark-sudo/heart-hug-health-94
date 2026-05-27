import { useCallback, useEffect, useRef, useState } from "react";
import { Pill, Droplet, Footprints, Moon, Apple, HeartPulse, type LucideIcon } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";

export type ReminderKind = "medication" | "water" | "movement" | "rest" | "nourish" | "checkin" | "appointment";

export interface Reminder {
  id: string;
  title: string;
  detail: string;
  time: string; // "HH:mm"
  kind: ReminderKind;
  completedOn?: string; // YYYY-MM-DD
}

export const kindMeta: Record<ReminderKind, { icon: LucideIcon; label: string; tint: string }> = {
  medication:  { icon: Pill,       label: "Medication",  tint: "from-rose-200/60 to-pink-200/60" },
  water:       { icon: Droplet,    label: "Hydration",   tint: "from-sky-100/70 to-pink-100/70" },
  movement:    { icon: Footprints, label: "Movement",    tint: "from-pink-100/70 to-amber-100/70" },
  rest:        { icon: Moon,       label: "Rest",        tint: "from-violet-100/70 to-pink-100/70" },
  nourish:     { icon: Apple,      label: "Nourish",     tint: "from-rose-100/70 to-orange-100/70" },
  checkin:     { icon: HeartPulse, label: "Check-in",    tint: "from-pink-200/70 to-rose-200/70" },
  appointment: { icon: HeartPulse, label: "Appointment", tint: "from-violet-100/70 to-sky-100/70" },
};

const today = () => new Date().toISOString().slice(0, 10);
const trimTime = (t: string) => t.slice(0, 5); // "HH:mm:ss" -> "HH:mm"

export function useReminders() {
  const { user } = useAuth();
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [hydrated, setHydrated] = useState(false);

  const load = useCallback(async () => {
    if (!user) return;
    const todayStr = today();
    const [remRes, logRes] = await Promise.all([
      supabase
        .from("reminders")
        .select("id,title,detail,time_of_day,kind")
        .eq("is_active", true)
        .order("time_of_day", { ascending: true }),
      supabase
        .from("reminder_logs")
        .select("reminder_id")
        .eq("done_on", todayStr),
    ]);
    const doneSet = new Set((logRes.data ?? []).map((l) => l.reminder_id));
    const list: Reminder[] = (remRes.data ?? []).map((r) => ({
      id: r.id,
      title: r.title,
      detail: r.detail ?? "A gentle nudge from us 💙",
      time: trimTime(r.time_of_day),
      kind: r.kind as ReminderKind,
      completedOn: doneSet.has(r.id) ? todayStr : undefined,
    }));
    setReminders(list);
    setHydrated(true);
  }, [user]);

  useEffect(() => {
    if (user) load();
  }, [user, load]);

  const toggleComplete = async (id: string) => {
    if (!user) return;
    const todayStr = today();
    const current = reminders.find((r) => r.id === id);
    const isDone = current?.completedOn === todayStr;
    // optimistic
    setReminders((prev) => prev.map((r) => (r.id === id ? { ...r, completedOn: isDone ? undefined : todayStr } : r)));
    if (isDone) {
      await supabase.from("reminder_logs").delete().eq("reminder_id", id).eq("done_on", todayStr);
    } else {
      await supabase.from("reminder_logs").insert({ user_id: user.id, reminder_id: id, done_on: todayStr });
    }
  };

  const add = async (r: Omit<Reminder, "id">) => {
    if (!user) return;
    const { error } = await supabase.from("reminders").insert({
      user_id: user.id,
      title: r.title,
      detail: r.detail,
      time_of_day: `${r.time}:00`,
      kind: r.kind,
    });
    if (!error) await load();
  };

  const remove = async (id: string) => {
    await supabase.from("reminders").delete().eq("id", id);
    setReminders((prev) => prev.filter((r) => r.id !== id));
  };

  const todayStr = today();
  const completedToday = reminders.filter((r) => r.completedOn === todayStr).length;
  const upcoming = reminders.filter((r) => r.completedOn !== todayStr);
  const completed = reminders.filter((r) => r.completedOn === todayStr);

  return { reminders, hydrated, toggleComplete, add, remove, completedToday, upcoming, completed, total: reminders.length, reload: load };
}

export function warmGreeting(name?: string) {
  const h = new Date().getHours();
  const who = name ? `, ${name}` : "";
  if (h < 5) return `Still up${who}? Be gentle with yourself 🌙`;
  if (h < 12) return `Good morning${who} 🌸`;
  if (h < 17) return `Good afternoon${who} ✨`;
  if (h < 21) return `Good evening${who} 💙`;
  return `Soft evening${who} 🌙`;
}

export function warmSubline(completed: number, total: number) {
  if (total === 0) return "Whenever you're ready, we can set up your first gentle reminder.";
  if (completed === 0) return "No rush. Today is a fresh, kind start.";
  if (completed < total) return `${completed} small win${completed > 1 ? "s" : ""} already — that matters.`;
  return "Every reminder cared for today. You are absolutely glowing 🌸";
}

/**
 * Schedules native browser notifications for today's upcoming reminders.
 * Re-runs whenever the reminder list changes.
 */
export function useReminderNotifications(reminders: Reminder[]) {
  const timersRef = useRef<number[]>([]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (!("Notification" in window) || Notification.permission !== "granted") return;

    // clear any prior timers
    timersRef.current.forEach((t) => window.clearTimeout(t));
    timersRef.current = [];

    const now = new Date();
    const todayStr = today();

    reminders.forEach((r) => {
      if (r.completedOn === todayStr) return;
      const [h, m] = r.time.split(":").map(Number);
      const when = new Date();
      when.setHours(h, m, 0, 0);
      const ms = when.getTime() - now.getTime();
      if (ms <= 0 || ms > 24 * 60 * 60 * 1000) return;
      const id = window.setTimeout(() => {
        try {
          new Notification(`🌸 ${r.title}`, {
            body: r.detail,
            tag: `petal-${r.id}-${todayStr}`,
            icon: "/favicon.ico",
          });
        } catch {
          /* ignore */
        }
      }, ms);
      timersRef.current.push(id);
    });

    return () => {
      timersRef.current.forEach((t) => window.clearTimeout(t));
      timersRef.current = [];
    };
  }, [reminders]);
}

export function notificationPermission(): NotificationPermission | "unsupported" {
  if (typeof window === "undefined" || !("Notification" in window)) return "unsupported";
  return Notification.permission;
}

export async function requestNotificationPermission(): Promise<NotificationPermission | "unsupported"> {
  if (typeof window === "undefined" || !("Notification" in window)) return "unsupported";
  if (Notification.permission === "granted" || Notification.permission === "denied") return Notification.permission;
  return await Notification.requestPermission();
}
