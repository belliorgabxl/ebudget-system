"use client";

import { EmptyState } from "@/components/project/EmptyState";
import { LoadData } from "@/components/project/LoadData";
import { useEffect, useState } from "react";
import type { GetProjectsByOrgRespond, Pagination, ProjectsQuery } from "@/dto/dashboardDto";
import { GetProjectsByOrgFromApi } from "@/api/dashboard";
import BackGroundLight from "@/components/background/bg-light";
import { ProjectsPagination } from "@/components/project/ProjectPagination";
import { ProjectsHeader } from "@/components/project/ProjectHeader";
import { ProjectsSummaryCard } from "@/components/project/ProjectSummaryCard";
import { ProjectsTable } from "@/components/project/ProjectTable";
import { Search, X, SlidersHorizontal, ChevronDown, ChevronUp } from "lucide-react";

const STATUS_OPTIONS = [
  { value: "", label: "ทุกสถานะ" },
  { value: "draft", label: "กำลังร่าง" },
  { value: "pending_approval", label: "รออนุมัติ" },
  { value: "in_progress", label: "กำลังดำเนินการ" },
  { value: "approved", label: "อนุมัติแล้ว" },
  { value: "completed", label: "เสร็จสิ้น" },
  { value: "cancelled", label: "ยกเลิก" },
  { value: "rejected", label: "ถูกปฏิเสธ" },
];

type SortDir = "asc" | "desc";

type FilterState = {
  name: string;
  code: string;
  status: string;
  department_name: string;
  date_from: string;
  date_to: string;
  budget_min: string;
  budget_max: string;
};

const INITIAL_FILTERS: FilterState = {
  name: "",
  code: "",
  status: "",
  department_name: "",
  date_from: "",
  date_to: "",
  budget_min: "",
  budget_max: "",
};

