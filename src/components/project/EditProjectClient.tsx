"use client";
import React, { useState } from "react";
import Link from "next/link";
import type {
  ActivitiesRow,
  BudgetTableValue,
  EditFormState,
  ProjectInformationResponse,
} from "@/dto/projectDto";
import { FieldBlock, SectionCard } from "./Helper";
import { mapApiToForm, mapFormToPayload } from "@/lib/helper";
import { useToast } from "@/components/ToastProvider";

export default function EditProjectClient({
  id,
  initialData,
}: {
  id: string;
  initialData: ProjectInformationResponse;
}) {
  const { push } = useToast();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [form, setForm] = useState<EditFormState>(() =>
    mapApiToForm(initialData)
  );

  const updateSectionField = <
    K extends keyof EditFormState,
    F extends keyof EditFormState[K]
  >(
    section: K,
    field: F,
    value: EditFormState[K][F]
  ) => {
    setForm((prev) =>
      prev
        ? {
            ...prev,
            [section]: {
              ...(prev[section] as any),
              [field]: value,
            },
          }
        : prev
    );
  };

  const handleBudgetRowChange = (
    index: number,
    field: "item" | "amount" | "note",
    value: string
  ) => {
    setForm((prev) => {
      if (!prev || !prev.budget) return prev;
      const rows = prev.budget.rows.map((r, i) =>
        i === index ? { ...r, [field]: value } : r
      );
      const total = rows.reduce(
        (sum, r) => sum + (parseFloat(r.amount) || 0),
        0
      );

      return {
        ...prev,
        budget: {
          ...prev.budget,
          rows,
          total,
        },
      };
    });
  };

  const addBudgetRow = () => {
    setForm((prev) => {
      if (!prev) return prev;
      const nextRows = prev.budget?.rows ? [...prev.budget.rows] : [];
      nextRows.push({
        id: nextRows.length + 1,
        name: "",
        amount: "0",
        remark: "",
      });
      return {
        ...prev,
        budget: prev.budget
          ? {
              ...prev.budget,
              rows: nextRows,
            }
          : {
              rows: nextRows,
              total: 0,
              sources: { source: "", externalAgency: "" },
            },
      };
    });
  };

  const removeBudgetRow = (index: number) => {
    setForm((prev) => {
      if (!prev || !prev.budget) return prev;
      const rows = prev.budget.rows.filter((_, i) => i !== index);
      const total = rows.reduce(
        (sum, r) => sum + (parseFloat(r.amount) || 0),
        0
      );
      return {
        ...prev,
        budget: {
          ...prev.budget,
          rows,
          total,
        },
      };
    });
  };

  const handleActivityChange = <K extends keyof ActivitiesRow>(
    index: number,
    field: K,
    value: ActivitiesRow[K]
  ) => {
    setForm((prev) => {
      if (!prev) return prev;
      const activities = prev.activities.map((a, i) =>
        i === index ? { ...a, [field]: value } : a
      );
      return { ...prev, activities };
    });
  };

  const addActivityRow = () => {
    setForm((prev) => {
      if (!prev) return prev;
      const next = [...prev.activities];
      next.push({
        id: next.length + 1,
        activity: "",
        startDate: "",
        endDate: "",
        owner: "",
      });
      return { ...prev, activities: next };
    });
  };

  const removeActivityRow = (index: number) => {
    setForm((prev) => {
      if (!prev) return prev;
      const next = prev.activities.filter((_, i) => i !== index);
      return { ...prev, activities: next };
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form) return;

    setSaving(true);
    setSuccess(null);

    try {
      const payload = mapFormToPayload(form);

      const res = await fetch(`/api/project/${form.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => null);
        const errorMsg = data?.message || "ไม่สามารถบันทึกข้อมูลโครงการได้ กรุณาลองใหม่อีกครั้ง";
        throw new Error(errorMsg);
      }

      setSuccess("บันทึกข้อมูลโครงการสำเร็จ");
      push("success", "บันทึกข้อมูลโครงการสำเร็จ");
    } catch (err: any) {
      console.error("save project error:", err);
      const errorMsg = err?.message || "ไม่สามารถบันทึกข้อมูลโครงการได้ กรุณาลองใหม่อีกครั้ง";
      push("error", "บันทึกไม่สำเร็จ", errorMsg);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <main className="lg:mx-10 lg:pl-16 px-4 py-8">
        <p className="text-sm text-gray-600">กำลังโหลดข้อมูลโครงการ...</p>
      </main>
    );
  }

  if (!form) {
    return (
      <main className="lg:mx-10 lg:pl-16 px-4 py-8 space-y-4">
        <h1 className="text-xl font-semibold text-gray-900">
          ไม่สามารถโหลดข้อมูลสำหรับแก้ไขได้
        </h1>
        <Link
          href="/organizer/projects/my-project"
          className="text-sm text-indigo-600 hover:underline"
        >
          ← กลับไปยัง My Project
        </Link>
      </main>
    );
  }

  return (
    <main className="lg:mx-10 lg:pl-16 px-4 py-8">
      <nav className="mb-4 text-xs text-gray-500">
        <Link href="/organizer/projects/my-project" className="hover:underline">
          โครงการของคุณ
        </Link>
        <span className="mx-1">/</span>
        <span className="text-gray-700">แก้ไขโครงการ</span>
      </nav>

      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            แก้ไขโครงการ: {form.generalInfo?.name || "ไม่ระบุชื่อโครงการ"}
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            แบบฟอร์มแก้ไขข้อมูลโครงการ eBudget
          </p>
        </div>
        <Link
          href={`/organizer/projects/my-project/${form.id ?? ""}`}
          className="text-xs text-gray-600 hover:text-indigo-600 hover:underline"
        >
          ← กลับไปหน้าแสดงรายละเอียด
        </Link>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8 mb-10">
        {error && (
          <div className="rounded-md border border-red-300 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}
        {success && (
          <div className="rounded-md border border-green-300 bg-green-50 px-4 py-3 text-sm text-green-700">
            {success}
          </div>
        )}

        <SectionCard title="ข้อมูลพื้นฐาน">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <FieldBlock label="ชื่อโครงการ">
              <input
                type="text"
                className="w-full border border-gray-300 py-1 px-4 rounded-md"
                value={form.generalInfo.name || ""}
                onChange={(e) =>
                  updateSectionField("generalInfo", "name", e.target.value)
                }
              />
            </FieldBlock>
            <FieldBlock label="ประเภทโครงการ">
              <input
                type="text"
                className="w-full border border-gray-300 py-1 px-4 rounded-md"
                value={form.generalInfo.type || ""}
                onChange={(e) =>
                  updateSectionField("generalInfo", "type", e.target.value)
                }
              />
            </FieldBlock>
            <FieldBlock label="หน่วยงานที่รับผิดชอบ">
              <input
                type="text"
                className="form-input"
                value={form.generalInfo.department_id || ""}
                onChange={(e) =>
                  updateSectionField(
                    "generalInfo",
                    "department_id",
                    e.target.value
                  )
                }
              />
            </FieldBlock>
          </div>
        </SectionCard>

        <SectionCard title="เป้าหมายของโครงการ">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <FieldBlock label="เชิงปริมาณ">
              <input
                className="w-full border border-gray-300 py-1 px-4 rounded-md"
                value={form.goal.quantityGoal || ""}
                onChange={(e) =>
                  updateSectionField("goal", "quantityGoal", e.target.value)
                }
              />
            </FieldBlock>
            <FieldBlock label="เชิงคุณภาพ">
              <input
                className="w-full border border-gray-300 py-1 px-4 rounded-md"
                value={form.goal.qualityGoal || ""}
                onChange={(e) =>
                  updateSectionField("goal", "qualityGoal", e.target.value)
                }
              />
            </FieldBlock>
          </div>
        </SectionCard>

        <SectionCard title="ระยะเวลาดำเนินงาน">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <FieldBlock label="วันเริ่มต้น">
              <input
                type="date"
                className="form-input"
                value={form.duration.startDate || ""}
                onChange={(e) =>
                  updateSectionField("duration", "startDate", e.target.value)
                }
              />
            </FieldBlock>
            <FieldBlock label="วันสิ้นสุด">
              <input
                type="date"
                className="form-input"
                value={form.duration.endDate || ""}
                onChange={(e) =>
                  updateSectionField("duration", "endDate", e.target.value)
                }
              />
            </FieldBlock>
            <FieldBlock label="ระยะเวลา (เดือน)">
              <input
                type="number"
                className="form-input"
                value={form.duration.durationMonths ?? 0}
                onChange={(e) =>
                  updateSectionField(
                    "duration",
                    "durationMonths",
                    Number(e.target.value)
                  )
                }
              />
            </FieldBlock>
          </div>
        </SectionCard>

        <SectionCard title="ความสอดคล้องเชิงยุทธศาสตร์">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <FieldBlock label="แผนยุทธศาสตร์ของสถานศึกษา">
              <textarea
                className="form-textarea"
                rows={3}
                value={form.strategy.schoolPlan || ""}
                onChange={(e) =>
                  updateSectionField("strategy", "schoolPlan", e.target.value)
                }
              />
            </FieldBlock>
            <FieldBlock label="นโยบาย/ยุทธศาสตร์ของ สอศ.">
              <textarea
                className="form-textarea"
                rows={3}
                value={form.strategy.ovEcPolicy || ""}
                onChange={(e) =>
                  updateSectionField("strategy", "ovEcPolicy", e.target.value)
                }
              />
            </FieldBlock>
            <FieldBlock label="ตัวชี้วัดงานประกันคุณภาพภายใน">
              <textarea
                className="form-textarea"
                rows={3}
                value={form.strategy.qaIndicator || ""}
                onChange={(e) =>
                  updateSectionField("strategy", "qaIndicator", e.target.value)
                }
              />
            </FieldBlock>
          </div>
        </SectionCard>

        <SectionCard title="ตัวชี้วัดความสำเร็จ (KPIs)">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <FieldBlock label="ผลผลิต (Output)">
              <textarea
                className="form-textarea"
                rows={3}
                value={form.kpi.output || ""}
                onChange={(e) =>
                  updateSectionField("kpi", "output", e.target.value)
                }
              />
            </FieldBlock>
            <FieldBlock label="ผลลัพธ์ (Outcome)">
              <textarea
                className="form-textarea"
                rows={3}
                value={form.kpi.outcome || ""}
                onChange={(e) =>
                  updateSectionField("kpi", "outcome", e.target.value)
                }
              />
            </FieldBlock>
          </div>
        </SectionCard>

        <SectionCard title="การติดตามและประเมินผล">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <FieldBlock label="วิธีการ / ประเภทการประเมินผล">
              <input
                type="text"
                className="form-input"
                value={form.estimate.estimateType || ""}
                onChange={(e) =>
                  updateSectionField("estimate", "estimateType", e.target.value)
                }
              />
            </FieldBlock>
            <FieldBlock label="ผู้รับผิดชอบการประเมิน">
              <input
                type="text"
                className="form-input"
                value={form.estimate.evaluator || ""}
                onChange={(e) =>
                  updateSectionField("estimate", "evaluator", e.target.value)
                }
              />
            </FieldBlock>
            <FieldBlock label="ระยะเวลา (เริ่ม - สิ้นสุด)">
              <div className="flex gap-2">
                <input
                  type="date"
                  className="form-input flex-1"
                  value={form.estimate.startDate || ""}
                  onChange={(e) =>
                    updateSectionField("estimate", "startDate", e.target.value)
                  }
                />
                <input
                  type="date"
                  className="form-input flex-1"
                  value={form.estimate.endDate || ""}
                  onChange={(e) =>
                    updateSectionField("estimate", "endDate", e.target.value)
                  }
                />
              </div>
            </FieldBlock>
          </div>
        </SectionCard>

        <SectionCard title="ผลที่คาดว่าจะได้รับ">
          <FieldBlock label="ผลที่คาดว่าจะได้รับ (ใส่เป็นบรรทัด ๆ)">
            <textarea
              className="form-textarea"
              rows={4}
              value={(form.expect.results || [])
                .map((r) => r.description || "")
                .join("\n")}
              onChange={(e) => {
                const lines = e.target.value.split("\n");
                updateSectionField(
                  "expect",
                  "results",
                  lines
                    .map((ln) => ln.trim())
                    .filter((ln) => ln.length > 0)
                    .map((ln, idx) => ({
                      index: idx + 1,
                      description: ln,
                    })) as any
                );
              }}
            />
          </FieldBlock>
        </SectionCard>

        <SectionCard title="งบประมาณ">
          {form.budget ? (
            <div className="space-y-4">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <FieldBlock label="แหล่งงบประมาณ">
                  <select
                    className="form-input"
                    value={form.budget.sources.source || ""}
                    onChange={(e) =>
                      setForm((prev) =>
                        prev
                          ? {
                              ...prev,
                              budget: {
                                ...(prev.budget as BudgetTableValue),
                                sources: {
                                  ...prev.budget!.sources,
                                  source: e.target.value,
                                },
                              },
                            }
                          : prev
                      )
                    }
                  >
                    <option value="">—</option>
                    <option value="school">งบสถานศึกษา</option>
                    <option value="revenue">เงินรายได้</option>
                    <option value="external">ภายนอก</option>
                  </select>
                  {form.budget.sources.source === "external" && (
                    <input
                      type="text"
                      className="form-input mt-2"
                      placeholder="ระบุหน่วยงานภายนอก"
                      value={form.budget.sources.externalAgency || ""}
                      onChange={(e) =>
                        setForm((prev) =>
                          prev
                            ? {
                                ...prev,
                                budget: {
                                  ...(prev.budget as BudgetTableValue),
                                  sources: {
                                    ...prev.budget!.sources,
                                    externalAgency: e.target.value,
                                  },
                                },
                              }
                            : prev
                        )
                      }
                    />
                  )}
                </FieldBlock>
                <FieldBlock label="งบประมาณรวม (บาท)">
                  <input
                    type="number"
                    className="form-input"
                    value={form.budget.total ?? 0}
                    onChange={(e) =>
                      setForm((prev) =>
                        prev
                          ? {
                              ...prev,
                              budget: {
                                ...(prev.budget as BudgetTableValue),
                                total: Number(e.target.value),
                              },
                            }
                          : prev
                      )
                    }
                  />
                </FieldBlock>
              </div>

              <div className="overflow-x-auto rounded border border-gray-200">
                <table className="min-w-full text-sm">
                  <thead className="bg-gray-50">
                    <tr className="text-gray-700">
                      <th className="px-3 py-2 text-xs font-semibold text-center">
                        #
                      </th>
                      <th className="px-3 py-2 text-xs font-semibold">
                        รายการ
                      </th>
                      <th className="px-3 py-2 text-xs font-semibold text-right">
                        จำนวนเงิน
                      </th>
                      <th className="px-3 py-2 text-xs font-semibold">
                        หมายเหตุ
                      </th>
                      <th className="px-3 py-2 text-xs font-semibold"></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {form.budget.rows.map((r, idx) => (
                      <tr key={idx}>
                        <td className="px-3 py-2 text-center text-xs">
                          {idx + 1}
                        </td>
                        <td className="px-3 py-2">
                          <input
                            type="text"
                            className="form-input"
                            value={r.name}
                            onChange={(e) =>
                              handleBudgetRowChange(idx, "item", e.target.value)
                            }
                          />
                        </td>
                        <td className="px-3 py-2">
                          <input
                            type="number"
                            className="form-input text-right"
                            value={r.amount}
                            onChange={(e) =>
                              handleBudgetRowChange(
                                idx,
                                "amount",
                                e.target.value
                              )
                            }
                          />
                        </td>
                        <td className="px-3 py-2">
                          <input
                            type="text"
                            className="form-input"
                            value={r.remark}
                            onChange={(e) =>
                              handleBudgetRowChange(idx, "note", e.target.value)
                            }
                          />
                        </td>
                        <td className="px-3 py-2 text-center">
                          <button
                            type="button"
                            onClick={() => removeBudgetRow(idx)}
                            className="text-xs text-red-500 hover:underline"
                          >
                            ลบ
                          </button>
                        </td>
                      </tr>
                    ))}
                    <tr>
                      <td colSpan={5} className="px-3 py-2">
                        <button
                          type="button"
                          onClick={addBudgetRow}
                          className="text-xs text-indigo-600 hover:underline"
                        >
                          + เพิ่มรายการงบประมาณ
                        </button>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          ) : (
            <p className="text-sm text-gray-500">
              ยังไม่มีข้อมูลงบประมาณ (ระบบจะสร้างให้เมื่อเพิ่มแถว)
            </p>
          )}
        </SectionCard>

        <SectionCard title="ขั้นตอนการดำเนินงานกิจกรรม">
          <div className="overflow-x-auto rounded border border-gray-200">
            <table className="min-w-full text-sm">
              <thead className="bg-gray-50 text-gray-700">
                <tr>
                  <th className="px-3 py-2 text-xs font-semibold text-center w-16">
                    ลำดับ
                  </th>
                  <th className="px-3 py-2 text-xs font-semibold">กิจกรรม</th>
                  <th className="px-3 py-2 text-xs font-semibold w-56">
                    ระยะเวลา
                  </th>
                  <th className="px-3 py-2 text-xs font-semibold w-64">
                    ผู้รับผิดชอบ
                  </th>
                  <th className="px-3 py-2 text-xs font-semibold w-16"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {form.activities.map((a, idx) => (
                  <tr key={idx}>
                    <td className="px-3 py-2 text-center text-xs">{idx + 1}</td>
                    <td className="px-3 py-2">
                      <input
                        type="text"
                        className="form-input"
                        value={a.activity}
                        onChange={(e) =>
                          handleActivityChange(idx, "activity", e.target.value)
                        }
                      />
                    </td>
                    <td className="px-3 py-2">
                      <div className="flex gap-2">
                        <input
                          type="date"
                          className="form-input flex-1"
                          value={a.startDate || ""}
                          onChange={(e) =>
                            handleActivityChange(
                              idx,
                              "startDate",
                              e.target.value
                            )
                          }
                        />
                        <input
                          type="date"
                          className="form-input flex-1"
                          value={a.endDate || ""}
                          onChange={(e) =>
                            handleActivityChange(idx, "endDate", e.target.value)
                          }
                        />
                      </div>
                    </td>
                    <td className="px-3 py-2">
                      <input
                        type="text"
                        className="form-input"
                        value={a.owner}
                        onChange={(e) =>
                          handleActivityChange(idx, "owner", e.target.value)
                        }
                      />
                    </td>
                    <td className="px-3 py-2 text-center">
                      <button
                        type="button"
                        onClick={() => removeActivityRow(idx)}
                        className="text-xs text-red-500 hover:underline"
                      >
                        ลบ
                      </button>
                    </td>
                  </tr>
                ))}
                <tr>
                  <td colSpan={5} className="px-3 py-2">
                    <button
                      type="button"
                      onClick={addActivityRow}
                      className="text-xs text-indigo-600 hover:underline"
                    >
                      + เพิ่มกิจกรรม
                    </button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </SectionCard>

        <SectionCard title="การอนุมัติและลงนาม">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <FieldBlock label="ผู้เสนอ">
              <input
                type="text"
                className="form-input"
                value={form.approve.proposerName || ""}
                onChange={(e) =>
                  updateSectionField("approve", "proposerName", e.target.value)
                }
              />
            </FieldBlock>
            <FieldBlock label="ตำแหน่ง">
              <input
                type="text"
                className="form-input"
                value={form.approve.proposerPosition || ""}
                onChange={(e) =>
                  updateSectionField(
                    "approve",
                    "proposerPosition",
                    e.target.value
                  )
                }
              />
            </FieldBlock>
            <FieldBlock label="วันที่เสนอ">
              <input
                type="date"
                className="form-input"
                value={form.approve.proposeDate || ""}
                onChange={(e) =>
                  updateSectionField("approve", "proposeDate", e.target.value)
                }
              />
            </FieldBlock>
          </div>
          <div className="grid grid-cols-1 gap-4 mt-4">
            <FieldBlock label="ความเห็นหัวหน้างาน/แผนก">
              <textarea
                className="form-textarea"
                rows={3}
                value={form.approve.deptComment || ""}
                onChange={(e) =>
                  updateSectionField("approve", "deptComment", e.target.value)
                }
              />
            </FieldBlock>
            <FieldBlock label="ความเห็นผู้บริหาร/ผู้อำนวยการ">
              <textarea
                className="form-textarea"
                rows={3}
                value={form.approve.directorComment || ""}
                onChange={(e) =>
                  updateSectionField(
                    "approve",
                    "directorComment",
                    e.target.value
                  )
                }
              />
            </FieldBlock>
          </div>
        </SectionCard>

        <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-200">
          <Link
            href={`/organizer/projects/my-project/${form.id ?? ""}`}
            className="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
          >
            ยกเลิก
          </Link>
          <button
            type="submit"
            disabled={saving}
            className="rounded-md bg-indigo-600 px-5 py-2 text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-60"
          >
            {saving ? "กำลังบันทึก..." : "บันทึกการเปลี่ยนแปลง"}
          </button>
        </div>
      </form>
    </main>
  );
}
