export type Priority = "high" | "medium" | "low"

export interface ApprovalItem {
  project: string
  dept: string
  amount: string
  owner: string
  stage: string
  lastUpdate: string
  priority: Priority
}

export const MOCK_APPROVALS: ApprovalItem[] = [
  { project: "ปรับปรุงหลักสูตรวิทยาศาสตร์", dept: "วิชาการ", amount: "฿850,000",  owner: "ดร.สมชาย ใจดี", stage: "รอผู้อำนวยการ", lastUpdate: "2 ชม.", priority: "high" },
  { project: "จัดซื้อครุภัณฑ์คอมพิวเตอร์",   dept: "การเงิน",  amount: "฿1,250,000", owner: "นางสาวมานี รักงาน", stage: "รอหัวหน้าฝ่าย", lastUpdate: "5 ชม.", priority: "medium" },
  { project: "โครงการพัฒนาบุคลากร",         dept: "ฝ่ายแผน",  amount: "฿450,000",  owner: "นายประสิทธิ์ ทำดี",  stage: "รอผู้อำนวยการ", lastUpdate: "1 วัน", priority: "high" },
  { project: "ระบบทะเบียนออนไลน์",           dept: "ทะเบียน",  amount: "฿2,100,000", owner: "นางสาววิไล เก่งงาน", stage: "รอหัวหน้าฝ่าย", lastUpdate: "2 วัน", priority: "low" },
]


export interface BudgetByDept { dept: string; approved: number; pending: number; rejected: number }
export const MOCK_BUDGET_BY_DEPT: BudgetByDept[] = [
  { dept: "ฝ่ายแผน",       approved: 35, pending: 8,  rejected: 2 },
  { dept: "วิชาการ",       approved: 52, pending: 12, rejected: 3 },
  { dept: "การเงิน",       approved: 28, pending: 5,  rejected: 1 },
  { dept: "ทะเบียน",       approved: 42, pending: 7,  rejected: 2 },
  { dept: "กิจการนักเรียน", approved: 38, pending: 6,  rejected: 4 },
]

export interface ProjectTypeRatio { name: string; value: number; color: string }
export const MOCK_PROJECT_TYPES: ProjectTypeRatio[] = [
  { name: "งานประจำ", value: 156, color: "hsl(var(--chart-1))" },
  { name: "โครงการ",  value: 139, color: "hsl(var(--chart-4))" },
]

export type ProjectStatus = "approved" | "pending" | "rejected" | "closed"
export interface ProjectRow {
  name: string
  dept: string
  type: string
  amount: string
  status: ProjectStatus
  qaCount: number
  strategy: string
  period: string
}
export const MOCK_PROJECTS: ProjectRow[] = [
  { name: "ปรับปรุงหลักสูตรวิทยาศาสตร์", dept: "วิชาการ",       type: "โครงการ", amount: "฿850,000",  status: "approved", qaCount: 3, strategy: "S2 Quality",   period: "ม.ค. - มี.ค. 68" },
  { name: "จัดซื้อครุภัณฑ์คอมพิวเตอร์",   dept: "การเงิน",        type: "งานประจำ", amount: "฿1,250,000",status: "pending",  qaCount: 2, strategy: "S1 Efficiency", period: "ก.พ. - เม.ย. 68" },
  { name: "โครงการพัฒนาบุคลากร",         dept: "ฝ่ายแผน",        type: "โครงการ", amount: "฿450,000",  status: "approved", qaCount: 4, strategy: "S2 Quality",   period: "ม.ค. - มิ.ย. 68" },
  { name: "ระบบทะเบียนออนไลน์",           dept: "ทะเบียน",        type: "โครงการ", amount: "฿2,100,000",status: "pending",  qaCount: 5, strategy: "S3 Innovation", period: "ม.ค. - ธ.ค. 68" },
  { name: "กิจกรรมพัฒนานักเรียน",         dept: "กิจการนักเรียน",  type: "งานประจำ", amount: "฿320,000",  status: "approved", qaCount: 2, strategy: "S2 Quality",   period: "ม.ค. - มี.ค. 68" },
  { name: "ปรับปรุงห้องสมุด",             dept: "วิชาการ",       type: "โครงการ", amount: "฿680,000",  status: "rejected", qaCount: 1, strategy: "S1 Efficiency", period: "ก.พ. - พ.ค. 68" },
  { name: "ระบบบัญชีอัตโนมัติ",           dept: "การเงิน",        type: "โครงการ", amount: "฿1,800,000",status: "approved", qaCount: 3, strategy: "S3 Innovation", period: "ม.ค. - ก.ย. 68" },
  { name: "จัดซื้อวัสดุสำนักงาน",          dept: "ฝ่ายแผน",        type: "งานประจำ", amount: "฿180,000",  status: "closed",   qaCount: 1, strategy: "S1 Efficiency", period: "ต.ค. - ธ.ค. 67" },
]
// ====== เพิ่มต่อจาก MOCK_PROJECTS ด้านบน ======

