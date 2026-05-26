import { useEffect, useState } from "react";
import { Pill, Droplet, Footprints, Moon, Apple, HeartPulse, type LucideIcon } from "lucide-react";

export type ReminderKind = "medication" | "water" | "movement" | "rest" | "nourish" | "checkin";

export interface Reminder {
  id: string;
  title: string;
  detail: string;
  time: string; // "HH:mm"
  kind: ReminderKind;
  completedOn?: string; // YYYY-MM-DD
}

export const kindMeta: Record<ReminderKind, { icon: LucideIcon; label: string; tint: string }> = {
  medication: { icon: Pill, label: "Medication", tint: "from-rose-200/60 to-pink-200/60" },
  water:      { icon: Droplet, label: "Hydration", tint: "from-sky-100/70 to-pink-100/70" },
  movement:   { icon: Footprints, label: "Movement", tint: "from-pink-100/70 to-amber-100/70" },
  rest:       { icon: Moon, label: "Rest", tint: "from-violet-100/70 to-pink-100/70" },
  nourish:    { icon: Apple, label: "Nourish", tint: "from-rose-100/70 to-orange-100/70" },
  checkin:    { icon: HeartPulse, label: "Check-in", tint: "from-pink-200/70 to-rose-200/70" },
};

const STORAGE_KEY = "petal.reminders.v1";
const today = () => new Date().toISOString().slice(0, 10);

const defaults: Reminder[] = [
  { id: "1", title: "Morning medication", detail: "With a small glass of water 💧", time: "08:00", kind: "medication" },
  { id: "2", title: "Hydration check", detail: "A gentle sip whenever you can", time: "10:30", kind: "water" },
  { id: "3", title: "A little movement", detail: "Even a short stretch counts ✨", time: "12:00", kind: "movement" },
  { id: "4", title: "Nourishing lunch", detail: "Something that loves you back", time: "13:00", kind: "nourish" },
  { id: "5", title: "Afternoon medication", detail: "You're taking such good care of yourself", time: "18:00", kind: "medication" },
  { id: "6", title: "Wind-down time", detail: "Dim the lights, breathe slow 🌙", time: "21:30", kind: "rest" },
];

function read(): Reminder[] {
  if (typeof window === "undefined") return defaults;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return defaults;
    return JSON.parse(raw) as Reminder[];
  } catch {
    return defaults;
  }
}

function write(list: Reminder[]) {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
}

export function useReminders() {
  const [reminders, setReminders] = useState<Reminder[]>(defaults);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setReminders(read());
    setHydrated(true);
  }, []);

  const update = (next: Reminder[]) => {
    setReminders(next);
    write(next);
  };

  const toggleComplete = (id: string) =>
    update(
      reminders.map((r) =>
        r.id === id ? { ...r, completedOn: r.completedOn === today() ? undefined : today() } : r,
      ),
    );

  const add = (r: Omit<Reminder, "id">) =>
    update([...reminders, { ...r, id: crypto.randomUUID() }].sort((a, b) => a.time.localeCompare(b.time)));

  const remove = (id: string) => update(reminders.filter((r) => r.id !== id));

  const todayStr = today();
  const completedToday = reminders.filter((r) => r.completedOn === todayStr).length;
  const upcoming = reminders.filter((r) => r.completedOn !== todayStr);
  const completed = reminders.filter((r) => r.completedOn === todayStr);

  return { reminders, hydrated, toggleComplete, add, remove, completedToday, upcoming, completed, total: reminders.length };
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
