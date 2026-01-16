import Link from "next/link";
import { fetchProjectInformationServer } from "@/api/project.server";
import type { ProjectInformationResponse } from "@/dto/projectDto";

import { toThaiDate } from "@/lib/util";
import SubmitApprovalClient from "@/components/project/approval/SubmitApproval";
import BackGroundLight from "@/components/background/bg-light";
import { Info } from "@/components/approve/InfoBox";
import { ProjectIcon } from "@/components/project/Helper";

type PageParams = Promise<{ id: string }>;

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
