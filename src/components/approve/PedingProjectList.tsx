import React from "react";
import Link from "next/link";
import { checkApprovalPermissionServer } from "@/api/approval.server";
import { cache } from "react";
import ProcessButton from "./ProcessButton";

type ProjectItem = {
  id: string;
  name: string;
  code?: string | null;
  description?: string | null;
  start_date?: string | null;
  end_date?: string | null;
  budget_plan_id?: string | null;
};

type Pagination = {
  total: number;
};

type Props = {
  projects: ProjectItem[];
  pg?: Pagination | null;
};

function truncateText(text?: string | null, max = 100) {
  if (!text) return "—";
  if (text.length <= max) return text;
  return text.slice(0, max) + "...";
}

const getPermCached = cache(async (budgetPlanId: string) => {
  return checkApprovalPermissionServer(budgetPlanId);
});

export default async function PendingProjectList({ projects, pg }: Props) {
  const perms = await Promise.all(
    projects.map(async (p) => {
      const budgetPlanId = p.budget_plan_id;
      if (!budgetPlanId) return { projectId: p.id, canApprove: false };

      try {
        const perm = await getPermCached(budgetPlanId);
        return { projectId: p.id, canApprove: perm.has_permission };
      } catch {
        return { projectId: p.id, canApprove: false };
      }
    })
  );

  const canApproveMap = new Map(perms.map((x) => [x.projectId, x.canApprove]));

  return (
    <div className="rounded-xl w-full border border-gray-200 bg-white">
      <div className="border-b border-gray-200 text-indigo-600 px-4 py-3 text-base font-semibold">
        รายชื่อโปรเจกต์ ({pg?.total ?? projects.length})
      </div>

      {projects.length === 0 ? (
        <div className="p-6 text-sm text-muted-foreground">ไม่พบข้อมูล</div>
      ) : (
        <div className="divide-y divide-gray-300">
          {projects.map((p) => {
            const canApprove = canApproveMap.get(p.id) ?? false;

            return (
              <Link
                href={`/organizer/approve/${p.id}/project-detail`}
                key={p.id}
                className="flex flex-col gap-2 px-4 py-2 md:flex-row md:items-center md:justify-between"
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
                      <p className="font-semibold line-clamp-1">รายละเอียด:</p>{" "}
                      <p className="lg:block hidden">
                        {truncateText(p.description, 150)}
                      </p>
                      <p className="lg:hidden block">
                        {truncateText(p.description, 45)}
                      </p>
                    </span>
                  </div>

                  <div className="mt-1 flex flex-wrap gap-x-3 gap-y-1 text-xs text-muted-foreground">
                    {p.start_date ? (
                      <span className="flex gap-3 items-center">
                        <p className="font-semibold">เริ่ม:</p> {p.start_date}
                      </span>
                    ) : null}
                    {p.end_date ? (
                      <span className="flex gap-3 items-center">
                        <p className="font-semibold">สิ้นสุด:</p> {p.end_date}
                      </span>
                    ) : null}
                  </div>
                </div>

                <div className="grid grid-rows-2 z-10 h-full gap-2 place-items-end">
                  <ProcessButton project_id={p.id} />
                  {canApprove ? (
                    <span
                      className="h-fit rounded-lg border border-green-400 bg-green-50 px-3
                     py-2 text-sm font-medium text-green-700 cursor-text"
                    >
                      รอคุณอนุมัติ
                    </span>
                  ) : (
                    <span
                      className="h-fit rounded-lg border border-gray-400 bg-gray-50 px-3
                     py-2 text-sm font-medium text-gray-700 cursor-text"
                    >
                      รอคนอื่นอนุมัติ
                    </span>
                  )}
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
