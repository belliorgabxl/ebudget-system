import Link from "next/link";
import { fetchProjectInformationServer } from "@/api/project.server";
import type { ProjectInformationResponse } from "@/dto/projectDto";

import { toThaiDate } from "@/lib/util";
import SubmitApprovalClient from "@/components/project/approval/SubmitApproval";
import BackGroundLight from "@/components/background/bg-light";
import { Info } from "@/components/approve/InfoBox";
import { ProjectIcon } from "@/components/project/Helper";
import { nestGet } from "@/lib/server-api";
import { CheckCircle2, Users, ShieldCheck } from "lucide-react";

type PageParams = Promise<{ id: string }>;

type WorkflowLevel = {
  level_number: number;
  department_name?: string | null;
  backup_user_name?: string | null;
  is_active: boolean;
};

async function fetchApprovalFlow(budgetPlanId: string): Promise<WorkflowLevel[]> {
  try {
    // Step 1: get budget plan to extract organization_id
    const bpRes = await nestGet<any>(`/budget-plans/${budgetPlanId}`);
    if (!bpRes.success) return [];
    const orgId: string = bpRes.data?.organization_id ?? "";
    if (!orgId) return [];

    // Step 2: get workflow config for that organization
    const cfgRes = await nestGet<any>(`/approval-workflow-config/organization/${orgId}`);
    if (!cfgRes.success) return [];
    const levels: WorkflowLevel[] = Array.isArray(cfgRes.data?.levels) ? cfgRes.data.levels : [];
    return levels.filter((l) => l.is_active).sort((a, b) => a.level_number - b.level_number);
  } catch {
    return [];
  }
}

export default async function Page({ params }: { params: PageParams }) {
  const { id: projectId } = await params;

  let project: ProjectInformationResponse;
  try {
    project = await fetchProjectInformationServer(projectId);
  } catch {
    return (
      <main className="mx-auto max-w-3xl p-6">
        <div className="rounded-2xl border bg-white p-6 shadow-sm">
          <h1 className="text-xl font-semibold text-gray-900">
            ไม่พบโครงการ
          </h1>
          <p className="mt-2 text-sm text-gray-600">
            โครงการอาจถูกลบหรือคุณไม่มีสิทธิ์เข้าถึง
          </p>
          <div className="mt-5">
            <Link
              href="/organizer/projects/my-project"
              className="text-indigo-600 hover:underline"
            >
              กลับไปยัง My Project
            </Link>
          </div>
        </div>
      </main>
    );
  }

  const name = project.project_name ?? "—";
  const code = (project as any).project_code ?? "—";
  const planType = (project as any).plan_type ?? "—";
  const department = project.department_name ?? "—";
  const owner = (project as any).owner_user ?? "—";
  const start = toThaiDate((project as any).start_date);
  const end = toThaiDate((project as any).end_date);
  const budgetTotal =
    typeof project.budget_amount === "number" ? project.budget_amount : 0;

  // Fetch approval flow for this budget plan
  const approvalLevels = project.budget_plan_id
    ? await fetchApprovalFlow(project.budget_plan_id)
    : [];

  const levelLabelMap: Record<number, { icon: React.ReactNode; label: string }> = {
    1: { icon: <Users className="h-4 w-4 text-indigo-500" />, label: "หัวหน้าแผนก" },
    2: { icon: <ShieldCheck className="h-4 w-4 text-violet-500" />, label: "ฝ่ายวางแผน/งบประมาณ" },
    3: { icon: <CheckCircle2 className="h-4 w-4 text-emerald-500" />, label: "ผู้อำนวยการ" },
  };

  return (
    <BackGroundLight>
      <div className="w-full py-5 flex justify-center ">
        <main className="w-full lg:max-w-3xl p-6">
          <div className="rounded-2xl border border-gray-300 bg-white p-6 shadow-xl">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h1 className="text-xl font-semibold">ส่งยื่นเสนอโครงการ</h1>
                <p className="mt-1 text-sm text-slate-600">
                  ตรวจสอบรายละเอียดหลัก ๆ แล้วกดส่งอนุมัติได้เลย
                </p>
              </div>

              <ProjectIcon />
            </div>

            <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Info label="ชื่อโครงการ" value={name} />
              <Info label="รหัสโครงการ" value={code} />
              <Info label="ประเภท" value={planType} />
              <Info label="หน่วยงาน" value={department} />
              <Info label="ผู้รับผิดชอบ" value={owner} />
              <Info label="วันเริ่มโครงการ" value={start} />
              <Info label="วันสิ้นสุดโครงการ" value={end} />
              <Info
                label="งบประมาณรวม"
                value={Number(budgetTotal).toLocaleString("th-TH")}
              />
            </div>

            {/* Approval Flow */}
            {approvalLevels.length > 0 && (
              <div className="mt-6 border-t border-gray-200 pt-5">
                <h2 className="text-sm font-semibold text-gray-700 mb-3">
                  ขั้นตอนการอนุมัติโครงการนี้
                </h2>
                <ol className="flex flex-col gap-2">
                  {approvalLevels.map((lvl, idx) => {
                    const meta = levelLabelMap[lvl.level_number];
                    return (
                      <li key={lvl.level_number} className="flex items-start gap-3">
                        {/* Step number */}
                        <div className="flex-shrink-0 w-6 h-6 rounded-full bg-indigo-100 text-indigo-700 text-xs font-bold flex items-center justify-center mt-0.5">
                          {lvl.level_number}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-1.5">
                            {meta?.icon}
                            <span className="text-sm font-medium text-gray-800">
                              {meta?.label ?? `ระดับที่ ${lvl.level_number}`}
                            </span>
                            {lvl.department_name && (
                              <span className="text-xs text-gray-400">
                                ({lvl.department_name})
                              </span>
                            )}
                          </div>
                          {lvl.backup_user_name && (
                            <p className="text-xs text-gray-400 mt-0.5">
                              ผู้สำรอง: {lvl.backup_user_name}
                            </p>
                          )}
                        </div>
                        {/* Connector line */}
                        {idx < approvalLevels.length - 1 && (
                          <div className="absolute ml-3 mt-6 h-3 w-px bg-gray-200" />
                        )}
                      </li>
                    );
                  })}
                </ol>
              </div>
            )}

            <div className="mt-6 border-t border-gray-300 pt-5">
              <SubmitApprovalClient
                budgetPlanId={project.budget_plan_id}
                projectName={name}
              />
            </div>
          </div>
        </main>
      </div>
    </BackGroundLight>
  );
}
