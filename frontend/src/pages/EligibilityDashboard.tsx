import { useEffect } from "react";
import { io } from "socket.io-client";
import { LogOut } from "lucide-react";
import { api, clearToken } from "../api/client";
import CriteriaPanel from "../components/CriteriaPanel";
import Dropzone from "../components/Dropzone";
import NotificationFeed from "../components/NotificationFeed";
import PipelineLogs from "../components/PipelineLogs";
import ResultsTable from "../components/ResultsTable";
import { signedOut } from "../store/authSlice";
import { setError, setRun, setStatus } from "../store/engineSlice";
import { useAppDispatch, useAppSelector } from "../store";

export default function EligibilityDashboard() {
  const dispatch = useAppDispatch();
  const auth = useAppSelector((s) => s.auth);
  const engine = useAppSelector((s) => s.engine);

  useEffect(() => {
    const socket = io({ transports: ["websocket"] });
    return () => {
      socket.close();
    };
  }, []);

  async function execute() {
    if (!engine.batchId) {
      dispatch(setError("Upload a student CSV before running the engine."));
      return;
    }
    dispatch(setStatus("processing"));
    try {
      const res = await api.runEngine(engine.batchId, engine.criteria);
      dispatch(
        setRun({
          runId: res.runId,
          logs: res.logs,
          results: res.results,
          metrics: res.metrics,
          notifications: res.notifications,
          appliedCriteria: engine.criteria,
        }),
      );
    } catch (err) {
      dispatch(setError(err instanceof Error ? err.message : "Engine failed"));
    }
  }

  function logout() {
    clearToken();
    dispatch(signedOut());
  }

  return (
    <div className="min-h-screen text-zinc-100 p-6 md:p-8 font-sans">
      <header className="mx-auto mb-10 flex max-w-6xl items-center justify-between border-b border-zinc-800 pb-4">
        <div className="flex items-center gap-3">
          <div className="h-4 w-4 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 animate-pulse" />
          <h1 className="text-xl font-bold tracking-tight bg-gradient-to-r from-white to-zinc-400 bg-clip-text text-transparent">
            PlacementOS
            <span className="ml-2 text-sm font-medium text-zinc-500">/ Cell Engine</span>
          </h1>
        </div>
        <div className="flex items-center gap-3">
          <span className="hidden sm:inline text-xs text-zinc-500">{auth.email}</span>
          <span className="text-xs bg-zinc-900 border border-zinc-800 px-3 py-1 rounded-full text-zinc-400">
            v1.0.0 Stable
          </span>
          <button type="button" onClick={logout} className="rounded-lg border border-zinc-800 p-1.5 text-zinc-500 hover:text-zinc-200">
            <LogOut className="h-4 w-4" />
          </button>
        </div>
      </header>

      <main className="mx-auto max-w-6xl grid grid-cols-1 lg:grid-cols-3 gap-8">
        <CriteriaPanel />
        <section className="lg:col-span-2 space-y-6">
          <Dropzone />
          {engine.error ? (
            <p className="text-sm text-rose-400">{engine.error}</p>
          ) : null}
          <button
            type="button"
            onClick={() => void execute()}
            disabled={engine.status === "processing" || engine.status === "uploading"}
            className="w-full py-3 rounded-xl font-medium tracking-wide bg-gradient-to-r from-blue-500 to-purple-600 hover:opacity-90 active:scale-[0.99] transition-all text-white shadow-lg shadow-purple-500/10 text-sm disabled:opacity-60"
          >
            {engine.status === "processing"
              ? "Processing data streams…"
              : "Execute automated shortlisting engine"}
          </button>
          <PipelineLogs />
          <ResultsTable />
          <NotificationFeed />
        </section>
      </main>
    </div>
  );
}
