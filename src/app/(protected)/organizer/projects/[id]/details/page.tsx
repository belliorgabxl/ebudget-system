import Link from "next/link";
import { formatThaiDateTime, StatusBadge } from "@/components/project/Helper";
import type {
  ActivitiesRow,
  ApproveParams,
  BudgetTableValue,
  DateDurationValue,
  EstimateParams,
  ExpectParams,
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

type Project = {
  id: string;
  budgetPlanStatus: string;
  status: "draft" | "in_progress" | "on_hold" | "done";
  progress: number;
  updatedAt: string;
  project_objectives_and_outcomes: ProjectObjectiveOrOutcome[];
  generalInfo: GeneralInfoForUpdateData;
  strategy: StrategyParams;
  duration: DateDurationValue;
  budget: BudgetTableValue | null;
  activities: ActivitiesRow[];
  kpi: ProjectKPI[];
  estimate: EstimateParams;
  approve: ApproveParams;
  goal: GoalParams;
};

async function getProject(id: string): Promise<Project | null> {
  try {
    const cookieStore = cookies();
    const accessToken = (await cookieStore).get("api_token")?.value;

    if (!accessToken) {
      console.error("getProject: no api_token in server cookies");
      return null;
    }

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
    const activities: ActivitiesRow[] = (apiData.progress || []).map(
      (p, idx) => ({
        id: p.sequence_number || idx + 1,
        activity: p.description || "",
        startDate: p.start_date || "",
        endDate: p.end_date || "",
        owner: p.responsible_name || "",
      })
    ) as any;

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

    const project: Project = {
      id,
      status: "in_progress",
      progress: 0,
      updatedAt: apiData.updated_at,
      budgetPlanStatus: apiData.budget_plan_status,
      generalInfo,
      strategy,
      duration,
      budget,
      activities,
      kpi: kpis,
      estimate,
      project_objectives_and_outcomes: project_objectives_and_outcomes,
      approve,
      goal,
    };

    return project;
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
        <h1 className="text-xl font-semibold text-gray-900">ไม่พบโปรเจ็กต์</h1>
        <p className="text-sm text-gray-600 mt-2">
          โปรเจ็กต์อาจถูกลบหรือคุณไม่มีสิทธิ์เข้าถึง
        </p>
        <div className="mt-6">
          <Link
            href="/organizer/projects/my-project"
            className="text-indigo-600 hover:underline"
          >
            กลับไปยังหน้าโปรเจ็คทั้งหมด
          </Link>
        </div>
      </main>
    );
  }

  return (
    <BackGroundLight>
      <main className="lg:mx-10 lg:pl-16 px-4 py-8">
        <nav className="mb-4 text-xs text-gray-500">
          <Link
            href="/organizer/projects/my-project"
            className="hover:underline"
          >
            โปรเจ็กต์ของคุณ
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

            <div className="mt-2 flex flex-wrap items-center gap-3 text-sm text-gray-600">
              <StatusBadge status={p.status} />

              <span className="flex items-center gap-1">
                อัปเดตล่าสุด:
                <b className="text-gray-800">
                  {formatThaiDateTime(p.updatedAt)}
                </b>
              </span>
            </div>
          </div>
          <ApprovalStatusButton projectId={p.id} status={p.budgetPlanStatus} />
        </div>
        <ProjectDetailClient initialProject={p} />
      </main>
    </BackGroundLight>
  );
}
