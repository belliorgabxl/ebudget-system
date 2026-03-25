import { BudgetTableValue, Project, TdProps } from "@/dto/projectDto";
import Image from "next/image";

export function Section({
  title,
  children,
  icon
}: {
  title: string;
  children: React.ReactNode;
  icon? : React.ReactNode;
}) {
  return (
    <section className="mb-4 rounded-lg border border-gray-200 bg-white shadow-sm">
      <div className="border-b border-gray-100 px-4 py-3">
        <h2 className="text-base flex items-center font-semibold gap-2 text-blue-700">{title} {icon || ""}</h2>
      </div>
      <div className="px-4 py-5">{children}</div>
    </section>
  );
}

export function Grid2({ children }: { children: React.ReactNode }) {
  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">{children}</div>
  );
}

export function Field({
  label,
  value,
  children,
}: {
  label: string;
  value?: any;
  children?: React.ReactNode;
}) {
  const content = children ?? (
    <span className="text-sm font-medium text-gray-800">{value ?? "—"}</span>
  );

  return (
    <div className="flex flex-col">
      <span className="text-xs font-medium text-indigo-500 mb-1">{label}</span>
      <div className="rounded-md bg-gray-50 px-3 py-2 text-sm text-gray-800 border border-gray-200">
        {content}
      </div>
    </div>
  );
}

export function EmptyRow({ children }: { children: React.ReactNode }) {
  return (
    <div className="rounded-lg border border-dashed border-gray-300 bg-gray-50 p-4 text-sm text-gray-600">
      {children}
    </div>
  );
}
export function StatusBadge({ status }: { status: string }) {
  const map: Record<string, string> = {
    draft: "bg-gray-100 text-gray-700",
    pending_approval: "bg-yellow-100 text-yellow-800",
    in_progress: "bg-blue-100 text-blue-800",
    completed: "bg-green-100 text-green-800",
    rejected: "bg-red-100 text-red-800",
    cancelled: "bg-gray-200 text-gray-500",
    out_of_date: "bg-orange-100 text-orange-800",
    in_revision: "bg-amber-100 text-amber-800",
    approved: "bg-emerald-100 text-emerald-800",
    closed: "bg-slate-100 text-slate-600",
  };
  const label: Record<string, string> = {
    draft: "ฉบับร่าง",
    pending_approval: "รออนุมัติ",
    in_progress: "กำลังดำเนินการ",
    completed: "เสร็จสิ้น",
    rejected: "ถูกปฏิเสธ",
    cancelled: "ยกเลิก",
    out_of_date: "หมดอายุ",
    in_revision: "ถูกส่งกลับแก้ไข",
    approved: "อนุมัติแล้ว",
    closed: "ปิดแผนแล้ว",
  };
  return (
    <span
      className={`justify-center flex items-center rounded-full w-full text-center px-2.5 py-0.5 text-xs font-medium ${
        map[status] ?? "bg-gray-100 text-gray-600"
      }`}
    >
      {label[status] ?? status}
    </span>
  );
}

export function ProgressBar({
  value,
  status,
}: {
  value: number;
  status: string;
}) {
  const v = Math.max(0, Math.min(100, value ?? 0));
  const color =
    status === "completed"
      ? "bg-green-600"
      : status === "cancelled" || status === "rejected"
      ? "bg-red-400"
      : status === "in_progress"
      ? "bg-blue-600"
      : "bg-gray-400";
  return (
    <div className="h-2 w-full rounded-full bg-gray-200">
      <div
        className={`h-2 rounded-full transition-[width] ${color}`}
        style={{ width: `${v}%` }}
      />
    </div>
  );
}

export function chipList(list?: string[]) {
  if (!list?.length) return <span className="text-gray-500">—</span>;
  return (
    <div className="flex flex-wrap gap-2">
      {list.map((t) => (
        <span
          key={t}
          className="inline-flex items-center rounded-full bg-gray-100 px-2 py-0.5 text-xs text-gray-800"
        >
          {t}
        </span>
      ))}
    </div>
  );
}
export function formatBaht(n: number) {
  return new Intl.NumberFormat("th-TH", {
    style: "currency",
    currency: "THB",
    maximumFractionDigits: 0,
  }).format(n);
}
export function formatThaiDateTime(iso: string) {
  return new Date(iso).toLocaleString("th-TH", {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

export function Td({ children, className = "", ...rest }: TdProps) {
  return (
    <td
      {...rest}
      className={`px-3 py-3 align-top min-w-0 overflow-hidden ${className}`}
    >
      {children}
    </td>
  );
}

export function BadgeTiny({
  children,
  title,
}: {
  children: React.ReactNode;
  title?: string;
}) {
  return (
    <span
      className="inline-flex items-center rounded-full bg-gray-100 px-2 py-0.5 text-[11px] max-w-[12rem] overflow-hidden"
      title={title}
    >
      <span className="line-clamp-1">{children}</span>
    </span>
  );
}

export function BadgeLabel({ title }: { title: string }) {
  return <span className="text-base  text-indigo-500">{title}</span>;
}

export function BadgeCreateFormProject({ title }: { title: string }) {
  return (
    <h1 className="px-4 py-1 text-white bg-gradient-to-r from-blue-600 to-indigo-500 rounded-md w-fit ">
      {title}
    </h1>
  );
}

export function Stat({ title, value }: { title: string; value: number }) {
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-lg">
      <div className="text-sm text-gray-600">{title}</div>
      <div className="mt-1 text-2xl font-semibold tabular-nums text-gray-900">
        {value}
      </div>
    </div>
  );
}

export function SectionCard({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-md border border-gray-200 bg-white p-5 shadow-sm">
      <h2 className="mb-4 text-sm font-semibold text-blue-700">{title}</h2>
      {children}
    </section>
  );
}

export function FieldBlock({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1">
      <label className="text-sm font-medium text-gray-700">{label}</label>
      {children}
    </div>
  );
}

export function dateOrDash(iso?: string) {
  if (!iso) return "—";
  try {
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) return "—";
    return d.toLocaleDateString("th-TH", { dateStyle: "medium" });
  } catch {
    return "—";
  }
}

export function numOrDash(n?: number) {
  return typeof n === "number" && Number.isFinite(n) ? String(n) : "—";
}

export function moneyOrDash(amount: string) {
  const n = parseFloat(amount);
  return Number.isFinite(n)
    ? n.toLocaleString(undefined, {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      })
    : "—";
}

export function RichOrDash({ text }: { text?: string }) {
  if (!text || !text.trim()) return <span>—</span>;
  return <p className="text-sm text-gray-800 whitespace-pre-line">{text}</p>;
}

export function BudgetSources({
  sources,
}: {
  sources: BudgetTableValue["sources"];
}) {
  if (!sources || !sources.source) return <span>—</span>;

  let label = "";
  switch (sources.source) {
    case "school":
      label = "งบสถานศึกษา";
      break;
    case "revenue":
      label = "เงินรายได้";
      break;
    case "external":
      label = sources.externalAgency?.trim()
        ? `ภายนอก (${sources.externalAgency.trim()})`
        : "ภายนอก";
      break;
    default:
      label = sources.source;
  }

  return (
    <span className="inline-flex items-center rounded bg-gray-100 px-2 py-0.5 text-[11px]">
      {label}
    </span>
  );
}

export function ProjectIcon() {
  return (
    <div className="flex items-center gap-3">
      <Image
        src={"/ebudget-icon.png"}
        className="h-18 w-18"
        height={200}
        width={200}
        alt="icon-ebudget"
      />
      <h1>Ebudget-System</h1>
    </div>
  );
}
