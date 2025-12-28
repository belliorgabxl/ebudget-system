"use client";
import { submitBudgetPlan } from "@/api/approval.client";
import ConfirmSubmitPopup from "@/components/popup/ConfirmPopup";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "react-toastify";

type Props = {
  budgetPlanId: string;
  projectName: string;
};

export default function SubmitApprovalClient({
  budgetPlanId,
  projectName,
}: Props) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [open, setOpen] = useState(false);

  const handleConfirm = async () => {
    setLoading(true);
    setError(null);

    try {
      const res = await submitBudgetPlan(budgetPlanId);

      console.log("Submit approval success", {
        budgetPlanId: budgetPlanId,
        response: res,
      });

      setOpen(false);
      toast.success("ส่งอนุมัติสำเร็จ");
      router.push("/success-screen");
    } catch (e) {
       console.error(" Submit approval failed", {
      budgetPlanId: budgetPlanId,
      error: e,
    });

      setError("ไม่สามารถส่งอนุมัติได้ กรุณาลองใหม่");
    } finally {
      setLoading(false);
    }
  };
  return (
    <>
      {error && (
        <div className="mb-4 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">
          {error}
        </div>
      )}

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-end">
        <button
          type="button"
          onClick={() => router.back()}
          disabled={loading}
          className="rounded-lg bg-gray-200 hover:bg-gray-400 hover:text-white px-4 py-2 text-sm font-medium text-slate-700 disabled:opacity-60"
        >
          ย้อนกลับ
        </button>

        <button
          type="button"
          onClick={() => setOpen(true)}
          disabled={loading}
          className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-900 disabled:opacity-60"
        >
          ส่งอนุมัติ
        </button>
      </div>

      <ConfirmSubmitPopup
        open={open}
        loading={loading}
        title="ส่งยื่นเสนอโปรเจกต์"
        description={`คุณต้องการส่งโครงการ "${projectName}" เพื่อเข้าสู่ขั้นตอนการอนุมัติ`}
        warning="* หลังจากส่งแล้ว จะไม่สามารถแก้ไขข้อมูลโครงการได้"
        confirmLabel="ยืนยันส่งอนุมัติ"
        cancelLabel="ยกเลิก"
        onCancel={() => setOpen(false)}
        onConfirm={handleConfirm}
      />
    </>
  );
}
