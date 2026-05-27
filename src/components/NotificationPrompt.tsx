import { useEffect, useState } from "react";
import { Bell, BellOff, BellRing } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { notificationPermission, requestNotificationPermission } from "@/lib/reminders";

export function NotificationPrompt() {
  const [perm, setPerm] = useState<NotificationPermission | "unsupported">("default");

  useEffect(() => {
    setPerm(notificationPermission());
  }, []);

  if (perm === "unsupported") return null;

  if (perm === "granted") {
    return (
      <div className="inline-flex items-center gap-1.5 rounded-full bg-card/80 px-3 py-1 text-xs text-muted-foreground shadow-petal">
        <BellRing className="h-3.5 w-3.5 text-primary" /> Gentle nudges on
      </div>
    );
  }

  if (perm === "denied") {
    return (
      <div className="inline-flex items-center gap-1.5 rounded-full bg-card/80 px-3 py-1 text-xs text-muted-foreground shadow-petal">
        <BellOff className="h-3.5 w-3.5" /> Notifications blocked in your browser
      </div>
    );
  }

  return (
    <Button
      type="button"
      size="sm"
      variant="outline"
      className="rounded-full border-primary/30 bg-card/80 text-foreground shadow-petal hover:bg-primary/10"
      onClick={async () => {
        const result = await requestNotificationPermission();
        setPerm(result);
        if (result === "granted") {
          toast.success("Lovely — we'll whisper a soft reminder when it's time 🌸");
          try {
            new Notification("🌸 Petal is here", { body: "We'll gently nudge you at reminder time." });
          } catch { /* ignore */ }
        } else if (result === "denied") {
          toast("No worries — you can still see reminders right here 💙");
        }
      }}
    >
      <Bell className="mr-1.5 h-3.5 w-3.5" /> Turn on gentle nudges
    </Button>
  );
}
