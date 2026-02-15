"use client";

import React, { useMemo, useState } from "react";
import { Eye } from "lucide-react";

function Table({
  children,
  className = "",
}: React.PropsWithChildren<{ className?: string }>) {
  return (
    <div className="overflow-x-auto rounded-xl border border-gray-200 bg-white shadow-sm">
      {/* ตั้งขนาดฟอนต์มาตรฐานของตารางเป็น text-xs */}
      <table className={`min-w-full text-xs ${className}`}>{children}</table>
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
  const alignCls =
    align === "right" ? "text-right" : align === "center" ? "text-center" : "text-left";
  // เปลี่ยนเป็น text-xs เพื่อความสอดคล้อง
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
  const alignCls =
    align === "right" ? "text-right" : align === "center" ? "text-center" : "text-left";
  // เปลี่ยนเป็น text-xs เพื่อความสอดคล้อง
  return (
    <td className={`px-4 py-3 text-xs text-gray-800 ${alignCls} ${className}`} {...rest}>
      {children}
    </td>
  );
}

type User = {
  id?: string | number;
  name?: string;
  title?: string;
  department?: string;
  status?: "Active" | "On leave" | "Inactive" | string;
  isActive?: boolean;
};

interface UsersTableProps {
  users?: User[];
  itemsPerPage?: number;
  viewAllHref?: string;
  onToggleIsActive?: (id?: string | number) => void;
  onEdit?: (u: User) => void;
  onDetails?: (u: User) => void;
  currentPage?: number;
  onPageChange?: (newPage: number) => void;
  disableNext?: boolean;
  totalItems?: number;
  totalPages?: number;
  showIndex?: boolean;
  loading?: boolean;
  skeletonRows?: number;
}

export default function UsersTable({
  users = [],
  itemsPerPage = 10,
  onToggleIsActive,
  onEdit,
  onDetails,
  currentPage: controlledPage,
  onPageChange,
  disableNext = false,
  totalItems,
  totalPages: propTotalPages,
  showIndex = false,
  loading = false,
  skeletonRows = 6,
}: UsersTableProps) {
  const [internalPage, setInternalPage] = useState(1);
  const isControlled = typeof onPageChange === "function" || typeof controlledPage === "number";
  const currentPage = isControlled ? (controlledPage ?? 1) : internalPage;

  const rows = useMemo(
    () =>
      (users || []).map((u) => {
        const isActiveComputed = typeof u.isActive === "boolean" ? u.isActive : u.status === "Active";
        const statusLabel = isActiveComputed ? (u.status === "On leave" ? "ลาหยุด" : "ใช้งาน") : "ระงับการใช้งาน";
        return {
          ...u,
          idKey: u.id ?? `${u.name ?? "user"}-${Math.random().toString(36).slice(2, 9)}`,
          isActiveComputed,
          statusLabel,
        };
      }),
    [users]
  );

  const computedTotalItems = typeof totalItems === "number" ? totalItems : rows.length;
  // ใช้ totalPages จาก API ถ้ามี ไม่งั้นคำนวณเอง
  const totalPages = typeof propTotalPages === "number" && propTotalPages > 0
    ? propTotalPages
    : Math.max(1, Math.ceil(computedTotalItems / itemsPerPage));

  const currentRows = isControlled
    ? rows
    : rows.slice((currentPage - 1) * itemsPerPage, (currentPage - 1) * itemsPerPage + itemsPerPage);

  const startIndex = (currentPage - 1) * itemsPerPage;

  const goPage = (newPage: number) => {
    if (newPage < 1) newPage = 1;
    if (newPage > totalPages) newPage = totalPages;
    if (isControlled) {
      onPageChange?.(newPage);
    } else {
      setInternalPage(newPage);
    }
  };

  const renderSkeletonRow = (key: string | number, showIndexCol: boolean) => (
    <TR key={`s-${key}`}>
      {showIndexCol && (
        <TD align="center" className="w-1/12">
          <div className="h-4 w-6 rounded bg-gray-200 animate-pulse" />
        </TD>
      )}
      <TD className="w-2/12 text-left">
        <div className="h-4 w-40 rounded bg-gray-200 animate-pulse" />
      </TD>
      <TD className="w-2/12">
        <div className="h-4 w-28 rounded bg-gray-200 animate-pulse" />
      </TD>
      <TD className="w-3/12">
        <div className="h-4 w-24 rounded bg-gray-200 animate-pulse" />
      </TD>
      <TD align="center" className="w-1/12">
        <div className="h-4 w-12 rounded bg-gray-200 animate-pulse" />
      </TD>
      <TD align="right" className="w-1/12">
        <div className="h-4 w-8 rounded bg-gray-200 animate-pulse" />
      </TD>
    </TR>
  );

  return (
    <div>
      <Table>
        <THead>
          {showIndex && (
            <TH className="w-1/12" align="center">
              ลำดับ
            </TH>
          )}
          <TH className="w-2/12">ชื่อ</TH>
          <TH className="w-2/12">ตำแหน่ง</TH>
          <TH className="w-3/12">อีเมล</TH>
          <TH className="w-1/12 text-center">สถานะใช้งาน</TH>
          <TH className="w-1/12" align="right">จัดการ</TH>
        </THead>

        <TBody>
          {loading ? (
            Array.from({ length: skeletonRows }).map((_, i) => renderSkeletonRow(i, showIndex))
          ) : currentRows.length > 0 ? (
            currentRows.map((u: any, idx: number) => (
              <TR key={String(u.idKey)}>
                {showIndex && <TD align="center" className="w-1/12">{startIndex + idx + 1}</TD>}
                <TD className="w-2/12 text-left">{u.name ?? "-"}</TD>
                <TD className="w-2/12">{u.title ?? "-"}</TD>
                <TD className="w-3/12">
                  <span className="inline-flex items-center rounded-md px-2 py-0.5 text-xs font-medium text-gray-700">
                    {u.department_name ?? "-"}
                  </span>
                </TD>
                <TD align="center" className="w-1/12">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onToggleIsActive?.(u.id);
                    }}
                    aria-pressed={u.isActive}
                    title={u.isActive ? "ระงับการใช้งาน" : "เปิดใช้งาน"}
                    className={`relative inline-flex items-center h-6 w-12 rounded-full transition-colors focus:outline-none ${u.isActive ? "bg-green-600" : "bg-gray-300"}`}
                  >
                    <span className={`inline-block h-4 w-4 transform rounded-full bg-white shadow-sm transition-transform ${u.isActive ? "translate-x-6" : "translate-x-1"}`} />
                    <span className="sr-only">{u.statusLabel}</span>
                  </button>
                </TD>
                <TD align="right" className="w-1/12">
                  <div className="flex items-center justify-end gap-2">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onDetails?.(u);
                      }}
                      className="h-8 w-8 rounded-md hover:bg-blue-600/10 hover:text-blue-700 flex items-center justify-center"
                      title="ดูรายละเอียด"
                    >
                      <Eye className="h-4 w-4" />
                    </button>
                  </div>
                </TD>
              </TR>
            ))
          ) : (
            <TR>
              <TD align="center" colSpan={showIndex ? 6 : 5} className="py-10">
                <div className="space-y-2">
                  <p className="text-xs font-medium text-gray-700">ยังไม่มีผู้ใช้ในระบบ</p>
                  <p className="text-xs text-gray-500">คุณสามารถเพิ่มผู้ใช้ใหม่หรือดูรายการทั้งหมดได้จากหน้าจัดการ</p>
                </div>
              </TD>
            </TR>
          )}
        </TBody>
      </Table>

      <div className="mt-4 flex items-center justify-between px-2 m-4">
        <p className="text-xs text-gray-600 mb-2">
          แสดง {computedTotalItems === 0 ? 0 : startIndex + 1}-{Math.min(startIndex + currentRows.length, computedTotalItems)} จาก {computedTotalItems} รายการ
        </p>

        <div className="flex items-center gap-2">
          <button
            onClick={() => goPage(currentPage - 1)}
            disabled={currentPage === 1 || computedTotalItems === 0}
            className="inline-flex items-center gap-2 rounded-md bg-white px-3 py-2 text-xs shadow-sm hover:bg-gray-50 disabled:opacity-50"
          >
            ก่อนหน้า
          </button>

          <span className="rounded-lg bg-gray-100 px-3 py-1.5 text-xs font-medium text-gray-700">
            หน้า {currentPage} / {totalPages}
          </span>

          <button
            onClick={() => goPage(currentPage + 1)}
            disabled={currentPage === totalPages || computedTotalItems === 0 || disableNext}
            className="inline-flex items-center gap-2 rounded-md bg-white px-3 py-2 text-xs shadow-sm hover:bg-gray-50 disabled:opacity-50"
          >
            ถัดไป
          </button>
        </div>
      </div>
    </div>
  );
}
