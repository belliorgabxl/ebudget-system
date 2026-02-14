import type {
  CreateOrganizationRequest,
  UpdateOrganizationRequest,
  OrganizationResponse,
  OrganizationListResponse,
  GetOrganizationsParams,
} from "@/dto/organizationDto";
import type { GetUserRespond } from "@/dto/userDto";
import { clientFetch, clientFetchArray } from "@/lib/client-api";

/* -------------------- queries -------------------- */

/**
 * GET /api/organizations
 * Get list of organizations with pagination and filters
 */
export type OrganizationListPage = {
  items: OrganizationResponse[];
  total: number;
  page: number;
  limit: number;
  total_pages: number;
};

export async function GetOrganizationsFromApi(
  params: GetOrganizationsParams = {}
): Promise<OrganizationListPage> {
  try {
    // Validate pagination
    const validPage = Math.max(1, Math.floor(params.page || 1));
    const validLimit = Math.min(100, Math.max(1, Math.floor(params.limit || 10)));

    const queryParams = new URLSearchParams({
      page: String(validPage),
      limit: String(validLimit),
    });

    // Add filters
    if (params.name) queryParams.set("name", params.name);
    if (params.type) queryParams.set("type", params.type);
    if (typeof params.is_active === "boolean") {
      queryParams.set("is_active", String(params.is_active));
    }

    const r = await clientFetchArray<OrganizationListResponse>(
      `/api/organizations?${queryParams.toString()}`,
      { cache: "no-store" }
    );

    if (!r.success) {
      console.warn("[GetOrganizationsFromApi] API call failed:", r);
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
    const totalPages =
      typeof body.total_pages === "number"
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
    console.error("[GetOrganizationsFromApi] Error:", error);
    return {
      items: [],
      total: 0,
      page: params.page || 1,
      limit: params.limit || 10,
      total_pages: 0,
    };
  }
}

/**
 * GET /api/organizations/{id}
 * Get single organization by ID
 */
export async function GetOrganizationByIdFromApi(
  id: string
): Promise<OrganizationResponse | null> {
  try {
    const r = await clientFetch<OrganizationResponse>(
      `/api/organizations/${id}`,
      { cache: "no-store" }
    );

    return r.success ? r.data : null;
  } catch (error) {
    console.error("[GetOrganizationByIdFromApi] Error:", error);
    return null;
  }
}

/**
 * GET /api/admin/organization/{org_id}
 * Get users by organization ID
 */
export async function GetUsersByOrgFromApi(
  orgId: string
): Promise<GetUserRespond[]> {
  try {
    const r = await clientFetchArray<{ success: boolean; data: GetUserRespond[] }>(
      `/api/admin/organization/${orgId}`,
      { cache: "no-store" }
    );

    if (!r.success || !r.data) return [];
    
    // r.data is the response object { success: true, data: [...] }
    const responseData = r.data as any;
    return Array.isArray(responseData.data) ? responseData.data : [];
  } catch (error) {
    console.error("[GetUsersByOrgFromApi] Error:", error);
    return [];
  }
}

/* -------------------- mutations -------------------- */

/**
 * POST /api/organizations
 * Create new organization
 */
export async function CreateOrganizationFromApi(
  payload: CreateOrganizationRequest
): Promise<{ ok: boolean; data?: any; message?: string }> {
  try {
    const r = await clientFetch<any>("/api/organizations", {
      method: "POST",
      body: JSON.stringify(payload),
      headers: { "Content-Type": "application/json" },
      cache: "no-store",
    });

    return r.success
      ? { ok: true, data: r.data }
      : { ok: false, message: r.message || "Failed to create organization" };
  } catch (error) {
    console.error("[CreateOrganizationFromApi] Error:", error);
    return { ok: false, message: "Failed to create organization" };
  }
}

/**
 * PUT /api/organizations/{id}
 * Update organization (🚧 Not implemented in backend yet)
 */
export async function UpdateOrganizationFromApi(
  payload: UpdateOrganizationRequest
): Promise<{ ok: boolean; data?: OrganizationResponse; message?: string }> {
  try {
    const { id, ...body } = payload;
    const r = await clientFetch<OrganizationResponse>(
      `/api/organizations/${id}`,
      {
        method: "PUT",
        body: JSON.stringify(body),
        headers: { "Content-Type": "application/json" },
        cache: "no-store",
      }
    );

    return r.success
      ? { ok: true, data: r.data }
      : { ok: false, message: r.message || "Update failed" };
  } catch (error) {
    console.error("[UpdateOrganizationFromApi] Error:", error);
    return { ok: false, message: "Failed to update organization" };
  }
}

/**
 * DELETE /api/organizations/{id}
 * Delete organization (🚧 Not implemented in backend yet)
 */
export async function DeleteOrganizationFromApi(
  id: string
): Promise<boolean> {
  try {
    const r = await clientFetch(`/api/organizations/${id}`, {
      method: "DELETE",
      cache: "no-store",
    });

    return r.success;
  } catch (error) {
    console.error("[DeleteOrganizationFromApi] Error:", error);
    return false;
  }
}
