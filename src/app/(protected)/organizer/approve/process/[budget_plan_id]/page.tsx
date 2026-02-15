"use client";

import BackGroundLight from "@/components/background/bg-light";
import { CheckCircle, Clock, XCircle, ArrowLeft } from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { getApprovalQueue } from "@/api/approval.client";
import type { ApprovalQueueData, ApprovalFlowItem } from "@/dto/approveDto";

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

        // Get approval queue data directly with budget_plan_id
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
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
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
            <button
              onClick={() => router.back()}
              className="mt-4 text-indigo-600 hover:underline"
            >
              กลับ
            </button>
          </div>
        </div>
      </BackGroundLight>
    );
  }

  const sortedFlow = [...data.approvalFlow].sort((a, b) => a.level - b.level);

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

        <h1 className="text-xl font-semibold text-gray-900">
          สถานะการอนุมัติโครงการ
        </h1>
        <p className="mt-1 text-sm text-gray-500">
          แสดงลำดับและประวัติการอนุมัติโครงการ
        </p>

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

        {/* Approval Flow */}
        <div className="mt-8 bg-white rounded-lg px-2 lg:px-4 py-4 lg:py-8 shadow-lg space-y-6">
          {sortedFlow.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-500 text-sm">
                ยังไม่มีขั้นตอนการอนุมัติในระบบ
              </p>
            </div>
          ) : (
            sortedFlow.map((step, index) => {
            const isLast = index === sortedFlow.length - 1;
            const isApproved = step.action === "approve" || step.action === "approved" || step.action === "อนุมัติ";
            const isRejected = step.action === "reject" || step.action === "rejected" || step.action === "ไม่อนุมัติ";
            const isPending = !step.action || step.action === "pending" || step.action === "รออนุมัติ";

            return (
              <div key={`${step.level}-${index}`} className="flex gap-4">
                <div className="flex flex-col items-center">
                  {isApproved ? (
                    <CheckCircle className="h-6 w-6 text-green-600" />
                  ) : isRejected ? (
                    <XCircle className="h-6 w-6 text-red-600" />
                  ) : (
                    <Clock className="h-6 w-6 text-amber-500 animate-pulse" />
                  )}

                  {!isLast && <div className="mt-1 h-full w-px bg-gray-300" />}
                </div>

                <div
                  className={`w-full rounded-lg border p-4 ${
                    isApproved
                      ? "border-green-200 bg-green-50"
                      : isRejected
                      ? "border-red-200 bg-red-50"
                      : "border-amber-200 bg-amber-50"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <h3 className="font-medium text-gray-900">
                      {step.roleTitle || `ระดับ ${step.level}`}
                    </h3>

                    {isApproved ? (
                      <span className="text-xs font-medium text-green-700">
                        อนุมัติแล้ว
                      </span>
                    ) : isRejected ? (
                      <span className="text-xs font-medium text-red-700">
                        ไม่อนุมัติ
                      </span>
                    ) : (
                      <span className="text-xs font-medium text-amber-700">
                        รอการอนุมัติ
                      </span>
                    )}
                  </div>

                  {(isApproved || isRejected) && step.reviewerName ? (
                    <div className="mt-2 text-sm text-gray-600">
                      <p>
                        โดย{" "}
                        <span className="font-medium">{step.reviewerName}</span>
                      </p>
                      {step.actionDate && (
                        <p className="text-xs text-gray-500">
                          {new Date(step.actionDate).toLocaleDateString("th-TH", {
                            year: "numeric",
                            month: "short",
                            day: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </p>
                      )}
                      {step.comments && (
                        <p className="mt-1 text-xs text-gray-600 italic">
                          หมายเหตุ: {step.comments}
                        </p>
                      )}
                    </div>
                  ) : (
                    <p className="mt-2 text-sm text-gray-600">
                      ยังไม่ได้ดำเนินการ
                    </p>
                  )}
                </div>
              </div>
            );
          })
          )}
        </div>
      </div>
    </BackGroundLight>
  );
}