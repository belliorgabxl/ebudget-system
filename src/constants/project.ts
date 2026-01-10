export const PROJECT_TYPE_LABEL: Record<string, string> = {
  project: "ทั่วไป",
  regular_work: "แผนงานประจำ",
  special_project: "โครงการพิเศษ / พัฒนา",
};

export type EditKey =
  | "general"
  | "goal"
  | "duration"
  | "strategy"
  | "kpi"
  | "estimate"
  | "expect"
  | "budget"
  | "activities"
  | "approve";
