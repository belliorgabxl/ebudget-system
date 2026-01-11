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
  kpi: ProjectKPI[];
  estimate: EstimateParams;
  approve: ApproveParams;
  project_objectives_and_outcomes: ProjectObjectiveOrOutcome[];
  goal: GoalParams;
};