// แจ้งเตือนในศูนย์ Notification
export interface NotificationItem {
  id: string
  title: string
  message?: string
  project?: string
  createdAt: string // ISO
  read: boolean
}
export const MOCK_NOTIFICATIONS: NotificationItem[] = [
  { id: "n-101", title: "โครงการของคุณถูกขอแก้ไข", message: "เพิ่ม KPI เชิงปริมาณ", project: "ปรับปรุงหลักสูตรวิทยาศาสตร์", createdAt: "2026-02-10T09:30:00+07:00", read: false },
  { id: "n-102", title: "โครงการได้รับการอนุมัติ", message: "ระบบบัญชีอัตโนมัติ", project: "ระบบบัญชีอัตโนมัติ", createdAt: "2026-02-09T15:00:00+07:00", read: false },
  { id: "n-103", title: "ใกล้ครบกำหนดปิดโครงการ", project: "กิจกรรมพัฒนานักเรียน", createdAt: "2026-02-08T08:00:00+07:00", read: true },
]

// ปฏิทินโครงการ (ใช้ใน Calendar View)
export type CalendarStatus = "approved" | "pending" | "closed"
export interface CalendarEvent {
  title: string
  dept: string
  start: string // ISO
  end: string   // ISO
  status: CalendarStatus
}
export const MOCK_CALENDAR: CalendarEvent[] = [
  { title: "ปรับปรุงหลักสูตรวิทยาศาสตร์", dept: "วิชาการ", start: "2026-01-10", end: "2026-03-25", status: "approved" },
  { title: "จัดซื้อครุภัณฑ์คอมพิวเตอร์",   dept: "การเงิน", start: "2026-02-01", end: "2026-04-30", status: "pending" },
  { title: "โครงการพัฒนาบุคลากร",  dept: "ฝ่ายแผน", start: "2026-01-15", end: "2026-06-30", status: "approved" },
  { title: "ระบบทะเบียนออนไลน์",           dept: "ทะเบียน", start: "2026-01-01", end: "2026-12-31", status: "pending" },
  { title: "กิจกรรมพัฒนานักเรียน",         dept: "กิจการนักเรียน", start: "2026-01-05", end: "2026-03-20", status: "approved" },
]

export type CalendarEventModel = {
  id: string;
  title: string;
  start_date: Date | string;
  plan_id?: string;
  end_date?: Date | string;
  department?: string;
  status?: string;
};



export interface StrategyItem { code: string; name: string }
export const MOCK_STRATEGIES: StrategyItem[] = [
  { code: "S1", name: "Efficiency" },
  { code: "S2", name: "Quality" },
  { code: "S3", name: "Innovation" },
  { code: "S4", name: "Sustainability" },
]

