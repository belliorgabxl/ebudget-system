"use client";

import BackGroundLight from "@/components/background/bg-light";
import { CheckCircle, Clock, XCircle, ArrowLeft, RotateCcw } from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { getApprovalQueue } from "@/api/approval.client";
import type { ApprovalQueueData, ApprovalFlowItem } from "@/dto/approveDto";

function ActionIcon({ action }: { action: string }) {
  if (action === "อนุมัติ") return <CheckCircle className="h-6 w-6 text-green-600 shrink-0" />;
  if (action === "ไม่อนุมัติ") return <XCircle className="h-6 w-6 text-red-600 shrink-0" />;
  if (action === "แก้ไข") return <RotateCcw className="h-6 w-6 text-amber-600 shrink-0" />;
  return <Clock className="h-6 w-6 text-amber-400 animate-pulse shrink-0" />;
}

function stepBg(action: string) {
  if (action === "อนุมัติ") return "border-green-200 bg-green-50";
  if (action === "ไม่อนุมัติ") return "border-red-200 bg-red-50";
  if (action === "แก้ไข") return "border-amber-300 bg-amber-50";
  return "border-amber-200 bg-amber-50";
}

function statusLabel(action: string) {
  if (action === "อนุมัติ") return <span className="text-xs font-semibold text-green-700">อนุมัติแล้ว</span>;
  if (action === "ไม่อนุมัติ") return <span className="text-xs font-semibold text-red-700">ไม่อนุมัติ</span>;
  if (action === "แก้ไข") return <span className="text-xs font-semibold text-amber-700">ส่งกลับแก้ไข</span>;
  return <span className="text-xs font-semibold text-amber-600">รอการอนุมัติ</span>;
}

