const TOKEN_KEY = "placementos_token";

export function getToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

export function setToken(token: string): void {
  localStorage.setItem(TOKEN_KEY, token);
}

export function clearToken(): void {
  localStorage.removeItem(TOKEN_KEY);
}

async function request<T>(path: string, init: RequestInit = {}): Promise<T> {
  const headers = new Headers(init.headers);
  const token = getToken();
  if (token) headers.set("Authorization", `Bearer ${token}`);
  if (!(init.body instanceof FormData) && !headers.has("Content-Type") && init.body) {
    headers.set("Content-Type", "application/json");
  }

  const res = await fetch(path, { ...init, headers });
  if (!res.ok) {
    const payload = await res.json().catch(() => ({ error: res.statusText }));
    throw new Error(payload.error || "Request failed");
  }
  return res.json() as Promise<T>;
}

export const api = {
  login: (email: string, password: string) =>
    request<{ token: string; user: { email: string; name: string; role: string } }>("/api/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    }),
  uploadCsv: (file: File) => {
    const body = new FormData();
    body.append("file", file);
    return request<import("./types").UploadResponse>("/api/uploads/students", {
      method: "POST",
      body,
    });
  },
  runEngine: (batchId: string, criteria: import("./types").EligibilityCriteria) =>
    request<import("./types").RunResponse>("/api/engine/run", {
      method: "POST",
      body: JSON.stringify({ batchId, criteria }),
    }),
};

export function exportUrl(runId: string, kind: "csv" | "pdf" | "audit"): string {
  if (kind === "pdf") return `/api/engine/runs/${runId}/export.pdf`;
  if (kind === "audit") return `/api/engine/runs/${runId}/export.csv?mode=audit`;
  return `/api/engine/runs/${runId}/export.csv?mode=shortlisted`;
}

export async function downloadExport(runId: string, kind: "csv" | "pdf" | "audit"): Promise<void> {
  const token = getToken();
  const res = await fetch(exportUrl(runId, kind), {
    headers: token ? { Authorization: `Bearer ${token}` } : undefined,
  });
  if (!res.ok) throw new Error("Export failed");
  const blob = await res.blob();
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download =
    kind === "pdf"
      ? `placementos-shortlist-${runId}.pdf`
      : `placementos-${kind}-${runId}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}