// สรุปแนวโน้มงบประมาณรายเดือน (ใช้ทำกราฟเส้น/แท่งใน Dashboard)
export interface BudgetTrendPoint { month: string; approved: number; pending: number; rejected: number }
export const MOCK_BUDGET_TREND: BudgetTrendPoint[] = [
  { month: "ต.ค.", approved: 2.1, pending: 0.4, rejected: 0.1 },
  { month: "พ.ย.", approved: 1.8, pending: 0.6, rejected: 0.2 },
  { month: "ธ.ค.", approved: 2.6, pending: 0.5, rejected: 0.0 },
  { month: "ม.ค.", approved: 3.4, pending: 0.9, rejected: 0.3 },
  { month: "ก.พ.", approved: 2.9, pending: 1.1, rejected: 0.2 },
  { month: "มี.ค.", approved: 3.2, pending: 0.7, rejected: 0.2 },
]
// *หน่วยเป็น “ล้านบาท” เพื่อทำกราฟง่าย ๆ

// สรุปรายแผนก (จำนวน + วงเงินรวม) ใช้ทำตาราง/การ์ด
export interface DeptSummary {
  dept: string
  totalProjects: number
  approved: number
  pending: number
  rejected: number
  closed: number
  totalBudget: string
}
export const MOCK_DEPT_SUMMARY: DeptSummary[] = [
  { dept: "ฝ่ายแผน", totalProjects: 43, approved: 28, pending: 9, rejected: 2, closed: 4, totalBudget: "฿12,450,000" },
  { dept: "วิชาการ", totalProjects: 67, approved: 52, pending: 12, rejected: 1, closed: 2, totalBudget: "฿24,880,000" },
  { dept: "การเงิน", totalProjects: 36, approved: 28, pending: 5, rejected: 1, closed: 2, totalBudget: "฿18,120,000" },
  { dept: "ทะเบียน", totalProjects: 49, approved: 42, pending: 5, rejected: 0, closed: 2, totalBudget: "฿15,760,000" },
]

// ไทม์ไลน์การอนุมัติ (ใช้แสดงใน Project Detail > Approval)
export type ApprovalAction = "approve" | "reject" | "request_revision"
export interface ApprovalTimelineItem {
  step: 1 | 2 | 3
  role: "หัวหน้าแผนก" | "ฝ่ายแผน" | "ผู้อำนวยการ"
  user: string
  action: ApprovalAction
  at: string // ISO
  comment?: string
}
export const MOCK_APPROVAL_TIMELINE: Record<string, ApprovalTimelineItem[]> = {
  // key = ชื่อโครงการ หรือ id โครงการที่คุณใช้ mapping
  "ปรับปรุงหลักสูตรวิทยาศาสตร์": [
    { step: 1, role: "หัวหน้าแผนก", user: "น.ส. ศิริยา แผนดี", action: "approve", at: "2026-01-20T10:00:00+07:00", comment: "ผ่านหลักการ" },
    { step: 2, role: "ฝ่ายแผน",    user: "นาย ปกรณ์ วางแผน", action: "request_revision", at: "2026-01-22T14:30:00+07:00", comment: "เพิ่ม KPI เชิงปริมาณ" },
  ],
  "ระบบบัญชีอัตโนมัติ": [
    { step: 1, role: "หัวหน้าแผนก", user: "น.ส. วราภรณ์ การเงิน", action: "approve", at: "2026-01-10T09:00:00+07:00" },
    { step: 2, role: "ฝ่ายแผน",    user: "นาย ปกรณ์ วางแผน", action: "approve", at: "2026-01-12T11:10:00+07:00" },
    { step: 3, role: "ผู้อำนวยการ", user: "ดร. สมชาย ใจดี",  action: "approve", at: "2026-01-15T16:00:00+07:00" },
  ],
}

// ความเห็นแก้ไข (Revision) สำหรับหน้า Edit/Feedback
export interface RevisionComment {
  byRole: "หัวหน้าแผนก" | "ฝ่ายแผน" | "ผู้อำนวยการ"
  comment: string
  at: string
}
export const MOCK_REVISIONS: Record<string, RevisionComment[]> = {
  "ปรับปรุงหลักสูตรวิทยาศาสตร์": [
    { byRole: "ฝ่ายแผน", comment: "ขอเพิ่มตัวชี้วัดผลลัพธ์ผู้เรียน (จำนวนผลงาน/คะแนนเฉลี่ย)", at: "2026-01-22T14:30:00+07:00" },
  ],
}