export default function ApprovalProcessPage() {
  const params = useParams();
  const router = useRouter();
  const budgetPlanId = params?.budget_plan_id as string;

  const [data, setData] = useState<ApprovalQueueData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!budgetPlanId) return;
    const fetchData = async () => {
      try {
        setLoading(true);
        const response = await getApprovalQueue(budgetPlanId);
        if (response.success && response.data) {
          setData(response.data as unknown as ApprovalQueueData);
        } else {
          setError("ไม่พบข้อมูลการอนุมัติ");
        }
      } catch (err: any) {
        setError(err.message || "เกิดข้อผิดพลาดในการโหลดข้อมูล");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [budgetPlanId]);

  if (loading) {
    return (
      <BackGroundLight>
        <div className="mx-auto max-w-2xl px-6 py-8 flex justify-center items-center min-h-[400px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto" />
            <p className="mt-4 text-gray-600">กำลังโหลดข้อมูล...</p>
          </div>
        </div>
      </BackGroundLight>
    );
  }

  if (error || !data) {
    return (
      <BackGroundLight>
        <div className="mx-auto max-w-2xl px-6 py-8">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
            <p className="text-red-800">{error || "ไม่พบข้อมูล"}</p>
            <button onClick={() => router.back()} className="mt-4 text-indigo-600 hover:underline">
              กลับ
            </button>
          </div>
        </div>
      </BackGroundLight>
    );
  }

  // Group steps by cycleNumber (ascending = chronological)
  const stepsWithCycle = (data.approvalFlow as ApprovalFlowItem[]).slice().sort((a, b) => {
    if (a.cycleNumber !== b.cycleNumber) return a.cycleNumber - b.cycleNumber;
    return a.level - b.level;
  });

  const cycleGroups: { cycleNumber: number; isCompleted: boolean; steps: ApprovalFlowItem[] }[] = [];
  for (const step of stepsWithCycle) {
    const cn = step.cycleNumber ?? 0;
    let group = cycleGroups.find((g) => g.cycleNumber === cn);
    if (!group) {
      group = { cycleNumber: cn, isCompleted: step.cycleIsCompleted ?? false, steps: [] };
      cycleGroups.push(group);
    }
    group.steps.push(step);
  }

  return (
    <BackGroundLight>
      <div className="mx-auto max-w-2xl px-6 py-8">
        <button
          onClick={() => router.back()}
          className="mb-4 flex items-center gap-2 text-gray-600 hover:text-indigo-600"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>กลับ</span>
        </button>

        <h1 className="text-xl font-semibold text-gray-900">สถานะการอนุมัติโครงการ</h1>
        <p className="mt-1 text-sm text-gray-500">แสดงลำดับและประวัติการอนุมัติโครงการ</p>

        {/* Project Info Card */}
        <div className="mt-6 bg-white rounded-lg border border-gray-200 p-4 shadow-sm">
          <h2 className="font-semibold text-gray-900">{data.projectName}</h2>
          <div className="mt-2 grid grid-cols-2 gap-2 text-sm">
            <div>
              <span className="text-gray-500">เลขที่แผน:</span>{" "}
              <span className="font-medium">{data.planNumber || "—"}</span>
            </div>
            <div>
              <span className="text-gray-500">หน่วยงาน:</span>{" "}
              <span className="font-medium">{data.department || "—"}</span>
            </div>
            <div>
              <span className="text-gray-500">งบประมาณ:</span>{" "}
              <span className="font-medium">
                {data.budget?.toLocaleString("th-TH") || 0} บาท
              </span>
            </div>
            <div>
              <span className="text-gray-500">สถานะ:</span>{" "}
              <span className="font-medium">{data.status || "—"}</span>
            </div>
          </div>
        </div>

        {/* Approval Flow — grouped by cycle */}
        <div className="mt-8 space-y-6">
          {cycleGroups.length === 0 ? (
            <div className="bg-white rounded-lg p-8 shadow-sm text-center text-sm text-gray-400 italic">
              ยังไม่มีขั้นตอนการอนุมัติในระบบ
            </div>
          ) : (
            cycleGroups.map((group, gi) => (
              <div key={group.cycleNumber}>
                {/* Cycle header (only show if more than one cycle) */}
                {cycleGroups.length > 1 && (
                  <div className="flex items-center gap-2 mb-3">
                    <span
                      className={`text-xs font-semibold px-2.5 py-1 rounded-full ${
                        gi < cycleGroups.length - 1
                          ? "bg-gray-200 text-gray-600"
                          : "bg-indigo-100 text-indigo-700"
                      }`}
                    >
                      รอบที่ {group.cycleNumber}
                      {gi < cycleGroups.length - 1 ? " (ประวัติ)" : " (ปัจจุบัน)"}
                    </span>
                    <div className="flex-1 h-px bg-gray-200" />
                  </div>
                )}

                <div className="bg-white rounded-lg px-4 py-5 shadow-sm space-y-4">
                  {group.steps.map((step, idx) => {
                    const isLast = idx === group.steps.length - 1;
                    const isPending = step.action === "รอดำเนินการ" || !step.action;

                    return (
                      <div key={`${group.cycleNumber}-${step.level}-${idx}`} className="flex gap-4">
                        <div className="flex flex-col items-center">
                          <ActionIcon action={step.action} />
                          {!isLast && <div className="mt-1 h-full w-px bg-gray-200" />}
                        </div>

                        <div className={`w-full rounded-lg border p-4 ${stepBg(step.action)}`}>
                          <div className="flex items-center justify-between">
                            <h3 className="font-medium text-gray-900 text-sm">
                              {step.roleTitle || `ระดับ ${step.level}`}
                            </h3>
                            {statusLabel(step.action)}
                          </div>

                          {!isPending && step.reviewerName ? (
                            <div className="mt-2 text-sm text-gray-600 space-y-0.5">
                              <p>
                                โดย <span className="font-medium">{step.reviewerName}</span>
                              </p>
                              {step.actionDate ? (
                                <p className="text-xs text-gray-500">{step.actionDate}</p>
                              ) : null}
                              {step.comments ? (
                                <p className="mt-1 text-xs text-gray-600 italic">
                                  เหตุผล: {step.comments}
                                </p>
                              ) : null}
                            </div>
                          ) : isPending ? (
                            <p className="mt-2 text-sm text-gray-500 italic">ยังไม่ได้ดำเนินการ</p>
                          ) : null}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </BackGroundLight>
  );
}