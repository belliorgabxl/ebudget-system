import BackGroundLight from "@/components/background/bg-light";
import ApproveProjectClient from "../../../../../../components/approve/ApproveProjectClient";
import { fetchProjectInformationServer } from "@/api/project.server";
import { Info } from "@/components/approve/InfoBox";
import Image from "next/image";
import { ProjectIcon } from "@/components/project/Helper";
import Link from "next/link";

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
              value={Number(budgetTotal).toLocaleString("th-TH") + "  " + "THB"}
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

          <div className=" border-t border-gray-300 pt-5">
            <ApproveProjectClient projectId={projectId} projectName={name} />
          </div>
        </div>
      </div>
    </BackGroundLight>
  );
}