export default function AllProjectPage() {
  const [projects, setProjects] = useState<GetProjectsByOrgRespond[]>([]);
  const [fetchDataLoader, setFetchDataLoader] = useState<boolean>(false);
  const [page, setPage] = useState<number>(1);
  const [limit] = useState<number>(15);
  const [pg, setPg] = useState<Pagination | null>(null);

  const [form, setForm] = useState<FilterState>(INITIAL_FILTERS);
  const [applied, setApplied] = useState<FilterState>(INITIAL_FILTERS);
  const [filterOpen, setFilterOpen] = useState(false);

  const [sortBy, setSortBy] = useState("created_at");
  const [sortDir, setSortDir] = useState<SortDir>("desc");

  const setF = (field: keyof FilterState, val: string) =>
    setForm((prev) => ({ ...prev, [field]: val }));

  const handleSearch = () => {
    setApplied({ ...form });
    setPage(1);
  };

  const handleClear = () => {
    setForm(INITIAL_FILTERS);
    setApplied(INITIAL_FILTERS);
    setPage(1);
  };

  const handleSort = (field: string) => {
    if (sortBy === field) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortBy(field);
      setSortDir("desc");
    }
    setPage(1);
  };

  const hasProjects = projects.length > 0;

  const isFiltered =
    applied.name !== "" ||
    applied.code !== "" ||
    applied.status !== "" ||
    applied.department_name !== "" ||
    applied.date_from !== "" ||
    applied.date_to !== "" ||
    applied.budget_min !== "" ||
    applied.budget_max !== "";

  useEffect(() => {
    let cancelled = false;

    const loadProjects = async () => {
      try {
        setFetchDataLoader(true);

        const query: ProjectsQuery = {
          page,
          limit,
          ...(applied.name && { name: applied.name }),
          ...(applied.code && { code: applied.code }),
          ...(applied.status && { status: applied.status }),
          ...(applied.department_name && { department_name: applied.department_name }),
          ...(applied.date_from && { start_date: applied.date_from }),
          ...(applied.date_to && { end_date: applied.date_to }),
          ...(applied.budget_min && { budget_min: applied.budget_min }),
          ...(applied.budget_max && { budget_max: applied.budget_max }),
          sort_by: sortBy,
          sort_dir: sortDir,
          // No my_projects_only — show all org projects
        };

        const res = await GetProjectsByOrgFromApi(query);
        if (cancelled) return;

        if (!res) {
          setProjects([]);
          setPg(null);
          return;
        }

        setProjects(res.data ?? []);
        setPg(res.pagination ?? null);
      } catch (err) {
        console.error("[AllProjectPage] loadProjects error:", err);
        if (!cancelled) {
          setProjects([]);
          setPg(null);
        }
      } finally {
        if (!cancelled) setFetchDataLoader(false);
      }
    };

    loadProjects();
    return () => {
      cancelled = true;
    };
  }, [page, limit, applied, sortBy, sortDir]);

  const canPrev = !!pg?.has_prev && page > 1;
  const canNext = !!pg?.has_next;

  return (
    <BackGroundLight>
      <main className="w-full grid place-items-center lg:px-18 md:px-10 sm:px-5 px-1 py-6">
        <div className="lg:px-20 lg:pt-0 pt-10 px-2 w-full">
          <ProjectsHeader
            title="โครงการทั้งหมด"
            subtitle="แสดงโครงการทั้งหมดในองค์กร — ดูได้อย่างเดียว ไม่สามารถแก้ไขได้"
            showCreateButton={false}
            readOnly={true}
          />
          <div className="flex items-center justify-between gap-3 mb-2">
            <ProjectsSummaryCard total={pg?.total} />
            <div className="flex items-center gap-2">
              <button
                onClick={() => setFilterOpen((o) => !o)}
                className={`inline-flex items-center gap-2 px-3 py-2 text-sm rounded-lg border transition-colors
                  ${filterOpen
                    ? "bg-indigo-50 border-indigo-300 text-indigo-700"
                    : "bg-white border-gray-300 text-gray-600 hover:bg-gray-50"
                  }`}
              >
                <SlidersHorizontal className="h-4 w-4" />
                ตัวกรองการค้นหา
                {filterOpen
                  ? <ChevronUp className="h-4 w-4" />
                  : <ChevronDown className="h-4 w-4" />
                }
                {isFiltered && (
                  <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-indigo-600 text-white text-xs font-bold">
                    {[applied.name, applied.code, applied.status, applied.department_name, applied.date_from, applied.date_to, applied.budget_min, applied.budget_max].filter(Boolean).length}
                  </span>
                )}
              </button>
              {isFiltered && (
                <button
                  onClick={handleClear}
                  className="inline-flex items-center gap-1 px-3 py-2 text-sm rounded-lg text-red-600 hover:bg-red-50 border border-red-200"
                >
                  <X className="h-3.5 w-3.5" />
                  ล้างตัวกรอง
                </button>
              )}
            </div>
          </div>

          {/* Filter panel */}
          {filterOpen && (
            <div className="bg-white border border-gray-200 rounded-xl p-4 mb-4 space-y-3 shadow-sm">
              <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                <input
                  type="text"
                  placeholder="ชื่อโครงการ"
                  className="px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-400"
                  value={form.name}
                  onChange={(e) => setF("name", e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                />
                <input
                  type="text"
                  placeholder="รหัสโครงการ"
                  className="px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-400"
                  value={form.code}
                  onChange={(e) => setF("code", e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                />
                <input
                  type="text"
                  placeholder="หน่วยงาน"
                  className="px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-400"
                  value={form.department_name}
                  onChange={(e) => setF("department_name", e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                />
                <select
                  className="px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-400 bg-white"
                  value={form.status}
                  onChange={(e) => setF("status", e.target.value)}
                >
                  {STATUS_OPTIONS.map((o) => (
                    <option key={o.value} value={o.value}>
                      {o.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                <div>
                  <label className="block text-xs text-gray-500 mb-1">ระยะเวลา เริ่ม</label>
                  <input
                    type="date"
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-400"
                    value={form.date_from}
                    onChange={(e) => setF("date_from", e.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-500 mb-1">ระยะเวลา สิ้นสุด</label>
                  <input
                    type="date"
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-400"
                    value={form.date_to}
                    onChange={(e) => setF("date_to", e.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-500 mb-1">งบประมาณต่ำสุด (บาท)</label>
                  <input
                    type="number"
                    min="0"
                    placeholder="0"
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-400"
                    value={form.budget_min}
                    onChange={(e) => setF("budget_min", e.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-500 mb-1">งบประมาณสูงสุด (บาท)</label>
                  <input
                    type="number"
                    min="0"
                    placeholder="ไม่จำกัด"
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-400"
                    value={form.budget_max}
                    onChange={(e) => setF("budget_max", e.target.value)}
                  />
                </div>
              </div>

              <div className="flex gap-2 justify-end pt-1">
                <button
                  onClick={handleSearch}
                  disabled={fetchDataLoader}
                  className="inline-flex items-center gap-2 px-5 py-2 text-sm font-medium rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white disabled:opacity-60 transition"
                >
                  <Search className="h-4 w-4" />
                  ค้นหา
                </button>
              </div>
            </div>
          )}
        </div>

        {fetchDataLoader ? (
          <LoadData />
        ) : !hasProjects ? (
          <div className="lg:px-20 px-2 w-full">
            {isFiltered ? (
              <div className="rounded-2xl border border-dashed border-gray-300 bg-gray-50 p-10 text-center">
                <div className="mx-auto mb-3 h-12 w-12 rounded-full bg-white shadow grid place-items-center text-xl">
                  🔍
                </div>
                <h3 className="text-base font-semibold text-gray-900">ไม่พบโครงการที่ตรงกับเงื่อนไข</h3>
                <p className="mt-1 text-sm text-gray-600">ลองปรับเงื่อนไขการค้นหาแล้วกดค้นหาใหม่</p>
                <button
                  onClick={handleClear}
                  className="mt-4 inline-flex items-center gap-2 px-4 py-2 text-sm rounded-lg border border-gray-300 hover:bg-gray-100"
                >
                  <X className="h-4 w-4" />
                  ล้างตัวกรอง
                </button>
              </div>
            ) : (
              <EmptyState />
            )}
          </div>
        ) : (
          <div className="flex justify-center lg:px-20 px-0 w-full">
            <section className="w-full grid place-items-center relative sm:mx-0 overflow-x-auto">
              <div className="w-full overflow-y-auto rounded bg-white">
                <ProjectsTable
                  projects={projects}
                  page={page}
                  limit={limit}
                  sortBy={sortBy}
                  sortDir={sortDir}
                  onSort={handleSort}
                  readOnly={true}
                />
              </div>

              <ProjectsPagination
                page={page}
                pg={pg}
                canPrev={canPrev}
                canNext={canNext}
                onPrev={() => setPage((p) => Math.max(1, p - 1))}
                onNext={() => setPage((p) => p + 1)}
              />
            </section>
          </div>
        )}
      </main>
    </BackGroundLight>
  );
}
