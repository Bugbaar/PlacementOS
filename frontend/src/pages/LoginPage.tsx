import { FormEvent, useState } from "react";
import { useNavigate } from "react-router-dom";
import { api, setToken } from "../api/client";
import { signedIn } from "../store/authSlice";
import { useAppDispatch } from "../store";

export default function LoginPage() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const [email, setEmail] = useState("tpo@placementos.dev");
  const [password, setPassword] = useState("Placement@2026");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const res = await api.login(email, password);
      setToken(res.token);
      dispatch(signedIn({ token: res.token, email: res.user.email, name: res.user.name }));
      navigate("/");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Login failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-6 text-zinc-100">
      <div className="w-full max-w-md rounded-2xl border border-zinc-800 bg-[#18181B]/80 backdrop-blur-md p-8 shadow-glow">
        <div className="flex items-center gap-3 mb-8">
          <div className="h-3.5 w-3.5 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 animate-pulse" />
          <div>
            <h1 className="text-xl font-semibold tracking-tight">PlacementOS</h1>
            <p className="text-xs text-zinc-500">Placement Cell · Eligibility Engine</p>
          </div>
        </div>
        <form onSubmit={onSubmit} className="space-y-4">
          <label className="block text-xs uppercase tracking-wider text-zinc-400">
            Officer email
            <input
              className="mt-2 w-full rounded-lg border border-zinc-800 bg-obsidian px-3 py-2.5 text-sm outline-none focus:border-purple-500"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              type="email"
            />
          </label>
          <label className="block text-xs uppercase tracking-wider text-zinc-400">
            Password
            <input
              className="mt-2 w-full rounded-lg border border-zinc-800 bg-obsidian px-3 py-2.5 text-sm outline-none focus:border-purple-500"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              type="password"
            />
          </label>
          {error ? <p className="text-sm text-rose-400">{error}</p> : null}
          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-xl py-3 text-sm font-medium text-white bg-gradient-to-r from-blue-500 to-purple-600 hover:opacity-90 disabled:opacity-60"
          >
            {loading ? "Authenticating…" : "Enter cell dashboard"}
          </button>
        </form>
        <p className="mt-6 text-[11px] text-zinc-500">
          Demo access is prefilled. JWT is issued by the PlacementOS API.
        </p>
      </div>
    </div>
  );
}
