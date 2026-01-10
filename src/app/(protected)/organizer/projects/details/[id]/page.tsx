import Link from "next/link";
import {
  formatThaiDateTime,
  formatBaht,
  ProgressBar,
  StatusBadge,
  Section,
  Field,
  Grid2,
  EmptyRow,
  Td,
  numOrDash,
  dateOrDash,
  RichOrDash,
  BudgetSources,
  moneyOrDash,
} from "@/components/project/Helper";
import type {
  ActivitiesRow,
  ApproveParams,
  BudgetTableValue,
  DateDurationValue,
  EstimateParams,
  ExpectParams,
  GeneralInfoCreateParams,
  GoalParams,
  KPIParams,
  ProjectInformationResponse,
  StrategyParams,
} from "@/dto/projectDto";
import { cookies } from "next/headers";
import { fetchProjectInformationServer } from "@/api/project.server";
import { Th } from "@/components/approve/Helper";

type Project = {
  id: string;
  budgetPlanStatus:string;
  status: "draft" | "in_progress" | "on_hold" | "done";
  progress: number;
  updatedAt: string;

  generalInfo: GeneralInfoCreateParams;
  strategy: StrategyParams;
  duration: DateDurationValue;
  budget: BudgetTableValue | null;
  activities: ActivitiesRow[];
  kpi: KPIParams;
  estimate: EstimateParams;
  expect: ExpectParams;
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

    const generalInfo: GeneralInfoCreateParams = {
      name: apiData.project_name || "",
      type: (apiData as any).plan_type || "",
      department: apiData.department_name || "",
      owner_user_id: (apiData as any).owner_user || "",
    } as any;

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
      item: b.name || "",
      amount: String(b.amount ?? 0),
      note: b.remark || "",
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
      } as any;
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
    const kpis = (apiData as any).project_kpis ?? [];
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

    const kpi: KPIParams = {
      output: kpiText,
      outcome: "",
    };

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

    const oo = (apiData as any).project_objectives_and_outcomes ?? [];
    const expectList = Array.isArray(oo)
      ? oo
          .filter((x: any) => x?.type === "expectation")
          .map((x: any) => ({ description: String(x?.description ?? "") }))
          .filter((x: any) => x.description.trim())
      : [];

    const expect: ExpectParams = {
      results: expectList as any,
    };

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
      kpi,
      estimate,
      expect,
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
            ← กลับไปยัง My Project
          </Link>
        </div>
      </main>
    );
  }

  const {
    generalInfo,
    strategy,
    duration,
    budget,
    activities,
    kpi,
    estimate,
    expect,
    approve,
    goal,
  } = p;
  return (
    <main className="lg:mx-10 lg:pl-16 px-4 py-8">
      <nav className="mb-4 text-xs text-gray-500">
        <Link href="/organizer/projects/my-project" className="hover:underline">
          โปรเจ็กต์ของคุณ
        </Link>
        <span className="mx-1">/</span>
        <span className="text-gray-700">
          {generalInfo?.name || "ไม่ระบุชื่อโครงการ"}
        </span>
      </nav>

      <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            {generalInfo?.name || "ไม่ระบุชื่อโครงการ"}
          </h1>

          <div className="mt-2 flex flex-wrap items-center gap-3 text-sm text-gray-600">
            <StatusBadge status={p.status} />

            <span className="flex items-center gap-1">
              อัปเดตล่าสุด:
              <b className="text-gray-800">{formatThaiDateTime(p.updatedAt)}</b>
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Link
            href={`/organizer/projects/edit/${p.id}`}
            className="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            แก้ไข
          </Link>
          <Link
            href={`/organizer/projects/approval/${p.id}`}
            className="rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700"
          >
            ส่งอนุมัติ
          </Link>
        </div>
      </div>

      <section className="mb-8 rounded-md border border-gray-200 bg-white p-5 shadow-sm">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-green-600">
            ความคืบหน้า
          </span>
          <span className="text-sm font-semibold text-gray-900 tabular-nums">
            {p.budgetPlanStatus}
          </span>
        </div>
        <div className="mt-3">
          <ProgressBar value={p.progress} status={p.status} />
        </div>
      </section>

      <Section title="ข้อมูลพื้นฐาน">
        <Grid2>
          <Field label="ประเภทโครงการ" value={generalInfo?.type || "—"} />
          <Field label="หน่วยงานที่รับผิดชอบ" value={"หน่วยงานความมั่นคง"} />
          <Field label="ผู้รับผิดชอบโครงการ" value={"นาย ศรันท์"} />
        </Grid2>
      </Section>

      <Section title="เป้าหมายของโครงการ">
        <Grid2>
          <Field label="เชิงปริมาณ">
            <p className="text-sm text-gray-800 whitespace-pre-line">
              {goal?.quantityGoal?.trim() || "—"}
            </p>
          </Field>
          <Field label="เชิงคุณภาพ">
            <p className="text-sm text-gray-800 whitespace-pre-line">
              {goal?.qualityGoal?.trim() || "—"}
            </p>
          </Field>
        </Grid2>
      </Section>

      <Section title="ระยะเวลาดำเนินงาน">
        <Grid2>
          <Field label="วันเริ่มต้น" value={dateOrDash(duration?.startDate)} />
          <Field label="วันสิ้นสุด" value={dateOrDash(duration?.endDate)} />
          <Field
            label="ระยะเวลา (เดือน)"
            value={numOrDash(duration?.durationMonths)}
          />
        </Grid2>
      </Section>

      <Section title="ความสอดคล้องเชิงยุทธศาสตร์">
        <Grid2>
          <Field label="แผนยุทธศาสตร์ของสถานศึกษา">
            <RichOrDash text={strategy?.schoolPlan} />
          </Field>
          <Field label="นโยบาย/ยุทธศาสตร์ของ สอศ.">
            <RichOrDash text={strategy?.ovEcPolicy} />
          </Field>
          <Field label="ตัวชี้วัดงานประกันคุณภาพภายใน">
            <RichOrDash text={strategy?.qaIndicator} />
          </Field>
        </Grid2>
      </Section>

      <Section title="ตัวชี้วัดความสำเร็จ (KPIs)">
        <Grid2>
          <Field label="ผลผลิต (Output)">
            <RichOrDash text={kpi?.output} />
          </Field>
          <Field label="ผลลัพธ์ (Outcome)">
            <RichOrDash text={kpi?.outcome} />
          </Field>
        </Grid2>
      </Section>

      {/* Estimate */}
      <Section title="การติดตามและประเมินผล">
        <Grid2>
          <Field
            label="วิธีการ / ประเภทการประเมินผล"
            value={estimate?.estimateType || "—"}
          />
          <Field
            label="ผู้รับผิดชอบการประเมิน"
            value={estimate?.evaluator || "—"}
          />
          <Field
            label="ระยะเวลา"
            value={
              estimate?.startDate || estimate?.endDate
                ? `${dateOrDash(estimate?.startDate)} - ${dateOrDash(
                    estimate?.endDate
                  )}`
                : "—"
            }
          />
        </Grid2>
      </Section>

      {/* Expect */}
      <Section title="ผลที่คาดว่าจะได้รับ">
        {expect?.results?.length ? (
          <ul className="list-disc pl-5 text-sm text-gray-800">
            {expect.results
              .filter((r) => r.description?.trim())
              .map((r, idx) => (
                <li key={idx} className="whitespace-pre-line">
                  {r.description}
                </li>
              ))}
          </ul>
        ) : (
          <span>—</span>
        )}
      </Section>
      <Section title="งบประมาณ">
        {!budget ? (
          <EmptyRow>ยังไม่มีการบันทึกงบประมาณ</EmptyRow>
        ) : (
          <div className="space-y-4">
            <Grid2>
              <Field label="แหล่งงบประมาณ">
                <BudgetSources sources={budget.sources} />
              </Field>
              <Field label="งบประมาณรวม" value={formatBaht(budget.total)} />
            </Grid2>

            <div className="overflow-x-auto rounded border border-gray-200">
              <table className="min-w-full text-sm">
                <thead className="bg-gray-50">
                  <tr className="text-gray-700">
                    <Th className="font-semibold">#</Th>
                    <Th className="font-semibold">รายการ</Th>
                    <Th className="text-right font-semibold">จำนวนเงิน</Th>
                    <Th className="font-semibold">หมายเหตุ</Th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {budget.rows?.length ? (
                    budget.rows.map((r) => (
                      <tr key={r.id}>
                        <Td className="px-3 py-2 text-center">{r.id}</Td>
                        <Td className="px-3 py-2">{r.item || "—"}</Td>
                        <Td className="px-3 py-2 text-right">
                          {moneyOrDash(r.amount)}
                        </Td>
                        <Td className="px-3 py-2">{r.note || "—"}</Td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td
                        colSpan={4}
                        className="px-3 py-3 text-center text-gray-500"
                      >
                        ยังไม่มีรายการงบประมาณ
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </Section>

      <Section title="ขั้นตอนการดำเนินงานกิจกรรม">
        {!activities?.length ? (
          <EmptyRow>ยังไม่มีการบันทึกกิจกรรม</EmptyRow>
        ) : (
          <div className="overflow-x-auto rounded border border-gray-200">
            <table className="min-w-full text-sm">
              <thead className="bg-gray-50 text-gray-700">
                <tr>
                  <Th className="w-16">ลำดับ</Th>
                  <Th>กิจกรรม</Th>
                  <Th className="w-56">ระยะเวลา</Th>
                  <Th className="w-64">ผู้รับผิดชอบ</Th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {activities.map((a) => (
                  <tr key={a.id}>
                    <Td className="px-3 py-2 text-center">{a.id}</Td>
                    <Td className="px-3 py-2">{a.activity || "—"}</Td>
                    <Td className="px-3 py-2">
                      {a.startDate || a.endDate
                        ? `${dateOrDash(a.startDate)} - ${dateOrDash(
                            a.endDate
                          )}`
                        : "—"}
                    </Td>
                    <Td className="px-3 py-2">{a.owner || "—"}</Td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Section>

      <Section title="การอนุมัติและลงนาม">
        <Grid2>
          <Field label="ผู้เสนอ" value={approve?.proposerName || "—"} />
          <Field label="ตำแหน่ง" value={approve?.proposerPosition || "—"} />
          <Field label="วันที่เสนอ" value={dateOrDash(approve?.proposeDate)} />
          <Field label="ความเห็นหัวหน้างาน/แผนก">
            <RichOrDash text={approve?.deptComment} />
          </Field>
          <Field label="ความเห็นผู้บริหาร/ผู้อำนวยการ">
            <RichOrDash text={approve?.directorComment} />
          </Field>
        </Grid2>
      </Section>
    </main>
  );
}
