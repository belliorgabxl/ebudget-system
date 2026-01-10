import React from "react";
import Link from "next/link";
import BackGroundLight from "@/components/background/bg-light";
import { getPendingApprovalsServer } from "@/api/project.server";
import { buildPageHref } from "@/lib/util";

type SearchParams = Promise<{
  q?: string;
  code?: string;
  plan_type?: string;
  page?: string;
  limit?: string;
}>;

export default async function Page({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const sp = await searchParams;

  const res = await getPendingApprovalsServer(sp);
  const projects = res.data ?? [];
  const pg = res.pagination;

  const page = pg?.page ?? Math.max(1, Number(sp.page ?? "1") || 1);
  const truncateText = (text?: string, max = 100) => {
    if (!text) return "—";
    if (text.length <= max) return text;
    return text.slice(0, max) + "...";
  };
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
                    defaultValue={sp.q ?? ""}
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
                <div className="flex items-center">
                  <select
                    name="limit"
                    defaultValue={sp.limit ?? String(pg?.limit ?? 10)}
                    className="w-full rounded-lg border border-gray-200 px-5 py-2 text-sm outline-none focus:ring"
                  >
                    <option value="10">10</option>
                    <option value="20">20</option>
                    <option value="50">50</option>
                  </select>
                </div>

                <input type="hidden" name="page" value="1" />
              </div>

              <button
                type="submit"
                className="lg:w-40 h-fit  w-full rounded-lg bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-blue-800
                hover:to-blue-800 hover:scale-[102%] px-4 
                py-2 text-sm font-medium text-white hover:opacity-90"
              >
                ค้นหา
              </button>
            </div>
          </form>

          <div className="rounded-xl w-full border border-gray-200 bg-white">
            <div className="border-b border-gray-200 text-indigo-600 px-4 py-3 text-base font-semibold">
              รายชื่อโปรเจกต์ ({pg?.total ?? projects.length})
            </div>

            {projects.length === 0 ? (
              <div className="p-6 text-sm text-muted-foreground">
                ไม่พบข้อมูล
              </div>
            ) : (
              <div className="divide-y divide-gray-300">
                {projects.map((p) => (
                  <div
                    key={p.id}
                    className="flex flex-col gap-2 px-4  py-2 md:flex-row md:items-center md:justify-between"
                  >
                    <div className="min-w-0">
                      <div className="truncate flex items-center gap-4 text-sm text-gray-700 font-medium">
                        <p className="text-green-600">ชื่อโครงการ</p> {p.name}
                      </div>

                      <div className="mt-1 flex flex-wrap gap-x-3 gap-y-1 text-xs text-muted-foreground">
                        {p.code ? (
                          <span className="flex gap-3 items-center">
                            <p className="font-semibold">รหัส:</p> {p.code}
                          </span>
                        ) : null}
                        |
                        <span className="flex gap-3 items-center">
                          <p className="font-semibold line-clamp-1">
                            รายละเอียด:
                          </p>{" "}
                          <p className="lg:block hidden">{truncateText(p.description, 150)}</p>
                          <p className="lg:hidden block">{truncateText(p.description, 45)}</p>
                        </span>
                      </div>
                      <div className="mt-1 flex flex-wrap gap-x-3 gap-y-1 text-xs text-muted-foreground">
                        {p.start_date ? (
                          <span className="flex gap-3 items-center">
                            <p className="font-semibold">เริ่ม:</p>{" "}
                            {p.start_date}
                          </span>
                        ) : null}
                        {p.end_date ? (
                          <span className="flex gap-3 items-center">
                            <p className="font-semibold">สิ้นสุด:</p>{" "}
                            {p.end_date}
                          </span>
                        ) : null}
                      </div>
                    </div>

                    <div className="flex shrink-0 gap-2">
                      <Link
                        href={`/organizer/approve/${p.id}/project-detail`}
                        className="rounded-lg border border-gray-200 px-3 bg-gradient-to-r from-indigo-400 to-blue-500 py-2 
                        text-sm hover:from-blue-800 hover:to-blue-800 text-white"
                      >
                        ดูรายละเอียด
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
              {pg
                ? ` • แสดง ${projects.length} จากทั้งหมด ${pg.total} รายการ`
                : ""}
            </div>

            <div className="flex gap-2">
              <Link
                aria-disabled={!pg?.has_prev}
                className={`rounded-lg bg-white shadow-sm px-3 py-2 text-sm ${
                  !pg?.has_prev
                    ? "pointer-events-none opacity-50"
                    : "hover:bg-gray-100"
                }`}
                href={buildPageHref(sp, Math.max(1, page - 1))}
              >
                ก่อนหน้า
              </Link>

              <Link
                aria-disabled={!pg?.has_next}
                className={`rounded-lg bg-white shadow-sm px-3 py-2 text-sm ${
                  !pg?.has_next
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
