export type RoleKey =
  | "department_user"
  | "department_head"
  | "planning"
  | "director"
  | "admin"
  | "hr";

export const ROLE_MAP: Record<number, { key: RoleKey; label: string }> = {
  1: { key: "department_user",  label: "ผู้ใช้แผนก" },
  2: { key: "department_head",  label: "หัวหน้าแผนก" },
  3: { key: "planning",         label: "ฝ่ายวางแผน" },
  4: { key: "director",         label: "ผู้อำนวยการ" },
  5: { key: "admin",            label: "ผู้ดูแลระบบ" },
  6: { key: "hr",               label: "ฝ่ายบุคคล" },
};

export function roleIdToKey(id?: unknown): RoleKey | null {
  const n = Number(id);
  if (!Number.isFinite(n)) return null;
  return ROLE_MAP[n]?.key ?? null;
}

export function roleIdToLabel(id?: unknown): string | null {
  const n = Number(id);
  if (!Number.isFinite(n)) return null;
  return ROLE_MAP[n]?.label ?? null;
}

export function pickHomeByRole(role?: string): string {
  switch (role) {
    case "admin":
      return "/admin";
    case "director":
      return "/organizer/dashboard/director";
    case "hr":
      return "/organizer/dashboard/hr";
    case "department_user":
      return "/organizer/dashboard/user";
    case "planning":
      return "/organizer/dashboard/user";
    case "department_head":
      return "/organizer/dashboard/user";
    default:
      return "/login";
  }
}