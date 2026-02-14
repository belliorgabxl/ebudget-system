import { MOCK_APPROVAL_LEVELS, MOCK_ORGANIZATION_ROLES, type OrganizationRole } from "./mock-org-detail"

export type Organization = {
  id: string
  name: string
  code: string
  description: string
  totalBudget: number
  totalDepartments: number
  totalEmployees: number
  totalProjects: number
  status: "active" | "inactive"
  createdAt: string
  updatedAt: string
  type?: string
  max_approval_level?: number
  roles?: OrganizationRole[]
  approvalLevels?: typeof MOCK_APPROVAL_LEVELS
}

export const MOCK_ORGANIZATIONS: Organization[] = [
  {
    id: "ORG-001",
    name: "EA sport",
    code: "EAS",
    description: "บริษัทเทคโนโลยีชั้นนำ",
    type: "organization",
    totalBudget: 100000000,
    totalDepartments: 8,
    totalEmployees: 250,
    totalProjects: 45,
    status: "active",
    createdAt: "2023-01-15T00:00:00Z",
    updatedAt: "2025-01-20T00:00:00Z",
    max_approval_level: 4,
    roles: MOCK_ORGANIZATION_ROLES,
    approvalLevels: MOCK_APPROVAL_LEVELS,
  },
  {
    id: "ORG-002",
    name: "บริษัท XYZ จำกัด",
    code: "XYZ",
    description: "บริษัทบริการการเงิน",
    type: "organization",
    totalBudget: 150000000,
    totalDepartments: 12,
    totalEmployees: 400,
    totalProjects: 68,
    status: "active",
    createdAt: "2022-06-10T00:00:00Z",
    updatedAt: "2025-01-18T00:00:00Z",
    max_approval_level: 3,
    roles: MOCK_ORGANIZATION_ROLES,
    approvalLevels: MOCK_APPROVAL_LEVELS,
  },
  {
    id: "ORG-003",
    name: "บริษัท DEF จำกัด",
    code: "DEF",
    description: "บริษัทอุตสาหกรรม",
    type: "organization",
    totalBudget: 80000000,
    totalDepartments: 6,
    totalEmployees: 180,
    totalProjects: 32,
    status: "active",
    createdAt: "2023-03-20T00:00:00Z",
    updatedAt: "2025-01-15T00:00:00Z",
    max_approval_level: 3,
    roles: MOCK_ORGANIZATION_ROLES,
    approvalLevels: MOCK_APPROVAL_LEVELS,
  },
  {
    id: "ORG-004",
    name: "บริษัท GHI จำกัด",
    code: "GHI",
    description: "บริษัทการค้า",
    type: "organization",
    totalBudget: 50000000,
    totalDepartments: 4,
    totalEmployees: 120,
    totalProjects: 18,
    status: "inactive",
    createdAt: "2022-11-05T00:00:00Z",
    updatedAt: "2024-12-10T00:00:00Z",
    max_approval_level: 2,
    roles: MOCK_ORGANIZATION_ROLES,
    approvalLevels: MOCK_APPROVAL_LEVELS,
  },
  {
    id: "ORG-005",
    name: "บริษัท JKL จำกัด",
    code: "JKL",
    description: "บริษัทการศึกษา",
    type: "organization",
    totalBudget: 60000000,
    totalDepartments: 5,
    totalEmployees: 150,
    totalProjects: 25,
    status: "active",
    createdAt: "2023-05-12T00:00:00Z",
    updatedAt: "2025-01-19T00:00:00Z",
    max_approval_level: 3,
    roles: MOCK_ORGANIZATION_ROLES,
    approvalLevels: MOCK_APPROVAL_LEVELS,
  },
]