// ไฟล์แนบในโครงการ (ใช้แท็บ Files)
export type FileKind = "proposal" | "quote" | "approval" | "closure" | "other"
export interface ProjectFile {
  name: string
  kind: FileKind
  url: string
  uploadedBy: string
  at: string
}
export const MOCK_PROJECT_FILES: Record<string, ProjectFile[]> = {
  "ปรับปรุงหลักสูตรวิทยาศาสตร์": [
    { name: "TOR_หลักสูตรX.pdf", kind: "proposal", url: "#", uploadedBy: "ดร.สมชาย ใจดี", at: "2026-01-12T09:10:00+07:00" },
    { name: "ใบเสนอราคา_labA.pdf", kind: "quote", url: "#", uploadedBy: "ดร.สมชาย ใจดี", at: "2026-01-15T10:00:00+07:00" },
  ],
  "ระบบบัญชีอัตโนมัติ": [
    { name: "แผนโครงการ_บัญชีอัตโนมัติ.pdf", kind: "proposal", url: "#", uploadedBy: "นางสาวมานี รักงาน", at: "2026-01-05T08:30:00+07:00" },
    { name: "รายงานปิดโครงการ.pdf", kind: "closure", url: "#", uploadedBy: "นางสาวมานี รักงาน", at: "2026-09-25T16:45:00+07:00" },
  ],
}

// โซ่อนุมัติระดับองค์กร (สำหรับแสดงใน Settings หรือ side panel)
export interface ApprovalChainItem { level: 1 | 2 | 3; role: string; name: string }
export const MOCK_APPROVAL_CHAIN: ApprovalChainItem[] = [
  { level: 1, role: "หัวหน้าแผนก",   name: "น.ส. ศิริยา แผนดี" },
  { level: 2, role: "ฝ่ายแผน",       name: "นาย ปกรณ์ วางแผน" },
  { level: 3, role: "ผู้อำนวยการ",  name: "ดร. สมชาย ใจดี" },
]

// KPI ของโครงการ (ใช้ใน Project Detail > KPI)
export interface KPIItem { name: string; target: number; actual: number; unit: string; progress: number } // progress = 0..100
export const MOCK_PROJECT_KPIS: Record<string, KPIItem[]> = {
  "ปรับปรุงหลักสูตรวิทยาศาสตร์": [
    { name: "อัตราการผ่านผลลัพธ์การเรียนรู้", target: 85, actual: 78, unit: "%", progress: 78 },
    { name: "จำนวนกิจกรรมการเรียนรู้เชิงรุก", target: 12, actual: 8, unit: "ครั้ง", progress: 66 },
  ],
  "โครงการพัฒนาบุคลากร": [
    { name: "ชั่วโมงอบรมเฉลี่ย/คน", target: 24, actual: 20, unit: "ชั่วโมง", progress: 83 },
  ],
}

// ความครอบคลุมตามยุทธศาสตร์/QA (ใช้ widget ใน Dashboard)
export interface StrategyCoverage { strategy: string; projects: number; budget: string }
export const MOCK_STRATEGY_COVERAGE: StrategyCoverage[] = [
  { strategy: "S1 Efficiency", projects: 48, budget: "฿18,400,000" },
  { strategy: "S2 Quality",    projects: 72, budget: "฿26,900,000" },
  { strategy: "S3 Innovation", projects: 39, budget: "฿22,100,000" },
]

export interface QACoverage { code: string; name: string; projects: number; gaps: boolean }
export const MOCK_QA_COVERAGE: QACoverage[] = [
  { code: "QA-2.1", name: "ผู้เรียนเป็นศูนย์กลาง", projects: 64, gaps: false },
  { code: "QA-3.2", name: "คุณภาพหลักสูตร",       projects: 31, gaps: true },
  { code: "QA-4.1", name: "พัฒนาครูและบุคลากร",   projects: 22, gaps: false },
]

