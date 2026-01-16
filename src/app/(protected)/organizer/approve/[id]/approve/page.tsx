import BackGroundLight from "@/components/background/bg-light";
import ApproveProjectClient from "../../../../../../components/approve/ApproveProjectClient";
import { fetchProjectInformationServer } from "@/api/project.server";
import { Info } from "@/components/approve/InfoBox";
import { ProjectIcon } from "@/components/project/Helper";
import Link from "next/link";
import { checkApprovalPermissionServer, CheckPermissionResponse } from "@/api/approval.server";

type PageParams = Promise<{ id: string }>;

function toThaiDate(iso: string | null | undefined) {
  if (!iso) return "—";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleDateString("th-TH", {
    year: "numeric",
    month: "short",
    day: "2-digit",
  });
}

export default async function ProjectApprovePage({
  params,
}: {
  params: PageParams;
}) {
  const { id: projectId } = await params;
  const p = await fetchProjectInformationServer(projectId);
   let permission: CheckPermissionResponse | null = null;
  try {
    permission = await checkApprovalPermissionServer(p.budget_plan_id);
  } catch (e) {
    console.error("checkApprovalPermissionServer error:", e);
    permission = null;
  }
 const canApprove = Boolean(permission?.has_permission);
  if (!canApprove) {
    return (
      <BackGroundLight>
        <div className="mx-auto max-w-3xl p-6">
          <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-xl">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h1 className="text-xl font-semibold text-gray-900">
                  ไม่สามารถอนุมัติโครงการได้
                </h1>
                <p className="mt-1 text-sm text-slate-600">
                  คุณไม่มีสิทธิ์อนุมัติโครงการนี้
                  หรือโครงการยังไม่อยู่ในขั้นตอนที่คุณสามารถอนุมัติได้
                </p>
              </div>
              <ProjectIcon />
            </div>

            <div className="mt-6 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
              หากคิดว่าเป็นข้อผิดพลาด กรุณาติดต่อผู้ดูแลระบบ/ผู้รับผิดชอบ
              workflow
            </div>

            <div className="mt-6 flex justify-end gap-2">
              <Link
                href="/organizer/approve/"
                className="rounded-md bg-gray-200 hover:bg-gray-400 hover:text-white px-4 py-2 text-sm font-medium text-slate-700"
              >
                กลับ
              </Link>

              <Link
                href={`/organizer/approve/${projectId}/project-detail`}
                className="rounded-md bg-indigo-600 hover:bg-indigo-900 px-4 py-2 text-sm font-semibold text-white"
              >
                ดูรายละเอียด
              </Link>
            </div>
          </div>
        </div>
      </BackGroundLight>
    );
  }

  const name = p.project_name ?? "—";
  const type = p.plan_type ?? "—";
  const department = p.department_name ?? "—";
  const owner = p.owner_user ?? "—";
  const startDate = toThaiDate(p.start_date);
  const endDate = toThaiDate(p.end_date);
  const budgetTotal = p.budget_amount ?? 0;

  return (
    <BackGroundLight>
      <div className="mx-auto max-w-3xl p-6">
        <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-xl">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h1 className="text-xl font-semibold">อนุมัติโครงการ</h1>
              <p className="mt-1 text-sm text-slate-600">
                ตรวจสอบรายละเอียดให้เรียบร้อยก่อนอนุมัติ
              </p>
            </div>

            <ProjectIcon />
          </div>

          <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Info label="ชื่อโครงการ" value={name} />
            <Info label="ประเภท" value={type} />
            <Info label="หน่วยงาน" value={department} />
            <Info label="ผู้รับผิดชอบ" value={owner} />
            <Info label="วันเริ่มโครงการ" value={startDate} />
            <Info label="วันสิ้นสุดโครงการ" value={endDate} />
            <Info
              label="งบประมาณรวม"
              value={Number(budgetTotal).toLocaleString("th-TH") + " THB"}
            />
          </div>

          <div className="w-full flex justify-center py-4">
            <Link
              href={`/organizer/approve/${projectId}/project-detail`}
              className="text-sm text-gray-500 hover:text-blue-600 hover:underline cursor-pointer"
            >
              ดูรายละเอียดเพิ่มเติม
            </Link>
          </div>

          <div className="border-t border-gray-300 pt-5">
            <ApproveProjectClient
              projectId={p.budget_plan_id}
              projectName={name}
            />
          </div>
        </div>
      </div>
    </BackGroundLight>
  );
}
