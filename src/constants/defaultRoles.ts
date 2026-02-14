/**
 * Default roles that must be created for every organization
 * These roles have fixed properties except: name, display_name, description, approval_level
 */

export interface DefaultRoleTemplate {
  code: string;
  name: string;
  display_name: string;
  description: string;
  approval_level: number;
  can_create_budget_plan: boolean;
  can_view_all_plans: boolean;
  can_approve: boolean;
  can_edit_qas: boolean;
}

export const DEFAULT_ROLES: DefaultRoleTemplate[] = [
  {
    name: "Department User",
    display_name: "ผู้ใช้แผนก",
    code: "user",
    description: "ผู้ใช้งานในแผนกสามารถสร้างและจัดการงบประมาณของแผนกตนเอง",
    approval_level: 0,
    can_create_budget_plan: true,
    can_view_all_plans: false,
    can_approve: false,
    can_edit_qas: false
  },
  {
    name: "HR",
    display_name: "ฝ่ายบุคคล",
    code: "hr",
    description: "ฝ่ายบุคคลสามารถจัดการข้อมูลพนักงานและสิทธิ์การเข้าถึง",
    approval_level: 0,
    can_create_budget_plan: false,
    can_view_all_plans: false,
    can_approve: false,
    can_edit_qas: false
  },
  {
    name: "Director",
    display_name: "ผู้อำนวยการ",
    code: "director",
    description: "ผู้อำนวยการสามารถอนุมัติงบประมาณขั้นสูงสุด",
    approval_level: 1,
    can_create_budget_plan: false,
    can_view_all_plans: true,
    can_approve: true,
    can_edit_qas: false
  }
];

/**
 * Role codes that are system-protected
 * Only name, display_name, description, and approval_level can be edited
 */
export const PROTECTED_ROLE_CODES = ["user", "hr", "director"];

/**
 * Check if a role code is protected
 */
export function isProtectedRoleCode(code: string): boolean {
  return PROTECTED_ROLE_CODES.includes(code.toLowerCase());
}

/**
 * Get editable fields for a role based on whether it's protected
 */
export function getEditableFields(code: string): string[] {
  if (isProtectedRoleCode(code)) {
    return ["name", "display_name", "description", "approval_level"];
  }
  return ["name", "display_name", "description", "approval_level", "code", "can_create_budget_plan", "can_view_all_plans", "can_approve", "can_edit_qas"];
}
