import {
  LayoutDashboard,
  Building2,
  Settings,
  TrendingUp,
  ClipboardList,
  FileCheck,
  Users,
  DollarSign,
} from "lucide-react";

// ใช้ role code เป็น string โดยตรง
export type MenuItem = {
  id: string;
  href: string | ((roleHome: string | null) => string | null);
  icon: any;
  label: string;
  allow?: string[]; // role codes
  deny?: string[]; // role codes
};

export const MENU: MenuItem[] = [
  {
    id: "dashboard",
    href: (roleHome) => roleHome,
    icon: LayoutDashboard,
    label: "ภาพรวม",
    allow: ["department_user", "department_head", "planning", "director", "hr"],
  },
  {
    id: "admin-dashboard",
    href: "/admin/dashboard",
    icon: LayoutDashboard,
    label: "Admin Dashboard",
    allow: ["admin"],
  },
  {
    id: "admin-users",
    href: "/admin/users",
    icon: Users,
    label: "จัดการผู้ใช้งาน",
    allow: ["admin"],
  },
  {
    id: "department",
    href: "/organizer/department",
    icon: Building2,
    label: "หน่วยงาน",
    allow: ["hr"],
    deny: ["admin"],
  },
  {
    id: "users",
    href: "/organizer/users",
    icon: Users,
    label: "พนักงาน",
    allow: ["hr"],
    deny: ["admin"],
  },
  {
    id: "projects",
    href: "/organizer/projects/my-project",
    icon: ClipboardList,
    label: "โครงการ",
    allow: ["department_user", "department_head", "planning", "director"],
  },
  {
    id: "reports",
    href: "/organizer/reports",
    icon: TrendingUp,
    label: "รายงาน",
    allow: ["planning", "director", "department_user", "department_head", "hr"],
  },
  {
    id: "approve",
    href: "/organizer/approve",
    icon: FileCheck,
    label: "การอนุมัติ",
    allow: ["director", "department_head", "planning", "hr"],
  },
  {
    id: "qa-coverage",
    href: "/organizer/qa-coverage",
    icon: ClipboardList,
    label: "ความครอบคลุมตัวบ่งชี้ QA",
    allow: ["director"],
  },
  {
    id: "manage-org",
    href: "/admin/manage-org",
    icon: Building2,
    label: "จัดการองค์กร",
    allow: ["admin"],
  },
  {
    id: "budget-settings",
    href: "/organizer/budget-settings",
    icon: DollarSign,
    label: "งบประมาณประจำปี",
    allow: ["director"],
  },
  {
    id: "setup",
    href: "/organizer/setup",
    icon: Settings,
    label: "ตั้งค่า",
    allow: [
      "hr",
      "admin",
      "planning",
      "director",
      "department_user",
      "department_head",
    ],
  },
];

export const canSeeMenuHandler = (roleCode: string, item: MenuItem, approvalLevel?: number | null) => {
  // Normalize role code - ถ้าไม่ใช่ role ที่กำหนดไว้ ให้ใช้เป็น "user"
  const normalizedRole = normalizeRoleCode(roleCode);
  
  if (item.deny?.includes(normalizedRole)) return false;
  if (!item.allow) return true;
  if (!item.allow.includes(normalizedRole)) return false;
  
  // Special condition for approve menu: only show if approval_level > 0
  if (item.id === "approve") {
    return (approvalLevel ?? 0) > 0;
  }
  
  return true;
};

// Normalize role code: ถ้าไม่ใช่ role ที่รู้จัก ให้ใช้เป็น "user" (department_user)
export const normalizeRoleCode = (roleCode: string): string => {
  const knownRoles = ["admin", "hr", "director", "department_user", "department_head", "planning"];
  const normalized = roleCode.toLowerCase();
  return knownRoles.includes(normalized) ? normalized : "department_user";
};
