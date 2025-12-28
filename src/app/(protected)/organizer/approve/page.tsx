import React from "react";
import Link from "next/link";
import BackGroundLight from "@/components/background/bg-light";

import { getProjectsServer } from "@/api/project.server";
import { buildPageHref } from "@/lib/util";

type SearchParams = Promise<{
  q?: string;
  status?: string;
  name?: string;
  code?: string;
  plan_type?: string;
  is_active?: string;
  department_id?: string;
  start_date?: string;
  page?: string;
}>;
export default async function Page({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const sp = await searchParams;
  const q = (sp.q ?? "").trim();
  const projects = await getProjectsServer(sp);

  const page = Math.max(1, Number(sp.page ?? "1") || 1);
  const limit = 20;
  const hasNext = projects.length === limit;

  return (
    <BackGroundLight>
      <div className="w-full flex py-5 justify-center">
        <div className="lg:max-w-5/6 lg:px-0 px3 w-full">
          <div className="mb-5 flex items-start justify-between gap-3">
            <div>
              <div className="text-2xl font-semibold">อนุมัติเอกสาร</div>
              <div className="mt-1 text-sm text-muted-foreground">
                เลือกโปรเจกต์จากรายการ แล้วกดเข้าไปอนุมัติทีละรายการ
              </div>
            </div>
          </div>

          <form className="mb-4 rounded-xl border border-gray-200 shadow-md bg-white p-4">
            <div className="text-sm font-medium">ค้นหา</div>
            <div className="w-full grid gap-3 lg:gap-5 lg:flex justify-between">
              <div className="lg:flex grid gap-4 w-full">
                <div className="lg:flex grid items-center lg:gap-4 gap-2">
                  <input
                    name="q"
                    defaultValue={q}
                    className=" w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:ring"
                    placeholder="ชื่อโปรเจกต์ / หน่วยงาน / เจ้าของ..."
                  />
                </div>
                <div className="flex items-center">
                  <input
                    name="code"
                    defaultValue={sp.code ?? ""}
                    className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:ring"
                    placeholder="รหัสโครงการ"
                  />
                </div>
                <div className="flex items-center">
                  <select
                    className="w-full rounded-lg border border-gray-200 px-5 py-2 text-sm outline-none focus:ring"
                    name="plan_type"
                    defaultValue={sp.plan_type ?? ""}
                  >
                    <option value="">ทุกประเภท</option>
                    <option value="regular_work">งานประจำ</option>
                    <option value="project">โครงการ</option>
                  </select>
                </div>

                <div className="grid lg:flex items-center gap-2">
                  <label className="text-sm  font-medium">สถานะ</label>
                  <select
                    name="is_active"
                    defaultValue={sp.is_active ?? ""}
                    className="w-full rounded-lg border border-gray-200 px-5 py-2 text-sm outline-none focus:ring"
                  >
                    <option value="">ทั้งหมด</option>
                    <option value="true">Active</option>
                    <option value="false">Inactive</option>
                  </select>
                </div>
              </div>
              <button
                type="submit"
                className="lg:w-40 w-full rounded-lg bg-blue-600 hover:bg-blue-800 px-4 py-2 text-sm font-medium text-white hover:opacity-90"
              >
                ค้นหา
              </button>
            </div>
          </form>

          <div className="rounded-xl w-full border border-gray-200 bg-white">
            <div className="border-b border-gray-200 px-4 py-3 text-base font-semibold">
              รายชื่อโปรเจกต์ ({projects.length})
            </div>

            {projects.length === 0 ? (
              <div className="p-6 text-sm text-muted-foreground">
                ไม่พบข้อมูล
              </div>
            ) : (
              <div className="divide-y divide-gray-300">
                {projects?.map((p) => (
                  <div
                    key={p.id}
                    className="flex flex-col gap-2 px-4  py-4 md:flex-row md:items-center md:justify-between"
                  >
                    <div className="min-w-0">
                      <div className="truncate text-sm text-gray-700 font-medium">
                        {p.name}
                      </div>
                      <div className="mt-1 flex flex-wrap gap-x-3 gap-y-1 text-xs text-muted-foreground">
                        {p.department ? (
                          <span>หน่วยงาน: {p.department}</span>
                        ) : null}
                        {p.owner ? <span>เจ้าของ: {p.owner}</span> : null}
                        {p.type ? <span>ประเภท: {p.type}</span> : null}
                        {p.status ? <span>สถานะ: {p.status}</span> : null}
                        {p.updatedAt ? (
                          <span>อัปเดต: {p.updatedAt}</span>
                        ) : null}
                      </div>
                    </div>

                    <div className="flex shrink-0 gap-2">
                      <Link
                        href={`/organizer/approve/${p.id}/project-detail`}
                        className="rounded-lg border border-gray-200 shadow-sm px-3 py-2 text-sm hover:bg-gray-300"
                      >
                        ดูรายละเอียด
                      </Link>
                      <Link
                        href={`/organizer/approve/${p.id}/approve`}
                        className="rounded-lg bg-green-600 px-3 py-2 text-sm font-medium text-white hover:bg-emerald-800"
                      >
                        เข้าไปอนุมัติ
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="flex items-center justify-between px-4 py-3">
            <div className="text-xs text-gray-500">
              หน้า {page}
              {projects.length > 0 ? ` • แสดง ${projects.length} รายการ` : ""}
            </div>

            <div className="flex gap-2">
              <Link
                aria-disabled={page <= 1}
                className={`rounded-lg  bg-white  shadow-sm px-3 py-2 text-sm hover:bg-gray-300 ${
                  page <= 1
                    ? "pointer-events-none opacity-50"
                    : "hover:bg-gray-100"
                }`}
                href={buildPageHref(sp, Math.max(1, page - 1))}
              >
                 ก่อนหน้า
              </Link>

              <Link
                aria-disabled={!hasNext}
                className={`rounded-lg  bg-white  shadow-sm px-3 py-2 text-sm hover:bg-gray-300 ${
                  !hasNext
                    ? "pointer-events-none opacity-50"
                    : "hover:bg-gray-100"
                }`}
                href={buildPageHref(sp, page + 1)}
              >
                ถัดไป
              </Link>
            </div>
          </div>
        </div>
      </div>
    </BackGroundLight>
  );
}
