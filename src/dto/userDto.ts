export interface User {
  id: string;
  organization_id: string;
  department_id: string | null;
  role: string;
  username: string;
  email: string;
  position: string;
  first_name: string;
  last_name: string;
  full_name: string;
  last_login_at: string | null;
}
export interface AuthUser {
  id: string;
  username: string;
  name: string;
  role_key: string | null;
  role_id: string | null;
  role_label: string | null;
  org_id: string | null;
  department_id: string | null;
}

export interface GetUserRespond {
  approval_level?: number;
  department_id: string | null;
  department_name: string;
  email: string;
  first_name: string;
  full_name: string;
  id: string;
  is_active: boolean;
  is_system_role?: boolean;
  last_login_at: string | null;
  last_name: string;
  organization_id: string;
  organization_name?: string;
  position: string | null;
  role: string;
  role_code?: string;
  username: string;
}

export interface CreateUserRequest {
  department_id: string | null;
  email: string;
  first_name: string;
  last_name: string;
  organization_id: string;
  password: string;
  position: string | null;
  role_id: number;
  username: string;
}
export interface UpdateUserStatusRequest {
  user_id: string;
  is_active :string;
}
export interface UpdateUserRequest {
  user_id: string;
  email :string;
  first_name :string;
  lastname :string;
  position :string;
  role_id :number;
  department_id :string;
}