import { clientFetch } from "@/lib/client-api";
import type {
  DashboardKPI,
  BudgetByYear,
  BudgetByDepartment,
  BudgetByStatus,
  ProjectCountByDepartment,
  ProjectCountByStatus,
  ApprovalQueueItem,
} from "@/dto/dashboardDto";

/* -------------------- Dashboard KPI -------------------- */

export async function GetDashboardKPIFromApi(
  year: string
): Promise<DashboardKPI | null> {
  try {
    const r = await clientFetch<DashboardKPI>(
      `/api/dashboard/kpi?year=${encodeURIComponent(year)}`,
      { cache: "no-store" }
    );
    return r.success ? r.data ?? null : null;
  } catch (error) {
    console.error("[Client] GetDashboardKPIFromApi error:", error);
    return null;
  }
}

/* -------------------- Budget Charts -------------------- */

export async function GetBudgetByYearFromApi(
  year?: string
): Promise<BudgetByYear[]> {
  try {
    const params = year ? `?year=${encodeURIComponent(year)}` : "";
    const r = await clientFetch<BudgetByYear[]>(
      `/api/dashboard/budget/by-year${params}`,
      { cache: "no-store" }
    );
    return r.success ? r.data ?? [] : [];
  } catch (error) {
    console.error("[Client] GetBudgetByYearFromApi error:", error);
    return [];
  }
}

export async function GetBudgetByDepartmentFromApi(
  year?: string
): Promise<BudgetByDepartment[]> {
  try {
    const params = year ? `?year=${encodeURIComponent(year)}` : "";
    const r = await clientFetch<BudgetByDepartment[]>(
      `/api/dashboard/budget/by-department${params}`,
      { cache: "no-store" }
    );
    return r.success ? r.data ?? [] : [];
  } catch (error) {
    console.error("[Client] GetBudgetByDepartmentFromApi error:", error);
    return [];
  }
}

export async function GetBudgetByStatusFromApi(
  year?: string
): Promise<BudgetByStatus[]> {
  try {
    const params = year ? `?year=${encodeURIComponent(year)}` : "";
    const r = await clientFetch<BudgetByStatus[]>(
      `/api/dashboard/budget/by-status${params}`,
      { cache: "no-store" }
    );
    return r.success ? r.data ?? [] : [];
  } catch (error) {
    console.error("[Client] GetBudgetByStatusFromApi error:", error);
    return [];
  }
}

/* -------------------- Project Count Charts -------------------- */

export async function GetProjectCountByDepartmentFromApi(
  year?: string
): Promise<ProjectCountByDepartment[]> {
  try {
    const params = year ? `?year=${encodeURIComponent(year)}` : "";
    const r = await clientFetch<ProjectCountByDepartment[]>(
      `/api/dashboard/projects/count/by-department${params}`,
      { cache: "no-store" }
    );
    return r.success ? r.data ?? [] : [];
  } catch (error) {
    console.error("[Client] GetProjectCountByDepartmentFromApi error:", error);
    return [];
  }
}

export async function GetProjectCountByStatusFromApi(
  year?: string
): Promise<ProjectCountByStatus[]> {
  try {
    const params = year ? `?year=${encodeURIComponent(year)}` : "";
    const r = await clientFetch<ProjectCountByStatus[]>(
      `/api/dashboard/projects/count/by-status${params}`,
      { cache: "no-store" }
    );
    return r.success ? r.data ?? [] : [];
  } catch (error) {
    console.error("[Client] GetProjectCountByStatusFromApi error:", error);
    return [];
  }
}

/* -------------------- Approval Queue -------------------- */

export async function GetApprovalQueueFromApi(
  year?: string,
  departmentId?: string,
  status?: string
): Promise<ApprovalQueueItem[]> {
  try {
    const params = new URLSearchParams();
    if (year) params.set("year", year);
    if (departmentId) params.set("department_id", departmentId);
    if (status) params.set("status", status);
    
    const queryString = params.toString();
    const url = `/api/dashboard/approvals${queryString ? `?${queryString}` : ""}`;
    
    const r = await clientFetch<ApprovalQueueItem[]>(url, { cache: "no-store" });
    return r.success ? r.data ?? [] : [];
  } catch (error) {
    console.error("[Client] GetApprovalQueueFromApi error:", error);
    return [];
  }
}
