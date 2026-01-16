import { nestGet } from "@/lib/server-api";
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

export async function GetDashboardKPIFromApiServer(
  year: string
): Promise<DashboardKPI | null> {
  const r = await nestGet<DashboardKPI>(`/dashboard/kpi?year=${encodeURIComponent(year)}`);
  return r.success ? r.data ?? null : null;
}

/* -------------------- Budget Charts -------------------- */

export async function GetBudgetByYearFromApiServer(
  year?: string
): Promise<BudgetByYear[]> {
  const params = year ? `?year=${encodeURIComponent(year)}` : "";
  const r = await nestGet<BudgetByYear[]>(`/dashboard/budget/by-year${params}`);
  return r.success ? r.data ?? [] : [];
}

export async function GetBudgetByDepartmentFromApiServer(
  year?: string
): Promise<BudgetByDepartment[]> {
  const params = year ? `?year=${encodeURIComponent(year)}` : "";
  const r = await nestGet<BudgetByDepartment[]>(`/dashboard/budget/by-department${params}`);
  return r.success ? r.data ?? [] : [];
}

export async function GetBudgetByStatusFromApiServer(
  year?: string
): Promise<BudgetByStatus[]> {
  const params = year ? `?year=${encodeURIComponent(year)}` : "";
  const r = await nestGet<BudgetByStatus[]>(`/dashboard/budget/by-status${params}`);
  return r.success ? r.data ?? [] : [];
}

/* -------------------- Project Count Charts -------------------- */

export async function GetProjectCountByDepartmentFromApiServer(
  year?: string
): Promise<ProjectCountByDepartment[]> {
  const params = year ? `?year=${encodeURIComponent(year)}` : "";
  const r = await nestGet<ProjectCountByDepartment[]>(`/dashboard/projects/count/by-department${params}`);
  return r.success ? r.data ?? [] : [];
}

export async function GetProjectCountByStatusFromApiServer(
  year?: string
): Promise<ProjectCountByStatus[]> {
  const params = year ? `?year=${encodeURIComponent(year)}` : "";
  const r = await nestGet<ProjectCountByStatus[]>(`/dashboard/projects/count/by-status${params}`);
  return r.success ? r.data ?? [] : [];
}

/* -------------------- Approval Queue -------------------- */

export async function GetApprovalQueueFromApiServer(
  year?: string,
  departmentId?: string,
  status?: string
): Promise<ApprovalQueueItem[]> {
  const params = new URLSearchParams();
  if (year) params.set("year", year);
  if (departmentId) params.set("department_id", departmentId);
  if (status) params.set("status", status);
  
  const queryString = params.toString();
  const url = `/dashboard/approvals${queryString ? `?${queryString}` : ""}`;
  
  const r = await nestGet<ApprovalQueueItem[]>(url);
  return r.success ? r.data ?? [] : [];
}
