"use client";

import React, { useEffect, useMemo, useState } from "react";

/**
 * eBudget Profile Page (No shadcn/ui)
 * - Tailwind only
 * - White background, blue theme
 * - Long, fancy UI: hero, stats, tabs, tables, timeline, modals, toggles
 */

type Role = "Employee" | "BudgetOwner" | "Approver" | "Admin";
type ApprovalLevel = "L1" | "L2" | "L3" | "Director" | "CFO";
type Risk = "Low" | "Medium" | "High";

type Me = {
  id: string;
  displayName: string;
  employeeCode: string;
  email: string;
  phone?: string;
  avatarUrl?: string;

  department: string;
  division: string;
  position: string;
  workLocation: string;

  roles: Role[];
  approvalLevel: ApprovalLevel;
  signatureStatus: "Verified" | "Pending" | "Missing";
  risk: Risk;

  stats: {
    myProjects: number;
    pendingApprovals: number;
    submittedThisMonth: number;
    totalBudgetYTD: number; // THB
    approvalSlaScore: number; // 0-100
  };

  budgetPolicy: {
    canCreateProject: boolean;
    maxProjectBudgetTHB: number;
    monthlyCapTHB: number;
    costCenter: string;
    fundingSources: string[];
  };

  security: {
    mfaEnabled: boolean;
    lastPasswordChangedAt: string;
    lastLoginAt: string;
    sessions: Array<{
      id: string;
      device: string;
      ip: string;
      location: string;
      lastSeenAt: string;
      trusted: boolean;
    }>;
    connectedApps: Array<{
      name: string;
      scope: string[];
      linkedAt: string;
      status: "Active" | "Expired";
    }>;
  };

  preferences: {
    darkMode: boolean;
    emailNoti: boolean;
    pushNoti: boolean;
    weeklyDigest: boolean;
    language: "th" | "en";
    timezone: string;
  };

  activity: Array<{
    id: string;
    type:
      | "SUBMIT_PROJECT"
      | "APPROVE"
      | "REJECT"
      | "COMMENT"
      | "UPLOAD_DOC"
      | "EXPORT_REPORT"
      | "LOGIN";
    title: string;
    detail?: string;
    createdAt: string;
    severity?: "info" | "success" | "warn" | "danger";
  }>;

  approvals: Array<{
    id: string;
    projectName: string;
    requester: string;
    amountTHB: number;
    status: "Pending" | "Approved" | "Rejected" | "Returned";
    dueAt: string;
    updatedAt: string;
  }>;

  projects: Array<{
    id: string;
    name: string;
    status: "Draft" | "InReview" | "Approved" | "Rejected" | "Closed";
    budgetTHB: number;
    updatedAt: string;
    progress: number; // 0-100
  }>;
};

function demoMe(): Me {
  return {
    id: "u_01HRX",
    displayName: "Saran Wongkum",
    employeeCode: "EMP-20419",
    email: "Saran@company.co.th",
    phone: "064-xxx-xxxx",
    avatarUrl: "",

    department: "Finance Systems",
    division: "Corporate IT",
    position: "Full-Stack Developer",
    workLocation: "Bangkok HQ",

    roles: ["Employee", "BudgetOwner", "Approver"],
    approvalLevel: "L2",
    signatureStatus: "Verified",
    risk: "Low",

    stats: {
      myProjects: 12,
      pendingApprovals: 5,
      submittedThisMonth: 9,
      totalBudgetYTD: 2_485_000,
      approvalSlaScore: 92,
    },

    budgetPolicy: {
      canCreateProject: true,
      maxProjectBudgetTHB: 1_200_000,
      monthlyCapTHB: 450_000,
      costCenter: "CC-IT-OPS-01",
      fundingSources: ["School", "Revenue", "External", "External Agency"],
    },

    security: {
      mfaEnabled: true,
      lastPasswordChangedAt: "2025-12-21T09:20:00.000Z",
      lastLoginAt: "2026-02-15T04:10:00.000Z",
      sessions: [
        {
          id: "s_01",
          device: "Windows • Chrome",
          ip: "10.0.0.42",
          location: "Bangkok, TH",
          lastSeenAt: "2026-02-15T04:11:00.000Z",
          trusted: true,
        },
        {
          id: "s_02",
          device: "iPhone • Safari",
          ip: "1.2.3.4",
          location: "Nonthaburi, TH",
          lastSeenAt: "2026-02-12T18:02:00.000Z",
          trusted: false,
        },
      ],
      connectedApps: [
        {
          name: "Google Workspace",
          scope: ["profile", "email", "drive.readonly"],
          linkedAt: "2025-10-02T02:00:00.000Z",
          status: "Active",
        },
        {
          name: "Slack",
          scope: ["channels:read", "users:read"],
          linkedAt: "2025-06-01T02:00:00.000Z",
          status: "Active",
        },
        {
          name: "Legacy SSO",
          scope: ["openid", "employee_id"],
          linkedAt: "2024-11-01T02:00:00.000Z",
          status: "Expired",
        },
      ],
    },

    preferences: {
      darkMode: false,
      emailNoti: true,
      pushNoti: true,
      weeklyDigest: true,
      language: "th",
      timezone: "Asia/Bangkok",
    },

    activity: [
      {
        id: "a_01",
        type: "APPROVE",
        title: "Approved: Network Upgrade FY26",
        detail: "Approved as L2 within SLA",
        createdAt: "2026-02-14T11:22:00.000Z",
        severity: "success",
      },
      {
        id: "a_02",
        type: "UPLOAD_DOC",
        title: "Uploaded: TOR_v3.pdf",
        detail: "Project: Smart Classroom",
        createdAt: "2026-02-13T08:05:00.000Z",
        severity: "info",
      },
      {
        id: "a_03",
        type: "EXPORT_REPORT",
        title: "Exported: Budget Summary (YTD)",
        createdAt: "2026-02-12T02:40:00.000Z",
        severity: "info",
      },
      {
        id: "a_04",
        type: "LOGIN",
        title: "New login detected",
        detail: "iPhone • Safari",
        createdAt: "2026-02-12T01:58:00.000Z",
        severity: "warn",
      },
    ],

    approvals: [
      {
        id: "ap_01",
        projectName: "Smart Classroom Phase 2",
        requester: "N. Srisuk",
        amountTHB: 380_000,
        status: "Pending",
        dueAt: "2026-02-18T09:00:00.000Z",
        updatedAt: "2026-02-14T10:10:00.000Z",
      },
      {
        id: "ap_02",
        projectName: "Data Center Maintenance",
        requester: "P. Anan",
        amountTHB: 220_000,
        status: "Returned",
        dueAt: "2026-02-16T09:00:00.000Z",
        updatedAt: "2026-02-14T08:35:00.000Z",
      },
      {
        id: "ap_03",
        projectName: "Campus Wi-Fi Expansion",
        requester: "K. Wipada",
        amountTHB: 610_000,
        status: "Pending",
        dueAt: "2026-02-20T09:00:00.000Z",
        updatedAt: "2026-02-13T15:21:00.000Z",
      },
    ],

    projects: [
      {
        id: "p_01",
        name: "Smart Classroom Phase 2",
        status: "InReview",
        budgetTHB: 980_000,
        updatedAt: "2026-02-14T12:01:00.000Z",
        progress: 63,
      },
      {
        id: "p_02",
        name: "Network Upgrade FY26",
        status: "Approved",
        budgetTHB: 1_250_000,
        updatedAt: "2026-02-14T11:22:00.000Z",
        progress: 80,
      },
      {
        id: "p_03",
        name: "Digital Archive",
        status: "Draft",
        budgetTHB: 255_000,
        updatedAt: "2026-02-10T07:10:00.000Z",
        progress: 22,
      },
    ],
  };
}


const cx = (...xs: Array<string | false | undefined | null>) => xs.filter(Boolean).join(" ");

