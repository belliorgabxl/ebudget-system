// Organization DTOs based on API documentation
export interface ApprovalLevel {
  level: number;
  roles: { id: string; name: string }[];
}

export interface OrganizationResponse {
  id: string;
  name: string;
  type: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  created_by: string | null;
  updated_by: string | null;
  max_approval_level?: number;
  roles?: OrganizationRole[];
  count_pending_approval?: number;
}
export interface RoleViewModel {
  id: string;
  name: string;
  description: string;
  approvalOrder?: number;
  permissions: string[];
  userCount: number;
}

// Role data for creating within an organization
export interface CreateRolePayload {
  name: string;
  display_name: string;
  code: string;
  description: string;
  approval_level: number;
  can_create_budget_plan: boolean;
  can_view_all_plans: boolean;
  can_approve: boolean;
  can_edit_qas: boolean;
}

export interface CreateOrganizationRequest {
  name: string;
  type?: string;
  max_approval_level?: number;
  roles?: CreateRolePayload[];
}

export interface UpdateOrganizationRequest {
  id: string;
  name: string;
  type?: string;
  max_approval_level?: number;
  roles?: OrganizationRole[];
}
export interface OrganizationRole {
  id: string;
  name: string;
  display_name: string;
  code: string;
  description: string;
  is_system: boolean;
  is_active: boolean;
  organization_id: string;
  approval_level: number;
  can_create_budget_plan: boolean;
  can_view_all_plans: boolean;
  can_approve: boolean;
  can_edit_qas: boolean;
}
export interface OrganizationListResponse {
  data: OrganizationResponse[];
  total: number;
  page: number;
  limit: number;
  total_pages: number;
}

export interface GetOrganizationsParams {
  page?: number;
  limit?: number;
  name?: string;
  type?: string;
  is_active?: boolean;
}
