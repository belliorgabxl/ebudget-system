import { ProjectKPI } from "./projectDto";

export interface BudgetItem {
  amount: number;
  name: string;
  remark?: string;
}

export interface Budgets {
  approved_at?: string;
  budget_amount: number;
  budget_items: BudgetItem[];
  budget_source: string;
  budget_source_department?: string;
  closed_at?: string;
  created_at?: string;
  current_approval_level?: number;
  fiscal_year: number;
  organization_id: string;
  plan_number?: string;
  rejected_at?: string;
  status?: string;
  submitted_at?: string;
  updated_at?: string;
  updated_by?: string;
}

export interface ProjectObjectiveOutcome {
  description: string;
  type: string;
}

export interface ProjectProgress {
  description: string;
  end_date: string;
  remarks?: string;
  responsible_name: string;
  start_date: string;
  updated_by?: string;
}

export interface ProjectQaIndicator {
  organization_id: string;
  qa_indicator_id: string;
}

export interface ProjectStrategy {
  strategic_plan_id: string;
}

export interface CreateProjectPayload {
  budgets?: Budgets;
  code?: string;
  department_id: string;
  description: string;
  end_date: string;
  location: string;
  name: string;
  organization_id: string;
  owner_user_id: string;
  plan_type: string; 
  project_kpis?: ProjectKPI[];
  project_objective_and_outcomes?: ProjectObjectiveOutcome[];
  project_progress?: ProjectProgress[];
  project_qa_indicators?: ProjectQaIndicator[];
  project_strategy?: ProjectStrategy[];
  qualitative_goal?: string;
  quantitative_goal?: string;
  rationale?: string;
  start_date: string;
  updated_by?: string;
  evaluation: EvaluationParams;
}

export type EvaluationParams = {
  start_date: string;
  end_date: string;
  estimate_type: string;
  evaluator_user_id: string;
}

export type CreateProjectRequest = CreateProjectPayload;

export interface CreateProjectResponse {
  message: string;
}