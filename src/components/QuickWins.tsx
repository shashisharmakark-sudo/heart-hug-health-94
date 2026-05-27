import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Droplet, Wind, Footprints, Heart, Sun, Smile, type LucideIcon } from "lucide-react";

interface QuickWin {
  id: string;
  label: string;
  cheer: string;
  icon: LucideIcon;
}

const QUICK_WINS: QuickWin[] = [
  { id: "sip",     label: "Sip of water",  cheer: "Hydration counts 💧 lovely.",        icon: Droplet },
  { id: "breath",  label: "Deep breath",   cheer: "One slow breath — beautiful 🌿",     icon: Wind },
  { id: "stretch", label: "Tiny stretch",  cheer: "Your body says thank you ✨",        icon: Footprints },
  { id: "grateful",label: "A grateful thought", cheer: "Soft heart, full heart 💙",     icon: Heart },
  { id: "sunlight",label: "A peek of light",   cheer: "Hello, sunshine 🌞",             icon: Sun },
  { id: "smile",   label: "A small smile", cheer: "That looks good on you 🌸",          icon: Smile },
];

const today = () => new Date().toISOString().slice(0, 10);
const KEY = "petal.quickwins.v1";

interface Store { date: string; counts: Record<string, number> }

function read(): Store {
  if (typeof window === "undefined") return { date: today(), counts: {} };
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return { date: today(), counts: {} };
    const parsed = JSON.parse(raw) as Store;
    if (parsed.date !== today()) return { date: today(), counts: {} };
    return parsed;
  } catch {
    return { date: today(), counts: {} };
  }
}

export function useQuickWinsTotal() {
  const [total, setTotal] = useState(0);
  useEffect(() => {
    const sync = () => {
      const s = read();
      setTotal(Object.values(s.counts).reduce((a, b) => a + b, 0));
    };
    sync();
    window.addEventListener("storage", sync);
    window.addEventListener("petal:quickwin", sync);
    return () => {
      window.removeEventListener("storage", sync);
      window.removeEventListener("petal:quickwin", sync);
    };
  }, []);
  return total;
}

export function QuickWins() {
  const [counts, setCounts] = useState<Record<string, number>>({});

  useEffect(() => { setCounts(read().counts); }, []);

  const tally = (w: QuickWin) => {
    const store = read();
    store.counts[w.id] = (store.counts[w.id] ?? 0) + 1;
    localStorage.setItem(KEY, JSON.stringify(store));
    setCounts({ ...store.counts });
    window.dispatchEvent(new Event("petal:quickwin"));
    toast.success(w.cheer, { description: `${w.label} — added to today's wins.` });
  };

  return (
    <section className="mt-10">
      <header className="mb-4 flex items-center justify-between">
        <h2 className="font-display text-2xl font-semibold text-foreground">Quick wins</h2>
        <span className="text-sm text-muted-foreground">tap to count a tiny kindness</span>
      </header>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        {QUICK_WINS.map((w) => {
          const Icon = w.icon;
          const n = counts[w.id] ?? 0;
          return (
            <button
              key={w.id}
              type="button"
              onClick={() => tally(w)}
              className="group relative flex items-center gap-3 overflow-hidden rounded-2xl border border-border/60 bg-card p-4 text-left shadow-petal transition-all hover:-translate-y-0.5 hover:shadow-soft"
            >
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-blossom">
                <Icon className="h-5 w-5 text-primary" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-foreground">{w.label}</p>
                <p className="text-xs text-muted-foreground">
                  {n === 0 ? "tap when you can" : `${n}× today ✨`}
                </p>
              </div>
            </button>
          );
        })}
      </div>
    </section>
  );
}
