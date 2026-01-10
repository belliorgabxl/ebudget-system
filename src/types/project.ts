import type {
  StrategyParams,
  DateDurationValue,
  BudgetTableValue,
  ActivitiesRow,
  KPIParams,
  EstimateParams,
  ExpectParams,
  ApproveParams,
  GoalParams,
  GeneralInfoForUpdateData,
} from "@/dto/projectDto";

export type Project = {
  id: string;
  budgetPlanStatus: string;
  status: "draft" | "in_progress" | "on_hold" | "done";
  progress: number;
  updatedAt: string;
  generalInfo: GeneralInfoForUpdateData;
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