// งานค้างส่วนตัวของผู้ใช้ (ใช้ใน My Project / Dashboard widget)
export interface TodoItem { id: string; title: string; project?: string; due?: string; priority: Priority; done: boolean }
export const MOCK_TODOS: TodoItem[] = [
  { id: "td-1", title: "อัปเดต KPI โครงการ ปรับปรุงหลักสูตร", project: "ปรับปรุงหลักสูตรวิทยาศาสตร์", due: "2026-02-12", priority: "high", done: false },
  { id: "td-2", title: "แนบใบเสนอราคา ระบบทะเบียนออนไลน์", project: "ระบบทะเบียนออนไลน์", priority: "medium", done: false },
  { id: "td-3", title: "ตรวจไฟล์สรุปผล กิจกรรมพัฒนานักเรียน", project: "กิจกรรมพัฒนานักเรียน", priority: "low", done: true },
]

export type Role = "user" | "admin" | "planning" | "director" | "head";

export interface DemoUser {
  label: string;
  username: string;
  password: string;
  role: Role;
}

export const DEMO_USERS: DemoUser[] = [
  { label: "User (demo)", username: "demo",     password: "1234", role: "user" },
  { label: "Head (head)", username: "head",     password: "1234", role: "head" },
  { label: "Planning",    username: "plan",     password: "1234", role: "planning" },
  { label: "Director",    username: "director", password: "1234", role: "director" },
];

// username -> password
export const DEMO_PASSWORD_MAP: Record<string, string> =
  Object.fromEntries(DEMO_USERS.map(u => [u.username, u.password]));

// username -> role
export const ROLE_MAP: Record<string, Role> =
  Object.fromEntries(DEMO_USERS.map(u => [u.username, u.role]));

// helper สำหรับหน้า login
export function isValidMockLogin(username: string, password: string): boolean {
  return !!username && !!password && DEMO_PASSWORD_MAP[username] === password;
}
export function getRoleByUsername(username: string): Role {
  return ROLE_MAP[username] ?? "user";
}/* =================================
 * MOCK DATA : ตัวอย่างชัดเจน 2563–2568
 * ================================= */

export const YEARS = ["2563", "2564", "2565", "2566", "2567", "2568"]

/* -------------------------------
 * 1. เงินที่ใช้ในโครงการ (รวม)
 * ------------------------------- */
export const MOCK_BUDGET_BY_YEAR = [
  { year: "2563", budget: 150, actual: 135 }, // ใช้ต่ำกว่างบ
  { year: "2564", budget: 170, actual: 160 },
  { year: "2565", budget: 190, actual: 185 },
  { year: "2566", budget: 210, actual: 220 }, // เริ่มเกินงบ
  { year: "2567", budget: 230, actual: 245 },
  { year: "2568", budget: 250, actual: 275 }, // เกินงบชัด
]

/* ------------------------------------------------
 * 2. เงินที่ใช้ในโครงการต่อหน่วยงาน (ต่อปี)
 * ------------------------------------------------ */
