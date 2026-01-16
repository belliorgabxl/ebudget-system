import {
  ActivitiesRow,
  ApproveParams,
  BudgetTableValue,
  DateDurationValue,
  EditFormState,
  EstimateParams,
  ExpectParams,
  GeneralInfoCreateParams,
  GoalParams,
  KPIParams,
  ObjectiveParams,
  ProjectInformationResponse,
  StrategyParams,
  ValidationIssue,
} from "@/dto/projectDto";
import { pushIfEmpty, validateStartEndDate } from "./util";
import { BudgetSourceType } from "@/constants/project";
import jsPDF from "jspdf";

export function mapFormToPayload(form: EditFormState) {
  return {
    project_name: form.generalInfo.name,
    plane_type: form.generalInfo.type,
    department_name: form.generalInfo.department_id,
    quantitative_goal: form.goal.quantityGoal,
    qualitative_goal: form.goal.qualityGoal,
  };
}

export function mapApiToForm(
  apiData: ProjectInformationResponse
): EditFormState {
  const generalInfo: GeneralInfoCreateParams = {
    name: apiData.project_name,
    type: apiData.plan_type || "",
    department: apiData.department_name || "",
    owner_user_id: "",
  } as any;

  const goal: GoalParams = {
    quantityGoal: apiData.quantitative_goal || "",
    qualityGoal: apiData.qualitative_goal || "",
  };

  let startDate = "";
  let endDate = "";

  if (apiData.progress && apiData.progress.length > 0) {
    const startList = apiData.progress
      .map((p) => p.start_date)
      .filter((d): d is string => !!d);
    const endList = apiData.progress
      .map((p) => p.end_date)
      .filter((d): d is string => !!d);

    if (startList.length) {
      startDate = startList.sort()[0]!;
    }
    if (endList.length) {
      endDate = endList.sort()[endList.length - 1]!;
    }
  }

  const duration: DateDurationValue = {
    startDate,
    endDate,
    durationMonths: 0,
  };

  let budget: BudgetTableValue | null = null;

  if (apiData.budget_items && apiData.budget_items.length > 0) {
    const rows = apiData.budget_items.map((b, idx) => ({
      id: idx + 1,
      name: b.name || "",
      amount: String(b.amount ?? 0),
      remark: b.remark || "",
    }));

    budget = {
      rows,
      total:
        typeof apiData.budget_amount === "number"
          ? apiData.budget_amount
          : rows.reduce((sum, r) => sum + (parseFloat(r.amount) || 0), 0),
      sources: {
        source: apiData.budget_source || "",
        externalAgency: apiData.budget_source_department || "",
      },
    };
  }

  const activities: ActivitiesRow[] = (apiData.progress || []).map(
    (p, idx) =>
      ({
        id: p.sequence_number || idx + 1,
        activity: p.description || "",
        startDate: p.start_date || "",
        endDate: p.end_date || "",
        owner: p.responsible_name || "",
      } as ActivitiesRow)
  );

  const strategy: StrategyParams = {
    schoolPlan: "",
    ovEcPolicy: "",
    qaIndicator: "",
  };

  const kpi: KPIParams = {
    output: "",
    outcome: "",
  };

  const estimate: EstimateParams = {
    estimateType: "",
    evaluator: "",
    startDate: "",
    endDate: "",
  };

  const expect: ExpectParams = {
    results: [],
  };

  const approve: ApproveParams = {
    proposerName: "",
    proposerPosition: "",
    proposeDate: "",
    deptComment: "",
    directorComment: "",
  };

  return {
    id: String(apiData.created_at ?? ""),
    generalInfo,
    goal,
    duration,
    strategy,
    kpi,
    estimate,
    expect,
    budget,
    activities,
    approve,
  };
}

