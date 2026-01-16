import Link from "next/link";
import type { GetProjectsByOrgRespond } from "@/dto/dashboardDto";
import { ExportPDFDocument } from "@/components/button/ExportProjectButton";
import { renderDateRange } from "@/lib/helper";
import { Td, Th } from "./ProjectHeader";

type Props = {
  projects: GetProjectsByOrgRespond[];
  page: number;
  limit: number;
};

export function ProjectsTable({ projects, page, limit }: Props) {
  return (
    <section className="w-full grid place-items-center relative sm:mx-0 overflow-x-auto ">
      <div className="w-full overflow-y-auto rounded bg-white">
        <table className="w-full min-w-[1100px] text-sm">
          <thead className="bg-blue-200 text-gray-700">
            <tr>
              <Th className="w-15 text-center">No.</Th>
              <Th className="w-100">ชื่อโครงการ</Th>
              <Th className="w-20 text-xs whitespace-nowrap">รหัสโครงการ</Th>
              <Th className="w-50 whitespace-nowrap">หน่วยงาน</Th>
              <Th className="w-50 whitespace-nowrap">ระยะเวลา</Th>
              <Th className="w-45 whitespace-nowrap">สถานที่</Th>
              <Th className="w-50">ไฟล์</Th>
              <Th className="w-40 text-center">จัดการ</Th>
            </tr>
          </thead>

          <tbody className="divide-y divide-gray-100">
            {projects.map((p, idx) => {
              const rowNo = (page - 1) * limit + (idx + 1);

              return (
                <tr
                  key={p.id}
                  className={`${idx % 2 != 0 ? "bg-slate-100" : ""}`}
                >
                  <Td className="text-center">{rowNo}</Td>

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

                  <Td className="text-gray-700 text-xs text-start pl-3 py-1.5">
                    {p.code || "—"}
                  </Td>

                  <Td className="text-gray-700 text-xs py-1.5">
                    {p.department_id ? p.department_name : "—"}
                  </Td>

                  <Td className="text-gray-700 text-xs text-center py-1.5">
                    {renderDateRange(p.start_date, p.end_date)}
                  </Td>

                  <Td className="text-green-700 text-xs text-start py-1.5">
                    {p.location ? p.location.slice(0, 30) : "—"}
                  </Td>

                  <Td className="text-gray-700 py-3 flex justify-center items-center">
                    <ExportPDFDocument id={p.id} />
                  </Td>

                  <Td className="text-center py-1.5">
                    <div className="flex flex-col items-center gap-1">
                      <Link
                        href={`/organizer/projects/${p.id}/details`}
                        className="inline-flex items-center rounded-md border text-white
                          bg-slate-400 border-gray-300 px-2 py-1 text-xs hover:bg-gray-600"
                      >
                        ดูรายละเอียด
                      </Link>
                    </div>
                  </Td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </section>
  );
}