function formatTHB(n: number) {
  return new Intl.NumberFormat("th-TH", {
    style: "currency",
    currency: "THB",
    maximumFractionDigits: 0,
  }).format(n);
}
function formatDT(iso: string) {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleString("th-TH", { dateStyle: "medium", timeStyle: "short" });
}
function initials(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  const a = parts[0]?.[0] ?? "U";
  const b = parts[1]?.[0] ?? "";
  return (a + b).toUpperCase();
}

function Icon({
  name,
  className,
}: {
  name:
    | "sparkle"
    | "edit"
    | "mail"
    | "phone"
    | "building"
    | "pin"
    | "shield"
    | "wallet"
    | "clock"
    | "check"
    | "warn"
    | "x"
    | "download"
    | "arrow"
    | "user"
    | "key"
    | "finger"
    | "link"
    | "bell"
    | "laptop";
  className?: string;
}) {
  const c = className ?? "h-5 w-5";
  const common = { className: c, fill: "none", stroke: "currentColor", strokeWidth: 2, strokeLinecap: "round" as const, strokeLinejoin: "round" as const };
  switch (name) {
    case "sparkle":
      return (
        <svg {...common} viewBox="0 0 24 24">
          <path d="M12 2l1.3 4.6L18 8l-4.7 1.4L12 14l-1.3-4.6L6 8l4.7-1.4L12 2z" />
          <path d="M19 14l.8 2.6L22 17l-2.2.7L19 20l-.8-2.3L16 17l2.2-.4L19 14z" />
          <path d="M5 14l.8 2.6L8 17l-2.2.7L5 20l-.8-2.3L2 17l2.2-.4L5 14z" />
        </svg>
      );
    case "edit":
      return (
        <svg {...common} viewBox="0 0 24 24">
          <path d="M12 20h9" />
          <path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L8 18l-4 1 1-4 11.5-11.5z" />
        </svg>
      );
    case "mail":
      return (
        <svg {...common} viewBox="0 0 24 24">
          <path d="M4 4h16v16H4z" />
          <path d="M22 6l-10 7L2 6" />
        </svg>
      );
    case "phone":
      return (
        <svg {...common} viewBox="0 0 24 24">
          <path d="M22 16.9v3a2 2 0 0 1-2.2 2A19.8 19.8 0 0 1 3 5.2 2 2 0 0 1 5 3h3a2 2 0 0 1 2 1.7c.1.9.3 1.8.6 2.7a2 2 0 0 1-.5 2.1L9.6 10.6a16 16 0 0 0 3.8 3.8l1.1-1.1a2 2 0 0 1 2.1-.5c.9.3 1.8.5 2.7.6A2 2 0 0 1 22 16.9z" />
        </svg>
      );
    case "building":
      return (
        <svg {...common} viewBox="0 0 24 24">
          <path d="M3 21V7l9-4 9 4v14" />
          <path d="M9 21v-8h6v8" />
          <path d="M6 10h.01M6 13h.01M6 16h.01M18 10h.01M18 13h.01M18 16h.01" />
        </svg>
      );
    case "pin":
      return (
        <svg {...common} viewBox="0 0 24 24">
          <path d="M12 21s7-4.4 7-11a7 7 0 0 0-14 0c0 6.6 7 11 7 11z" />
          <path d="M12 10a2 2 0 1 0 0 .01" />
        </svg>
      );
    case "shield":
      return (
        <svg {...common} viewBox="0 0 24 24">
          <path d="M12 2l8 4v6c0 5-3.4 9.7-8 10-4.6-.3-8-5-8-10V6l8-4z" />
          <path d="M9 12l2 2 4-4" />
        </svg>
      );
    case "wallet":
      return (
        <svg {...common} viewBox="0 0 24 24">
          <path d="M3 7h18v14H3z" />
          <path d="M3 7l14-4h4v4" />
          <path d="M17 13h4v4h-4z" />
        </svg>
      );
    case "clock":
      return (
        <svg {...common} viewBox="0 0 24 24">
          <path d="M12 22a10 10 0 1 0-10-10 10 10 0 0 0 10 10z" />
          <path d="M12 6v6l4 2" />
        </svg>
      );
    case "check":
      return (
        <svg {...common} viewBox="0 0 24 24">
          <path d="M20 6L9 17l-5-5" />
        </svg>
      );
    case "warn":
      return (
        <svg {...common} viewBox="0 0 24 24">
          <path d="M10.3 3.7L1.8 18a2 2 0 0 0 1.7 3h17a2 2 0 0 0 1.7-3L13.7 3.7a2 2 0 0 0-3.4 0z" />
          <path d="M12 9v4" />
          <path d="M12 17h.01" />
        </svg>
      );
    case "x":
      return (
        <svg {...common} viewBox="0 0 24 24">
          <path d="M18 6L6 18" />
          <path d="M6 6l12 12" />
        </svg>
      );
    case "download":
      return (
        <svg {...common} viewBox="0 0 24 24">
          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
          <path d="M7 10l5 5 5-5" />
          <path d="M12 15V3" />
        </svg>
      );
    case "arrow":
      return (
        <svg {...common} viewBox="0 0 24 24">
          <path d="M7 17L17 7" />
          <path d="M10 7h7v7" />
        </svg>
      );
    case "user":
      return (
        <svg {...common} viewBox="0 0 24 24">
          <path d="M20 21a8 8 0 0 0-16 0" />
          <path d="M12 13a4 4 0 1 0-4-4 4 4 0 0 0 4 4z" />
        </svg>
      );
    case "key":
      return (
        <svg {...common} viewBox="0 0 24 24">
          <path d="M21 2l-2 2m-2 2l-2 2" />
          <path d="M7 12a5 5 0 1 1 3.5 4.8L7 20H3v-4l4-4z" />
        </svg>
      );
    case "finger":
      return (
        <svg {...common} viewBox="0 0 24 24">
          <path d="M12 11V5a2 2 0 0 1 4 0v6" />
          <path d="M12 11V6a2 2 0 1 0-4 0v9" />
          <path d="M8 15l-1-1a2 2 0 1 0-3 3l3 3a6 6 0 0 0 10-4v-2" />
        </svg>
      );
    case "link":
      return (
        <svg {...common} viewBox="0 0 24 24">
          <path d="M10 13a5 5 0 0 0 7.1 0l1.4-1.4a5 5 0 0 0-7.1-7.1L10 5" />
          <path d="M14 11a5 5 0 0 0-7.1 0L5.5 12.4a5 5 0 1 0 7.1 7.1L14 19" />
        </svg>
      );
    case "bell":
      return (
        <svg {...common} viewBox="0 0 24 24">
          <path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 7h18s-3 0-3-7" />
          <path d="M13.7 21a2 2 0 0 1-3.4 0" />
        </svg>
      );
    case "laptop":
      return (
        <svg {...common} viewBox="0 0 24 24">
          <path d="M4 5h16v11H4z" />
          <path d="M2 18h20" />
        </svg>
      );
    default:
      return null;
  }
}

function Badge({ children, variant = "soft" }: { children: React.ReactNode; variant?: "soft" | "solid" | "warn" | "danger" | "outline" }) {
  const base = "inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-semibold";
  const style =
    variant === "solid"
      ? "bg-sky-600 text-white"
      : variant === "warn"
      ? "bg-amber-600 text-white"
      : variant === "danger"
      ? "bg-rose-600 text-white"
      : variant === "outline"
      ? "border border-sky-200 text-slate-700 bg-white"
      : "bg-sky-50 text-sky-800";
  return <span className={cx(base, style)}>{children}</span>;
}