export function validateStep(
  step: number,
  data: {
    generalInfo: GeneralInfoCreateParams;
    strategy: StrategyParams;
    retaional: string;
    objective: ObjectiveParams;
    goal: GoalParams;
    dateDur: DateDurationValue;
    location: string;
    budget: BudgetTableValue | null;
    activity: ActivitiesRow[];
    kpi: KPIParams;
    estimate: EstimateParams;
    expectation: ExpectParams;
  }
): ValidationIssue[] {
  const issues: ValidationIssue[] = [];

  if (step === 0) {
    pushIfEmpty(
      issues,
      "generalInfo.name",
      data.generalInfo.name,
      "กรุณากรอกชื่อโครงการ"
    );
    pushIfEmpty(
      issues,
      "generalInfo.type",
      data.generalInfo.type,
      "กรุณาเลือกประเภทแผน/โครงการ"
    );
    pushIfEmpty(
      issues,
      "generalInfo.department_id",
      data.generalInfo.department_id,
      "กรุณาเลือกหน่วยงาน/แผนก"
    );
    pushIfEmpty(
      issues,
      "generalInfo.owner_user_id",
      data.generalInfo.owner_user_id,
      "กรุณาเลือกผู้รับผิดชอบโครงการ"
    );
  }

  if (step === 2) {
    pushIfEmpty(
      issues,
      "rationale",
      data.retaional,
      "กรุณากรอกหลักการและเหตุผล"
    );
  }

  if (step === 3) {
    const hasObjective = data.objective.results?.some(
      (x) => x.description.trim() !== ""
    );
    if (!hasObjective)
      issues.push({
        field: "objective",
        message: "กรุณากรอกวัตถุประสงค์อย่างน้อย 1 ข้อ",
      });
  }

  if (step === 4) {
    pushIfEmpty(
      issues,
      "goal.quantityGoal",
      data.goal.quantityGoal,
      "กรุณากรอกเป้าหมายเชิงปริมาณ"
    );
    pushIfEmpty(
      issues,
      "goal.qualityGoal",
      data.goal.qualityGoal,
      "กรุณากรอกเป้าหมายเชิงคุณภาพ"
    );
  }

  if (step === 5) {
    const err = validateStartEndDate(
      data.dateDur.startDate,
      data.dateDur.endDate
    );
    if (err === "MISSING_START")
      issues.push({ field: "startDate", message: "กรุณาเลือกวันเริ่มต้น" });
    if (err === "MISSING_END")
      issues.push({ field: "endDate", message: "กรุณาเลือกวันสิ้นสุด" });
    if (err === "INVALID_START")
      issues.push({
        field: "startDate",
        message: "รูปแบบวันเริ่มต้นไม่ถูกต้อง",
      });
    if (err === "INVALID_END")
      issues.push({ field: "endDate", message: "รูปแบบวันสิ้นสุดไม่ถูกต้อง" });
    if (err === "START_EQUALS_END")
      issues.push({
        field: "dateRange",
        message: "วันเริ่มต้นและวันสิ้นสุดห้ามเป็นวันเดียวกัน",
      });
    if (err === "START_AFTER_END")
      issues.push({
        field: "dateRange",
        message: "วันเริ่มต้นต้องมาก่อนวันสิ้นสุด",
      });
  }

  if (step === 6) {
    pushIfEmpty(issues, "location", data.location, "กรุณากรอกสถานที่ดำเนินงาน");
  }

  if (step === 7) {
    if (!data.budget) {
      issues.push({ field: "budget", message: "กรุณากรอกข้อมูลงบประมาณ" });
    } else {
      if (!data.budget.rows || data.budget.rows.length === 0) {
        issues.push({
          field: "budget.rows",
          message: "กรุณาเพิ่มรายการงบประมาณอย่างน้อย 1 รายการ",
        });
      }
      const badRow = data.budget.rows?.find(
        (r) => !r.name?.trim() || Number(r.amount) <= 0
      );
      if (badRow)
        issues.push({
          field: "budget.row",
          message: "กรุณากรอกชื่องบประมาณ และจำนวนเงินให้ถูกต้อง (มากกว่า 0)",
        });
    }
  }

  if (step === 8) {
    const hasActivity = data.activity?.some((a) => a.activity.trim() !== "");
    if (!hasActivity)
      issues.push({
        field: "activity",
        message: "กรุณากรอกกิจกรรมอย่างน้อย 1 รายการ",
      });
  }

  if (step === 9) {
    if (!data.kpi.output.trim() && !data.kpi.outcome.trim()) {
      issues.push({
        field: "kpi",
        message: "กรุณากรอก KPI อย่างน้อย 1 ข้อ (Output หรือ Outcome)",
      });
    }
  }

  if (step === 10) {
    pushIfEmpty(
      issues,
      "estimate.estimateType",
      data.estimate.estimateType,
      "กรุณาเลือกประเภทการประเมิน"
    );
    pushIfEmpty(
      issues,
      "estimate.evaluator",
      data.estimate.evaluator,
      "กรุณาเลือกผู้ประเมิน"
    );
    const err = validateStartEndDate(
      data.estimate.startDate,
      data.estimate.endDate
    );
    if (err === "MISSING_START")
      issues.push({
        field: "estimate.startDate",
        message: "กรุณาเลือกวันเริ่มติดตาม/ประเมินผล",
      });
    if (err === "MISSING_END")
      issues.push({
        field: "estimate.endDate",
        message: "กรุณาเลือกวันสิ้นสุดติดตาม/ประเมินผล",
      });
    if (err === "START_EQUALS_END")
      issues.push({
        field: "estimate.dateRange",
        message: "ช่วงวันติดตาม/ประเมินผล ห้ามเป็นวันเดียวกัน",
      });
    if (err === "START_AFTER_END")
      issues.push({
        field: "estimate.dateRange",
        message: "วันเริ่มติดตาม/ประเมินผล ต้องมาก่อนวันสิ้นสุด",
      });
  }

  if (step === 11) {
    const hasExpect = data.expectation.results?.some(
      (x) => x.description.trim() !== ""
    );
    if (!hasExpect)
      issues.push({
        field: "expectation",
        message: "กรุณากรอกผลที่คาดว่าจะได้รับอย่างน้อย 1 ข้อ",
      });
  }

  return issues;
}

