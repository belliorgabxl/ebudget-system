import React from "react";
import { checkApprovalPermissionServer } from "@/api/approval.server";
import { cache } from "react";
import { getCurrentUser } from "@/lib/auth";
import ProjectListItem from "./ProjectListItem";

type ProjectItem = {
  id: string;
  name: string;
  code?: string | null;
  description?: string | null;
  start_date?: string | null;
  end_date?: string | null;
  budget_plan_id?: string | null;
  current_approval_level?: number | null;
};

type Pagination = {
  total: number;
};

type Props = {
  projects: ProjectItem[];
  pg?: Pagination | null;
};

const getPermCached = cache(async (budgetPlanId: string) => {
  return checkApprovalPermissionServer(budgetPlanId);
});

export default async function PendingProjectList({ projects, pg }: Props) {
  // Get current user's approval level
  const currentUser = await getCurrentUser();
  const userApprovalLevel = currentUser?.approval_level ?? 0;

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
            const currentApprovalLevel = p.current_approval_level ?? 0;

            // Determine status based on approval levels
            let statusLabel = "";
            let statusClass = "";
            let canAccess = true;

            if (userApprovalLevel === currentApprovalLevel) {
              // ถึงขั้นที่เราต้องอนุมัติแล้ว
              statusLabel = "พร้อมให้คุณอนุมัติ";
              statusClass = "border-green-400 bg-green-50 text-green-700";
              canAccess = true;
            } else if (userApprovalLevel > currentApprovalLevel) {
              // ยังไม่ถึงลำดับเรา
              statusLabel = "รอการอนุมัติจากลำดับก่อนหน้า";
              statusClass = "border-gray-400 bg-gray-50 text-gray-600";
              canAccess = false;
            } else {
              // เราอนุมัติไปแล้ว
              statusLabel = "ลำดับขั้นของคุณได้อนุมัติแล้ว";
              statusClass = "border-blue-400 bg-blue-50 text-blue-700";
              canAccess = true;
            }

            return (
              <ProjectListItem
                key={p.id}
                id={p.id}
                name={p.name}
                code={p.code}
                description={p.description}
                start_date={p.start_date}
                end_date={p.end_date}
                budget_plan_id={p.budget_plan_id}
                statusLabel={statusLabel}
                statusClass={statusClass}
                canAccess={canAccess}
              />
            );
          })}
        </div>
      )}
    </div>
  );
}
