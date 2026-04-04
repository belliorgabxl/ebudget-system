import Link from "next/link";
import { formatThaiDateTime, StatusBadge } from "@/components/project/Helper";
import type {
  ApproveParams,
  BudgetTableValue,
  DateDurationValue,
  EstimateParams,
  GeneralInfoForUpdateData,
  GoalParams,
  ProjectInformationResponse,
  ProjectKPI,
  ProjectObjectiveOrOutcome,
  StrategyParams,
} from "@/dto/projectDto";
import { fetchProjectInformationServer } from "@/api/project.server";
import { ProjectDetailClient } from "@/components/project/details/ProjectDetailClient";
import BackGroundLight from "@/components/background/bg-light";
import {
  checkApprovalPermissionServer,
  CheckPermissionResponse,
} from "@/api/approval.server";
import { ArrowRight, FileClock } from "lucide-react";
import { ROLE_LABEL } from "@/constants/project";
import type { Project } from "@/types/project";

async function getProject(id: string): Promise<Project | null> {
  try {
    const apiData: ProjectInformationResponse =
      await fetchProjectInformationServer(id);

    const generalInfo: GeneralInfoForUpdateData = {
      name: apiData.project_name,
      plan_type: apiData.plan_type,
      code: apiData.project_code,
      description: apiData.project_description,
      rationale: apiData.rationale,
      start_date: apiData.start_date,
      end_date: apiData.end_date,
      location: apiData.location,
      project_id: id,
      quantitative_goal: apiData.quantitative_goal,
      qualitative_goal: apiData.qualitative_goal,
    } as GeneralInfoForUpdateData;

    const goal: GoalParams = {
      quantityGoal: apiData.quantitative_goal || "",
      qualityGoal: apiData.qualitative_goal || "",
    };

    const startDate = apiData.start_date || "";
    const endDate = apiData.end_date || "";

    let durationMonths = 0;
    if (startDate && endDate) {
      const s = new Date(startDate);
      const e = new Date(endDate);
      if (!Number.isNaN(s.getTime()) && !Number.isNaN(e.getTime())) {
        const m =
          (e.getFullYear() - s.getFullYear()) * 12 +
          (e.getMonth() - s.getMonth());
        durationMonths = Math.max(0, m);
      }
    }

    const duration: DateDurationValue = { startDate, endDate, durationMonths };

    let budget: BudgetTableValue | null = null;
    const budgetItems = apiData.budget_items ?? [];
    const rows = budgetItems.map((b, idx) => ({
      id: idx + 1,
      name: b.name || "",
      amount: String(b.amount ?? 0),
      remark: b.remark || "",
    }));
    const budgetTotal =
      typeof apiData.budget_amount === "number"
        ? apiData.budget_amount
        : rows.reduce((sum, r) => sum + (parseFloat(r.amount) || 0), 0);
    if (rows.length > 0 || typeof apiData.budget_amount === "number") {
      budget = {
        rows,
        total: budgetTotal,
        sources: {
          source: apiData.budget_source || "",
          externalAgency: apiData.budget_source_department || "",
        },
      } satisfies BudgetTableValue;
    }

    const rawProgress = (apiData.progress || []).map((p) => ({
      id: p.id,
      project_id: String(id),
      start_date: p.start_date ?? null,
      end_date: p.end_date ?? null,
      sequence_number: p.sequence_number,
      description: p.description || "",
      responsible_name: p.responsible_name || "",
      remarks: p.remarks || "",
      updated_by: p.updated_by ?? null,
      updated_at: p.updated_at || "",
      budget_cost_used: (p as any).budget_cost_used ?? null,
    }));

    const activities = rawProgress.map((p, idx) => ({
      id: p.sequence_number || idx + 1,
      activity: p.description || "",
      startDate: p.start_date || "",
      endDate: p.end_date || "",
      owner: p.responsible_name || "",
    }));

    const strategy: StrategyParams = {
      schoolPlan: "",
      ovEcPolicy: "",
      qaIndicator: "",
    };

    const kpis: ProjectKPI[] = Array.isArray(apiData.project_kpis)
      ? apiData.project_kpis.map((k: any) => ({
          id: Number(k.id),
          indicator: String(k.indicator ?? ""),
          target_value:
            k.target_value !== null && k.target_value !== undefined
              ? String(k.target_value)
              : "",
          description: String(k.description ?? ""),
        }))
      : [];

    const evals = (apiData as any).project_evaluation ?? [];
    const latestEval =
      Array.isArray(evals) && evals.length
        ? [...evals].sort((a: any, b: any) =>
            String(a?.updated_at ?? "").localeCompare(
              String(b?.updated_at ?? "")
            )
          )[evals.length - 1]
        : null;

    const estimate: EstimateParams = {
      estimateType: latestEval?.estimate_type || "",
      evaluator: latestEval?.evaluator_user_id || "",
      startDate: latestEval?.start_date || "",
      endDate: latestEval?.end_date || "",
    } as any;

    const project_objectives_and_outcomes: ProjectObjectiveOrOutcome[] =
      Array.isArray((apiData as any).project_objectives_and_outcomes)
        ? (apiData as any).project_objectives_and_outcomes.map((x: any) => ({
            id: Number(x?.id ?? 0),
            project_id: String(x?.project_id ?? id),
            type: (x?.type as "objective" | "expectation") ?? "objective",
            description: String(x?.description ?? ""),
          }))
        : [];

    const approve: ApproveParams = {
      proposerName: "",
      proposerPosition: "",
      proposeDate: "",
      deptComment: "",
      directorComment: "",
    };

    return {
      id,
      budgetPlanId: apiData.budget_plan_id,
      status: (apiData.project_status as Project["status"]) || "in_progress",
      progress: 0,
      updatedAt: apiData.updated_at,
      budgetPlanStatus: apiData.budget_plan_status,
      generalInfo,
      strategy,
      duration,
      budget,
      activities,
      rawProgress,
      kpi: kpis,
      estimate,
      project_objectives_and_outcomes,
      approve,
      goal,
      closureRecord: (apiData as any).closure_record ?? null,
    };
  } catch (e) {
    console.error("getProject error:", e);
    return null;
  }
}

