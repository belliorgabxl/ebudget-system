"use client";

import { useState, useMemo } from "react";
import { Eye, Edit, FileX, ChevronLeft, ChevronRight } from "lucide-react";
import Link from "next/link";
import type { GetProjectsByOrgRespond } from "@/dto/dashboardDto";

interface ProjectsTableProps {
  filters?: Record<string, string>;
  projects: GetProjectsByOrgRespond[];
}

export function ProjectsTable({ projects = [] }: ProjectsTableProps) {
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const formatMoney = (v?: number | string) => {
    if (v == null || v === "") return "-";
    const n = typeof v === "string" ? Number(v) : v;
    if (Number.isNaN(n)) return String(v);
    return n.toLocaleString("th-TH", {
      style: "currency",
      currency: "THB",
      maximumFractionDigits: 0,
    });
  };

  const formatDate = (iso?: string | null) => {
    if (!iso) return "";
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) return iso;
    return d.toLocaleDateString("th-TH", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const formatPeriod = (start?: string | null, end?: string | null) => {
    const s = formatDate(start ?? undefined);
    const e = formatDate(end ?? undefined);
    if (s && e) return `${s} — ${e}`;
    return s || e || "-";
  };

  const rows = useMemo(() => {
    if (!Array.isArray(projects)) return [];

    return projects.map((p) => {
      const deptName =
        (p as any).department?.name ??
        (p as any).department_name ??
        (p as any).department_id ??
        "-";

      const type = p.plan_type ?? "-";

      const budgetPlans = (p as any).budget_plans;
      const budgetTotal = Array.isArray(budgetPlans)
        ? budgetPlans.reduce(
            (acc: number, bp: any) =>
              acc + (Number(bp?.budget_amount ?? 0) || 0),
            0
          )
        : 0;

      const period = formatPeriod(p.start_date as any, p.end_date as any);

      return {
        id: p.id,
        code: (p as any).code ?? "-",
        name: p.name ?? "-",
        dept: deptName,
        type,
        budget: budgetTotal,
        period,
      };
    });
  }, [projects]);

  const totalPages = Math.max(1, Math.ceil(rows.length / itemsPerPage));
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentProjects = rows.slice(startIndex, endIndex);

  return (
    <div className="rounded-lg border  border-gray-200 bg-white shadow-sm transition-shadow hover:shadow-md">
      <div className="flex items-center justify-between border-b border-gray-200 px-4 py-3">
        <div>
          <h3 className="text-sm font-semibold text-gray-900">
            รายการโครงการทั้งหมด
          </h3>
          <p className="mt-1 text-xs text-gray-500">จัดการและติดตามโครงการ</p>
        </div>

        <div className="flex items-center gap-2">
          <span className="rounded-md bg-gray-100 px-2.5 py-1 text-xs font-medium text-gray-700">
            {rows.length} โครงการ
          </span>
          <Link
            href="/organizer/projects/my-project"
            className="text-xs text-gray-600 hover:text-indigo-700 hover:underline"
          >
            ทั้งหมด
          </Link>
        </div>
      </div>

      <div className="p-4">
        <div className="overflow-x-auto rounded-xl border border-gray-200 shadow-sm">
          <table className="w-full border-collapse text-xs">
            <thead>
              <tr className="bg-gray-50 text-gray-900">
                <th className="w-[10%] px-3 py-2 text-center font-semibold">
                  รหัส
                </th>
                <th className="w-[25%] px-3 py-2 text-center font-semibold">
                  ชื่อโครงการ
                </th>
                <th className="w-[15%] px-3 py-2 text-center font-semibold">
                  หน่วยงาน
                </th>
                <th className="w-[15%] px-3 py-2 text-center font-semibold">
                  งบประมาณ
                </th>
                <th className="w-[15%] px-3 py-2 text-center font-semibold">
                  ระยะเวลา
                </th>
                <th className="w-[10%] px-3 py-2 text-center font-semibold">
                  จัดการ
                </th>
              </tr>
            </thead>

            <tbody>
              {currentProjects.length > 0 ? (
                currentProjects.map((p, i) => (
                  <tr
                    key={p.id ?? i}
                    className="border-t border-gray-200 hover:bg-gray-50"
                  >
                    <td className="px-3 py-2 font-medium text-gray-900">
                      {p.code}
                    </td>

                    <td className="px-3 py-2 font-medium text-gray-900">
                      {p.name}
                    </td>

                    <td className="px-3 py-2 text-start">
                      <span className="inline-flex items-start rounded-md border border-gray-200 px-2 py-0.5 text-[11px] font-medium text-gray-700">
                        {p.dept}
                      </span>
                    </td>

                    <td className="px-3 py-2 text-center font-semibold text-gray-700">
                      {formatMoney(p.budget)}
                    </td>

                    <td className="px-3 py-2 text-start text-gray-700">
                      {p.period}
                    </td>

                    <td className="px-3 py-2">
                      <div className="flex items-start justify-center gap-1">
                        <button
                          className="h-8 w-8 rounded-md hover:bg-blue-600/10 hover:text-blue-700"
                          title="ดู"
                        >
                          <Eye className="mx-auto h-4 w-4" />
                        </button>
                        <button
                          className="h-8 w-8 rounded-md hover:bg-blue-600/10 hover:text-blue-700"
                          title="แก้ไข"
                        >
                          <Edit className="mx-auto h-4 w-4" />
                        </button>
                        <button
                          className="h-8 w-8 rounded-md hover:bg-red-600/10 hover:text-red-700"
                          title="ลบ"
                        >
                          <FileX className="mx-auto h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan={7}
                    className="px-3 py-10 text-center text-sm text-gray-500"
                  >
                    ยังไม่มีข้อมูลโครงการ
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        <div className="mt-6 flex items-center justify-between">
          <p className="text-xs font-medium text-gray-600">
            แสดง {rows.length === 0 ? 0 : startIndex + 1}-
            {Math.min(endIndex, rows.length)} จาก {rows.length} รายการ
          </p>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1 || rows.length === 0}
              className="inline-flex items-center gap-2 rounded-md border border-gray-200 bg-white px-3 py-2 text-xs shadow-sm hover:bg-gray-50 disabled:opacity-50"
            >
              <ChevronLeft className="h-4 w-4" />
              ก่อนหน้า
            </button>

            <span className="rounded-lg bg-gray-100 px-3 py-1.5 text-xs font-medium text-gray-700">
              หน้า {currentPage} / {totalPages}
            </span>

            <button
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages || rows.length === 0}
              className="inline-flex items-center gap-2 rounded-md border border-gray-200 bg-white px-3 py-2 text-xs shadow-sm hover:bg-gray-50 disabled:opacity-50"
            >
              ถัดไป
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
