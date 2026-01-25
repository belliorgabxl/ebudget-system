import type {
  CreateOrganizationRequest,
  UpdateOrganizationRequest,
  OrganizationResponse,
  OrganizationListResponse,
  GetOrganizationsParams,
} from "@/dto/organizationDto";
import { nestFetch } from "@/lib/server-api";

/* -------------------- queries -------------------- */

/**
 * GET /organizations
 * Get list of organizations with pagination and filters
 */
export async function GetOrganizationsFromApiServer(
  params: GetOrganizationsParams = {}
): Promise<OrganizationListResponse> {
  try {
    const queryParams = new URLSearchParams();

    // Add pagination
    if (params.page) queryParams.set("page", String(params.page));
    if (params.limit) queryParams.set("limit", String(params.limit));

    // Add filters
    if (params.name) queryParams.set("name", params.name);
    if (params.type) queryParams.set("type", params.type);
    if (typeof params.is_active === "boolean") {
      queryParams.set("is_active", String(params.is_active));
    }

    const url = `/organizations${queryParams.toString() ? `?${queryParams.toString()}` : ""}`;
    const r = await nestFetch<OrganizationListResponse>(url, { method: "GET" });

    if (!r.success) {
      console.warn(`[GetOrganizationsFromApiServer] Backend API failed:`, r.message);
      return {
        data: [],
        total: 0,
        page: params.page || 1,
        limit: params.limit || 10,
        total_pages: 0,
      };
    }

    const body = r.data ?? {
      data: [],
      total: 0,
      page: params.page || 1,
      limit: params.limit || 10,
      total_pages: 0,
    };

    return body;
  } catch (error) {
    console.error("[GetOrganizationsFromApiServer] Error:", error);
    return {
      data: [],
      total: 0,
      page: params.page || 1,
      limit: params.limit || 10,
      total_pages: 0,
    };
  }
}

/**
 * GET /organizations/{id}
 * Get single organization by ID
 */
export async function GetOrganizationByIdFromApiServer(
  id: string
): Promise<OrganizationResponse | null> {
  try {
    const r = await nestFetch<OrganizationResponse>(`/organizations/${id}`, {
      method: "GET",
    });

    return r.success ? r.data ?? null : null;
  } catch (error) {
    console.error("[GetOrganizationByIdFromApiServer] Error:", error);
    return null;
  }
}

/* -------------------- mutations -------------------- */

/**
 * POST /organizations
 * Create new organization
 */
export async function CreateOrganizationFromApiServer(
  payload: CreateOrganizationRequest
): Promise<{ ok: boolean; data?: any; message?: string }> {
  try {
    console.log("[CreateOrganizationFromApiServer] Sending payload:", payload);
    
    const r = await nestFetch<any>("/organizations", {
      method: "POST",
      body: JSON.stringify(payload),
      headers: { "Content-Type": "application/json" },
    });

    console.log("[CreateOrganizationFromApiServer] Response:", r);

    return r.success
      ? { ok: true, data: r.data }
      : { ok: false, message: r.message || "Backend API returned error" };
  } catch (error: any) {
    console.error("[CreateOrganizationFromApiServer] Error:", error);
    return { ok: false, message: error?.message || "Failed to create organization" };
  }
}

/**
 * PUT /organizations/{id}
 * Update organization (🚧 Not implemented in backend yet)
 */
export async function UpdateOrganizationFromApiServer(
  payload: UpdateOrganizationRequest
): Promise<{ ok: boolean; data?: OrganizationResponse; message?: string }> {
  try {
    const { id, ...body } = payload;
    const r = await nestFetch<OrganizationResponse>(`/organizations/${id}`, {
      method: "PUT",
      body: JSON.stringify(body),
      headers: { "Content-Type": "application/json" },
    });

    return r.success
      ? { ok: true, data: r.data }
      : { ok: false, message: r.message || "Update failed" };
  } catch (error) {
    console.error("[UpdateOrganizationFromApiServer] Error:", error);
    return { ok: false, message: "Failed to update organization" };
  }
}

/**
 * DELETE /organizations/{id}
 * Delete organization (🚧 Not implemented in backend yet)
 */
export async function DeleteOrganizationFromApiServer(
  id: string
): Promise<boolean> {
  try {
    const r = await nestFetch(`/organizations/${id}`, {
      method: "DELETE",
    });

    return r.success;
  } catch (error) {
    console.error("[DeleteOrganizationFromApiServer] Error:", error);
    return false;
  }
}