export const MOCK_BUDGET_BY_DEPT_YEAR = [
  // ===== 2563 =====
  { year: "2563", department: "IT",           budget: 60,  actual: 55 },
  { year: "2563", department: "HR",           budget: 40,  actual: 38 },
  { year: "2563", department: "Finance",      budget: 50,  actual: 42 },
  { year: "2563", department: "Procurement",  budget: 30,  actual: 28 },
  { year: "2563", department: "Operations",   budget: 45,  actual: 43 },
  { year: "2563", department: "Marketing",    budget: 35,  actual: 32 },

  // ===== 2564 =====
  { year: "2564", department: "IT",           budget: 70,  actual: 68 },
  { year: "2564", department: "HR",           budget: 45,  actual: 44 },
  { year: "2564", department: "Finance",      budget: 55,  actual: 48 },
  { year: "2564", department: "Procurement",  budget: 35,  actual: 34 },
  { year: "2564", department: "Operations",   budget: 50,  actual: 48 },
  { year: "2564", department: "Marketing",    budget: 40,  actual: 38 },

  // ===== 2565 =====
  { year: "2565", department: "IT",           budget: 80,  actual: 82 },
  { year: "2565", department: "HR",           budget: 50,  actual: 48 },
  { year: "2565", department: "Finance",      budget: 60,  actual: 55 },
  { year: "2565", department: "Procurement",  budget: 40,  actual: 38 },
  { year: "2565", department: "Operations",   budget: 55,  actual: 57 },
  { year: "2565", department: "Marketing",    budget: 45,  actual: 44 },

  // ===== 2566 =====
  { year: "2566", department: "IT",           budget: 90,  actual: 98 },
  { year: "2566", department: "HR",           budget: 55,  actual: 54 },
  { year: "2566", department: "Finance",      budget: 65,  actual: 68 },
  { year: "2566", department: "Procurement",  budget: 45,  actual: 46 },
  { year: "2566", department: "Operations",   budget: 60,  actual: 63 },
  { year: "2566", department: "Marketing",    budget: 50,  actual: 52 },

  // ===== 2567 =====
  { year: "2567", department: "IT",           budget: 100, actual: 112 },
  { year: "2567", department: "HR",           budget: 60,  actual: 58 },
  { year: "2567", department: "Finance",      budget: 70,  actual: 75 },
  { year: "2567", department: "Procurement",  budget: 50,  actual: 53 },
  { year: "2567", department: "Operations",   budget: 65,  actual: 70 },
  { year: "2567", department: "Marketing",    budget: 55,  actual: 60 },

  // ===== 2568 =====
  { year: "2568", department: "IT",           budget: 110, actual: 130 },
  { year: "2568", department: "HR",           budget: 65,  actual: 62 },
  { year: "2568", department: "Finance",      budget: 75,  actual: 83 },
  { year: "2568", department: "Procurement",  budget: 55,  actual: 58 },
  { year: "2568", department: "Operations",   budget: 70,  actual: 78 },
  { year: "2568", department: "Marketing",    budget: 60,  actual: 68 },
]

/* ------------------------------------------------
 * 3. เงินที่ใช้ในโครงการตามสถานะ (ต่อปี)
 * ------------------------------------------------ */
export const MOCK_BUDGET_BY_STATUS_YEAR = [
  // ===== 2563 =====
  { year: "2563", status: "อนุมัติ",    budget: 110 },
  { year: "2563", status: "รออนุมัติ",  budget: 30 },
  { year: "2563", status: "ไม่อนุมัติ", budget: 10 },
  { year: "2563", status: "ปิดโครงการ", budget: 45 },

  // ===== 2564 =====
  { year: "2564", status: "อนุมัติ",    budget: 130 },
  { year: "2564", status: "รออนุมัติ",  budget: 35 },
  { year: "2564", status: "ไม่อนุมัติ", budget: 15 },
  { year: "2564", status: "ปิดโครงการ", budget: 60 },

  // ===== 2565 =====
  { year: "2565", status: "อนุมัติ",    budget: 150 },
  { year: "2565", status: "รออนุมัติ",  budget: 30 },
  { year: "2565", status: "ไม่อนุมัติ", budget: 10 },
  { year: "2565", status: "ปิดโครงการ", budget: 75 },

  // ===== 2566 =====
  { year: "2566", status: "อนุมัติ",    budget: 165 },
  { year: "2566", status: "รออนุมัติ",  budget: 35 },
  { year: "2566", status: "ไม่อนุมัติ", budget: 10 },
  { year: "2566", status: "ปิดโครงการ", budget: 95 },

  // ===== 2567 =====
  { year: "2567", status: "อนุมัติ",    budget: 180 },
  { year: "2567", status: "รออนุมัติ",  budget: 40 },
  { year: "2567", status: "ไม่อนุมัติ", budget: 10 },
  { year: "2567", status: "ปิดโครงการ", budget: 115 },

  // ===== 2568 =====
  { year: "2568", status: "อนุมัติ",    budget: 195 },
  { year: "2568", status: "รออนุมัติ",  budget: 45 },
  { year: "2568", status: "ไม่อนุมัติ", budget: 10 },
  { year: "2568", status: "ปิดโครงการ", budget: 135 },
]

