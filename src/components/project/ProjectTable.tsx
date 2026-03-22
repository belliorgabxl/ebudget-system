import Link from "next/link";
import type { GetProjectsByOrgRespond } from "@/dto/dashboardDto";
import { renderDateRange } from "@/lib/helper";
import { Td, Th } from "./ProjectHeader";
import { ChevronUp, ChevronDown, ChevronsUpDown } from "lucide-react";

type SortDir = "asc" | "desc";

type Props = {
  projects: GetProjectsByOrgRespond[];
  page: number;
  limit: number;
  sortBy?: string;
  sortDir?: SortDir;
  onSort?: (field: string) => void;
};

const getStatusBadge = (status?: string) => {
  const statusConfig: Record<string, { label: string; className: string }> = {
    draft: {
      label: "กำลังร่าง",
      className: "bg-gray-100 text-gray-700 border-gray-300",
    },
    pending_approval: {
      label: "รออนุมัติ",
      className: "bg-yellow-100 text-yellow-800 border-yellow-300",
    },
    in_progress: {
      label: "กำลังดำเนินการ",
      className: "bg-blue-100 text-blue-800 border-blue-300",
    },
    completed: {
      label: "เสร็จสิ้น",
      className: "bg-green-100 text-green-800 border-green-300",
    },
    cancelled: {
      label: "ยกเลิก",
      className: "bg-gray-100 text-gray-600 border-gray-300",
    },
    rejected: {
      label: "ถูกปฏิเสธ",
      className: "bg-red-100 text-red-800 border-red-300",
    },
    out_of_date: {
      label: "หมดอายุ",
      className: "bg-orange-100 text-orange-800 border-orange-300",
    },
  };

  const config = status ? statusConfig[status] : null;

  if (!config) {
    return (
      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-600 border border-gray-300">
        —
      </span>
    );
  }

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${config.className}`}
    >
      {config.label}
    </span>
  );
};

function SortIcon({ field, sortBy, sortDir }: { field: string; sortBy?: string; sortDir?: string }) {
  if (sortBy !== field) return <ChevronsUpDown className="h-3.5 w-3.5 text-gray-400" />;
  return sortDir === "asc"
    ? <ChevronUp className="h-3.5 w-3.5 text-indigo-700" />
    : <ChevronDown className="h-3.5 w-3.5 text-indigo-700" />;
}

function SortableTh({ field, sortBy, sortDir, onSort, children, className = "" }: {
  field: string;
  sortBy?: string;
  sortDir?: string;
  onSort?: (f: string) => void;
  children: React.ReactNode;
  className?: string;
}) {
  const active = sortBy === field;
  return (
    <th
      onClick={() => onSort?.(field)}
      className={`px-3 py-2 text-sm font-semibold text-center text-gray-700 select-none
        ${onSort ? "cursor-pointer hover:bg-blue-300 transition-colors" : ""}
        ${active ? "bg-blue-300" : ""}
        ${className}`}
    >
      <span className="inline-flex items-center justify-center gap-1">
        {children}
        <SortIcon field={field} sortBy={sortBy} sortDir={sortDir} />
      </span>
    </th>
  );
}

export function ProjectsTable({ projects, page, limit, sortBy, sortDir, onSort }: Props) {
  return (
    <section className="w-full grid place-items-center relative sm:mx-0 overflow-x-auto ">
      <div className="w-full overflow-y-auto rounded bg-white">
        <table className="w-full min-w-[1100px] text-sm">
          <thead className="bg-blue-200 text-gray-700">
            <tr>
              <Th className="w-15 text-center">No.</Th>
              <Th className="w-100">ชื่อโครงการ</Th>
              <Th className="w-20 text-xs whitespace-nowrap">รหัสโครงการ</Th>
              <Th className="w-50 whitespace-nowrap">หน่วยงาน</Th>
              <SortableTh field="start_date" sortBy={sortBy} sortDir={sortDir} onSort={onSort} className="w-50 whitespace-nowrap">
                ระยะเวลา
              </SortableTh>
              <SortableTh field="status" sortBy={sortBy} sortDir={sortDir} onSort={onSort} className="w-45 whitespace-nowrap">
                สถานะ
              </SortableTh>
              <SortableTh field="approved_budget" sortBy={sortBy} sortDir={sortDir} onSort={onSort} className="w-50">
                งบประมาณที่อนุมัติ
              </SortableTh>
              <Th className="w-40 text-center">จัดการ</Th>
            </tr>
          </thead>

          <tbody className="divide-y divide-gray-100">
            {projects.map((p, idx) => {
              const rowNo = (page - 1) * limit + (idx + 1);

              return (
                <tr
                  key={p.id}
                  className={`${idx % 2 != 0 ? "bg-slate-100" : ""}`}
                >
                  <Td className="text-center">{rowNo}</Td>

                  <Td>
                    <div className="flex flex-col py-1.5">
                      <span className="font-medium text-blue-900 pl-4 line-clamp-1">
                        {p.name || "ไม่ระบุชื่อโครงการ"}
                      </span>
                      {p.rationale ? (
                        <span className="text-xs text-gray-500 line-clamp-1 pl-4">
                          {p.rationale}
                        </span>
                      ) : null}
                    </div>
                  </Td>

                  <Td className="text-gray-700 text-xs text-start pl-3 py-1.5">
                    {p.code || "—"}
                  </Td>

                  <Td className="text-gray-700 text-xs py-1.5">
                    {p.department_id ? p.department_name : "—"}
                  </Td>

                  <Td className="text-gray-700 text-xs text-center py-1.5">
                    {renderDateRange(p.start_date, p.end_date)}
                  </Td>

                  <Td className="text-center py-1.5">
                    {getStatusBadge(p.status)}
                  </Td>

                  <Td className="text-gray-700 text-xs text-center py-1.5 pr-4">
                    {p.approved_budget ? p.approved_budget.toLocaleString('th-TH', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : "—"}
                  </Td>

                  <Td className="text-center py-1.5">
                    <div className="flex flex-col items-center gap-1">
                      <Link
                        href={`/organizer/projects/${p.id}/details`}
                        className="inline-flex items-center rounded-md border text-white
                          bg-slate-400 border-gray-300 px-2 py-1 text-xs hover:bg-gray-600"
                      >
                        ดูรายละเอียด
                      </Link>
                    </div>
                  </Td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </section>
  );
}