function Card({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={cx("rounded-3xl border border-slate-200 bg-white shadow-[0_1px_0_rgba(2,6,23,0.04)]", className)}>
      {children}
    </div>
  );
}
function CardHeader({ title, desc, icon }: { title: string; desc?: string; icon?: React.ReactNode }) {
  return (
    <div className="flex items-start justify-between gap-4 border-b border-slate-100 px-6 py-5">
      <div className="space-y-1">
        <div className="flex items-center gap-2">
          {icon ? <div className="text-sky-700">{icon}</div> : null}
          <h2 className="text-base font-bold tracking-tight text-slate-900 md:text-lg">{title}</h2>
        </div>
        {desc ? <p className="text-sm text-slate-600">{desc}</p> : null}
      </div>
      <div className="hidden md:block"></div>
    </div>
  );
}
function CardBody({ children, className }: { children: React.ReactNode; className?: string }) {
  return <div className={cx("px-6 py-5", className)}>{children}</div>;
}

function Button({
  children,
  variant = "solid",
  size = "md",
  className,
  onClick,
  type = "button",
}: {
  children: React.ReactNode;
  variant?: "solid" | "outline" | "ghost";
  size?: "sm" | "md" | "lg";
  className?: string;
  onClick?: () => void;
  type?: "button" | "submit";
}) {
  const base =
    "inline-flex items-center justify-center gap-2 rounded-2xl font-semibold transition active:translate-y-[1px] disabled:opacity-60 disabled:cursor-not-allowed";
  const sizes =
    size === "sm" ? "h-9 px-3 text-sm" : size === "lg" ? "h-12 px-5 text-base" : "h-10 px-4 text-sm";
  const style =
    variant === "solid"
      ? "bg-sky-600 text-white hover:bg-sky-700 shadow-[0_10px_30px_rgba(2,132,199,0.18)]"
      : variant === "outline"
      ? "border border-sky-200 bg-white text-slate-900 hover:bg-sky-50"
      : "bg-transparent text-slate-700 hover:bg-sky-50";
  return (
    <button type={type} onClick={onClick} className={cx(base, sizes, style, className)}>
      {children}
    </button>
  );
}

function ProgressBar({ value }: { value: number }) {
  const v = Math.max(0, Math.min(100, value));
  return (
    <div className="h-2 w-full rounded-full bg-slate-100">
      <div
        className="h-2 rounded-full bg-gradient-to-r from-sky-600 to-blue-600"
        style={{ width: `${v}%` }}
      />
    </div>
  );
}

function Divider() {
  return <div className="h-px w-full bg-slate-100" />;
}

function Toggle({
  checked,
  onChange,
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <button
      type="button"
      onClick={() => onChange(!checked)}
      className={cx(
        "relative h-7 w-12 rounded-full border transition",
        checked ? "border-sky-600 bg-sky-600" : "border-slate-200 bg-slate-100"
      )}
      aria-pressed={checked}
    >
      <span
        className={cx(
          "absolute top-0.5 h-6 w-6 rounded-full bg-white shadow transition",
          checked ? "left-5" : "left-0.5"
        )}
      />
    </button>
  );
}

function Modal({
  open,
  onClose,
  title,
  subtitle,
  children,
  footer,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
}) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50">
      <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={onClose} />
      <div className="absolute inset-0 flex items-center justify-center p-4">
        <div className="w-full max-w-2xl overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-xl">
          <div className="flex items-start justify-between gap-4 border-b border-slate-100 px-6 py-5">
            <div className="space-y-1">
              <p className="text-lg font-bold text-slate-900">{title}</p>
              {subtitle ? <p className="text-sm text-slate-600">{subtitle}</p> : null}
            </div>
            <button
              onClick={onClose}
              className="rounded-xl p-2 text-slate-600 hover:bg-slate-100"
              aria-label="Close"
            >
              <Icon name="x" className="h-5 w-5" />
            </button>
          </div>

          <div className="px-6 py-5">{children}</div>

          {footer ? <div className="border-t border-slate-100 px-6 py-4">{footer}</div> : null}
        </div>
      </div>
    </div>
  );
}

type TabKey = "overview" | "approvals" | "projects" | "security" | "prefs";