/* --------------------------------
 * 4. จำนวนโครงการต่อหน่วยงาน (รวม)
 * -------------------------------- */
export const MOCK_PROJECT_COUNT_BY_DEPT_BY_YEAR = [
  // ===== 2563 =====
  { year: "2563", department: "IT",          count: 45 },
  { year: "2563", department: "HR",          count: 30 },
  { year: "2563", department: "Finance",     count: 40 },
  { year: "2563", department: "Procurement", count: 22 },
  { year: "2563", department: "Operations",  count: 35 },
  { year: "2563", department: "Marketing",   count: 28 },

  // ===== 2564 =====
  { year: "2564", department: "IT",          count: 55 },
  { year: "2564", department: "HR",          count: 32 },
  { year: "2564", department: "Finance",     count: 45 },
  { year: "2564", department: "Procurement", count: 25 },
  { year: "2564", department: "Operations",  count: 38 },
  { year: "2564", department: "Marketing",   count: 30 },

  // ===== 2565 =====
  { year: "2565", department: "IT",          count: 65 },
  { year: "2565", department: "HR",          count: 35 },
  { year: "2565", department: "Finance",     count: 50 },
  { year: "2565", department: "Procurement", count: 28 },
  { year: "2565", department: "Operations",  count: 42 },
  { year: "2565", department: "Marketing",   count: 33 },

  // ===== 2566 =====
  { year: "2566", department: "IT",          count: 75 },
  { year: "2566", department: "HR",          count: 38 },
  { year: "2566", department: "Finance",     count: 55 },
  { year: "2566", department: "Procurement", count: 32 },
  { year: "2566", department: "Operations",  count: 48 },
  { year: "2566", department: "Marketing",   count: 37 },

  // ===== 2567 =====
  { year: "2567", department: "IT",          count: 85 },
  { year: "2567", department: "HR",          count: 40 },
  { year: "2567", department: "Finance",     count: 60 },
  { year: "2567", department: "Procurement", count: 36 },
  { year: "2567", department: "Operations",  count: 52 },
  { year: "2567", department: "Marketing",   count: 40 },

  // ===== 2568 =====
  { year: "2568", department: "IT",          count: 95 },
  { year: "2568", department: "HR",          count: 45 },
  { year: "2568", department: "Finance",     count: 70 },
  { year: "2568", department: "Procurement", count: 40 },
  { year: "2568", department: "Operations",  count: 58 },
  { year: "2568", department: "Marketing",   count: 45 },
]


/* --------------------------------
 * 5. จำนวนโครงการตามสถานะ (ต่อปี)
 * -------------------------------- */
export const MOCK_PROJECT_COUNT_BY_STATUS_BY_YEAR = [
  { year: "2563", status: "อนุมัติ", value: 120 },
  { year: "2563", status: "รออนุมัติ", value: 25 },
  { year: "2563", status: "ไม่อนุมัติ", value: 10 },

  { year: "2564", status: "อนุมัติ", value: 135 },
  { year: "2564", status: "รออนุมัติ", value: 30 },
  { year: "2564", status: "ไม่อนุมัติ", value: 12 },

  { year: "2565", status: "อนุมัติ", value: 150 },
  { year: "2565", status: "รออนุมัติ", value: 28 },
  { year: "2565", status: "ไม่อนุมัติ", value: 12 },

  { year: "2566", status: "อนุมัติ", value: 165 },
  { year: "2566", status: "รออนุมัติ", value: 30 },
  { year: "2566", status: "ไม่อนุมัติ", value: 15 },

  { year: "2567", status: "อนุมัติ", value: 175 },
  { year: "2567", status: "รออนุมัติ", value: 35 },
  { year: "2567", status: "ไม่อนุมัติ", value: 18 },

  { year: "2568", status: "อนุมัติ", value: 185 },
  { year: "2568", status: "รออนุมัติ", value: 40 },
  { year: "2568", status: "ไม่อนุมัติ", value: 20 },
]

