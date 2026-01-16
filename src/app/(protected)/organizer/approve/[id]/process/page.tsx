"use client";

import BackGroundLight from "@/components/background/bg-light";
import { CheckCircle, Clock } from "lucide-react";

type ApprovalRole = {
  role: "department_head" | "planning" | "director";
  label: string;
  approved: boolean;
  approvedAt?: string;
  approverName?: string;
};

const approvalSteps: ApprovalRole[] = [
  {
    role: "department_head",
    label: "หัวหน้าแผนก",
    approved: true,
    approvedAt: "10 ม.ค. 2569 14:32",
    approverName: "สมชาย ใจดี",
  },
  {
    role: "planning",
    label: "ฝ่ายวางแผน",
    approved: true,
    approvedAt: "11 ม.ค. 2569 09:10",
    approverName: "นางสาวศิริพร",
  },
  {
    role: "director",
    label: "ผู้อำนวยการ",
    approved: false,
  },
];

export default function ApprovalProcessPage() {
  return (
    <BackGroundLight>
      <div className="mx-auto max-w-2xl px-6 py-8">
        <h1 className="text-xl font-semibold text-gray-900">
          สถานะการอนุมัติโครงการ
        </h1>
        <p className="mt-1 text-sm text-gray-500">
          แสดงลำดับและประวัติการอนุมัติโครงการ
        </p>

        <div className="mt-8 bg-white rounded-lg px-2 lg:px-4 py-4 
        lg:py-8 shadow-lg space-y-6">
          {approvalSteps.map((step, index) => {
            const isLast = index === approvalSteps.length - 1;

            return (
              <div key={step.role} className="flex gap-4">
                <div className="flex flex-col items-center">
                  {step.approved ? (
                    <CheckCircle className="h-6 w-6 text-green-600" />
                  ) : (
                    <Clock className="h-6 w-6 text-amber-500 animate-pulse" />
                  )}

                  {!isLast && <div className="mt-1 h-full w-px bg-gray-300" />}
                </div>

                <div
                  className={`w-full rounded-lg border p-4 ${
                    step.approved
                      ? "border-green-200 bg-green-50"
                      : "border-amber-200 bg-amber-50"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <h3 className="font-medium text-gray-900">{step.label}</h3>

                    {step.approved ? (
                      <span className="text-xs font-medium text-green-700">
                        อนุมัติแล้ว
                      </span>
                    ) : (
                      <span className="text-xs font-medium text-amber-700">
                        รอการอนุมัติ
                      </span>
                    )}
                  </div>

                  {step.approved ? (
                    <div className="mt-2 text-sm text-gray-600">
                      <p>
                        โดย{" "}
                        <span className="font-medium">{step.approverName}</span>
                      </p>
                      <p className="text-xs text-gray-500">{step.approvedAt}</p>
                    </div>
                  ) : (
                    <p className="mt-2 text-sm text-gray-600">
                      ยังไม่ได้ดำเนินการ
                    </p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </BackGroundLight>
  );
}