export default function ProfilePage() {
  const [loading, setLoading] = useState(true);
  const [me, setMe] = useState<Me | null>(null);
  const [tab, setTab] = useState<TabKey>("overview");

  const [editOpen, setEditOpen] = useState(false);
  const [form, setForm] = useState({
    displayName: "",
    phone: "",
    department: "",
    position: "",
    bio: "",
  });

  // mock fetch
  useEffect(() => {
    const t = setTimeout(() => {
      const data = demoMe();
      setMe(data);
      setForm({
        displayName: data.displayName,
        phone: data.phone ?? "",
        department: data.department,
        position: data.position,
        bio: "รับผิดชอบระบบ eBudget: API, workflow approvals, export/report และการออกแบบ schema.",
      });
      setLoading(false);
    }, 380);
    return () => clearTimeout(t);
  }, []);

  const riskChip = useMemo(() => {
    if (!me) return null;
    if (me.risk === "Low") return <Badge>Risk: Low</Badge>;
    if (me.risk === "Medium") return <Badge variant="warn">Risk: Medium</Badge>;
    return <Badge variant="danger">Risk: High</Badge>;
  }, [me]);

  const signatureChip = useMemo(() => {
    if (!me) return null;
    if (me.signatureStatus === "Verified")
      return (
        <Badge variant="solid">
          <Icon name="check" className="h-4 w-4" />
          Signature Verified
        </Badge>
      );
    if (me.signatureStatus === "Pending")
      return (
        <Badge variant="warn">
          <Icon name="clock" className="h-4 w-4" />
          Signature Pending
        </Badge>
      );
    return (
      <Badge variant="danger">
        <Icon name="warn" className="h-4 w-4" />
        Signature Missing
      </Badge>
    );
  }, [me]);

  return (
    <div className="min-h-screen bg-white text-slate-900">
      {/* top glow */}
      <div className="pointer-events-none fixed inset-x-0 top-0 h-56 bg-gradient-to-b from-sky-100/70 via-blue-50/40 to-transparent" />
      <div className="pointer-events-none fixed inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-sky-300/70 to-transparent" />

      <div className="mx-auto w-full max-w-7xl px-4 pb-16 pt-8 md:px-6">
        {/* HERO */}
        <Card className="relative overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(1100px_circle_at_20%_0%,rgba(14,165,233,0.16),transparent_46%),radial-gradient(900px_circle_at_85%_18%,rgba(59,130,246,0.12),transparent_40%)]" />
          <div className="absolute -right-10 -top-10 h-56 w-56 rounded-full bg-sky-200/30 blur-3xl" />
          <div className="absolute bottom-0 left-10 h-40 w-72 rounded-full bg-blue-200/20 blur-3xl" />

          <div className="relative px-6 py-7 md:px-8 md:py-9">
            <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
              {/* left */}
              <div className="flex items-center gap-4">
                <div className="relative">
                  <div className="h-16 w-16 overflow-hidden rounded-full border border-sky-200 bg-white shadow-sm">
                    {me?.avatarUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={me.avatarUrl} alt="avatar" className="h-full w-full object-cover" />
                    ) : (
                      <div className="grid h-full w-full place-items-center bg-sky-50 text-sky-800">
                        <span className="text-lg font-extrabold">{initials(me?.displayName ?? "User")}</span>
                      </div>
                    )}
                  </div>
                  <button
                    className="absolute -bottom-1 -right-1 grid h-9 w-9 place-items-center rounded-full border border-sky-200 bg-white shadow-sm hover:bg-sky-50"
                    title="Change avatar"
                  >
                    <Icon name="sparkle" className="h-4 w-4 text-sky-700" />
                  </button>
                </div>

                <div className="space-y-2">
                  {loading ? (
                    <div className="space-y-2">
                      <div className="h-5 w-56 animate-pulse rounded bg-slate-100" />
                      <div className="h-4 w-72 animate-pulse rounded bg-slate-100" />
                    </div>
                  ) : (
                    <>
                      <div className="flex flex-wrap items-center gap-2">
                        <h1 className="text-xl font-extrabold tracking-tight md:text-2xl">
                          {me?.displayName}
                        </h1>
                        <Badge variant="outline">{me?.employeeCode}</Badge>
                        {signatureChip}
                        {riskChip}
                      </div>

                      <div className="flex flex-wrap items-center gap-2 text-sm text-slate-600">
                        <span className="inline-flex items-center gap-2">
                          <span className="text-sky-700">
                            <Icon name="building" className="h-4 w-4" />
                          </span>
                          {me?.division} • {me?.department}
                        </span>
                        <span className="text-slate-300">•</span>
                        <span className="inline-flex items-center gap-2">
                          <span className="text-sky-700">
                            <Icon name="user" className="h-4 w-4" />
                          </span>
                          {me?.position}
                        </span>
                        <span className="text-slate-300">•</span>
                        <span className="inline-flex items-center gap-2">
                          <span className="text-sky-700">
                            <Icon name="pin" className="h-4 w-4" />
                          </span>
                          {me?.workLocation}
                        </span>
                      </div>

                      <div className="flex flex-wrap items-center gap-4 text-sm">
                        <span className="inline-flex items-center gap-2 text-slate-700">
                          <span className="text-sky-700">
                            <Icon name="mail" className="h-4 w-4" />
                          </span>
                          {me?.email}
                        </span>

                        {me?.phone ? (
                          <span className="inline-flex items-center gap-2 text-slate-700">
                            <span className="text-sky-700">
                              <Icon name="phone" className="h-4 w-4" />
                            </span>
                            {me.phone}
                          </span>
                        ) : null}
                      </div>
                    </>
                  )}
                </div>
              </div>

              {/* right actions */}
              <div className="flex flex-wrap gap-2">
                <Button onClick={() => setEditOpen(true)}>
                  <Icon name="edit" className="h-4 w-4" />
                  Edit profile
                </Button>
                <Button variant="outline">
                  <Icon name="bell" className="h-4 w-4 text-sky-700" />
                  Notifications
                </Button>
                <Button variant="outline">
                  <Icon name="download" className="h-4 w-4 text-sky-700" />
                  Export (PDF)
                </Button>
              </div>
            </div>

            {/* stats ribbon */}
            <div className="mt-7 grid gap-3 md:grid-cols-5">
              <Stat
                loading={loading}
                label="My projects"
                value={me?.stats.myProjects ?? 0}
                hint="Projects you own / co-own"
                icon={<Icon name="user" className="h-5 w-5" />}
              />
              <Stat
                loading={loading}
                label="Pending approvals"
                value={me?.stats.pendingApprovals ?? 0}
                hint="Needs your action"
                icon={<Icon name="shield" className="h-5 w-5" />}
                accent="indigo"
              />
              <Stat
                loading={loading}
                label="Submitted (month)"
                value={me?.stats.submittedThisMonth ?? 0}
                hint="This month submissions"
                icon={<Icon name="clock" className="h-5 w-5" />}
              />
              <Stat
                loading={loading}
                label="Budget YTD"
                value={formatTHB(me?.stats.totalBudgetYTD ?? 0)}
                hint="Total budgets in year"
                icon={<Icon name="wallet" className="h-5 w-5" />}
              />
              <Stat
                loading={loading}
                label="SLA score"
                value={`${me?.stats.approvalSlaScore ?? 0}%`}
                hint="Approval speed score"
                icon={<Icon name="sparkle" className="h-5 w-5" />}
                accent="sky"
              />
            </div>
          </div>
        </Card>

        {/* body layout */}
        <div className="mt-6 grid gap-6 lg:grid-cols-[360px_1fr]">
          {/* left sidebar */}
          <div className="space-y-6">
            <Card>
              <CardHeader
                title="Identity & Access"
                desc="ภาพรวมสิทธิ์และระดับอนุมัติใน eBudget"
                icon={<Icon name="shield" className="h-5 w-5" />}
              />
              <CardBody className="space-y-5">
                {loading ? (
                  <SkeletonBlock />
                ) : (
                  <>
                    <div className="flex flex-wrap gap-2">
                      <Badge>Approval: {me?.approvalLevel}</Badge>
                      <Badge variant="outline">Cost Center: {me?.budgetPolicy.costCenter}</Badge>
                    </div>

                    <div className="space-y-2">
                      <p className="text-sm font-bold text-slate-900">Roles</p>
                      <div className="flex flex-wrap gap-2">
                        {me?.roles.map((r) => (
                          <Badge key={r} variant="solid">
                            {r}
                          </Badge>
                        ))}
                      </div>
                    </div>

                    <Divider />

                    <div className="space-y-2">
                      <p className="text-sm font-bold text-slate-900">Policy</p>

                      <div className="grid gap-2 text-sm text-slate-700">
                        <RowKV
                          k={
                            <span className="inline-flex items-center gap-2">
                              <span className="text-sky-700">
                                <Icon name="wallet" className="h-4 w-4" />
                              </span>
                              Max project
                            </span>
                          }
                          v={<span className="font-extrabold">{formatTHB(me?.budgetPolicy.maxProjectBudgetTHB ?? 0)}</span>}
                        />
                        <RowKV
                          k={
                            <span className="inline-flex items-center gap-2">
                              <span className="text-sky-700">
                                <Icon name="clock" className="h-4 w-4" />
                              </span>
                              Monthly cap
                            </span>
                          }
                          v={<span className="font-extrabold">{formatTHB(me?.budgetPolicy.monthlyCapTHB ?? 0)}</span>}
                        />
                        <RowKV
                          k={
                            <span className="inline-flex items-center gap-2">
                              <span className="text-sky-700">
                                <Icon name="shield" className="h-4 w-4" />
                              </span>
                              Create project
                            </span>
                          }
                          v={
                            me?.budgetPolicy.canCreateProject ? (
                              <Badge variant="solid">
                                <Icon name="check" className="h-4 w-4" />
                                Allowed
                              </Badge>
                            ) : (
                              <Badge variant="danger">
                                <Icon name="x" className="h-4 w-4" />
                                Denied
                              </Badge>
                            )
                          }
                        />
                      </div>
                    </div>

                    <Divider />

                    <div className="space-y-2">
                      <p className="text-sm font-bold text-slate-900">Funding sources</p>
                      <div className="flex flex-wrap gap-2">
                        {me?.budgetPolicy.fundingSources.map((s) => (
                          <Badge key={s} variant="outline">
                            {s}
                          </Badge>
                        ))}
                      </div>
                    </div>

                    <div className="rounded-3xl border border-sky-100 bg-sky-50/60 p-4">
                      <div className="flex items-start gap-3">
                        <div className="rounded-2xl border border-sky-200 bg-white p-2 text-sky-700">
                          <Icon name="shield" className="h-5 w-5" />
                        </div>
                        <div className="space-y-1">
                          <p className="text-sm font-extrabold">Compliance status</p>
                          <p className="text-xs text-slate-600">
                            Signature: <span className="font-semibold">{me?.signatureStatus}</span> • Risk:{" "}
                            <span className="font-semibold">{me?.risk}</span>
                          </p>
                        </div>
                      </div>
                    </div>
                  </>
                )}
              </CardBody>
            </Card>

            <Card>
              <CardHeader
                title="Shortcuts"
                desc="ไปส่วนที่ใช้บ่อย (dashboard vibe)"
                icon={<Icon name="link" className="h-5 w-5" />}
              />
              <CardBody className="grid gap-2">
                <Shortcut title="My approvals" desc="รายการที่รอคุณ action" />
                <Shortcut title="My projects" desc="โปรเจกต์ที่คุณเป็นเจ้าของ" />
                <Shortcut title="Security" desc="MFA, sessions, connected apps" />
                <Shortcut title="Preferences" desc="ภาษา, notification, timezone" />
              </CardBody>
            </Card>

            <Card>
              <CardHeader
                title="Quick audit hints"
                desc="policy"
                icon={<Icon name="sparkle" className="h-5 w-5" />}
              />
              <CardBody className="space-y-3 text-sm text-slate-700">
                <HintLine icon="check" text="แสดง last login, device, IP เพื่อให้ user เช็คความปลอดภัย" />
                <HintLine icon="check" text="แสดง policy caps (max project / monthly cap / funding sources)" />
                <HintLine icon="check" text="มี activity timeline ช่วย audit ได้ทันที" />
                <HintLine icon="check" text="มี export ปุ่มเดียวเอาไปแนบเอกสาร/รายงาน" />
              </CardBody>
            </Card>
          </div>

          {/* main */}
          <div className="space-y-6">
            {/* tabs */}
            <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
              <div className="flex flex-wrap gap-2 rounded-3xl border border-sky-100 bg-sky-50/60 p-2">
                <TabBtn active={tab === "overview"} onClick={() => setTab("overview")}>
                  Overview
                </TabBtn>
                <TabBtn active={tab === "approvals"} onClick={() => setTab("approvals")}>
                  Approvals
                </TabBtn>
                <TabBtn active={tab === "projects"} onClick={() => setTab("projects")}>
                  Projects
                </TabBtn>
                <TabBtn active={tab === "security"} onClick={() => setTab("security")}>
                  Security
                </TabBtn>
                <TabBtn active={tab === "prefs"} onClick={() => setTab("prefs")}>
                  Preferences
                </TabBtn>
              </div>

              <div className="flex flex-wrap gap-2">
                <Button variant="outline">
                  <Icon name="download" className="h-4 w-4 text-sky-700" />
                  Export (CSV)
                </Button>
                <Button>
                  <Icon name="arrow" className="h-4 w-4" />
                  Open dashboard
                </Button>
              </div>
            </div>

            {/* content */}
            {tab === "overview" ? (
              <Overview loading={loading} me={me} />
            ) : tab === "approvals" ? (
              <Approvals loading={loading} me={me} />
            ) : tab === "projects" ? (
              <Projects loading={loading} me={me} />
            ) : tab === "security" ? (
              <Security loading={loading} me={me} />
            ) : (
              <Preferences loading={loading} me={me} setMe={setMe} />
            )}
          </div>
        </div>
      </div>

      {/* Edit modal */}
      <Modal
        open={editOpen}
        onClose={() => setEditOpen(false)}
        title="Edit profile"
        subtitle="ตัวอย่าง UI — ต่อ API จริงได้ทันที"
        footer={
          <div className="flex items-center justify-end gap-2">
            <Button variant="ghost" onClick={() => setEditOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={() => {
                // TODO: call API update profile
                setMe((prev) =>
                  prev
                    ? {
                        ...prev,
                        displayName: form.displayName,
                        phone: form.phone,
                        department: form.department,
                        position: form.position,
                      }
                    : prev
                );
                setEditOpen(false);
              }}
            >
              <Icon name="check" className="h-4 w-4" />
              Save changes
            </Button>
          </div>
        }
      >
        <div className="grid gap-5 md:grid-cols-2">
          <Field label="Display name">
            <input
              value={form.displayName}
              onChange={(e) => setForm((p) => ({ ...p, displayName: e.target.value }))}
              className={inputBase}
              placeholder="Your name"
            />
          </Field>

          <Field label="Phone">
            <input
              value={form.phone}
              onChange={(e) => setForm((p) => ({ ...p, phone: e.target.value }))}
              className={inputBase}
              placeholder="0xx-xxx-xxxx"
            />
          </Field>

          <Field label="Department">
            <input
              value={form.department}
              onChange={(e) => setForm((p) => ({ ...p, department: e.target.value }))}
              className={inputBase}
            />
          </Field>

          <Field label="Position">
            <input
              value={form.position}
              onChange={(e) => setForm((p) => ({ ...p, position: e.target.value }))}
              className={inputBase}
            />
          </Field>

          <Field label="Bio / Note" className="md:col-span-2">
            <textarea
              value={form.bio}
              onChange={(e) => setForm((p) => ({ ...p, bio: e.target.value }))}
              className={cx(inputBase, "min-h-[110px] resize-none")}
              placeholder="เขียนสั้น ๆ ว่ารับผิดชอบอะไร..."
            />
          </Field>
        </div>
      </Modal>
    </div>
  );
}


