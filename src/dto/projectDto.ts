export interface Project {
  id: string;
  name: string;
  owner: string;
  role?: string;
  status: "draft" | "in_progress" | "on_hold" | "done";
  progress: number;
  updatedAt: string;
  type?: "Internal" | "External" | string;
  department?: string;
  durationMonths?: number;
  objective?: string;
  kpis?: { name: string; target?: number }[];
  budget?: number;
  qaIndicators?: string[];
  strategies?: string[];
  attachmentsCount?: number;
}
export type Department = {
  id: string;
  code: string;
  name: string;
  head?: string;
  employees?: number;
  projectsCount?: number;
  updatedAt?: string;
};

export type TdProps = React.TdHTMLAttributes<HTMLTableCellElement> & {
  className?: string;
  children: React.ReactNode;
};

// duration component part

export type DateDurationValue = {
  startDate: string;
  endDate: string;
  durationMonths: number;
};

// budget component part
export type BudgetTableValue = {
  rows: BudgetItems[];
  total: number;
  sources: FundingSources;
};
export type BudgetItems = {
  id: number;
  name: string;
  amount: string;
  remark: string;
};

export type FundingSources = {
  source: string;
  externalAgency: string;
};

// estimate component part
export type EstimateParams = {
  estimateType: string;
  evaluator: string;
  startDate: string;
  endDate: string;
};

// general info component part
export type GeneralInfoCreateParams = {
  name: string;
  type: string;
  department_id: string;
  owner_user_id: string;
  description: string;
};

// strategy component part
export type StrategyParams = {
  schoolPlan: string;
  ovEcPolicy: string;
  qaIndicator: string;
};

// approve component part
export type ApproveParams = {
  proposerName: string;
  proposerPosition: string;
  proposeDate: string;
  deptComment: string;
  directorComment: string;
};

// goal component part
export type GoalParams = {
  quantityGoal: string;
  qualityGoal: string;
};

// activity component part
export type ActivitiesRow = {
  id: number;
  activity: string;
  startDate: string;
  endDate: string;
  owner: string;
};

export type KPIParams = {
  output: string;
  outcome: string;
};


export type ExpectItem = {
  description: string;
  type: string;
};


export type ExpectParams = {
  results: ExpectItem[];
};

export type ObjectiveParams = {
  results: {
    description: string;
    type?: "objective";
  }[];
};

export interface ProjectInformationResponse {
  project_name: string;
  plan_type: string;
  project_code: string;
  project_description:string;
  rationale: string;
  location: string;

  quantitative_goal: string;
  qualitative_goal: string;

  created_at: string;
  updated_at: string;

  start_date: string;
  end_date: string;

  owner_user: string;

  objective_type: "objective" | "expectation" | string;
  objective_description: string;
  budget_plan_status: string;
  department_name: string;
  budget_plan_id: string;
  budget_source: "revenue" | "school" | "external" | "externalAgency" | string;
  budget_amount: number;

  budget_source_department?: string;

  budget_items: BudgetItem[];

  progress: ProjectProgress[];

  project_kpis: ProjectKPI[];

  project_evaluation: ProjectEvaluation[];

  project_objectives_and_outcomes: ProjectObjectiveOrOutcome[];
}

export interface BudgetItem {
  id: number;
  budget_plan_id: string;
  name: string;
  amount: number;
  remark: string;
  created_at: string;
  updated_at: string;
}

export interface ProjectProgress {
  id: number;
  project_id: string;
  start_date: string | null;
  end_date: string | null;
  sequence_number: number;
  description: string;
  responsible_name: string;
  remarks: string;
  updated_by: string | null;
  updated_at: string;
}

export interface ProjectKPI {
  id: number;
  indicator: string;
  target_value: number | string | null;
  description: string;
}

export interface ProjectEvaluation {
  id: number;
  evaluator_user_id: string;
  created_at: string;
  updated_at: string;
  estimate_type: string;
  start_date: string;
  end_date: string;
}

export interface ProjectObjectiveOrOutcome {
  id: number;
  project_id: string;
  type: "objective" | "expectation" | string;
  description: string;
}

export interface GeneralInfoForUpdateData {
  name: string;
  plan_type: string;
  code:string;
  description: string;
  rationale:string;
  location : string;
  project_id : string;
  regular_work_template_id:string;
  quantitative_goal:string;
  qualitative_goal :string;
  start_date: string;
  end_date :string;
}
export type EditFormState = {
  id: string;
  generalInfo: GeneralInfoCreateParams;
  goal: GoalParams;
  duration: DateDurationValue;
  strategy: StrategyParams;
  kpi: KPIParams;
  estimate: EstimateParams;
  expect: ExpectParams;
  budget: BudgetTableValue | null;
  activities: ActivitiesRow[];
  approve: ApproveParams;
};

export type DateError =
  | "MISSING_START"
  | "MISSING_END"
  | "INVALID_START"
  | "INVALID_END"
  | "START_AFTER_END"
  | "START_EQUALS_END";

export type ValidationIssue = { field: string; message: string };

export type ProjectListItem = {
  id: string;
  name: string;
  type?: string;
  department?: string;
  owner?: string;
  status?: string;
  updatedAt?: string;
};

export type KpiMaster = {
  id: number;
  name: string;
  type: "output" | "outcome";
};

export type KpiSectionDraft = {
  kpi_ids: number[];
};