export function normalizeDateOnly(input?: string | null): string {
  if (!input) return "";
  return String(input).slice(0, 10);
}

export const normalizeBudgetSourceLabel = (v?: string) => {
  if (!v) return "—";
  if (v.includes("external")) return "ภายนอก (ระบุหน่วยงาน)";
  if (v.includes("revenue")) return "เงินรายได้";
  if (v.includes("school")) return "งบสถานศึกษา";
  return v;
};

export const toBudgetSourceType = (v?: string): BudgetSourceType => {
  const s = String(v ?? "")
    .trim()
    .toLowerCase();

  if (s === "revenue") return "revenue";
  if (s === "school") return "school";
  if (s === "external") return "external";

  return "revenue";
};

export const toNumber = (v: string) => {
  const n = parseFloat(String(v ?? "").replace(/,/g, ""));
  return Number.isFinite(n) ? n : 0;
};

export function renderDateRange(
  start?: string | Date,
  end?: string | Date
): string {
  const fmt = (d?: string | Date) => {
    if (!d) return "";
    const iso = typeof d === "string" ? d : d.toString();
    const date = new Date(iso);
    if (Number.isNaN(date.getTime())) return "";
    return date.toLocaleDateString("th-TH", { dateStyle: "medium" });
  };

  const s = fmt(start);
  const e = fmt(end);

  if (!s && !e) return "—";
  if (s && !e) return s;
  if (!s && e) return e;
  return `${s} - ${e}`;
}

export function wrapText(doc: jsPDF, text: string, maxWidth: number) {
  return doc.splitTextToSize(text, maxWidth) as string[];
}

export function lineHeight(doc: jsPDF) {
  return doc.getFontSize() * 0.45;
}

export function drawLabelValueWrapped(opts: {
  doc: jsPDF;
  x: number;
  y: number;
  label: string;
  value: string;
  labelWidth: number;
  maxWidth: number;
}) {
  const { doc, x, y, label, value, labelWidth, maxWidth } = opts;

  doc.setFont("THSarabun", "bold");
  doc.text(label, x, y);

  doc.setFont("THSarabun", "normal");
  const valueX = x + labelWidth;
  const valueMax = maxWidth - labelWidth;

  const lines = wrapText(doc, value || "—", valueMax);
  doc.text(lines, valueX, y);

  const h = lines.length * lineHeight(doc);
  return { height: h, linesCount: lines.length };
}

export function diffDaysInclusive(startIso?: string, endIso?: string) {
  if (!startIso || !endIso) return null;
  const s = new Date(startIso);
  const e = new Date(endIso);
  if (Number.isNaN(s.getTime()) || Number.isNaN(e.getTime())) return null;
  const days =
    Math.floor((e.getTime() - s.getTime()) / (1000 * 60 * 60 * 24)) + 1;
  return days > 0 ? days : null;
}

export function formatBaht(amount: number) {
  return amount.toLocaleString("th-TH", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

export function drawTick(doc: jsPDF, x: number, y: number) {

  const x1 = x + 0.8;
  const y1 = y + 2.2;
  const x2 = x + 1.8;
  const y2 = y + 3.2;
  const x3 = x + 3.4;
  const y3 = y + 0.9;

  doc.setLineWidth(0.6);
  doc.line(x1, y1, x2, y2);
  doc.line(x2, y2, x3, y3);
  doc.setLineWidth(0.2); 
}

export function drawCheckbox(
  doc: jsPDF,
  x: number,
  y: number,
  label: string,
  checked: boolean
) {
  doc.rect(x, y, 4, 4);
  if (checked) drawTick(doc, x, y);
  doc.text(label, x + 6, y + 3);
}
export function normThaiKey(s?: string) {
  return (s ?? "")
    .replace(/[\s\u200B-\u200D\uFEFF]+/g, "") 
    .trim();
}

export function mapPlanTypeToThai(type?: string) {
  switch (type) {
    case "regular_work":
      return "งานประจำ";
    case "special_project":
      return "โครงการพิเศษเฉพาะทาง"
    case "strategic_plan":
      return "แผนยุทธศาสตร์";
    case "investment":
      return "โครงการลงทุน";
    case "development":
      return "โครงการพัฒนา";
    default:
      return "—";
  }
}