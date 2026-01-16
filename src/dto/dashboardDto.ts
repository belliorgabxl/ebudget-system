export type GetApprovalItems = {
  budget_id: string;
  amount: number;
  dept: string;
  owner: string;
  last_update: Date | string;
  priority: number;
  project: string;
  stage: string;
};

export type GetCalenderEventRespond = {
  id: string;
  title: string;
  start_date: Date | string;
  plan_id?: string;
  end_date?: Date | string;
  department?: string;
  status?: string;
};

export type GetProjectsByOrgRespond = {
  id: string;
  name: string;
  code?: string;
  department_id?: string;
  department_name?: string;
  description?: string;
  location?: string;
  organization_id?: string;
  owner_user_id?: string;
  plan_type?: "regular_work" | string;
  qualitative_goal?: string;
  quantitative_goal?: string;
  rationale?: string;
  regular_work_template_id?: string;
  start_date?: string;
  end_date?: string;
  updated_by?: string;
};

export type Pagination = {
  has_next: boolean;
  has_prev: boolean;
  limit: number;
  page: number;
  total: number;
  total_pages: number;
};

export type ProjectsListResponse = {
  data: GetProjectsByOrgRespond[];
  page: number;
  limit: number;
  total: number;
  total_pages: number;
  pagination: Pagination;
};

export type ProjectsQuery = {
  page?: number | string;
  limit?: number | string;
  name?: string;
  code?: string;
  plan_type?: string;
  is_active?: boolean | string; 
  department_id?: string;
  start_date?: string; 
};

// Dashboard KPI Types
export type DashboardKPI = {
  year: string;
  totalBudget: number;
  totalProjects: number;
  avgBudget: number;
  totalEmployees: number;
  totalDepartments: number;
};

export type BudgetByYear = {
  year: string;
  budget: number;
};

export type BudgetByDepartment = {
  department: string;
  budget: number;
  actual: number;
};

export type BudgetByStatus = {
  status: string;
  budget: number;
};

export type ProjectCountByDepartment = {
  department: string;
  count: number;
};

export type ProjectCountByStatus = {
  status: string;
  value: number;
};

export type ApprovalQueueItem = {
  id: string;
  projectName: string;
  department: string;
  budget: number;
  status: string;
  submittedAt: string;
};
