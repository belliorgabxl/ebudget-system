import type {
  GetCalenderEventRespond,
  GetProjectsByOrgRespond,
  GetApprovalItems,
} from "@/dto/dashboardDto";
import type { GetStrategicPlanRespond, GetQaIndicatorsRespond } from "@/dto/qaDto";
import { clientFetch } from "@/lib/client-api";

export async function GetCalendarEventsFromApi(): Promise<GetCalenderEventRespond[]> {
  const r = await clientFetch<GetCalenderEventRespond[]>("/api/dashboard/calendar-events", {
    cache: "no-store",
  });
  return r.success ? (r.data ?? []) : [];
}

export async function GetApprovalItemsFromApi(): Promise<GetApprovalItems[]> {
  const r = await clientFetch<GetApprovalItems[]>("/api/dashboard/approval-items", {
    cache: "no-store",
  });
  return r.success ? (r.data ?? []) : [];
}

export async function GetStrategicPlansFromApi(): Promise<GetStrategicPlanRespond[]> {
  const r = await clientFetch<GetStrategicPlanRespond[]>("/api/dashboard/strategic-plans", {
    cache: "no-store",
  });
  return r.success ? (r.data ?? []) : [];
}

export async function GetQaIndicatorsFromApi(): Promise<GetQaIndicatorsRespond[]> {
  const r = await clientFetch<GetQaIndicatorsRespond[]>("/api/dashboard/qa-indicators", {
    cache: "no-store",
  });
  return r.success ? (r.data ?? []) : [];
}

import type { ProjectsListResponse, ProjectsQuery } from "@/dto/dashboardDto";

export async function GetProjectsByOrgFromApi(
  params: ProjectsQuery = {}
): Promise<ProjectsListResponse | null> {
  const qs = new URLSearchParams();

  if (params.page !== undefined) qs.set("page", String(params.page));
  if (params.limit !== undefined) qs.set("limit", String(params.limit));
  if (params.name) qs.set("name", params.name);
  if (params.code) qs.set("code", params.code);
  if (params.plan_type) qs.set("plan_type", params.plan_type);
  if (params.is_active !== undefined) qs.set("is_active", String(params.is_active));
  if (params.department_id) qs.set("department_id", params.department_id);
  if (params.start_date) qs.set("start_date", params.start_date);

  const url = `/api/dashboard/projects${qs.toString() ? `?${qs.toString()}` : ""}`;

  const r = await clientFetch<ProjectsListResponse>(url, { cache: "no-store" });

  return r.success ? (r.data ?? null) : null;
}
