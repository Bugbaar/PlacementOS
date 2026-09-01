import { useEffect, useRef } from "react";
import { useAppDispatch, useAppSelector } from "../store";
import { bumpLogs, skipPlayback } from "../store/engineSlice";

export default function PipelineLogs() {
  const dispatch = useAppDispatch();
  const { logs, visibleLogCount, metrics, status } = useAppSelector((s) => s.engine);
  const scroller = useRef<HTMLDivElement>(null);
  const visible = logs.slice(0, visibleLogCount);
  const rate = metrics?.shortlistRate ?? 0;
  const pct = Math.round(rate * 100);
  const radius = 54;
  const circ = 2 * Math.PI * radius;
  const offset = circ - (status === "complete" || visibleLogCount > 3 ? rate : visibleLogCount / Math.max(logs.length, 1)) * circ;

  useEffect(() => {
    if (status !== "processing") return;
    const id = window.setInterval(() => dispatch(bumpLogs()), 18);
    return () => window.clearInterval(id);
  }, [status, dispatch]);

  useEffect(() => {
    scroller.current?.scrollTo({ top: scroller.current.scrollHeight });
  }, [visibleLogCount]);

  return (
    <section className="grid grid-cols-1 lg:grid-cols-5 gap-4 rounded-xl border border-zinc-800 bg-[#18181B] overflow-hidden">
      <div className="lg:col-span-3 border-b lg:border-b-0 lg:border-r border-zinc-800">
        <div className="flex items-center justify-between px-4 py-3 border-b border-zinc-800">
          <p className="text-xs font-medium text-zinc-400">Realtime pipeline</p>
          <button
            type="button"
            onClick={() => dispatch(skipPlayback())}
            className="text-[11px] text-zinc-500 hover:text-zinc-300"
          >
            Skip playback
          </button>
        </div>
        <div
          ref={scroller}
          className="h-64 overflow-auto bg-black/40 p-4 font-mono text-[11px] leading-5 text-zinc-400"
        >
          {visible.length === 0 ? (
            <p className="text-zinc-600">Awaiting engine execution…</p>
          ) : (
            visible.map((line, i) => (
              <p
                key={`${i}-${line.slice(0, 24)}`}
                className={
                  line.includes("MATCH")
                    ? "text-emerald-400"
                    : line.includes("REJECT")
                      ? "text-rose-400"
                      : line.includes("COMPLETE")
                        ? "text-blue-300"
                        : "text-zinc-400"
                }
              >
                {line}
                {status === "processing" && i === visible.length - 1 ? (
                  <span className="ml-0.5 inline-block h-3 w-1.5 animate-pulse bg-emerald-400 align-middle" />
                ) : null}
              </p>
            ))
          )}
        </div>
      </div>
      <div className="lg:col-span-2 flex flex-col items-center justify-center gap-4 p-6">
        <div className="relative h-36 w-36">
          <svg viewBox="0 0 140 140" className="h-full w-full -rotate-90">
            <circle cx="70" cy="70" r={radius} fill="none" stroke="#27272A" strokeWidth="10" />
            <circle
              cx="70"
              cy="70"
              r={radius}
              fill="none"
              stroke="#10B981"
              strokeWidth="10"
              strokeLinecap="round"
              strokeDasharray={circ}
              strokeDashoffset={Number.isFinite(offset) ? offset : circ}
              className="transition-[stroke-dashoffset] duration-300"
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-2xl font-semibold text-white">{metrics ? `${pct}%` : "—"}</span>
            <span className="text-[10px] uppercase tracking-widest text-zinc-500">Shortlist</span>
          </div>
        </div>
        <div className="grid grid-cols-3 gap-3 w-full text-center">
          <Stat label="Total" value={metrics?.total ?? 0} />
          <Stat label="In" value={metrics?.shortlisted ?? 0} tone="ok" />
          <Stat label="Out" value={metrics?.rejected ?? 0} tone="bad" />
        </div>
        {metrics ? (
          <p className="text-[11px] text-zinc-500">
            Avg shortlisted CGPA {metrics.avgCgpaShortlisted} · {metrics.elapsedMs}ms engine time
          </p>
        ) : null}
      </div>
    </section>
  );
}

function Stat({
  label,
  value,
  tone,
}: {
  label: string;
  value: number;
  tone?: "ok" | "bad";
}) {
  const color = tone === "ok" ? "text-emerald-400" : tone === "bad" ? "text-rose-400" : "text-zinc-200";
  return (
    <div className="rounded-lg border border-zinc-800 bg-obsidian px-2 py-2">
      <p className={`text-lg font-semibold ${color}`}>{value}</p>
      <p className="text-[10px] uppercase tracking-wider text-zinc-500">{label}</p>
    </div>
  );
}
