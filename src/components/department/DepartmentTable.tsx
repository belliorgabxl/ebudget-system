// DepartmentTable (updated) — replace your existing DepartmentTable export with this
import React, { useMemo } from "react";
import Link from "next/link";
import { Eye } from "lucide-react";
import { Department } from "@/dto/departmentDto";

// UI primitives (Table components) - keep the same as in your file
function Table({
  children,
  className = "",
}: React.PropsWithChildren<{ className?: string }>) {
  return (
    <div className="overflow-x-auto rounded-xl border border-gray-200 bg-white shadow-sm">
      <table className={`min-w-full text-sm ${className}`}>{children}</table>
    </div>
  );
}
function THead(props: React.HTMLAttributes<HTMLTableSectionElement>) {
  const { children, className = "", ...rest } = props;
  return (
    <thead className={`sticky top-0 z-10 ${className}`} {...rest}>
      <tr className="bg-gradient-to-r from-indigo-50/70 to-blue-50/70">{children}</tr>
    </thead>
  );
}
function TH(
  props: React.PropsWithChildren<
    { align?: "left" | "right" | "center"; className?: string } & React.ThHTMLAttributes<HTMLTableCellElement>
  >
) {
  const { children, align = "left", className = "", ...rest } = props;
  const alignCls = align === "right" ? "text-right" : align === "center" ? "text-center" : "text-left";
  return (
    <th
      scope="col"
      className={`px-4 py-3 text-xs font-semibold uppercase tracking-wide text-gray-700 ${alignCls} ${className}`}
      {...rest}
    >
      {children}
    </th>
  );
}
function TBody(props: React.HTMLAttributes<HTMLTableSectionElement>) {
  const { children, className = "", ...rest } = props;
  return (
    <tbody className={`divide-y divide-gray-100 ${className}`} {...rest}>
      {children}
    </tbody>
  );
}
function TR(props: React.HTMLAttributes<HTMLTableRowElement>) {
  const { children, className = "", ...rest } = props;
  return (
    <tr
      className={`odd:bg-white even:bg-gray-50/40 hover:bg-indigo-50/40 transition-colors ${className}`}
      {...rest}
    >
      {children}
    </tr>
  );
}
function TD(
  props: React.PropsWithChildren<
    { align?: "left" | "right" | "center"; className?: string } & React.TdHTMLAttributes<HTMLTableCellElement>
  >
) {
  const { children, align = "left", className = "", ...rest } = props;
  const alignCls = align === "right" ? "text-right" : align === "center" ? "text-center" : "text-left";
  return (
    <td className={`px-4 py-3 text-gray-800 ${alignCls} ${className}`} {...rest}>
      {children}
    </td>
  );
}

// small atoms
function CodeBadge({ children }: React.PropsWithChildren) {
  return (
    <span className="inline-flex items-center rounded-md border border-indigo-200 bg-indigo-50 px-2 py-0.5 text-[11px] font-medium text-indigo-700">
      {children}
    </span>
  );
}
function Muted({ children }: React.PropsWithChildren) {
  return <span className="text-gray-500">{children}</span>;
}

