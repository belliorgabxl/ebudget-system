"use client";

import { useRouter } from "next/navigation";
import {
  ClipboardList,
  Building2,
  TrendingUp,
  BarChart3,
  FileText,
} from "lucide-react";
import BackGroundLight from "@/components/background/bg-light";

const reportTypes = [
  {
    id: "project",
    name: "รายงานสรุปผลโครงการ",
    desc: "สรุปผลการดำเนินงานของแต่ละโครงการ พร้อมความคืบหน้าและสถานะ",
    icon: ClipboardList,
    color: "bg-blue-100 text-blue-700",
  },
  {
    id: "department",
    name: "รายงานผลการดำเนินงานหน่วยงาน",
    desc: "แสดงผลงานของแต่ละหน่วยงาน รวมถึงจำนวนโครงการที่เกี่ยวข้อง",
    icon: Building2,
    color: "bg-emerald-100 text-emerald-700",
  },
  {
    id: "budget",
    name: "รายงานงบประมาณ",
    desc: "สรุปรายละเอียดการใช้งบประมาณของโครงการในแต่ละหน่วยงาน",
    icon: FileText,
    color: "bg-amber-100 text-amber-700",
  },
  {
    id: "kpi",
    name: "รายงานตัวชี้วัด (KPI)",
    desc: "แสดงผลสำเร็จตามตัวชี้วัดหลักที่ตั้งไว้ในแต่ละโครงการ",
    icon: TrendingUp,
    color: "bg-indigo-100 text-indigo-700",
  },
  {
    id: "custom",
    name: "รายงานทั่วไป (Custom Report)",
    desc: "เลือกรูปแบบและข้อมูลที่ต้องการรายงานได้เอง",
    icon: BarChart3,
    color: "bg-gray-100 text-gray-700",
  },
];

export default function CreateReportPage() {
  const router = useRouter();

  const handleSelect = (id: string) => {
    router.push(`/user/reports/new/${id}`);
  };

  return (
    <BackGroundLight>
      <main className="w-full grid place-items-center lg:px-18 md:px-10 sm:px-5 px-1 py-6">
        <div className="lg:px-20 lg:pt-0 pt-10 px-2 w-full mb-4 ">
          <h1 className="text-xl  font-semibold text-gray-900">
            สร้างรายงานใหม่
          </h1>
          <p className="text-sm text-gray-600">
            โปรดเลือกประเภทของรายงานที่ต้องการสร้าง
          </p>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {reportTypes.map((type) => {
            const Icon = type.icon;
            return (
              <button
                key={type.id}
                onClick={() => handleSelect(type.id)}
                className="group relative w-full rounded-xl border border-gray-200 bg-white p-5 text-left shadow-sm hover:shadow-md transition-shadow hover:border-indigo-400"
              >
                <div
                  className={`flex h-10 w-10 items-center justify-center rounded-lg ${type.color} mb-3`}
                >
                  <Icon className="h-5 w-5" />
                </div>
                <h3 className="text-sm font-semibold text-gray-900 mb-1 group-hover:text-indigo-700">
                  {type.name}
                </h3>
                <p className="text-xs text-gray-600 line-clamp-2">
                  {type.desc}
                </p>
              </button>
            );
          })}
        </div>

        <div className="mt-10 text-center text-xs text-gray-500">
          คุณสามารถสร้างรายงานประเภทใหม่ได้ในภายหลังจากเมนู “ตั้งค่า”
        </div>
      </main>
    </BackGroundLight>
  );
}
