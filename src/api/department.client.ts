import type { Department } from "@/dto/departmentDto";
import { clientFetchArray } from "@/lib/client-api";

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