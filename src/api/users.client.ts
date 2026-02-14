import type {
  CreateUserRequest,
  UpdateUserRequest,
  UpdateUserStatusRequest,
  GetUserRespond,
} from "@/dto/userDto";
import { clientFetch, clientFetchArray } from "@/lib/client-api";
/* -------------------- query -------------------- */

/**
 * GET /api/users/organization?page=&limit=&status=
 */
export type UserListPage = {
  items: GetUserRespond[];
  total: number;
  page: number;
  limit: number;
  total_pages: number; // จาก API เท่านั้น
};

export async function GetUserByOrgFromApi(
  page: number = 1,
  limit: number = 10,
  filter: "all" | "active" | "inactive" = "all"
): Promise<UserListPage> {
  try {
    // Validate inputs
    const validPage = Math.max(1, Math.floor(page));
    const validLimit = Math.min(100, Math.max(1, Math.floor(limit)));

    const qs = new URLSearchParams({
      page: String(validPage),
      limit: String(validLimit),
    });

    if (filter !== "all") {
      qs.set("status", filter);
    }

    const r = await clientFetchArray<{
      data: GetUserRespond[];
      total: number;
      page: number;
      limit: number;
      total_pages: number;
      pagination?: {
        page: number;
        limit: number;
        total: number;
        total_pages: number;
      };
    }>(`/api/users/organization?${qs.toString()}`, { cache: "no-store" });

    if (!r.success) {
      console.warn("[GetUserByOrgFromApi] API call failed:", r);
      return {
        items: [],
        total: 0,
        page: validPage,
        limit: validLimit,
        total_pages: 0,
      };
    }

    const body = r.data;

    // Parse response with fallbacks
    const items = Array.isArray(body.data) ? body.data : [];
    const total = typeof body.total === "number" ? body.total : 0;
    const respPage = typeof body.page === "number" ? body.page : validPage;
    const respLimit = typeof body.limit === "number" ? body.limit : validLimit;
    const totalPages = typeof body.total_pages === "number" ? body.total_pages : Math.ceil(total / respLimit);

    return {
      items,
      total,
      page: respPage,
      limit: respLimit,
      total_pages: totalPages,
    };
  } catch (error) {
    console.error("[GetUserByOrgFromApi] Error:", error);
    return {
      items: [],
      total: 0,
      page: Math.max(1, page),
      limit: Math.max(1, limit),
      total_pages: 0,
    };
  }
}


export async function GetUserByIdFromApi(
  user_id: string
): Promise<GetUserRespond | null> {
  const r = await clientFetch<any>(`/api/users/${user_id}`, {
    cache: "no-store",
  });

  if (!r.success) return null;

  const body = r.data;
  if (!body) return null;

  if (body.data && typeof body.data === "object") {
    return body.data as GetUserRespond;
  }

  if (typeof body === "object") {
    return body as GetUserRespond;
  }

  return null;
}


/**
 * Return all users (helper for selects). Uses a large `limit` to attempt to fetch all rows.
 */
export async function GetAllUsers(): Promise<GetUserRespond[]> {
  const r = await GetUserByOrgFromApi(1, 1000);
  return r.items ?? [];
}

/**
 * GET /api/users - Get all users in organization with filters and pagination
 */
export type GetUsersFilters = {
  page?: number;
  limit?: number;
  organization_name?: string;
  is_active?: boolean;
  role?: string;
  is_system_role?: boolean;
  full_name?: string;
};

export type GetUsersResponse = {
  data: GetUserRespond[];
  page: number;
  limit: number;
  total: number;
  total_pages: number;
};

