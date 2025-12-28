export type ApprovalSubmitResponse = {
  budget_plan_id: string;
  current_level: number;
  message: string;
  status: string;
  submitted_at: string;
  submitted_by_user: string;
};

export type ApprovalActionType = "approve" | "reject" | "request_revision";

export type ProcessApprovalActionRequest = {
  action: ApprovalActionType;
  budget_plan_id: string;
  comments?: string;
  rejection_reason?: string;
};

export type ProcessApprovalActionResponse = {
  action: string;
  budget_plan_id: string;
  current_level: number;
  max_level: number;
  is_completed: boolean;
  new_status: string;
  message: string;
  processed_at: string;
  processed_by_user: string;
};


export type PendingApprovalProject = {
  id: string;
  organization_id: string;
  department_id: string;
  owner_user_id: string;
  name: string;
  code: string;
  description: string;
  plan_type: string;
  regular_work_template_id: string | null;
  rationale: string;
  quantitative_goal: string;
  qualitative_goal: string;
  location: string;
  updated_by: string | null;
  start_date: string | null;
  end_date: string | null;
};

export type PendingApprovalsEnvelope = {
  data: PendingApprovalProject[];
  total: number;
  pagination: {
    page: number;
    limit: number;
    total: number;
    total_pages: number;
    has_next: boolean;
    has_prev: boolean;
  };
};

export type PendingApprovalsParams = {
  q?: string;
  code?: string;
  plan_type?: string;
  page?: string;
  limit?: string;
};