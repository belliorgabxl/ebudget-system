import type { Department } from "@/dto/departmentDto";
import { clientFetchArray, clientFetch } from "@/lib/client-api";

/**
 * GET /api/departments/{org_id}
 * Get departments by organization ID
 */
export async function GetDepartmentsByOrgFromApi(
  orgId: string
): Promise<Department[]> {
  try {
    const r = await clientFetchArray<{ success: boolean; data: Department[] }>(
      `/api/departments/${orgId}`,
      { cache: "no-store" }
    );

    if (!r.success || !r.data) return [];
    
    // r.data is the response object { success: true, data: [...] }
    const responseData = r.data as any;
    return Array.isArray(responseData.data) ? responseData.data : [];
  } catch (error) {
    console.error("[GetDepartmentsByOrgFromApi] Error:", error);
    return [];
  }
}

/**
 * POST /api/admin/departments
 * Create a new department
 */
export async function CreateDepartmentFromApi(data: {
  code: string;
  name: string;
  organization_id: string;
}): Promise<{ success: boolean; message?: string; data?: Department }> {
  try {
    const r = await clientFetch<Department>("/api/admin/departments", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });

    return r;
  } catch (error) {
    console.error("[CreateDepartmentFromApi] Error:", error);
    return { success: false, message: "Network error" };
  }
}