export function DepartmentTable({
  data = [],
  itemsPerPage = 10,
  currentPage,
  onPageChange,
  totalItems,
  disableNext = false,
  showIndex = false,
  onToggleActive,
  onDetails,
  loading = false,
  skeletonRows = 6,
}: {
  data?: Department[];
  itemsPerPage?: number;
  currentPage?: number;
  onPageChange?: (p: number) => void;
  totalItems?: number;
  disableNext?: boolean;
  showIndex?: boolean;
  onToggleActive?: (id: string) => void;
  onDetails?: (d: Department) => void;
  loading?: boolean;
  skeletonRows?: number;
}) {
  const isControlled = typeof onPageChange === "function" || typeof currentPage === "number";
  const internalPage = 1;
  const page = isControlled ? (currentPage ?? 1) : internalPage;

  const rows = useMemo(() => (data || []).map((d) => d), [data]);

  const computedTotalItems = typeof totalItems === "number" ? totalItems : rows.length;
  const totalPages = Math.max(1, Math.ceil(computedTotalItems / itemsPerPage));

  const currentRows = isControlled ? rows : rows.slice((page - 1) * itemsPerPage, (page - 1) * itemsPerPage + itemsPerPage);
  const startIndex = (page - 1) * itemsPerPage;

  const goPage = (newPage: number) => {
    if (newPage < 1) newPage = 1;
    if (newPage > totalPages) newPage = totalPages;
    if (isControlled) {
      onPageChange?.(newPage);
    } else {
      // local paging not implemented (kept same as before)
    }
  };

  const renderSkeletonRow = (key: string | number, showIndexCol: boolean) => (
    <TR key={`s-${key}`}>
      {showIndexCol && (
        <TD align="center" className="w-1/12">
          <div className="h-4 w-6 rounded bg-gray-200 animate-pulse" />
        </TD>
      )}
      <TD align="center" className="w-2/12">
        <div className="h-4 w-12 rounded bg-gray-200 animate-pulse mx-auto" />
      </TD>
      <TD className="w-3/12">
        <div className="h-4 w-48 rounded bg-gray-200 animate-pulse" />
      </TD>
      <TD align="center" className="w-2/12">
        <div className="h-4 w-10 rounded bg-gray-200 animate-pulse mx-auto" />
      </TD>
      <TD align="center" className="w-2/12">
        <div className="h-4 w-10 rounded bg-gray-200 animate-pulse mx-auto" />
      </TD>
      <TD align="center" className="w-1/12">
        <div className="h-4 w-8 rounded bg-gray-200 animate-pulse mx-auto" />
      </TD>
      <TD align="center" className="w-1/12">
        <div className="h-8 w-8 rounded bg-gray-200 animate-pulse mx-auto" />
      </TD>
    </TR>
  );

  return (
    <div>
      <Table>
        <THead>
          {showIndex && <TH className="w-1/12 text-center">#</TH>}
          <TH className="w-2/12" align="center">รหัส</TH>
          <TH className="w-3/12">ชื่อหน่วยงาน</TH>
          <TH className="w-2/12" align="center">จำนวนพนักงาน</TH>
          <TH className="w-2/12" align="center">จำนวนโครงการ</TH>
          <TH className="w-1/12" align="center">สถานะใช้งาน</TH>
          <TH className="w-1/12" align="center">จัดการ</TH>
        </THead>

        <TBody>
          {loading ? (
            Array.from({ length: skeletonRows }).map((_, i) => renderSkeletonRow(i, showIndex))
          ) : currentRows.length === 0 ? (
            <TR>
              <TD align="center" className="py-8" colSpan={showIndex ? 7 : 6}>
                <Muted>ยังไม่มีหน่วยงาน</Muted>
              </TD>
            </TR>
          ) : (
            currentRows.map((d, idx) => (
              <TR key={d.id}>
                {showIndex && <TD align="center">{startIndex + idx + 1}</TD>}
                <TD align="center">{d.code ? <CodeBadge>{d.code}</CodeBadge> : <Muted>—</Muted>}</TD>
                <TD>
                  {d.name}

                </TD>

                <TD align="center" className="tabular-nums">
                  {typeof d.user_count === "number" ? d.user_count : <Muted>—</Muted>}
                </TD>

                <TD align="center" className="tabular-nums">
                  {typeof d.project_count === "number" ? d.project_count : <Muted>—</Muted>}
                </TD>

                <TD align="center" className="w-1/12">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onToggleActive?.(d.id);
                    }}
                    aria-pressed={d.is_active}
                    title={d.is_active ? "ปิดการใช้งาน" : "เปิดใช้งาน"}
                    className={`relative inline-flex items-center h-6 w-12 rounded-full transition-colors focus:outline-none ${d.is_active ? "bg-green-600" : "bg-gray-300"
                      }`}
                  >
                    <span className={`inline-block h-4 w-4 transform rounded-full bg-white shadow-sm transition-transform ${d.is_active ? "translate-x-6" : "translate-x-1"}`} />
                    <span className="sr-only">{d.is_active ? "active" : "inactive"}</span>
                  </button>
                </TD>

                <TD align="center" className="w-1/12">
                  <div className="flex items-center justify-center gap-2">
                    <Link
                      href={`/organizer/department/${d.id}`}
                      className="h-8 w-8 rounded-md hover:bg-blue-600/10 hover:text-blue-700 flex items-center justify-center"
                      title="ดูรายละเอียด"
                    >
                      <Eye className="h-4 w-4" />
                    </Link>
                  </div>
                </TD>
              </TR>
            ))
          )}
        </TBody>
      </Table>

      <div className="mt-4 flex items-center justify-between px-2 m-4">
        <p className="text-xs text-gray-600 mb-2">
          แสดง {computedTotalItems === 0 ? 0 : startIndex + 1}-{Math.min(startIndex + currentRows.length, computedTotalItems)} จาก {computedTotalItems} รายการ
        </p>

        <div className="flex items-center gap-2">
          <button
            onClick={() => goPage(page - 1)}
            disabled={page === 1 || computedTotalItems === 0}
            className="inline-flex items-center gap-2 rounded-md bg-white px-3 py-2 text-xs shadow-sm hover:bg-gray-50 disabled:opacity-50"
          >
            ก่อนหน้า
          </button>

          <span className="rounded-lg bg-gray-100 px-3 py-1.5 text-xs font-medium text-gray-700">
            หน้า {page} / {totalPages}
          </span>

          <button
            onClick={() => goPage(page + 1)}
            disabled={page === totalPages || computedTotalItems === 0 || disableNext}
            className="inline-flex items-center gap-2 rounded-md bg-white px-3 py-2 text-xs shadow-sm hover:bg-gray-50 disabled:opacity-50"
          >
            ถัดไป
          </button>
        </div>
      </div>
    </div>
  );
}
