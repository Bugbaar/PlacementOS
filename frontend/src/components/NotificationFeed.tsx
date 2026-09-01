import { Bell } from "lucide-react";
import { useAppSelector } from "../store";

export default function NotificationFeed() {
  const notifications = useAppSelector((s) => s.engine.notifications);

  return (
    <section className="rounded-xl border border-zinc-800 bg-[#18181B] p-4">
      <div className="mb-3 flex items-center gap-2 text-sm font-medium text-zinc-200">
        <Bell className="h-4 w-4 text-purple-400" />
        Mock notification log
      </div>
      <div className="max-h-48 space-y-2 overflow-auto">
        {notifications.length === 0 ? (
          <p className="text-xs text-zinc-500">Shortlisted students will receive simulated email / WhatsApp / in-app pings.</p>
        ) : (
          notifications.slice(0, 12).map((n) => (
            <div key={n.id} className="rounded-lg border border-zinc-800 bg-obsidian px-3 py-2">
              <div className="flex items-center justify-between gap-2">
                <span className="text-[10px] uppercase tracking-wider text-zinc-500">{n.channel}</span>
                <span className={n.status === "sent" ? "text-[10px] text-emerald-400" : "text-[10px] text-amber-400"}>
                  {n.status}
                </span>
              </div>
              <p className="mt-1 truncate text-xs text-zinc-300">{n.recipient}</p>
            </div>
          ))
        )}
      </div>
    </section>
  );
}
