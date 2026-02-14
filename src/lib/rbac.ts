// ใช้ role code โดยตรงจาก backend แทนการ map แบบเดิม
export function pickHomeByRole(roleCode?: string): string {
  if (!roleCode) return "/login";
  
  const code = roleCode.toLowerCase();
  
  // Admin dashboard
  if (code === "admin") {
    return "/admin/dashboard";
  }
  
  // Director dashboard
  if (code === "director") {
    return "/organizer/dashboard/director";
  }
  
  // HR dashboard
  if (code === "hr") {
    return "/organizer/dashboard/hr";
  }
  
  // User dashboard (สำหรับ role อื่นๆ ที่ไม่ใช่ admin, director, hr)
  // รวมถึง department_user, department_head, planning และ role อื่นๆ ที่ไม่ได้กำหนดไว้
  return "/organizer/dashboard/user";
}