export const MOCK_ALLTIME_BUDGET = [
  { year: "2549", total: 40 },
  { year: "2550", total: 85 },
  { year: "2551", total: 135 },
  { year: "2552", total: 190 },
  { year: "2553", total: 250 },
  { year: "2554", total: 320 },
  { year: "2555", total: 395 },
  { year: "2556", total: 475 },
  { year: "2557", total: 560 },
  { year: "2558", total: 650 },

  { year: "2559", total: 745 },
  { year: "2560", total: 845 },
  { year: "2561", total: 950 },
  { year: "2562", total: 1090 },

  { year: "2563", total: 1225 },
  { year: "2564", total: 1385 },
  { year: "2565", total: 1570 },
  { year: "2566", total: 1790 },
  { year: "2567", total: 2035 },
  { year: "2568", total: 2310 },
]

export const MOCK_ALLTIME_STATUS = [
  {
    status: "อนุมัติ",
    value:
      120 + 135 + 150 + 165 + 175 + 185, // = 930
  },
  {
    status: "รออนุมัติ",
    value:
      25 + 30 + 28 + 30 + 35 + 40, // = 188
  },
  {
    status: "ไม่อนุมัติ",
    value:
      10 + 12 + 12 + 15 + 18 + 20, // = 87
  },
]

export const MOCK_ALLTIME_PROJECT_COUNT_BY_DEPT = [
  { department: "IT",          count: 420 },
  { department: "HR",          count: 220 },
  { department: "Finance",     count: 320 },
  { department: "Procurement", count: 183 },
  { department: "Operations",  count: 270 },
  { department: "Marketing",   count: 213 },
]

export const MOCK_ALLTIME_BUDGET_BY_DEPT = [
  { department: "IT",          amount: 565 },
  { department: "HR",          amount: 304 },
  { department: "Finance",     amount: 371 },
  { department: "Procurement", amount: 257 },
  { department: "Operations",  amount: 359 },
  { department: "Marketing",   amount: 294 },
]

export const MOCK_ALLTIME_BUDGET_BY_STATUS = [
  {
    status: "อนุมัติ",
    amount: 930,   // งบที่ผ่านและใช้จริง
  },
  {
    status: "รออนุมัติ",
    amount: 188,   // งบที่ยังค้าง
  },
  {
    status: "ไม่อนุมัติ",
    amount: 87,    // งบที่ไม่ผ่าน
  },
  {
    status: "ปิดโครงการ",
    amount: 615,   // โครงการที่ปิดแล้ว (subset ของ approved)
  },
]

export const MOCK_YEAR_KPI: Record<
  string,
  {
    totalBudget: number
    totalProjects: number
    avgBudget: number
    totalEmployees: number
    totalDepartments: number
  }
> = {
  "all" : {
    totalBudget: 1000,
    totalProjects: 1500,
    avgBudget: 0.80,
    totalEmployees: 2300,
    totalDepartments: 30,
  },
  "2563": {
    totalBudget: 150,
    totalProjects: 180,
    avgBudget: 0.83,
    totalEmployees: 2300,
    totalDepartments: 30,
  },
  "2564": {
    totalBudget: 170,
    totalProjects: 210,
    avgBudget: 0.81,
     totalEmployees: 2300,
    totalDepartments: 30,
  },
  "2565": {
    totalBudget: 190,
    totalProjects: 245,
    avgBudget: 0.78,
    totalEmployees: 2300,
    totalDepartments: 30,
  },
  "2566": {
    totalBudget: 210,
    totalProjects: 270,
    avgBudget: 0.78,
    totalEmployees: 2300,
    totalDepartments: 30,
  },
  "2567": {
    totalBudget: 230,
    totalProjects: 295,
    avgBudget: 0.78,
     totalEmployees: 2300,
    totalDepartments: 30,
  },
  "2568": {
    totalBudget: 245.4,
    totalProjects: 320,
    avgBudget: 0.76,
    totalEmployees: 2300,
    totalDepartments: 30,
  },
}