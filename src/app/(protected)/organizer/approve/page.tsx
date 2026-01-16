import React from "react";
import Link from "next/link";
import BackGroundLight from "@/components/background/bg-light";
import { getPendingApprovalsServer } from "@/api/project.server";
import { buildPageHref } from "@/lib/util";
import ApprovalSearchForm from "@/components/approve/ApproveSearchForm";
import PendingProjectList from "@/components/approve/PedingProjectList";

type SearchParams = Promise<{
  q?: string;
  code?: string;
  plan_type?: string;
  page?: string;
  limit?: string;
}>;

export default async function Page({ searchParams }: { searchParams: SearchParams }) {
  const sp = await searchParams;

  const res = await getPendingApprovalsServer(sp);
  const projects = res.data ?? [];
  const pg = res.pagination;

  const page = pg?.page ?? Math.max(1, Number(sp.page ?? "1") || 1);

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

          <ApprovalSearchForm sp={sp} defaultLimit={pg?.limit ?? 10} />

          <PendingProjectList projects={projects} pg={pg ? { total: pg.total } : null} />

          <div className="flex items-center justify-between px-4 py-3">
            <div className="text-xs text-gray-500">
              หน้า {page}
              {pg ? ` • แสดง ${projects.length} จากทั้งหมด ${pg.total} รายการ` : ""}
            </div>

            <div className="flex gap-2">
              <Link
                aria-disabled={!pg?.has_prev}
                className={`rounded-lg bg-white shadow-sm px-3 py-2 text-sm ${
                  !pg?.has_prev ? "pointer-events-none opacity-50" : "hover:bg-gray-100"
                }`}
                href={buildPageHref(sp, Math.max(1, page - 1))}
              >
                ก่อนหน้า
              </Link>

              <Link
                aria-disabled={!pg?.has_next}
                className={`rounded-lg bg-white shadow-sm px-3 py-2 text-sm ${
                  !pg?.has_next ? "pointer-events-none opacity-50" : "hover:bg-gray-100"
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
