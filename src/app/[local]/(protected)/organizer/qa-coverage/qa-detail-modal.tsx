"use client";

import React, { useEffect, useState, useCallback } from "react";
import { X, Edit2, Save } from "lucide-react";
import { GetQaIndicatorsDetailByIdApi, UpdateQaDetailFromApi } from "@/api/qa/route";
import type { GetQaIndicatorsRespond, QaRequest } from "@/dto/qaDto";

type QADetailModalProps = {
  qaId: string;
  onClose: () => void;
  onUpdate: (updated: any) => void;
  initialData?: Partial<GetQaIndicatorsRespond> | null;
  fetchIfMissing?: boolean;
};

type FormDataType = {
  id: string;
  code?: string;
  name?: string;
  projects?: number; // maps to project_count
  description?: string;
  year?: number;
};

export default function QADetailModal({
  qaId,
  onClose,
  onUpdate,
  initialData = null,
  fetchIfMissing = true,
}: QADetailModalProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState<FormDataType>({
    id: qaId,
    code: qaId,
    name: "",
    projects: 0,
    description: "",
    year: undefined,
  });
  const [original, setOriginal] = useState<FormDataType | null>(null); // keep original to allow cancel
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Robust reader for project count (support many keys and string numbers)
  function readProjectsFromRec(rec: any): number {
    if (!rec || typeof rec !== "object") return 0;
    const candidates = [
      rec.project_count,
      rec.projectCount,
      rec.count_projects,
      rec.count_project,
      rec.projects,
      rec.count,
      rec.total,
      rec.value,
    ];
    for (const c of candidates) {
      if (typeof c === "number") return c;
      if (typeof c === "string" && c.trim() !== "" && !Number.isNaN(Number(c))) return Number(c);
    }
    return 0;
  }

  function mapApiRecordToForm(rec: Partial<GetQaIndicatorsRespond> & any, fallbackId: string): FormDataType {
    const projects = readProjectsFromRec(rec);
    const code = rec.code ?? rec.id ?? fallbackId ?? "";
    const name = rec.name ?? rec.title ?? "";
    const description = rec.description ?? "";
    const year = typeof rec.year === "number" ? rec.year : rec.year ? Number(rec.year) : undefined;

    return {
      id: String(rec.id ?? fallbackId),
      code: String(code),
      name: String(name),
      projects,
      description: String(description),
      year,
    };
  }

  useEffect(() => {
    let mounted = true;

    const applyRecord = (rec: any) => {
      if (!mounted) return;
      const mapped = mapApiRecordToForm(rec ?? {}, qaId);
      setFormData(mapped);
      setOriginal(mapped);
      setLoading(false);
      setError(null);
    };

    if (initialData) {
      applyRecord(initialData);
    }

    if (!fetchIfMissing && !initialData) {
      onClose();
      return () => {
        mounted = false;
      };
    }

    setLoading(true);
    setError(null);
    (async () => {
      try {
        const data = await GetQaIndicatorsDetailByIdApi(String(qaId));
        if (!mounted) return;
        const rec = Array.isArray(data) ? data[0] : data;
        if (!rec) {
          setError("ไม่พบข้อมูลรายละเอียดจาก API");
          setLoading(false);
          return;
        }
        applyRecord(rec);
      } catch (err: any) {
        if (!mounted) return;
        console.error("GetQaIndicatorsDetailByIdApi error:", err);
        let msg = "ไม่สามารถดึงข้อมูลรายละเอียดได้";
        if (err?.message) msg += `: ${err.message}`;
        setError(msg);
        setLoading(false);
      }
    })();

    return () => {
      mounted = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [qaId]);

  const startEditing = () => {
    if ((formData.projects ?? 0) > 0) return;
    setOriginal(formData);
    setIsEditing(true);
    setError(null);
  };

  // async save -> call UpdateQaDetailFromApi
  const handleSave = useCallback(async () => {
    setError(null);

    // basic validation
    if (!formData.name || formData.name.trim() === "") {
      setError("กรุณากรอกชื่อตัวบ่งชี้");
      return;
    }

    const safePayload: Partial<QaRequest> = {
      // we don't change id/code here
      name: formData.name?.trim(),
      description: formData.description?.trim(),
      // assume API expects numeric year (CE). If your UI uses BE, convert here before sending.
      year: typeof formData.year === "number" ? formData.year : formData.year ? Number(formData.year) : undefined,
    };

    try {
      setLoading(true);
      const ok = await UpdateQaDetailFromApi(String(formData.id), safePayload);
      setLoading(false);

      if (!ok) {
        setError("อัปเดตไม่สำเร็จ กรุณาลองอีกครั้ง");
        return;
      }

      // success: update original, exit editing, notify parent
      const updated: FormDataType = { ...formData };
      setOriginal(updated);
      setIsEditing(false);
      setError(null);

      // onUpdate expected to accept updated record (you can change shape as needed)
      onUpdate(updated);
    } catch (err: any) {
      console.error("UpdateQaDetailFromApi error:", err);
      setLoading(false);
      setError(err?.message ?? "เกิดข้อผิดพลาดขณะอัปเดต");
    }
  }, [formData, onUpdate]);

  const handleCancel = () => {
    if (original) setFormData(original);
    setIsEditing(false);
    setError(null);
  };

  const projectsLocked = (formData.projects ?? 0) > 0;
  const fieldsEditable = isEditing && !projectsLocked;

  // close modal and reset state
  const handleClose = useCallback(() => {
    if (original) setFormData(original);
    setIsEditing(false);
    setError(null);
    onClose();
  }, [original, onClose]);

  // close on Escape
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") handleClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [handleClose]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) handleClose();
      }}
    >
      <div
        className="w-full max-w-2xl rounded-2xl bg-white shadow-xl max-h-[90vh] overflow-y-auto"
        onMouseDown={(e) => e.stopPropagation()}
      >
        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-slate-200 bg-white px-6 py-4">
          <div>
            <h3 className="text-lg font-semibold text-slate-900">รายละเอียดตัวบ่งชี้ QA</h3>
            {loading ? <div className="text-xs text-slate-500 mt-1">กำลังประมวลผล...</div> : null}
            {error ? <div className="text-xs text-rose-600 mt-1">{error}</div> : null}
          </div>

          <div className="flex items-center gap-2">
            {!isEditing ? (
              <button
                onClick={startEditing}
                disabled={projectsLocked}
                title={projectsLocked ? "มีโครงการเชื่อมโยงอยู่ ไม่สามารถแก้ไขได้" : "แก้ไข"}
                className={`inline-flex items-center gap-2 rounded-lg px-3 py-1.5 text-sm font-medium transition-colors ${
                  projectsLocked
                    ? "bg-slate-50 text-slate-400 border border-slate-100 cursor-not-allowed"
                    : "text-indigo-600 hover:bg-indigo-50"
                }`}
              >
                <Edit2 className="h-4 w-4" /> แก้ไข
              </button>
            ) : (
              <div className="flex items-center gap-2">
                <button
                  onClick={handleSave}
                  disabled={loading}
                  className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-indigo-700 transition-colors disabled:opacity-60"
                >
                  <Save className="h-4 w-4" /> {loading ? "กำลังบันทึก..." : "บันทึก"}
                </button>
                <button onClick={handleCancel} className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-1 text-sm text-slate-700 hover:bg-slate-50">
                  ยกเลิก
                </button>
              </div>
            )}

            <button onClick={handleClose} className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors" aria-label="close">
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        <div className="p-6 space-y-6">
          <div>
            <div className="inline-flex items-center rounded-lg bg-white px-3 py-1.5 text-sm font-semibold text-indigo-700 shadow-sm">{formData.code}</div>
            {!isEditing ? (
              <h4 className="mt-3 text-xl font-semibold text-slate-900">{formData.name || "-"}</h4>
            ) : (
              <input
                type="text"
                value={formData.name ?? ""}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                disabled={!fieldsEditable}
                className={`mt-3 w-full rounded-lg border px-3 py-2 text-lg font-semibold focus:outline-none ${
                  fieldsEditable ? "border-indigo-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100" : "border-slate-200 bg-slate-50 text-slate-500"
                }`}
              />
            )}
          </div>

          <div>
            <div className="text-xs text-slate-500">คำอธิบาย</div>
            {!isEditing ? (
              <p className="mt-1 text-sm text-slate-700">{formData.description || '-'}</p>
            ) : (
              <textarea
                value={formData.description ?? ''}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                disabled={!fieldsEditable}
                className={`mt-1 w-full rounded-lg border px-3 py-2 text-sm focus:outline-none ${
                  fieldsEditable ? "border-slate-300 focus:border-indigo-500" : "border-slate-200 bg-slate-50 text-slate-500"
                }`}
                rows={4}
              />
            )}
          </div>

          <div className="flex items-end gap-6">
            <div className="flex-1">
              <div className="text-xs text-slate-500">จำนวนโครงการ</div>
              <div className="mt-1 text-2xl font-bold text-slate-900">{(formData.projects ?? 0).toLocaleString()}</div>
            </div>

            <div className="w-40">
              <div className="text-xs text-slate-500">ปี</div>
              <div className="font-medium text-slate-900">{formData.year ?? '-'}</div>
            </div>
          </div>

          <div className="flex items-center justify-end gap-2">
            {!isEditing ? null : (
              <button onClick={handleSave} disabled={loading} className="inline-flex items-center gap-2 rounded-md bg-indigo-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-indigo-700 transition-colors disabled:opacity-60">
                <Save className="h-4 w-4" /> {loading ? "กำลังบันทึก..." : "บันทึก"}
              </button>
            )}
            <button onClick={handleClose} className="inline-flex items-center gap-2 rounded-md border border-slate-200 bg-white px-3 py-1 text-sm text-slate-700 hover:bg-slate-50">
              ปิด
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
