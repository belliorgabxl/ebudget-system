import "server-only";

const NEST_BASE_URL = process.env.API_BASE_URL
if (!NEST_BASE_URL) throw new Error("Missing NEST_BASE_URL");

export async function nestFetch<T>(
  path: string,
  init?: RequestInit
): Promise<{ ok: boolean; status: number; data?: T; text?: string }> {
  const res = await fetch(`${NEST_BASE_URL}${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(init?.headers ?? {}),
    },
    cache: "no-store",
  });

  const contentType = res.headers.get("content-type") || "";
  if (contentType.includes("application/json")) {
    return { ok: res.ok, status: res.status, data: (await res.json()) as T };
  }
  return { ok: res.ok, status: res.status, text: await res.text() };
}
