import { Check } from "lucide-react";
import { toast } from "sonner";
import { kindMeta, type Reminder } from "@/lib/reminders";
import { cn } from "@/lib/utils";

const celebrate = [
  "Beautifully done 🌸 small wins really do add up.",
  "Look at you, taking such kind care of yourself ✨",
  "That's a lovely little victory 💙",
  "Cared for. Counted. Cherished 🌸",
];

interface Props {
  reminder: Reminder;
  onToggle: (id: string) => void;
}

export function ReminderCard({ reminder, onToggle }: Props) {
  const meta = kindMeta[reminder.kind];
  const Icon = meta.icon;
  const done = !!reminder.completedOn;

  const handle = () => {
    onToggle(reminder.id);
    if (!done) {
      toast.success(celebrate[Math.floor(Math.random() * celebrate.length)], {
        description: `${reminder.title} — noted with love.`,
      });
    }
  };

  return (
    <div
      className={cn(
        "group relative overflow-hidden rounded-2xl border bg-card p-5 shadow-petal transition-all",
        done ? "opacity-70" : "hover:-translate-y-0.5 hover:shadow-soft",
      )}
    >
      <div className={cn("pointer-events-none absolute inset-0 bg-gradient-to-br opacity-60", meta.tint)} />
      <div className="relative flex items-start gap-4">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-card shadow-petal">
          <Icon className="h-5 w-5 text-primary" />
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
              {meta.label}
            </span>
            <span className="text-xs text-muted-foreground">· {reminder.time}</span>
          </div>
          <h3 className={cn("mt-0.5 font-display text-lg font-semibold text-foreground", done && "line-through decoration-primary/50")}>
            {reminder.title}
          </h3>
          <p className="mt-1 text-sm text-muted-foreground">{reminder.detail}</p>
        </div>
        <button
          onClick={handle}
          aria-label={done ? "Mark as not done" : "Mark as done"}
          className={cn(
            "relative flex h-10 w-10 shrink-0 items-center justify-center rounded-full border-2 transition-all",
            done
              ? "border-primary bg-primary text-primary-foreground shadow-petal"
              : "border-primary/30 bg-card text-transparent hover:border-primary hover:bg-primary/10",
          )}
        >
          <Check className={cn("h-5 w-5", done ? "opacity-100" : "opacity-0 group-hover:opacity-50 group-hover:text-primary")} />
        </button>
      </div>
    </div>
  );
}
