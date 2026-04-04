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
import { cookies } from "next/headers";
import { fetchProjectInformationServer } from "@/api/project.server";
import { ProjectDetailClient } from "@/components/project/details/ProjectDetailClient";
import BackGroundLight from "@/components/background/bg-light";
import ApprovalStatusButton from "@/components/project/approval/ApprovalStatusButton";
import type { Project } from "@/types/project";

async function getProject(id: string): Promise<{ project: Project; isEdit: boolean; latestRemark: string } | null> {
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

    const startDate = (apiData as any).start_date || "";
    const endDate = (apiData as any).end_date || "";

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

    const duration: DateDurationValue = {
      startDate,
      endDate,
      durationMonths,
    };

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
          externalAgency: (apiData as any).budget_source_department || "",
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

    const kpiText = Array.isArray(kpis)
      ? kpis
          .map((k: any) => {
            const ind = (k?.indicator ?? "").trim();
            const desc = (k?.description ?? "").trim();
            const target =
              k?.target_value !== null && k?.target_value !== undefined
                ? String(k.target_value).trim()
                : "";
            if (!ind && !desc) return "";
            const t = target ? ` (เป้า: ${target})` : "";
            return `• ${ind || desc}${t}${
              desc && ind ? ` — ${desc}` : ""
            }`.trim();
          })
          .filter(Boolean)
          .join("\n")
      : "";

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

    const isEdit = apiData.is_edit !== false; // default true if field absent
    const latestRemark = (apiData as any).latest_remark || "";

    const project: Project = {
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
      project_objectives_and_outcomes: project_objectives_and_outcomes,
      approve,
      goal,
      closureRecord: (apiData as any).closure_record ?? null,
    };

    return { project, isEdit, latestRemark };
  } catch (e) {
    console.error("getProject error:", e);
    return null;
  }
}

type PageParams = Promise<{ id: string }>;

export default async function Page({ params }: { params: PageParams }) {
  const { id } = await params;
  const result = await getProject(id);

  if (!result) {
    return (
      <main className="mx-auto max-w-7xl px-6 py-10 space-y-8">
        <h1 className="text-xl font-semibold text-gray-900">ไม่พบโครงการ</h1>
        <p className="text-sm text-gray-600 mt-2">
          โครงการอาจถูกลบหรือคุณไม่มีสิทธิ์เข้าถึง
        </p>
        <div className="mt-6">
          <Link
            href="/organizer/projects/my-project"
            className="text-indigo-600 hover:underline"
          >
            กลับไปยังหน้าโครงการทั้งหมด
          </Link>
        </div>
      </main>
    );
  }

  const { project: p, isEdit, latestRemark } = result;

  return (
    <BackGroundLight>
      <main className="lg:mx-10 lg:pl-16 px-4 py-8">
        <nav className="mb-4 text-xs text-gray-500">
          <Link
            href="/organizer/projects/my-project"
            className="hover:underline"
          >
            โครงการของคุณ
          </Link>
          <span className="mx-1">/</span>
          <span className="text-gray-700">
            {p.generalInfo?.name || "ไม่ระบุชื่อโครงการ"}
          </span>
        </nav>
        <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              {p.generalInfo?.name || "ไม่ระบุชื่อโครงการ"}
            </h1>

            <div className="mt-2 mb-1 flex flex-wrap items-center gap-3 text-sm text-gray-600">
              <StatusBadge status={p.status} />

              <span className="flex items-center gap-1 text-gray-500">
                อัปเดตล่าสุด:
                <b className="text-gray-700">
                  {formatThaiDateTime(p.updatedAt)}
                </b>
              </span>
            </div>
          </div>
          <ApprovalStatusButton
              projectId={p.id}
              budgetPlanId={p.budgetPlanId}
              status={p.budgetPlanStatus}
              projectStatus={p.status}
              progressList={p.rawProgress}
              budgetTotal={p.budget?.total ?? 0}
              startDate={p.duration?.startDate ?? null}
              endDate={p.duration?.endDate ?? null}
              processSteps={[
                {
                  title: "หัวหน้าแผนก",
                  status: "approved",
                  by: "สมชาย ใจดี",
                  at: "10 ม.ค. 2569 14:32",
                },
                {
                  title: "ฝ่ายวางแผน",
                  status: "approved",
                  by: "นางสาวศิริพร",
                  at: "11 ม.ค. 2569 09:10",
                },
                {
                  title: "ผู้อำนวยการ",
                  status: "pending",
                  note: "ยังไม่ได้ดำเนินการ",
                },
              ]}
            />
        </div>
        {latestRemark && (p.budgetPlanStatus === "in_revision" || p.budgetPlanStatus === "rejected") && (
          <div
            className={`mb-6 rounded-lg border px-4 py-3 flex gap-3 items-start ${
              p.budgetPlanStatus === "rejected"
                ? "bg-red-50 border-red-200"
                : "bg-amber-50 border-amber-200"
            }`}
          >
            <span
              className={`mt-0.5 text-lg ${
                p.budgetPlanStatus === "rejected" ? "text-red-500" : "text-amber-500"
              }`}
            >
              {p.budgetPlanStatus === "rejected" ? "✕" : "↩"}
            </span>
            <div>
              <p
                className={`text-sm font-semibold ${
                  p.budgetPlanStatus === "rejected" ? "text-red-700" : "text-amber-700"
                }`}
              >
                {p.budgetPlanStatus === "rejected"
                  ? "โครงการถูกปฏิเสธ"
                  : "โครงการถูกส่งกลับเพื่อแก้ไข"}
              </p>
              <p className="mt-0.5 text-sm text-gray-700">{latestRemark}</p>
            </div>
          </div>
        )}
        <ProjectDetailClient initialProject={p} isOwner={true} projectStatus={p.status} />
      </main>
    </BackGroundLight>
  );
}
