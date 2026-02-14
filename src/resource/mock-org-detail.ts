export type Employee = {
  id: string
  name: string
  email: string
  position: string
  department: string
  role: string
  status: "active" | "inactive" | "on-leave"
  joinDate: string
  salary: number
}

export type Department = {
  id: string
  code: string
  name: string
  leader: string
  description: string
  employeeCount: number
  projectCount: number
  createdAt: string
}

export type Role = {
  id: string
  code: string
  name: string
  description: string
  permissions: string[]
  userCount: number
  approvalOrder?: number
  createdAt: string
}

export const MOCK_EMPLOYEES: Employee[] = [
  {
    id: "EMP-001",
    name: "สมชาย ใจดี",
    email: "somchai@abc.com",
    position: "ผู้บริหารสูง",
    department: "IT",
    role: "admin",
    status: "active",
    joinDate: "2020-01-15",
    salary: 80000,
  },
  {
    id: "EMP-002",
    name: "วิชัย เทคโน",
    email: "vichai@abc.com",
    position: "หัวหน้าฝ่าย",
    department: "IT",
    role: "department_head",
    status: "active",
    joinDate: "2020-06-10",
    salary: 60000,
  },
  {
    id: "EMP-003",
    name: "สุดา พัฒน์",
    email: "suda@abc.com",
    position: "นักพัฒนา",
    department: "IT",
    role: "department_user",
    status: "active",
    joinDate: "2021-03-20",
    salary: 45000,
  },
  {
    id: "EMP-004",
    name: "ประกาศ ศรีการ",
    email: "prakash@abc.com",
    position: "นักพัฒนา",
    department: "IT",
    role: "department_user",
    status: "active",
    joinDate: "2021-05-15",
    salary: 42000,
  },
  {
    id: "EMP-005",
    name: "มิ่งขวัญ วรรณ",
    email: "mingkwan@abc.com",
    position: "พนักงานบุคคล",
    department: "HR",
    role: "department_user",
    status: "on-leave",
    joinDate: "2019-12-01",
    salary: 35000,
  },
]

export const MOCK_DEPARTMENTS: Department[] = [
  {
    id: "DEPT-001",
    code: "IT",
    name: "ฝ่ายไอที",
    leader: "วิชัย เทคโน",
    description: "ฝ่ายที่รับผิดชอบเรื่องเทคโนโลยีและการพัฒนาระบบ",
    employeeCount: 15,
    projectCount: 8,
    createdAt: "2020-01-01",
  },
  {
    id: "DEPT-002",
    code: "HR",
    name: "ฝ่ายบุคคล",
    leader: "สมควร บริหาร",
    description: "ฝ่ายที่รับผิดชอบเรื่องการบริหารทรัพยากรมนุษย์",
    employeeCount: 8,
    projectCount: 3,
    createdAt: "2020-01-01",
  },
  {
    id: "DEPT-003",
    code: "FIN",
    name: "ฝ่ายการเงิน",
    leader: "ก่อม้วน จัดการเงิน",
    description: "ฝ่ายที่รับผิดชอบเรื่องการเงินและบัญชี",
    employeeCount: 6,
    projectCount: 2,
    createdAt: "2020-02-15",
  },
]

export const MOCK_ROLES: Role[] = [
  {
    id: "ROLE-001",
    code: "admin",
    name: "ผู้ดูแลระบบ",
    description: "มีสิทธิ์ทั้งหมดในระบบ",
    permissions: [
      "view_all",
      "create_org",
      "edit_org",
      "delete_org",
      "manage_users",
      "manage_roles",
    ],
    userCount: 2,
    approvalOrder: 1,
    createdAt: "2020-01-01",
  },
  {
    id: "ROLE-002",
    code: "director",
    name: "ผู้บริหารสูง",
    description: "มีสิทธิ์บริหารงบประมาณและการอนุมัติโครงการ",
    permissions: [
      "view_dashboard",
      "manage_budget",
      "approve_projects",
      "view_reports",
    ],
    userCount: 5,
    approvalOrder: 2,
    createdAt: "2020-01-01",
  },
  {
    id: "ROLE-003",
    code: "department_head",
    name: "หัวหน้าฝ่าย",
    description: "มีสิทธิ์บริหารหน่วยงานและพนักงาน",
    permissions: [
      "view_department",
      "manage_department",
      "create_project",
      "edit_project",
    ],
    userCount: 8,
    approvalOrder: 3,
    createdAt: "2020-02-01",
  },
  {
    id: "ROLE-004",
    code: "department_user",
    name: "พนักงาน",
    description: "มีสิทธิ์ดูข้อมูลและสร้างโครงการ",
    permissions: ["view_dashboard", "create_project", "edit_own_project"],
    userCount: 45,
    approvalOrder: 4,
    createdAt: "2020-02-01",
  },
]

// Organization Role Type
export type OrganizationRole = {
  approval_level: number
  can_approve: boolean
  can_create_budget_plan: boolean
  can_view_all_plans: boolean
  description: string
  display_name: string
  name: string
}

// Approval Levels Type (for UI display)
export type ApprovalLevel = {
  level: number
  roles: { id: string; name: string }[]
}

// Mock Organization Roles
export const MOCK_ORGANIZATION_ROLES: OrganizationRole[] = [
  {
    approval_level: 1,
    can_approve: false,
    can_create_budget_plan: true,
    can_view_all_plans: false,
    description: "เจ้าหน้าที่จัดทำแผนงบประมาณ",
    display_name: "Budget Officer",
    name: "budget_officer",
  },
  {
    approval_level: 2,
    can_approve: true,
    can_create_budget_plan: true,
    can_view_all_plans: false,
    description: "หัวหน้าหน่วยงาน ตรวจสอบและอนุมัติเบื้องต้น",
    display_name: "Department Head",
    name: "department_head",
  },
  {
    approval_level: 3,
    can_approve: true,
    can_create_budget_plan: false,
    can_view_all_plans: true,
    description: "ผู้บริหารระดับสูง อนุมัติขั้นกลาง",
    display_name: "Executive Manager",
    name: "executive_manager",
  },
  {
    approval_level: 4,
    can_approve: true,
    can_create_budget_plan: false,
    can_view_all_plans: true,
    description: "ผู้อนุมัติสูงสุดขององค์กร",
    display_name: "Director",
    name: "director",
  },
]

// Mock Approval Levels (for displaying approval flow)
export const MOCK_APPROVAL_LEVELS: ApprovalLevel[] = [
  {
    level: 1,
    roles: [
      { id: "budget_officer", name: "Budget Officer" },
    ],
  },
  {
    level: 2,
    roles: [
      { id: "department_head", name: "Department Head" },
    ],
  },
  {
    level: 3,
    roles: [
      { id: "executive_manager", name: "Executive Manager" },
    ],
  },
  {
    level: 4,
    roles: [
      { id: "director", name: "Director" },
    ],
  },
]
