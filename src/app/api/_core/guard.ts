import { NextRequest } from "next/server";
import { fail } from "./response";

export function requireAuth(req: NextRequest) {
  const token = req.cookies.get("accessToken")?.value;

  if (!token) {
    return {
      ok: false,
      response: fail("UNAUTHORIZED", "4010"),
    };
  }

  return { ok: true };
}

export function allowMethods(
  method: string,
  allowed: string[]
) {
  if (!allowed.includes(method)) {
    return {
      ok: false,
      response: fail("METHOD_NOT_ALLOWED", "4050"),
    };
  }
  return { ok: true };
}

export function requireJson(req: NextRequest) {
  const ct = req.headers.get("content-type");
  if (!ct?.includes("application/json")) {
    return {
      ok: false,
      response: fail("INVALID_CONTENT_TYPE", "4150"),
    };
  }
  return { ok: true };
}
