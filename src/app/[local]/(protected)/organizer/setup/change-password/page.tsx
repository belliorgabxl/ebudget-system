"use client";

import React, { useState } from "react";
import Link from "next/link";
import { ChangePassword } from "@/api/users";

type FormState = {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
};

type FormError = Partial<FormState & { general: string }>;

export default function ChangePasswordPage() {
  const [form, setForm] = useState<FormState>({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const [errors, setErrors] = useState<FormError>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");

  // state สำหรับ toggle ลูกตา
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleChange =
    (field: keyof FormState) => (e: React.ChangeEvent<HTMLInputElement>) => {
      setForm((prev) => ({ ...prev, [field]: e.target.value }));
      setErrors((prev) => ({
        ...prev,
        [field]: undefined,
        general: undefined,
      }));
      setSuccessMessage("");
    };

  const validate = (): boolean => {
    const newErrors: FormError = {};

    if (!form.currentPassword) {
      newErrors.currentPassword = "กรุณากรอกรหัสผ่านเดิม";
    }

    if (!form.newPassword) {
      newErrors.newPassword = "กรุณากรอกรหัสผ่านใหม่";
    } else if (form.newPassword.length < 8) {
      newErrors.newPassword = "รหัสผ่านใหม่ต้องมีอย่างน้อย 8 ตัวอักษร";
    } else if (
      !/[A-Za-z]/.test(form.newPassword) ||
      !/[0-9]/.test(form.newPassword)
    ) {
      newErrors.newPassword = "รหัสผ่านใหม่ควรมีทั้งตัวอักษรและตัวเลข";
    }

    if (!form.confirmPassword) {
      newErrors.confirmPassword = "กรุณายืนยันรหัสผ่านใหม่";
    } else if (form.confirmPassword !== form.newPassword) {
      newErrors.confirmPassword = "รหัสผ่านใหม่และการยืนยันไม่ตรงกัน";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validate()) return;

    setIsSubmitting(true);
    setErrors({});
    setSuccessMessage("");

    try {
      const message = await ChangePassword(
        form.currentPassword,
        form.newPassword
      );

      setSuccessMessage(message || "เปลี่ยนรหัสผ่านสำเร็จ");
      setForm({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
    } catch (err: any) {
      setErrors({
        general:
          err?.message || "ไม่สามารถเปลี่ยนรหัสผ่านได้ กรุณาลองใหม่อีกครั้ง",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const passwordStrength = (() => {
    const p = form.newPassword;
    if (!p) return { label: "ยังไม่ได้ตั้ง", level: 0 };
    let score = 0;
    if (p.length >= 8) score++;
    if (p.length >= 12) score++;
    if (/[0-9]/.test(p) && /[A-Za-z]/.test(p)) score++;
    if (/[^A-Za-z0-9]/.test(p)) score++;

    if (score <= 1) return { label: "อ่อน", level: 1 };
    if (score === 2) return { label: "ปานกลาง", level: 2 };
    if (score >= 3) return { label: "แข็งแรง", level: 3 };
    return { label: "ยังไม่ได้ตั้ง", level: 0 };
  })();

  // ไอคอนลูกตาเล็ก ๆ
  const EyeIcon = ({ off }: { off?: boolean }) => (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      className="h-4 w-4"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    >
      {off ? (
        <>
          <path d="M3 3l18 18" />
          <path d="M10.58 10.58A2 2 0 0 0 12 14a2 2 0 0 0 1.42-.58" />
          <path d="M16.24 16.24A8.44 8.44 0 0 1 12 18c-4.5 0-8.27-2.89-10-7 1-2.46 2.71-4.5 4.88-5.74" />
          <path d="M9.88 4.12A8.46 8.46 0 0 1 12 4c4.5 0 8.27 2.89 10 7a11.76 11.76 0 0 1-1.57 2.88" />
        </>
      ) : (
        <>
          <path d="M1 12s4-7 11-7 11 7 11 7-4 7-11 7S1 12 1 12z" />
          <circle cx="12" cy="12" r="3" />
        </>
      )}
    </svg>
  );

  return (
    <div className="min-h-screen bg-white text-slate-800 flex items-start justify-center px-4 py-10">
      <div className="w-full max-w-md">
        <div className="mb-6 text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-blue-200 bg-blue-50 px-3 py-1 text-xs text-blue-700">
            eBudget • Security
          </div>
          <h1 className="mt-4 text-2xl font-semibold tracking-tight text-slate-900">
            เปลี่ยนรหัสผ่าน
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            เพื่อความปลอดภัย เราแนะนำให้เปลี่ยนรหัสผ่านเป็นระยะ
          </p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white shadow-xl">
          <div className="border-b border-slate-200 px-6 py-4">
            <span className="text-xs font-medium text-blue-600">
              CHANGE PASSWORD
            </span>
            <p className="text-sm text-slate-500">ตั้งค่ารหัสผ่านใหม่ของคุณ</p>
          </div>

          <form onSubmit={handleSubmit} className="px-6 py-5 space-y-5">
            {errors.general && (
              <div className="rounded-lg border border-red-300 bg-red-50 px-3 py-2 text-xs text-red-700">
                {errors.general}
              </div>
            )}

            {successMessage && (
              <div className="rounded-lg border border-green-300 bg-green-50 px-3 py-2 text-xs text-green-700">
                {successMessage}
              </div>
            )}

            {/* รหัสผ่านเดิม */}
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-slate-700">
                รหัสผ่านเดิม
              </label>
              <div className="relative">
                <input
                  type={showCurrentPassword ? "text" : "password"}
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 pr-9 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none"
                  placeholder="********"
                  value={form.currentPassword}
                  onChange={handleChange("currentPassword")}
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-2 flex items-center text-slate-400 hover:text-slate-600"
                  onClick={() => setShowCurrentPassword((prev) => !prev)}
                  aria-label="Toggle current password visibility"
                >
                  <EyeIcon off={!showCurrentPassword} />
                </button>
              </div>
              {errors.currentPassword && (
                <p className="text-[11px] text-red-500">
                  {errors.currentPassword}
                </p>
              )}
            </div>

            {/* รหัสผ่านใหม่ */}
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-slate-700">
                รหัสผ่านใหม่
              </label>

              <div className="relative">
                <input
                  type={showNewPassword ? "text" : "password"}
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 pr-9 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none"
                  placeholder="กำหนดรหัสผ่านใหม่ของคุณ"
                  value={form.newPassword}
                  onChange={handleChange("newPassword")}
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-2 flex items-center text-slate-400 hover:text-slate-600"
                  onClick={() => setShowNewPassword((prev) => !prev)}
                  aria-label="Toggle new password visibility"
                >
                  <EyeIcon off={!showNewPassword} />
                </button>
              </div>

              {errors.newPassword && (
                <p className="text-[11px] text-red-500">{errors.newPassword}</p>
              )}

              <div className="mt-1.5 flex items-center justify-between gap-2">
                <div className="flex-1 flex gap-1">
                  {[1, 2, 3].map((i) => (
                    <div
                      key={i}
                      className={`h-1.5 flex-1 rounded-full transition-all ${
                        passwordStrength.level >= i
                          ? passwordStrength.level === 1
                            ? "bg-red-400"
                            : passwordStrength.level === 2
                            ? "bg-yellow-400"
                            : "bg-green-500"
                          : "bg-slate-200"
                      }`}
                    />
                  ))}
                </div>
                <span className="text-[11px] text-slate-500">
                  ความแข็งแรง:{" "}
                  <span className="font-medium text-blue-600">
                    {passwordStrength.label}
                  </span>
                </span>
              </div>
            </div>

            {/* ยืนยันรหัสผ่านใหม่ */}
            <div className="sace-y-1.5">
              <label className="text-xs font-medium text-slate-700">
                ยืนยันรหัสผ่านใหม่
              </label>
              <div className="relative">
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 pr-9 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none"
                  placeholder="ยืนยันรหัสผ่านใหม่"
                  value={form.confirmPassword}
                  onChange={handleChange("confirmPassword")}
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-2 flex items-center text-slate-400 hover:text-slate-600"
                  onClick={() => setShowConfirmPassword((prev) => !prev)}
                  aria-label="Toggle confirm password visibility"
                >
                  <EyeIcon off={!showConfirmPassword} />
                </button>
              </div>
              {errors.confirmPassword && (
                <p className="text-[11px] text-red-500">
                  {errors.confirmPassword}
                </p>
              )}
            </div>

            <div className="pt-2 flex items-center justify-between">
              <Link
                href="/"
                className="text-xs text-slate-500 hover:text-blue-600 underline-offset-2 hover:underline"
              >
                ← กลับไปหน้าแรก
              </Link>

              <button
                type="submit"
                disabled={isSubmitting}
                onClick={(e) => {
                  handleSubmit(e);
                }}
                className="rounded-lg bg-blue-600 text-white px-4 py-2 text-xs font-medium shadow hover:bg-blue-700 disabled:opacity-70"
              >
                {isSubmitting ? "กำลังบันทึก..." : "บันทึกรหัสผ่านใหม่"}
              </button>
            </div>
          </form>
        </div>
        <p className="mt-4 text-center text-[11px] text-slate-400">
          เพื่อความปลอดภัย หลีกเลี่ยงการใช้รหัสผ่านซ้ำกับระบบอื่น
        </p>
      </div>
    </div>
  );
}