type PageParams = Promise<{ id: string }>;

export default async function Page({ params }: { params: PageParams }) {
  const { id } = await params;
  const p = await getProject(id);

  if (!p) {
    return (
      <main className="mx-auto max-w-7xl px-6 py-10 space-y-8">
        <h1 className="text-xl font-semibold text-gray-900">ไม่พบโครงการ</h1>
        <p className="text-sm text-gray-600 mt-2">
          โครงการอาจถูกลบหรือคุณไม่มีสิทธิ์เข้าถึง
        </p>
        <div className="mt-6">
          <Link href="/organizer/approve/" className="text-indigo-600 hover:underline">
            กลับไปยังหน้าหลัก
          </Link>
        </div>
      </main>
    );
  }

  let permission: CheckPermissionResponse | null = null;
  try {
    permission = await checkApprovalPermissionServer(p.budgetPlanId!);
  } catch (e) {
    console.error("checkApprovalPermissionServer error:", e);
  }

  return (
    <BackGroundLight>
      <main className="lg:mx-10 lg:pl-16 px-4 py-8">
        <div className="mb-5 flex flex-wrap items-start justify-between gap-4">
          <div>
            <Link
              href="/organizer/approve/"
              className="rounded-md bg-gray-200 hover:bg-gray-400 hover:text-white px-4 py-2 text-sm font-medium text-slate-700 disabled:opacity-60"
            >
              กลับ
            </Link>
            <h1 className="text-2xl mt-5 font-bold text-gray-900">
              {p.generalInfo?.name || "ไม่ระบุชื่อโครงการ"}
            </h1>
            <div className="mt-2 flex flex-wrap items-center gap-3 text-sm text-gray-600">
              <StatusBadge status={p.status} />
              <span className="flex items-center gap-1">
                อัปเดตล่าสุด:
                <b className="text-gray-800">{formatThaiDateTime(p.updatedAt)}</b>
              </span>
            </div>
          </div>

          {permission?.has_permission && (
            <div className="flex flex-col gap-1">
              <Link
                href={`/organizer/approve/${id}/approve`}
                className="rounded-md flex justify-center items-center gap-4
                  bg-indigo-600 hover:bg-indigo-900
                  px-4 py-2 text-sm font-semibold text-white"
              >
                <FileClock className="h-5 w-5 text-white" />
                อนุมัติโครงการ
                <ArrowRight className="h-5 w-5 text-white" />
              </Link>
              <p className="text-xs text-gray-500 text-center">
                คุณกำลังอนุมัติในฐานะ{" "}
                <span className="font-medium text-gray-700">
                  {ROLE_LABEL[permission.currentRole] ?? "—"}
                </span>
              </p>
            </div>
          )}
          {permission && !permission.has_permission && (
            <div className="rounded-md bg-gray-100 px-4 py-2 text-sm text-gray-500">
              ขณะนี้ยังไม่ถึงลำดับการอนุมัติของคุณ
            </div>
          )}
        </div>

        <ProjectDetailClient initialProject={p} isOwner={false} projectStatus={p.status} />
      </main>
    </BackGroundLight>
  );
}
