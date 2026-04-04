import type {
  StrategyParams,
  DateDurationValue,
  BudgetTableValue,
  ActivitiesRow,
  EstimateParams,
  ApproveParams,
  GoalParams,
  GeneralInfoForUpdateData,
  ProjectKPI,
  ProjectObjectiveOrOutcome,
  ProjectProgress,
  ClosureRecord,
} from "@/dto/projectDto";

export type Project = {
  id: string;
  budgetPlanId?: string;
  budgetPlanStatus: string;
  status: "draft" | "pending_approval" | "in_progress" | "completed" | "cancelled" | "rejected" | "out_of_date" | "in_revision";
  progress: number;
  updatedAt: string;
  generalInfo: GeneralInfoForUpdateData;
  strategy: StrategyParams;
  duration: DateDurationValue;
  budget: BudgetTableValue | null;
  activities: ActivitiesRow[];
  rawProgress: ProjectProgress[];
  kpi: ProjectKPI[];
  estimate: EstimateParams;
  approve: ApproveParams;
  project_objectives_and_outcomes: ProjectObjectiveOrOutcome[];
  goal: GoalParams;
  closureRecord?: ClosureRecord | null;
};
