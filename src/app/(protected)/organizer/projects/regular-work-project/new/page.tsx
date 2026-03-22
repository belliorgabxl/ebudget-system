"use client";

import { useCallback, useState } from "react";
import { useRouter } from "next/navigation";
import {
  BookOpen,
  ChevronLeft,
  ChevronRight,
  Save,
  Loader2,
} from "lucide-react";
import BackGroundLight from "@/components/background/bg-light";
import { toast } from "react-toastify";

// ─── Types ────────────────────────────────────────────────────────────────────

type FormState = {
  name: string;
  description: string;
  plan_type: string;
  rationale: string;
  quantitative_goal: string;
  qualitative_goal: string;
  display_order: number;
};

// ─── Step config ─────────────────────────────────────────────────────────────

const steps = [
  "ข้อมูลพื้นฐาน",
  "หลักการและเหตุผล",
  "เป้าหมาย",
];

// ─── Sub components ───────────────────────────────────────────────────────────

function SectionTitle({ title }: { title: string }) {
  return (
    <div className="flex items-center gap-2 pb-2 border-b border-indigo-100 mb-4">
      <span className="h-1 w-4 rounded-full bg-indigo-500" />
      <h2 className="text-sm font-semibold text-gray-800">{title}</h2>
    </div>
  );
}

function Field({
  label,
  required,
  children,
}: {
  label: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-[200px_1fr] gap-2 items-start">
      <label className="text-sm text-gray-700 pt-2">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>
      <div>{children}</div>
    </div>
  );
}

const inputCls =
  "w-full px-4 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-400";
