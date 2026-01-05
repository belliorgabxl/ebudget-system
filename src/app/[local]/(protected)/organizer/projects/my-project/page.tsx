"use client";

import { EmptyState } from "@/components/project/EmptyState";
import { Stat } from "@/components/project/Helper";
import { LoadData } from "@/components/project/LoadData";
import { Plus } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";

import type { GetProjectsByOrgRespond } from "@/dto/dashboardDto";
import { GetProjectsByOrgFromApi } from "@/api/dashboard";
import { ExportPDFDocument } from "@/components/button/ExportProjectButton";
import BackGroundLight from "@/components/background/bg-light";

export default function Page() {
  const [projects, setProjects] = useState<GetProjectsByOrgRespond[]>([]);
  const [fetchDataLoader, setFetchDataLoader] = useState<boolean>(false);

  const hasProjects = projects.length > 0;

  useEffect(() => {
    let cancelled = false;

    const loadProjects = async () => {
      try {
        setFetchDataLoader(true);
        const apiProjects = await GetProjectsByOrgFromApi();
        if (cancelled) return;
        setProjects(apiProjects ?? []);
      } catch (err) {
        console.error("[Page] loadProjects error:", err);
        if (!cancelled) setProjects([]);
      } finally {
        if (!cancelled) setFetchDataLoader(false);
      }
    };

    loadProjects();
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <BackGroundLight>
      <main className="w-full grid place-items-center lg:px-18 md:px-10 sm:px-5 px-1 py-6">
        {fetchDataLoader ? (
          <LoadData />
        ) : (
          <>
            {!hasProjects ? (
              <EmptyState />
            ) : (
              <div className="">
                <div className="w-full mb-6 flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <h1 className="text-xl font-semibold text-gray-900">
                      โปรเจ็คทั้งหมด
                    </h1>
                    <p className="text-sm text-gray-600">
                      แสดงเฉพาะโปรเจ็กต์ที่คุณเป็นเจ้าของหรือผู้รับผิดชอบ
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <Link
                      href="/organizer/projects/new"
                      className="inline-flex items-center duration-400 gap-2
                     rounded-lg bg-gradient-to-r from-indigo-600 to-purple-600 hover:scale-[102%] px-3.5 py-2 
                     text-sm font-medium text-white hover:bg-black"
                    >
                      <div className="p-0.5 border-2 border-white rounded-full">
                        <Plus className="h-4 w-4 text-white " />
                      </div>
                      เพิ่มโปรเจ็คใหม่
                    </Link>
                  </div>
                </div>

                <section className="relative mb-5">
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    <div className="relative w-fit lg:px-10  overflow-hidden rounded-2xl bg-gradient-to-br from-indigo-600  to-sky-200 px-6 py-2 text-white shadow-md shadow-indigo-300/30">
                      <div className="absolute -right-4 -top-4 h-24 w-24 rounded-full bg-white/20 blur-2xl" />
                      <div className="absolute -left-8 bottom-0 h-36 w-36 rounded-full bg-white/10 blur-3xl" />

                      <div className="relative flex items-center lg:gap-8 gap-4">
                        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white/20 backdrop-blur-xl shadow-inner shadow-black/10">
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-7 w-7 text-white drop-shadow-lg"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                            strokeWidth={1.5}
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              d="M3 7.5l9-4.5 9 4.5M3 7.5l9 4.5 9-4.5M3 7.5v9l9 4.5 9-4.5v-9"
                            />
                          </svg>
                        </div>

                        <div className="flex gap-4 items-center">
                          <span className="text-2xl font-extrabold tracking-tight drop-shadow">
                            {projects.length}
                          </span>
                          <span className="text-xl uppercase tracking-wide text-white font-medium">
                            โปรเจ็ค
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </section>

                <section className=" relative sm:mx-0 overflow-x-auto ">
                  <div className="w-full overflow-y-auto rounded  bg-white">
                    <table className="table-auto min-w-[1100px] text-sm">
                      <thead className="bg-blue-200  text-gray-700">
                        <tr>
                          <Th className="w-15 text-center">No.</Th>
                          <Th className="w-100">ชื่อโครงการ</Th>
                          <Th className="w-50 whitespace-nowrap">
                            รหัสโครงการ
                          </Th>
                          <Th className="w-20 whitespace-nowrap">หน่วยงาน</Th>
                          <Th className="w-50 whitespace-nowrap">ระยะเวลา</Th>
                          <Th className="w-45 whitespace-nowrap">สถานที่</Th>
                          <Th className="w-50">ไฟล์</Th>
                          <Th className="w-40 text-center">จัดการ</Th>
                        </tr>
                      </thead>

                      <tbody className="divide-y divide-gray-100">
                        {projects.map((p, idx) => (
                          <tr
                            key={p.id}
                            className={`${idx % 2 != 0 ? "bg-slate-100" : ""}`}
                          >
                            <Td className="text-center">{idx + 1}</Td>
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

                            <Td className="text-gray-700 text-start pl-3 py-1.5">
                              {p.code || "—"}
                            </Td>

                            <Td className="text-gray-700 text-xs py-1.5">
                              {p.department_id
                                ? p.department_id.slice(0, 10) + "....."
                                : "—"}
                            </Td>

                            <Td className="text-gray-700 text-xs text-center py-1.5">
                              {renderDateRange(p.start_date, p.end_date)}
                            </Td>

                            <Td className="text-green-700 text-center py-1.5">
                              {p.location ? p.location.slice(0, 30) : "—"}
                            </Td>

                            <Td className="text-gray-700 py-3 flex justify-center items-center">
                              <ExportPDFDocument id={p.id} />
                            </Td>

                            <Td className="text-center py-1.5">
                              <div className="flex  flex-col items-center gap-1">
                                <Link
                                  href={`/organizer/projects/details/${p.id}`}
                                  className="inline-flex items-center rounded-md border text-white
                                   bg-slate-400 border-gray-300 px-2 py-1 text-xs  hover:bg-gray-600"
                                >
                                  ดูรายละเอียด
                                </Link>
                              </div>
                            </Td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </section>
              </div>
            )}
          </>
        )}
      </main>
    </BackGroundLight>
  );
}

function Th({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <th
      className={`px-3 py-2 lg:text-base  text-sm font-semibold text-center text-gray-700 ${className}`}
    >
      {children}
    </th>
  );
}

function Td({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return <td className={className}>{children}</td>;
}

function renderDateRange(start?: string | Date, end?: string | Date): string {
  const fmt = (d?: string | Date) => {
    if (!d) return "";
    const iso = typeof d === "string" ? d : d.toString();
    const date = new Date(iso);
    if (Number.isNaN(date.getTime())) return "";
    return date.toLocaleDateString("th-TH", { dateStyle: "medium" });
  };

  const s = fmt(start);
  const e = fmt(end);

  if (!s && !e) return "—";
  if (s && !e) return s;
  if (!s && e) return e;
  return `${s} - ${e}`;
}
