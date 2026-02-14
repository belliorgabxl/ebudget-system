import type {
  CreateUserRequest,
  UpdateUserRequest,
  UpdateUserStatusRequest,
  GetUserRespond,
} from "@/dto/userDto";
import { nestFetch } from "@/lib/server-api";

/* -------------------- queries -------------------- */

export type UserListServerResponse = {
  items: GetUserRespond[];
  total: number;
  page: number;
  limit: number;
  total_pages: number;
};

export async function GetUserByOrgFromApiServer(
  page: number,
  limit: number,
  status?: "active" | "inactive" | "all"
): Promise<UserListServerResponse> {
  try {
    // Build query string
    const params = new URLSearchParams({
      page: String(page),
      limit: String(limit),
    });

    if (status && status !== "all") {
      params.set("status", status);
    }

    const url = `/users/organization?${params.toString()}`;
    const r = await nestFetch<any>(url, { method: "GET" });

    if (!r.success) {
      console.warn(`[GetUserByOrgFromApiServer] Backend API failed:`, r.message);
      return {
        items: [],
        total: 0,
        page,
        limit,
        total_pages: 0,
      };
    }

    const body = r.data ?? {};
    const pagination = body.pagination ?? {};

    // Parse items - support multiple response formats
    const items = Array.isArray(body.items)
      ? body.items
      : Array.isArray(body.data)
      ? body.data
      : [];

    // Parse pagination info with fallbacks
    const total = typeof body.total === "number"
      ? body.total
      : typeof pagination.total === "number"
      ? pagination.total
      : items.length;

    const respPage = typeof pagination.page === "number"
      ? pagination.page
      : typeof body.page === "number"
      ? body.page
      : page;

    const respLimit = typeof pagination.limit === "number"
      ? pagination.limit
      : typeof body.limit === "number"
      ? body.limit
      : limit;

    const totalPages = typeof pagination.total_pages === "number"
      ? pagination.total_pages
      : typeof body.total_pages === "number"
      ? body.total_pages
      : Math.ceil(total / respLimit);

    return {
      items,
      total,
      page: respPage,
      limit: respLimit,
      total_pages: totalPages,
    };
  } catch (error) {
    console.error("[GetUserByOrgFromApiServer] Error:", error);
    return {
      items: [],
      total: 0,
      page,
      limit,
      total_pages: 0,
    };
  }
}
export async function GetUserByIdFromApiServer(id: string) {
  const r = await nestFetch<any>(`/users/${id}`, { method: "GET" });
  return r.success ? r.data ?? null : null;
}

/**
 * GET /users - Get all users in organization with query string
 */
export async function GetAllUsersFromApiServer(urlPath: string = "/users"): Promise<any> {
  try {
    const r = await nestFetch<any>(urlPath, { method: "GET" });

    if (!r.success) {
      console.warn("[GetAllUsersFromApiServer] Backend API failed:", r.message);
      return {
        data: [],
        page: 1,
        limit: 10,
        total: 0,
        total_pages: 0,
      };
    }

    // Backend returns { data, page, limit, total, total_pages }
    return r.data;
  } catch (error) {
    console.error("[GetAllUsersFromApiServer] Error:", error);
    return {
      data: [],
      page: 1,
      limit: 10,
      total: 0,
      total_pages: 0,
    };
  }
}


/* -------------------- mutations -------------------- */

/**
 * POST /admin/users/create - Admin creates a new user
 */
export async function CreateUserByAdminFromApiServer(
  payload: CreateUserRequest
) {
  const r = await nestFetch<any>("/admin/users/create", {
    method: "POST",
    body: JSON.stringify(payload),
    headers: { "Content-Type": "application/json" },
  });

  return r.success
    ? { ok: true, data: r.data }
    : { ok: false, message: r.message };
}

export async function CreateUserFromApiServer(
  payload: CreateUserRequest
) {
  const r = await nestFetch<any>("/users", {
    method: "POST",
    body: JSON.stringify(payload),
    headers: { "Content-Type": "application/json" },
  });

  return r.success
    ? { ok: true, data: r.data }
    : { ok: false, message: r.message };
}

export async function UpdateUserStatusFromApiServer(
  payload: UpdateUserStatusRequest
): Promise<boolean> {
  const r = await nestFetch("/users/status", {
    method: "PATCH",
    body: JSON.stringify(payload),
    headers: { "Content-Type": "application/json" },
  });

  return r.success;
}

export async function UpdateUserFromApiServer(
  payload: UpdateUserRequest
): Promise<boolean> {
  const r = await nestFetch("/users/details", {
    method: "PATCH",
    body: JSON.stringify(payload),
    headers: { "Content-Type": "application/json" },
  });

  return r.success;
}