const textareaCls =
  "w-full px-4 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-400 min-h-[100px] resize-y";

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function NewRegularWorkTemplatePage() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [isLoading, setIsLoading] = useState(false);

  // Form state
  const [form, setForm] = useState<FormState>({
    name: "",
    description: "",
    plan_type: "regular_work",
    rationale: "",
    quantitative_goal: "",
    qualitative_goal: "",
    display_order: 0,
  });

  const setF = (field: keyof FormState, val: string | number) =>
    setForm((p) => ({ ...p, [field]: val }));
  // ─── Validation ───────────────────────────────────────────────────────────
  const validateStep = (): boolean => {
    if (step === 0 && !form.name.trim()) {
      toast.error("กรุณาระบุชื่อแผนงาน");
      return false;
    }
    return true;
  };

  const handleNext = () => {
    if (!validateStep()) return;
    setStep((s) => Math.min(s + 1, steps.length - 1));
  };

  // ─── Submit ───────────────────────────────────────────────────────────────
  const handleSubmit = useCallback(async () => {
    if (!form.name.trim()) {
      toast.error("กรุณาระบุชื่อแผนงาน");
      return;
    }

    const payload = {
      name: form.name,
      description: form.description,
      plan_type: form.plan_type,
      rationale: form.rationale,
      quantitative_goal: form.quantitative_goal,
      qualitative_goal: form.qualitative_goal,
      display_order: form.display_order,
    };

    setIsLoading(true);
    try {
      const res = await fetch("/api/regular-work-templates", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const json = await res.json();
      if (!json.success) throw new Error(json.message ?? "Failed");
      toast.success("สร้างแผนงานประจำสำเร็จ");
      router.push("/organizer/projects/regular-work-project");
    } catch (err: any) {
      toast.error(err?.message ?? "สร้างแผนงานประจำไม่สำเร็จ");
    } finally {
      setIsLoading(false);
    }
  }, [form, router]);

  // ─── Step renders ─────────────────────────────────────────────────────────

  return (
    <BackGroundLight>
      <main className="w-full lg:mx-auto lg:max-w-4xl px-2 lg:px-6 py-6">
        {/* Header */}
        <div className="lg:pt-0 pt-10 mb-6">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-1 text-sm text-indigo-600 hover:underline mb-3"
          >
            <ChevronLeft className="h-4 w-4" /> ย้อนกลับ
          </button>
          <div className="flex items-center gap-3">
            <BookOpen className="h-7 w-7 text-indigo-600" />
            <div>
              <h1 className="text-xl font-semibold text-gray-900">สร้างแผนงานประจำใหม่</h1>
              <p className="text-sm text-gray-500">กรอกข้อมูลแผนงานประจำสำหรับองค์กร</p>
            </div>
          </div>
        </div>

        {/* Progress bar */}
        <div className="flex items-start gap-2 mb-6">
          {steps.map((label, index) => (
            <div key={index} className="flex-1">
              <div
                className={`h-2 rounded-full transition-colors ${
                  index <= step ? "bg-indigo-600" : "bg-gray-200"
                }`}
              />
              <p
                className={`text-[10px] lg:block hidden mt-1 text-center ${
                  index === step ? "text-indigo-700 font-medium" : "text-gray-500"
                }`}
              >
                {label}
              </p>
            </div>
          ))}
        </div>

        {/* Form card */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 min-h-[360px] space-y-5">
          {/* Step 0: Basic info */}
          {step === 0 && (
            <>
              <SectionTitle title="ข้อมูลพื้นฐาน" />
              <div className="space-y-4">
                <Field label="ชื่อแผนงาน" required>
                  <input
                    className={inputCls}
                    value={form.name}
                    onChange={(e) => setF("name", e.target.value)}
                    placeholder="ระบุชื่อแผนงานประจำ"
                  />
                </Field>
                <Field label="ประเภทแผนงาน" required>
                  <div className={`${inputCls} bg-gray-50 text-gray-500 cursor-not-allowed flex items-center`}>
                    แผนงานประจำ
                  </div>
                </Field>
                <Field label="รายละเอียด">
                  <textarea
                    className={textareaCls}
                    value={form.description}
                    onChange={(e) => setF("description", e.target.value)}
                    placeholder="อธิบายรายละเอียดของแผนงาน..."
                  />
                </Field>
                <Field label="ลำดับการแสดงผล">
                  <input
                    type="number"
                    className={inputCls}
                    value={form.display_order}
                    min={0}
                    onChange={(e) => setF("display_order", Number(e.target.value))}
                  />
                </Field>
              </div>
            </>
          )}

          {/* Step 1: Rationale */}
          {step === 1 && (
            <>
              <SectionTitle title="หลักการและเหตุผล" />
              <textarea
                className={textareaCls + " min-h-[200px]"}
                value={form.rationale}
                onChange={(e) => setF("rationale", e.target.value)}
                placeholder="ระบุหลักการและเหตุผลของแผนงาน..."
              />
            </>
          )}

          {/* Step 2: Goals */}
          {step === 2 && (
            <>
              <SectionTitle title="เป้าหมายของแผนงาน" />
              <div className="space-y-4">
                <Field label="เป้าหมายเชิงปริมาณ">
                  <textarea
                    className={textareaCls}
                    value={form.quantitative_goal}
                    onChange={(e) => setF("quantitative_goal", e.target.value)}
                    placeholder="ระบุเป้าหมายเชิงปริมาณ..."
                  />
                </Field>
                <Field label="เป้าหมายเชิงคุณภาพ">
                  <textarea
                    className={textareaCls}
                    value={form.qualitative_goal}
                    onChange={(e) => setF("qualitative_goal", e.target.value)}
                    placeholder="ระบุเป้าหมายเชิงคุณภาพ..."
                  />
                </Field>
              </div>
            </>
          )}

        </div>

        {/* Navigation */}
        <div className="mt-6 flex items-center justify-between">
          <button
            onClick={() =>
              step === 0
                ? router.back()
                : setStep((s) => Math.max(0, s - 1))
            }
            className="flex items-center gap-1 text-gray-700 hover:text-gray-900 hover:bg-slate-200 py-1 px-4 rounded-sm"
          >
            <ChevronLeft className="h-4 w-4" /> ย้อนกลับ
          </button>

          {step < steps.length - 1 ? (
            <button
              onClick={handleNext}
              className="inline-flex items-center gap-1 rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700"
            >
              ถัดไป <ChevronRight className="h-4 w-4" />
            </button>
          ) : (
            <button
              onClick={handleSubmit}
              disabled={isLoading}
              className="inline-flex items-center gap-1 rounded-md bg-green-600 hover:bg-green-700 px-4 py-2 text-sm font-medium text-white disabled:opacity-60"
            >
              {isLoading ? (
                <Loader2 className="animate-spin h-4 w-4" />
              ) : (
                <Save className="h-4 w-4" />
              )}{" "}
              บันทึกแผนงานประจำ
            </button>
          )}
        </div>
      </main>
    </BackGroundLight>
  );
}