function Overview({ loading, me }: { loading: boolean; me: Me | null }) {
  return (
    <div className="space-y-6">
      <div className="grid gap-6 xl:grid-cols-2">
        <Card>
          <CardHeader
            title="Activity feed"
            desc="สิ่งที่คุณทำล่าสุดใน eBudget"
            icon={<Icon name="sparkle" className="h-5 w-5" />}
          />
          <CardBody className="space-y-3">
            {loading ? (
              <div className="space-y-3">
                <SkeletonRow />
                <SkeletonRow />
                <SkeletonRow />
              </div>
            ) : (
              <div className="space-y-3">
                {me?.activity.map((a) => (
                  <div
                    key={a.id}
                    className="group rounded-3xl border border-sky-100 bg-white p-4 hover:bg-sky-50/30"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex items-start gap-3">
                        <div className="rounded-2xl border border-slate-200 bg-white p-2 text-sky-700">
                          <Icon name={activityIcon(a.type)} className="h-5 w-5" />
                        </div>
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className={cx("h-2 w-2 rounded-full", severityDot(a.severity))} />
                            <p className="text-sm font-extrabold">{a.title}</p>
                          </div>
                          {a.detail ? <p className="text-xs text-slate-600">{a.detail}</p> : null}
                          <p className="text-xs text-slate-500">{formatDT(a.createdAt)}</p>
                        </div>
                      </div>

                      <Button variant="ghost" size="sm" className="opacity-70 group-hover:opacity-100">
                        View <span className="text-sky-700"><Icon name="arrow" className="h-4 w-4" /></span>
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardBody>
        </Card>

        <Card>
          <CardHeader
            title="Health & performance"
            desc="ความเร็ว/ความปลอดภัย/ภาพรวมการใช้งาน"
            icon={<Icon name="shield" className="h-5 w-5" />}
          />
          <CardBody className="space-y-5">
            {loading ? (
              <SkeletonBlock />
            ) : (
              <>
                <KPI
                  title="Approval SLA score"
                  value={`${me?.stats.approvalSlaScore ?? 0}%`}
                  desc="คะแนนความเร็วในการอนุมัติ (ยิ่งสูงยิ่งดี)"
                  icon={<Icon name="clock" className="h-5 w-5" />}
                  progress={me?.stats.approvalSlaScore ?? 0}
                />
                <KPI
                  title="Security posture"
                  value={me?.security.mfaEnabled ? "MFA enabled" : "MFA disabled"}
                  desc={`Last password change: ${formatDT(me?.security.lastPasswordChangedAt ?? "")}`}
                  icon={<Icon name="key" className="h-5 w-5" />}
                  progress={me?.security.mfaEnabled ? 88 : 42}
                />
                <KPI
                  title="Budget usage (YTD)"
                  value={formatTHB(me?.stats.totalBudgetYTD ?? 0)}
                  desc={`Monthly cap: ${formatTHB(me?.budgetPolicy.monthlyCapTHB ?? 0)}`}
                  icon={<Icon name="wallet" className="h-5 w-5" />}
                  progress={Math.min(100, Math.round(((me?.stats.totalBudgetYTD ?? 0) / 5_000_000) * 100))}
                />

                <div className="grid gap-3 rounded-3xl border border-sky-100 bg-sky-50/40 p-4 md:grid-cols-3">
                  <MiniChip title="Last login" value={formatDT(me?.security.lastLoginAt ?? "")} icon="finger" />
                  <MiniChip title="Active sessions" value={`${me?.security.sessions.length ?? 0}`} icon="laptop" />
                  <MiniChip
                    title="Connected apps"
                    value={`${me?.security.connectedApps.filter((x) => x.status === "Active").length ?? 0}`}
                    icon="link"
                  />
                </div>
              </>
            )}
          </CardBody>
        </Card>
      </div>

      <Card>
        <CardHeader
          title="Work profile"
          desc="ข้อมูลการทำงาน + permission overview แบบเว่อ ๆ"
          icon={<Icon name="building" className="h-5 w-5" />}
        />
        <CardBody>
          {loading ? (
            <SkeletonBlock />
          ) : (
            <div className="grid gap-4 md:grid-cols-3">
              <Info label="Division" value={me?.division ?? "-"} icon="building" />
              <Info label="Department" value={me?.department ?? "-"} icon="building" />
              <Info label="Position" value={me?.position ?? "-"} icon="user" />
              <Info label="Location" value={me?.workLocation ?? "-"} icon="pin" />
              <Info label="Approval level" value={me?.approvalLevel ?? "-"} icon="shield" />
              <Info label="Cost center" value={me?.budgetPolicy.costCenter ?? "-"} icon="wallet" />
            </div>
          )}
        </CardBody>
      </Card>
    </div>
  );
}

function Approvals({ loading, me }: { loading: boolean; me: Me | null }) {
  return (
    <div className="space-y-6">
      <Card>
        <div className="flex flex-col gap-3 border-b border-slate-100 px-6 py-5 md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="text-base font-extrabold md:text-lg">Pending approvals</h2>
            <p className="text-sm text-slate-600">รายการที่รอคุณ action (อนุมัติ/ตีกลับ/ปฏิเสธ)</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button variant="outline">
              <Icon name="download" className="h-4 w-4 text-sky-700" />
              Export list
            </Button>
            <Button>
              <Icon name="shield" className="h-4 w-4" />
              Go to approvals
            </Button>
          </div>
        </div>

        <CardBody className="overflow-x-auto">
          {loading ? (
            <div className="space-y-3">
              <SkeletonRow />
              <SkeletonRow />
              <SkeletonRow />
            </div>
          ) : (
            <table className="min-w-[900px] w-full text-sm">
              <thead>
                <tr className="text-left text-xs font-bold text-slate-600">
                  <th className="pb-3">Project</th>
                  <th className="pb-3">Requester</th>
                  <th className="pb-3 text-right">Amount</th>
                  <th className="pb-3">Status</th>
                  <th className="pb-3">Due</th>
                  <th className="pb-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody>
                {me?.approvals.map((ap) => (
                  <tr key={ap.id} className="border-t border-slate-100 hover:bg-sky-50/30">
                    <td className="py-4 font-bold">{ap.projectName}</td>
                    <td className="py-4">{ap.requester}</td>
                    <td className="py-4 text-right font-extrabold">{formatTHB(ap.amountTHB)}</td>
                    <td className="py-4">{approvalBadge(ap.status)}</td>
                    <td className="py-4">{formatDT(ap.dueAt)}</td>
                    <td className="py-4 text-right">
                      <Button size="sm">
                        Open <Icon name="arrow" className="h-4 w-4" />
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </CardBody>
      </Card>

      <div className="grid gap-6 md:grid-cols-3">
        <BigMetric title="Max project" value={formatTHB(me?.budgetPolicy.maxProjectBudgetTHB ?? 0)} icon="wallet" loading={loading} />
        <BigMetric title="Monthly cap" value={formatTHB(me?.budgetPolicy.monthlyCapTHB ?? 0)} icon="clock" loading={loading} />
        <BigMetric title="Approval level" value={me?.approvalLevel ?? "-"} icon="shield" loading={loading} />
      </div>
    </div>
  );
}

function Projects({ loading, me }: { loading: boolean; me: Me | null }) {
  return (
    <div className="space-y-6">
      <Card>
        <div className="flex flex-col gap-3 border-b border-slate-100 px-6 py-5 md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="text-base font-extrabold md:text-lg">My projects</h2>
            <p className="text-sm text-slate-600">โปรเจกต์ของคุณ + status + budget + progress</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button variant="outline">
              <Icon name="download" className="h-4 w-4 text-sky-700" />
              Export
            </Button>
            <Button>
              <Icon name="sparkle" className="h-4 w-4" />
              Create new project
            </Button>
          </div>
        </div>

        <CardBody className="space-y-4">
          {loading ? (
            <div className="space-y-3">
              <SkeletonCard />
              <SkeletonCard />
            </div>
          ) : (
            <div className="grid gap-4">
              {me?.projects.map((p) => (
                <div key={p.id} className="rounded-[28px] border border-sky-100 bg-white p-5 hover:bg-sky-50/20">
                  <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                    <div className="space-y-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="text-base font-extrabold">{p.name}</p>
                        {projectBadge(p.status)}
                        <Badge variant="outline">Updated: {formatDT(p.updatedAt)}</Badge>
                      </div>
                      <p className="text-sm text-slate-600">
                        Budget: <span className="font-extrabold text-slate-900">{formatTHB(p.budgetTHB)}</span>
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      <Button variant="outline">
                        View detail
                        <span className="text-sky-700">
                          <Icon name="arrow" className="h-4 w-4" />
                        </span>
                      </Button>
                      <Button>
                        Open <Icon name="arrow" className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>

                  <div className="mt-4 grid gap-3 md:grid-cols-[1fr_auto] md:items-center">
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-xs text-slate-600">
                        <span>Progress</span>
                        <span className="font-extrabold text-slate-900">{p.progress}%</span>
                      </div>
                      <ProgressBar value={p.progress} />
                    </div>

                    <div className="rounded-2xl border border-sky-100 bg-sky-50/40 px-4 py-3 text-sm">
                      <div className="flex items-center gap-2 text-slate-700">
                        <span className="text-sky-700">
                          <Icon name="check" className="h-4 w-4" />
                        </span>
                        Next: Attach docs / review
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardBody>
      </Card>
    </div>
  );
}

function Security({ loading, me }: { loading: boolean; me: Me | null }) {
  return (
    <div className="space-y-6">
      <div className="grid gap-6 xl:grid-cols-2">
        <Card>
          <CardHeader
            title="Security settings"
            desc="MFA, password, sign-in health"
            icon={<Icon name="key" className="h-5 w-5" />}
          />
          <CardBody className="space-y-5">
            {loading ? (
              <SkeletonBlock />
            ) : (
              <>
                <div className="flex items-start justify-between gap-4 rounded-3xl border border-sky-100 p-4">
                  <div className="space-y-1">
                    <p className="text-sm font-extrabold">Multi-factor authentication (MFA)</p>
                    <p className="text-xs text-slate-600">เพิ่มความปลอดภัยในการล็อกอิน</p>
                  </div>
                  <Toggle checked={!!me?.security.mfaEnabled} onChange={() => {}} />
                </div>

                <div className="rounded-3xl border border-sky-100 bg-sky-50/40 p-4 text-sm text-slate-700">
                  <div className="grid gap-2">
                    <RowKV
                      k={
                        <span className="inline-flex items-center gap-2">
                          <span className="text-sky-700">
                            <Icon name="key" className="h-4 w-4" />
                          </span>
                          Last password change
                        </span>
                      }
                      v={<span className="font-extrabold">{formatDT(me?.security.lastPasswordChangedAt ?? "")}</span>}
                    />
                    <RowKV
                      k={
                        <span className="inline-flex items-center gap-2">
                          <span className="text-sky-700">
                            <Icon name="finger" className="h-4 w-4" />
                          </span>
                          Last login
                        </span>
                      }
                      v={<span className="font-extrabold">{formatDT(me?.security.lastLoginAt ?? "")}</span>}
                    />
                  </div>
                </div>

                <Button className="w-full">
                  <Icon name="key" className="h-4 w-4" />
                  Change password
                </Button>
              </>
            )}
          </CardBody>
        </Card>

        <Card>
          <CardHeader
            title="Sessions"
            desc="ดู session ทั้งหมด + revoke ได้"
            icon={<Icon name="laptop" className="h-5 w-5" />}
          />
          <CardBody className="space-y-3">
            {loading ? (
              <div className="space-y-3">
                <SkeletonRow />
                <SkeletonRow />
              </div>
            ) : (
              <>
                {me?.security.sessions.map((s) => (
                  <div key={s.id} className="rounded-3xl border border-sky-100 p-4 hover:bg-sky-50/20">
                    <div className="flex items-start justify-between gap-3">
                      <div className="space-y-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <Badge variant="outline">{s.device}</Badge>
                          {s.trusted ? (
                            <Badge variant="solid">
                              <Icon name="shield" className="h-4 w-4" />
                              Trusted
                            </Badge>
                          ) : (
                            <Badge variant="warn">
                              <Icon name="warn" className="h-4 w-4" />
                              Untrusted
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm text-slate-700">
                          <span className="font-bold">{s.location}</span> • IP {s.ip}
                        </p>
                        <p className="text-xs text-slate-500">Last seen: {formatDT(s.lastSeenAt)}</p>
                      </div>

                      <Button variant="outline" size="sm">
                        Revoke
                      </Button>
                    </div>
                  </div>
                ))}

                <div className="rounded-3xl border border-sky-100 bg-sky-50/40 p-4 text-sm text-slate-700">
                  <div className="flex items-center gap-2">
                    <span className="text-sky-700">
                      <Icon name="warn" className="h-4 w-4" />
                    </span>
                    ถ้าเจอ session แปลก ๆ ให้ revoke แล้วเปลี่ยนรหัสทันที
                  </div>
                </div>
              </>
            )}
          </CardBody>
        </Card>
      </div>

      <Card>
        <CardHeader
          title="Connected apps"
          desc="บริการที่เชื่อมกับบัญชี (SSO / Workspace / Slack ฯลฯ)"
          icon={<Icon name="link" className="h-5 w-5" />}
        />
        <CardBody className="overflow-x-auto">
          {loading ? (
            <SkeletonBlock />
          ) : (
            <table className="min-w-[980px] w-full text-sm">
              <thead>
                <tr className="text-left text-xs font-bold text-slate-600">
                  <th className="pb-3">App</th>
                  <th className="pb-3">Scopes</th>
                  <th className="pb-3">Linked</th>
                  <th className="pb-3">Status</th>
                  <th className="pb-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody>
                {me?.security.connectedApps.map((a) => (
                  <tr key={a.name} className="border-t border-slate-100 hover:bg-sky-50/30">
                    <td className="py-4 font-extrabold">{a.name}</td>
                    <td className="py-4">
                      <div className="flex flex-wrap gap-1">
                        {a.scope.map((sc) => (
                          <span
                            key={sc}
                            className="rounded-full border border-sky-100 bg-white px-2 py-1 text-xs text-slate-700"
                          >
                            {sc}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="py-4">{formatDT(a.linkedAt)}</td>
                    <td className="py-4">
                      {a.status === "Active" ? <Badge variant="solid">Active</Badge> : <Badge variant="warn">Expired</Badge>}
                    </td>
                    <td className="py-4 text-right">
                      <Button variant="outline" size="sm">
                        Manage <Icon name="arrow" className="h-4 w-4 text-sky-700" />
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </CardBody>
      </Card>
    </div>
  );
}

function Preferences({
  loading,
  me,
  setMe,
}: {
  loading: boolean;
  me: Me | null;
  setMe: React.Dispatch<React.SetStateAction<Me | null>>;
}) {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader
          title="Preferences"
          desc="ตั้งค่า UI, ภาษา, timezone, แจ้งเตือน"
          icon={<Icon name="sparkle" className="h-5 w-5" />}
        />
        <CardBody className="grid gap-6 md:grid-cols-2">
          {loading ? (
            <>
              <SkeletonBlock />
              <SkeletonBlock />
            </>
          ) : (
            <>
              <PrefTile
                title="Dark mode"
                desc="ตัวอย่าง: ต่อ theme system จริงได้"
                icon="sparkle"
                checked={!!me?.preferences.darkMode}
                onToggle={(v) => setMe((p) => (p ? { ...p, preferences: { ...p.preferences, darkMode: v } } : p))}
              />
              <PrefTile
                title="Email notifications"
                desc="แจ้งเตือนผ่านอีเมล"
                icon="mail"
                checked={!!me?.preferences.emailNoti}
                onToggle={(v) => setMe((p) => (p ? { ...p, preferences: { ...p.preferences, emailNoti: v } } : p))}
              />
              <PrefTile
                title="Push notifications"
                desc="แจ้งเตือนบนอุปกรณ์"
                icon="bell"
                checked={!!me?.preferences.pushNoti}
                onToggle={(v) => setMe((p) => (p ? { ...p, preferences: { ...p.preferences, pushNoti: v } } : p))}
              />
              <PrefTile
                title="Weekly digest"
                desc="สรุปทุกสัปดาห์"
                icon="clock"
                checked={!!me?.preferences.weeklyDigest}
                onToggle={(v) => setMe((p) => (p ? { ...p, preferences: { ...p.preferences, weeklyDigest: v } } : p))}
              />

              <div className="rounded-3xl border border-sky-100 p-4">
                <div className="flex items-start gap-3">
                  <div className="rounded-2xl border border-sky-200 bg-white p-2 text-sky-700">
                    <Icon name="link" className="h-5 w-5" />
                  </div>
                  <div className="w-full space-y-3">
                    <p className="text-sm font-extrabold">Locale</p>
                    <div className="grid gap-3 md:grid-cols-2">
                      <Field label="Language">
                        <input
                          value={me?.preferences.language ?? "th"}
                          onChange={(e) =>
                            setMe((p) =>
                              p ? { ...p, preferences: { ...p.preferences, language: (e.target.value as any) || "th" } } : p
                            )
                          }
                          className={inputBase}
                        />
                      </Field>
                      <Field label="Timezone">
                        <input
                          value={me?.preferences.timezone ?? "Asia/Bangkok"}
                          onChange={(e) =>
                            setMe((p) => (p ? { ...p, preferences: { ...p.preferences, timezone: e.target.value } } : p))
                          }
                          className={inputBase}
                        />
                      </Field>
                    </div>
                  </div>
                </div>
              </div>

              <div className="rounded-3xl border border-sky-100 bg-sky-50/40 p-4">
                <div className="flex items-start gap-3">
                  <div className="rounded-2xl border border-sky-200 bg-white p-2 text-sky-700">
                    <Icon name="shield" className="h-5 w-5" />
                  </div>
                  <div className="space-y-2">
                    <p className="text-sm font-extrabold">Tips</p>
                    <ul className="space-y-1 text-sm text-slate-700">
                      <li className="flex items-center gap-2">
                        <span className="text-sky-700"><Icon name="check" className="h-4 w-4" /></span>
                        ถ้าอยาก “เว่อ” กว่านี้ เพิ่ม chart / donut / heatmap ได้
                      </li>
                      <li className="flex items-center gap-2">
                        <span className="text-sky-700"><Icon name="check" className="h-4 w-4" /></span>
                        เพิ่มปุ่ม export แยกตาม template PDF/Excel ได้หลายแบบ
                      </li>
                    </ul>
                    <Button className="mt-2">
                      <Icon name="check" className="h-4 w-4" />
                      Save preferences
                    </Button>
                  </div>
                </div>
              </div>
            </>
          )}
        </CardBody>
      </Card>
    </div>
  );
}


function TabBtn({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      onClick={onClick}
      className={cx(
        "rounded-2xl px-4 py-2 text-sm font-extrabold transition",
        active ? "bg-white text-slate-900 shadow-sm" : "text-slate-600 hover:bg-white/70"
      )}
    >
      {children}
    </button>
  );
}

function Stat({
  loading,
  label,
  value,
  hint,
  icon,
  accent,
}: {
  loading: boolean;
  label: string;
  value: React.ReactNode;
  hint?: string;
  icon: React.ReactNode;
  accent?: "sky" | "indigo";
}) {
  const ring = accent === "indigo" ? "ring-indigo-200" : "ring-sky-200";
  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-4 hover:bg-sky-50/20">
      {loading ? (
        <SkeletonBlock />
      ) : (
        <>
          <div className={cx("inline-flex items-center gap-2 rounded-2xl bg-sky-50 px-3 py-2 ring-1", ring)}>
            <span className="text-sky-700">{icon}</span>
            <p className="text-xs font-extrabold text-slate-700">{label}</p>
          </div>
          <p className="mt-3 text-2xl font-extrabold tracking-tight">{value}</p>
          {hint ? <p className="mt-1 text-xs text-slate-500">{hint}</p> : null}
        </>
      )}
    </div>
  );
}

function Shortcut({ title, desc }: { title: string; desc: string }) {
  return (
    <button className="group rounded-3xl border border-sky-100 bg-white p-4 text-left transition hover:bg-sky-50/30">
      <div className="flex items-center justify-between">
        <p className="text-sm font-extrabold">{title}</p>
        <span className="text-sky-700 opacity-60 transition group-hover:opacity-100">
          <Icon name="arrow" className="h-4 w-4" />
        </span>
      </div>
      <p className="mt-1 text-xs text-slate-600">{desc}</p>
    </button>
  );
}

function KPI({
  title,
  value,
  desc,
  icon,
  progress,
}: {
  title: string;
  value: string;
  desc: string;
  icon: React.ReactNode;
  progress: number;
}) {
  return (
    <div className="rounded-3xl border border-sky-100 p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3">
          <div className="rounded-2xl border border-slate-200 bg-white p-2 text-sky-700">{icon}</div>
          <div className="space-y-1">
            <p className="text-sm font-extrabold">{title}</p>
            <p className="text-xs text-slate-600">{desc}</p>
          </div>
        </div>
        <Badge variant="solid">{value}</Badge>
      </div>
      <div className="mt-3">
        <ProgressBar value={progress} />
      </div>
    </div>
  );
}

function MiniChip({ title, value, icon }: { title: string; value: string; icon: any }) {
  return (
    <div className="rounded-3xl border border-sky-100 bg-white p-3">
      <div className="flex items-center gap-2 text-slate-700">
        <span className="text-sky-700">
          <Icon name={icon} className="h-4 w-4" />
        </span>
        <p className="text-xs font-bold">{title}</p>
      </div>
      <p className="mt-1 text-sm font-extrabold">{value}</p>
    </div>
  );
}

function Info({ label, value, icon }: { label: string; value: string; icon: any }) {
  return (
    <div className="rounded-3xl border border-sky-100 bg-white p-4">
      <div className="flex items-center gap-2 text-xs font-extrabold text-slate-600">
        <span className="rounded-2xl bg-sky-50 p-2 text-sky-700 ring-1 ring-sky-200">
          <Icon name={icon} className="h-4 w-4" />
        </span>
        {label}
      </div>
      <p className="mt-2 text-sm font-extrabold">{value}</p>
    </div>
  );
}

function RowKV({ k, v }: { k: React.ReactNode; v: React.ReactNode }) {
  return <div className="flex items-center justify-between gap-3">{k}<div>{v}</div></div>;
}

function BigMetric({ title, value, icon, loading }: { title: string; value: string; icon: any; loading: boolean }) {
  return (
    <Card>
      <CardBody>
        {loading ? (
          <SkeletonBlock />
        ) : (
          <>
            <div className="flex items-center gap-2 text-sm font-extrabold text-slate-700">
              <span className="rounded-2xl bg-sky-50 p-2 text-sky-700 ring-1 ring-sky-200">
                <Icon name={icon} className="h-5 w-5" />
              </span>
              {title}
            </div>
            <p className="mt-3 text-2xl font-extrabold tracking-tight">{value}</p>
            <p className="mt-1 text-xs text-slate-500">Applied by policy & approval level</p>
          </>
        )}
      </CardBody>
    </Card>
  );
}

function HintLine({ icon, text }: { icon: any; text: string }) {
  return (
    <div className="flex items-start gap-2">
      <span className="mt-0.5 text-sky-700">
        <Icon name={icon} className="h-4 w-4" />
      </span>
      <p>{text}</p>
    </div>
  );
}

function PrefTile({
  title,
  desc,
  icon,
  checked,
  onToggle,
}: {
  title: string;
  desc: string;
  icon: any;
  checked: boolean;
  onToggle: (v: boolean) => void;
}) {
  return (
    <div className="rounded-3xl border border-sky-100 p-4">
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-start gap-3">
          <div className="rounded-2xl border border-sky-200 bg-white p-2 text-sky-700">
            <Icon name={icon} className="h-5 w-5" />
          </div>
          <div className="space-y-1">
            <p className="text-sm font-extrabold">{title}</p>
            <p className="text-xs text-slate-600">{desc}</p>
          </div>
        </div>
        <Toggle checked={checked} onChange={onToggle} />
      </div>
    </div>
  );
}


function SkeletonBlock() {
  return (
    <div className="space-y-2">
      <div className="h-4 w-40 animate-pulse rounded bg-slate-100" />
      <div className="h-6 w-56 animate-pulse rounded bg-slate-100" />
      <div className="h-3 w-48 animate-pulse rounded bg-slate-100" />
    </div>
  );
}
function SkeletonRow() {
  return <div className="h-16 w-full animate-pulse rounded-3xl bg-slate-100" />;
}
function SkeletonCard() {
  return <div className="h-28 w-full animate-pulse rounded-[28px] bg-slate-100" />;
}

const inputBase =
  "w-full rounded-2xl border border-slate-200 bg-white px-4 py-2.5 text-sm outline-none transition focus:border-sky-300 focus:ring-4 focus:ring-sky-100";

function Field({ label, children, className }: { label: string; children: React.ReactNode; className?: string }) {
  return (
    <div className={cx("space-y-2", className)}>
      <label className="text-xs font-extrabold text-slate-700">{label}</label>
      {children}
    </div>
  );
}


function approvalBadge(status: Me["approvals"][number]["status"]) {
  if (status === "Pending") return <Badge variant="solid">Pending</Badge>;
  if (status === "Approved") return <Badge>Approved</Badge>;
  if (status === "Rejected") return <Badge variant="danger">Rejected</Badge>;
  return <Badge variant="warn">Returned</Badge>;
}
function projectBadge(status: Me["projects"][number]["status"]) {
  if (status === "Approved") return <Badge variant="solid">Approved</Badge>;
  if (status === "InReview") return <Badge variant="warn">In review</Badge>;
  if (status === "Draft") return <Badge variant="outline">Draft</Badge>;
  if (status === "Rejected") return <Badge variant="danger">Rejected</Badge>;
  return <Badge variant="outline">Closed</Badge>;
}

function activityIcon(type: Me["activity"][number]["type"]): any {
  switch (type) {
    case "SUBMIT_PROJECT":
      return "download";
    case "APPROVE":
      return "check";
    case "REJECT":
      return "x";
    case "COMMENT":
      return "user";
    case "UPLOAD_DOC":
      return "download";
    case "EXPORT_REPORT":
      return "download";
    case "LOGIN":
      return "finger";
    default:
      return "sparkle";
  }
}
function severityDot(s?: Me["activity"][number]["severity"]) {
  if (s === "success") return "bg-sky-600";
  if (s === "warn") return "bg-amber-600";
  if (s === "danger") return "bg-rose-600";
  return "bg-slate-400";
}
