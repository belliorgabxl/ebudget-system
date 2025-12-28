import { cookies } from "next/headers";
import "server-only";

import { headers } from "next/headers";

export async function getBaseUrl() {
  const h = await headers();

  const host = h.get("x-forwarded-host") ?? h.get("host");

  const proto = h.get("x-forwarded-proto") ?? "http";

  if (host) {
    return `${proto}://${host}`;
  }

  return process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
}

const NEST_BASE_URL = process.env.API_BASE_URL!;
type ApiOk<T> = { success: true; data: T; status?: number };
type ApiFail = { success: false; message?: string , status?: number  };
export type ApiResult<T> = ApiOk<T> | ApiFail;

export async function nestFetch<T>(
  path: string,
  init?: RequestInit
): Promise<ApiResult<T>> {
  try {
    const incomingAuth =
      (init?.headers instanceof Headers
        ? init.headers.get("authorization")
        : typeof init?.headers === "object" && init?.headers
        ? (init.headers as Record<string, string>)["authorization"] ??
          (init.headers as Record<string, string>)["Authorization"]
        : undefined) ?? "";

    const cookieToken = (await cookies()).get("api_token")?.value;

    const headers = new Headers(init?.headers);
    headers.set("Accept", "application/json");

    if (incomingAuth) {
      headers.set("Authorization", incomingAuth);
    } else if (cookieToken) {
      headers.set("Authorization", `Bearer ${cookieToken}`);
    }

    const res = await fetch(`${NEST_BASE_URL}${path}`, {
      ...init,
      headers,
      cache: "no-store",
    });

    const status = res.status;

    if (!res.ok) {
      const msg = (await res.text().catch(() => "")) || `HTTP ${status}`;
      return { success: false, message: msg, status };
    }

    const json = (await res.json()) as T;
    return { success: true, data: json, status };
  } catch (e: any) {
    return { success: false, message: e?.message ?? "Unknown error" };
  }
}
export const nestGet = <T>(path: string, init?: RequestInit) =>
  nestFetch<T>(path, { ...init, method: "GET" });

export const nestPost = <T>(path: string, body?: any, init?: RequestInit) =>
  nestFetch<T>(path, {
    ...init,
    method: "POST",
    body: JSON.stringify(body),
    headers: { "Content-Type": "application/json", ...(init?.headers as any) },
  });

export const nestPut = <T>(path: string, body?: any) =>
  nestFetch<T>(path, {
    method: "PUT",
    body: JSON.stringify(body),
    headers: { "Content-Type": "application/json" },
  });

export const nestDelete = <T>(path: string) =>
  nestFetch<T>(path, { method: "DELETE" });
