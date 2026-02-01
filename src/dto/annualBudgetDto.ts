// Annual Budget Types
export type AnnualBudget = {
  id: number;
  organization_id: string;
  fiscal_year: number;
  amount: number;
  used_amount: number;
  remaining_amount: number;
  usage_percentage: number;
  created_at: string;
  updated_at: string;
  created_by: string;
  updated_by: string;
};

export type CreateAnnualBudgetRequest = {
  amount: number;
  fiscal_year: number;
};

export type UpdateAnnualBudgetRequest = {
  id: number;
  amount: number;
  fiscal_year: number;
};

export type GetAnnualBudgetsResponse = AnnualBudget[];

export type GetAnnualBudgetByIdResponse = AnnualBudget;

export type BudgetSummary = {
  fiscal_year: number;
  year_label: string;
  total_budget: number;
  used_budget: number;
  remaining_budget: number;
  usage_percentage: number;
};

export type GetAnnualBudgetSummaryResponse = {
  summary: BudgetSummary;
  yearly_data: BudgetSummary[];
};

export type DeleteAnnualBudgetResponse = {
  success: boolean;
  message: string;
};
