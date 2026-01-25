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

export type RoleKey =
  | "department_user"
  | "department_head"
  | "planning"
  | "director"
  | "admin"
  | "hr";

export type MenuItem = {
  id: string;
  href: string | ((roleHome: string | null) => string | null);
  icon: any;
  label: string;
  allow?: RoleKey[];
  deny?: RoleKey[];
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
    id: "department",
    href: "/organizer/department",
    icon: Building2,
    label: "หน่วยงาน",
    allow: ["hr", "admin"],
  },
  {
    id: "users",
    href: "/organizer/users",
    icon: Users,
    label: "พนักงาน",
    allow: ["hr", "admin"],
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

export const canSeeMenuHandler = (role: RoleKey, item: MenuItem) => {
  if (item.deny?.includes(role)) return false;
  if (!item.allow) return true;
  return item.allow.includes(role);
};
