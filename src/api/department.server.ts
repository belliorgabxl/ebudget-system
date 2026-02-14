import { nestFetch } from "@/lib/server-api";
import type { Department } from "@/dto/departmentDto";

export type UpdateDepartmentRequest = {
  code?: string;
  name?: string;
  is_active?: boolean;
};

export type DepartmentListResponse = {
  data: Department[];
};

/**
 * GET /departments/{org_id}
 * Get departments by organization ID
 */
export async function GetDepartmentsByOrgFromApiServer(
  orgId: string
): Promise<DepartmentListResponse> {
  try {
    const r = await nestFetch<DepartmentListResponse>(`/departments/${orgId}`, {
      method: "GET",
    });

    if (!r.success) {
      console.warn(`[GetDepartmentsByOrgFromApiServer] Backend API failed:`, r.message);
      return {
        data: [],
      };
    }

    return r.data ?? { data: [] };
  } catch (error) {
    console.error("[GetDepartmentsByOrgFromApiServer] Error:", error);
    return {
      data: [],
    };
  }
}

export async function UpdateDepartmentFromApiServer(
  id: string,
  payload: UpdateDepartmentRequest
): Promise<boolean> {
  const r = await nestFetch(`/departments/${id}`, {
    method: "PATCH",
    body: JSON.stringify(payload),
    headers: { "Content-Type": "application/json" },
  });

  return r.success;
}
