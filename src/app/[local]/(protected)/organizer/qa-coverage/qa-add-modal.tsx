// File: components/qa-coverage/AddQAModal.tsx
"use client";

import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { X } from "lucide-react";
import { CreateQaFromApi } from "@/api/qa/route";
import type { QaRequest } from "@/dto/qaDto";
import { useToast } from "@/components/ToastProvider"; // keep your import path

type AddQAModalProps = {
  onClose: () => void;
  onAdd: (newQA: { code: string; name: string; year?: number; projects?: number; gaps?: boolean }) => void;
  year: string | number;
  onSuccess?: () => void;
};

function beToCe(yearBe?: number | string | null): number | null {
  if (yearBe === undefined || yearBe === null) return null;
  const n = Number(yearBe);
  if (Number.isNaN(n)) return null;
  return n - 543;
}

export default function AddQAModal({ onClose, onAdd, year, onSuccess }: AddQAModalProps) {
  const toast = useToast();

  const currentBe = useMemo(() => {
    const now = new Date();
    return now.getFullYear() + 543;
  }, []);

  const yearOptions = useMemo(() => {
    const start = currentBe - 3;
    const end = currentBe + 5;
    const arr: number[] = [];
    for (let y = start; y <= end; y++) arr.push(y);
    return arr;
  }, [currentBe]);

  // initial form: prefer provided year prop, otherwise default to current BE
  const initialForm = useMemo(
    () => ({
      code: "",
      name: "",
      description: "",
      year:
        typeof year === "string"
          ? parseInt(year || "") || currentBe
          : (typeof year === "number" && !Number.isNaN(year) ? (year as number) : currentBe),
    }),
    [year, currentBe]
  );

  const [formData, setFormData] = useState<{ code: string; name: string; description: string; year?: number }>(
    initialForm
  );
  const [loading, setLoading] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  // per-field errors
  const [errors, setErrors] = useState<{
    code?: string | null;
    name?: string | null;
    description?: string | null;
    year?: string | null;
  }>({});

  const modalRef = useRef<HTMLDivElement | null>(null);
  const closingRef = useRef(false);

  const resetForm = useCallback(() => {
    setFormData(initialForm);
    setSubmitError(null);
    setErrors({});
    setLoading(false);
  }, [initialForm]);

  const handleClose = useCallback(() => {
    if (closingRef.current) return;
    closingRef.current = true;
    resetForm();
    onClose();
    setTimeout(() => {
      closingRef.current = false;
    }, 0);
  }, [onClose, resetForm]);

  useEffect(() => {
    function onPointerDown(e: PointerEvent) {
      const el = modalRef.current;
      if (!el) return;
      const target = e.target as Node | null;
      if (target && !el.contains(target)) {
        handleClose();
      }
    }

    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") {
        handleClose();
      }
    }

    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [handleClose]);

  const validate = (): boolean => {
    const next: typeof errors = {};
    if (!formData.code || formData.code.trim() === "") next.code = "กรุณากรอกรหัสตัวบ่งชี้";
    if (!formData.name || formData.name.trim() === "") next.name = "กรุณากรอกชื่อตัวบ่งชี้";
    if (!formData.description || formData.description.trim() === "") next.description = "กรุณากรอกคำอธิบาย";
    if (!formData.year) next.year = "กรุณาเลือกปีงบประมาณ (พ.ศ.)";
    setErrors(next);
    // return true when no errors
    return Object.keys(next).length === 0;
  };

  const handleSubmit = async () => {
    setSubmitError(null);
    setErrors({});
    const ok = validate();
    if (!ok) {
      toast.push("error", "ข้อมูลไม่ครบ", "กรุณาตรวจสอบช่องที่แจ้งข้อผิดพลาด");
      return;
    }

    const yearCe = beToCe(formData.year as number);
    if (yearCe === null) {
      setErrors((s) => ({ ...s, year: "ปีไม่ถูกต้อง" }));
      toast.push("error", "ปีไม่ถูกต้อง", "กรุณาเลือกปีงบประมาณเป็น พ.ศ. ที่ถูกต้อง");
      return;
    }

    const payload: QaRequest = {
      code: formData.code.trim(),
      description: formData.description.trim(),
      display_order: 1,
      name: formData.name.trim(),
      organization_id: "",
      year: yearCe,
    };

    try {
      setLoading(true);
      const okApi = await CreateQaFromApi(payload);
      setLoading(false);
      if (!okApi) {
        setSubmitError("สร้างตัวบ่งชี้ไม่สำเร็จ (API คืนค่าไม่สำเร็จหรือไม่มี token)");
        toast.push("error", "สร้างล้มเหลว", "API คืนค่าไม่สำเร็จหรือไม่มี token");
        return;
      }

      // optimistic parent update
      onAdd({
        code: payload.code,
        name: payload.name,
        year: formData.year,
        projects: 0,
        gaps: true,
      });

      // show success toast
      toast.push("success", "สร้างตัวบ่งชี้สำเร็จ", `${payload.code} — ${payload.name}`);

      // allow parent to refresh authoritative data
      try {
        if (onSuccess) await onSuccess();
      } catch (e) {
        // ignore parent errors
      }

      resetForm();
      onClose();
    } catch (err: any) {
      console.error("CreateQaFromApi error:", err);
      setLoading(false);
      setSubmitError(err?.message ?? "เกิดข้อผิดพลาดขณะสร้างตัวบ่งชี้");
      toast.push("error", "เกิดข้อผิดพลาด", err?.message ?? "สร้างตัวบ่งชี้ล้มเหลว");
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div
        ref={modalRef}
        className="w-full max-w-md rounded-2xl bg-white shadow-xl"
        onPointerDown={(e) => {
          e.stopPropagation();
        }}
      >
        <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4">
          <h3 className="text-lg font-semibold text-slate-900">เพิ่มตัวบ่งชี้ QA</h3>
          <button
            onClick={handleClose}
            className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors"
            aria-label="close"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="p-6 space-y-4">
          {/* global submit error */}
          {submitError ? <div className="text-sm text-rose-600">{submitError}</div> : null}

          {/* code field */}
          <div>
            <label className="flex items-center justify-between">
              <span className="block text-sm font-medium text-slate-700 mb-1.5">รหัสตัวบ่งชี้</span>
              {errors.code ? (
                <span className="text-xs text-rose-600 ml-2" id="error-code">
                  {errors.code}
                </span>
              ) : null}
            </label>
            <input
              type="text"
              value={formData.code}
              onChange={(e) => setFormData({ ...formData, code: e.target.value })}
              placeholder="เช่น QA-006"
              className={`w-full rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-2 ${
                errors.code ? "border-rose-300 focus:ring-rose-100" : "border-slate-300 focus:ring-indigo-100"
              }`}
              disabled={loading}
              aria-invalid={errors.code ? "true" : "false"}
              aria-describedby={errors.code ? "error-code" : undefined}
            />
          </div>

          {/* name field */}
          <div>
            <label className="flex items-center justify-between">
              <span className="block text-sm font-medium text-slate-700 mb-1.5">ชื่อตัวบ่งชี้</span>
              {errors.name ? (
                <span className="text-xs text-rose-600 ml-2" id="error-name">
                  {errors.name}
                </span>
              ) : null}
            </label>
            <textarea
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="ระบุชื่อตัวบ่งชี้"
              rows={2}
              className={`w-full rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-2 ${
                errors.name ? "border-rose-300 focus:ring-rose-100" : "border-slate-300 focus:ring-indigo-100"
              }`}
              disabled={loading}
              aria-invalid={errors.name ? "true" : "false"}
              aria-describedby={errors.name ? "error-name" : undefined}
            />
          </div>

          {/* description field */}
          <div>
            <label className="flex items-center justify-between">
              <span className="block text-sm font-medium text-slate-700 mb-1.5">คำอธิบาย</span>
              {errors.description ? (
                <span className="text-xs text-rose-600 ml-2" id="error-description">
                  {errors.description}
                </span>
              ) : null}
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="คำอธิบายสั้น ๆ"
              rows={3}
              className={`w-full rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-2 ${
                errors.description ? "border-rose-300 focus:ring-rose-100" : "border-slate-300 focus:ring-indigo-100"
              }`}
              disabled={loading}
              aria-invalid={errors.description ? "true" : "false"}
              aria-describedby={errors.description ? "error-description" : undefined}
            />
          </div>

          {/* year (พ.ศ.) dropdown */}
          <div>
            <label className="flex items-center justify-between">
              <span className="block text-sm font-medium text-slate-700 mb-1.5">ปีงบประมาณ (พ.ศ.)</span>
              {errors.year ? (
                <span className="text-xs text-rose-600 ml-2" id="error-year">
                  {errors.year}
                </span>
              ) : null}
            </label>
            <select
              value={formData.year ?? ""}
              onChange={(e) =>
                setFormData({ ...formData, year: e.target.value ? parseInt(e.target.value) : undefined })
              }
              className={`w-full rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-2 ${
                errors.year ? "border-rose-300 focus:ring-rose-100" : "border-slate-300 focus:ring-indigo-100"
              }`}
              disabled={loading}
              aria-invalid={errors.year ? "true" : "false"}
              aria-describedby={errors.year ? "error-year" : undefined}
            >
              <option value="">-- เลือกปีงบประมาณ (พ.ศ.) --</option>
              {yearOptions.map((y) => (
                <option key={y} value={y}>
                  {y}
                </option>
              ))}
            </select>
            <p className="mt-1 text-xs text-slate-400">เลือกปีเป็น พ.ศ. (ระบบจะแปลงเป็น ค.ศ. ก่อนส่ง)</p>
          </div>

          <div className="flex gap-3 pt-4">
            <button
              onClick={handleClose}
              className="flex-1 rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors"
              disabled={loading}
            >
              ยกเลิก
            </button>
            <button
              onClick={handleSubmit}
              className="flex-1 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 transition-colors disabled:opacity-60"
              disabled={loading}
            >
              {loading ? "กำลังเพิ่ม..." : "เพิ่มตัวบ่งชี้"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