export async function GetAllUsersFromApi(
  filters: GetUsersFilters = {}
): Promise<GetUsersResponse> {
  try {
    const params = new URLSearchParams();
    
    // Pagination
    if (filters.page) params.set("page", String(filters.page));
    if (filters.limit) params.set("limit", String(filters.limit));
    
    // Filters
    if (filters.organization_name) params.set("organization_name", filters.organization_name);
    if (typeof filters.is_active === "boolean") params.set("is_active", String(filters.is_active));
    if (filters.role) params.set("role", filters.role);
    if (typeof filters.is_system_role === "boolean") params.set("is_system_role", String(filters.is_system_role));
    if (filters.full_name) params.set("full_name", filters.full_name);

    const queryString = params.toString();
    const url = queryString ? `/api/users?${queryString}` : "/api/users";

    const r = await clientFetchArray<GetUsersResponse>(url, {
      cache: "no-store",
    });

    if (!r.success) {
      console.warn("[GetAllUsersFromApi] API call failed:", r);
      return {
        data: [],
        page: filters.page || 1,
        limit: filters.limit || 10,
        total: 0,
        total_pages: 0,
      };
    }

    const body = r.data;
    
    // Backend returns { data: [...], page, limit, total, total_pages }
    if (body && typeof body === "object" && "data" in body) {
      return {
        data: Array.isArray(body.data) ? body.data : [],
        page: typeof body.page === "number" ? body.page : (filters.page || 1),
        limit: typeof body.limit === "number" ? body.limit : (filters.limit || 10),
        total: typeof body.total === "number" ? body.total : 0,
        total_pages: typeof body.total_pages === "number" ? body.total_pages : 0,
      };
    }

    // Fallback: if response is array directly
    if (Array.isArray(body)) {
      return {
        data: body,
        page: filters.page || 1,
        limit: filters.limit || 10,
        total: (body as GetUserRespond[]).length,
        total_pages: 1,
      };
    }

    return {
      data: [],
      page: filters.page || 1,
      limit: filters.limit || 10,
      total: 0,
      total_pages: 0,
    };
  } catch (error) {
    console.error("[GetAllUsersFromApi] Error:", error);
    return {
      data: [],
      page: filters.page || 1,
      limit: filters.limit || 10,
      total: 0,
      total_pages: 0,
    };
  }
}

/**
 * Call server change-password route which uses HttpOnly cookie for auth.
 */
export async function ChangePassword(currentPassword: string, newPassword: string): Promise<string> {
  try {
    const res = await fetch("/api/users/change-password", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ current_password: currentPassword, new_password: newPassword }),
    });

    if (!res.ok) {
      const json = await res.json().catch(() => null);
      throw new Error(json?.message ?? `HTTP ${res.status}`);
    }

    const json = await res.json().catch(() => null);
    return json?.data?.message ?? json?.message ?? "เปลี่ยนรหัสผ่านสำเร็จ";
  } catch (err: any) {
    throw new Error(err?.message ?? "Failed to change password");
  }
}

/* -------------------- mutations -------------------- */

/**
 * POST /api/admin/users/create - Admin creates a new user
 */
export async function CreateUserByAdminFromApi(
  payload: CreateUserRequest
): Promise<{ ok: boolean; status: number; data?: any; message?: string }> {
  try {
    const res = await fetch("/api/admin/users/create", {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify(payload),
    });

    const body = await res.json().catch(() => null);
    if (!res.ok) {
      return {
        ok: false,
        status: res.status,
        data: body,
        message: body?.message ?? body?.responseMessage ?? `HTTP ${res.status}`,
      };
    }

    // successful create
    return { ok: true, status: res.status, data: body?.data ?? body };
  } catch (err: any) {
    return { ok: false, status: 0, message: err?.message ?? "Network error" };
  }
}

/**
 * POST /api/users
 */
export async function CreateUserFromApi(
  payload: CreateUserRequest
): Promise<{ ok: boolean; status: number; data?: any; message?: string }> {
  try {
    const res = await fetch("/api/users", {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify(payload),
    });

    const body = await res.json().catch(() => null);
    if (!res.ok) {
      return { ok: false, status: res.status, data: body, message: body?.message ?? body?.responseMessage ?? `HTTP ${res.status}` };
    }

    // successful create
    return { ok: true, status: res.status, data: body?.data ?? body };
  } catch (err: any) {
    return { ok: false, status: 0, message: err?.message ?? "Network error" };
  }
}

/**
 * PATCH /api/users/status
 */
export async function UpdateUserStatusFromApi(
  payload: UpdateUserStatusRequest
): Promise<boolean> {
  const r = await clientFetch("/api/users/status", {
    method: "PATCH",
    body: JSON.stringify(payload),
  });

  return r.success;
}

/**
 * PATCH /api/users/details
 */
export async function UpdateUserFromApi(
  payload: UpdateUserRequest
): Promise<boolean> {
  const r = await clientFetch("/api/users/details", {
    method: "PATCH",
    body: JSON.stringify(payload),
  });

  return r.success;
}
