"use client";

import React, { useState } from "react";
import { X, Eye, EyeOff, RefreshCw } from "lucide-react";

type Props = {
  open: boolean;
  userId: string;
  username: string;
  onClose: () => void;
  onConfirm: (password: string) => Promise<void>;
};

function generatePassword(length: number = 12): string {
  const lowercase = "abcdefghijklmnopqrstuvwxyz";
  const uppercase = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  const numbers = "0123456789";
  const symbols = "!@#$%^&*";
  const allChars = lowercase + uppercase + numbers + symbols;

  let password = "";
  // Ensure at least one character from each category
  password += lowercase[Math.floor(Math.random() * lowercase.length)];
  password += uppercase[Math.floor(Math.random() * uppercase.length)];
  password += numbers[Math.floor(Math.random() * numbers.length)];
  password += symbols[Math.floor(Math.random() * symbols.length)];

  // Fill the rest randomly
  for (let i = password.length; i < length; i++) {
    password += allChars[Math.floor(Math.random() * allChars.length)];
  }

  // Shuffle the password
  return password
    .split("")
    .sort(() => Math.random() - 0.5)
    .join("");
}

export default function ResetPasswordModal({ open, userId, username, onClose, onConfirm }: Props) {
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  const handleGenerate = () => {
    const generated = generatePassword(12);
    setNewPassword(generated);
    setConfirmPassword(generated);
    setError("");
  };

  const handleSubmit = async () => {
    setError("");

    if (!newPassword || !confirmPassword) {
      setError("กรุณากรอกรหัสผ่านทั้งสองช่อง");
      return;
    }

    if (newPassword !== confirmPassword) {
      setError("รหัสผ่านไม่ตรงกัน");
      return;
    }

    if (newPassword.length < 8) {
      setError("รหัสผ่านต้องมีอย่างน้อย 8 ตัวอักษร");
      return;
    }

    setIsSubmitting(true);
    try {
      await onConfirm(newPassword);
      setNewPassword("");
      setConfirmPassword("");
      onClose();
    } catch (err: any) {
      setError(err?.message || "เกิดข้อผิดพลาด");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setNewPassword("");
    setConfirmPassword("");
    setError("");
    onClose();
  };

  if (!open) return null;

  return (
    <div
      aria-modal="true"
      role="dialog"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
      onClick={(e) => e.target === e.currentTarget && handleClose()}
    >
      <div
        className="w-full max-w-md rounded-2xl bg-white shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4">
          <h3 className="text-lg font-semibold text-slate-900">รีเซ็ตรหัสผ่าน</h3>
          <button
            onClick={handleClose}
            className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
            aria-label="close"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="p-6 space-y-4">
          <div className="rounded-lg bg-blue-50 p-3 text-sm text-blue-800">
            <p className="font-medium">ผู้ใช้: {username}</p>
            <p className="text-xs mt-1 text-blue-600">รหัสผ่านใหม่จะถูกตั้งค่าสำหรับผู้ใช้นี้</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">
              รหัสผ่านใหม่
            </label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                value={newPassword}
                onChange={(e) => {
                  setNewPassword(e.target.value);
                  setError("");
                }}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 pr-10 text-sm focus:ring-2 focus:ring-indigo-100 focus:border-indigo-500"
                placeholder="กรอกรหัสผ่านใหม่"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">
              ยืนยันรหัสผ่าน
            </label>
            <div className="relative">
              <input
                type={showConfirmPassword ? "text" : "password"}
                value={confirmPassword}
                onChange={(e) => {
                  setConfirmPassword(e.target.value);
                  setError("");
                }}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 pr-10 text-sm focus:ring-2 focus:ring-indigo-100 focus:border-indigo-500"
                placeholder="กรอกรหัสผ่านอีกครั้ง"
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>

          <button
            type="button"
            onClick={handleGenerate}
            className="w-full flex items-center justify-center gap-2 rounded-lg border border-indigo-300 bg-indigo-50 px-4 py-2 text-sm font-medium text-indigo-700 hover:bg-indigo-100"
          >
            <RefreshCw className="h-4 w-4" />
            สุ่มรหัสผ่าน
          </button>

          {error && (
            <div className="rounded-lg bg-red-50 p-3 text-sm text-red-800">
              {error}
            </div>
          )}
        </div>

        <div className="px-6 pb-4 flex justify-end gap-2 border-t border-slate-200 pt-4">
          <button
            onClick={handleClose}
            disabled={isSubmitting}
            className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50"
          >
            ยกเลิก
          </button>
          <button
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="rounded-lg bg-indigo-600 text-white px-4 py-2 text-sm font-medium hover:bg-indigo-700 disabled:opacity-50"
          >
            {isSubmitting ? "กำลังรีเซ็ต..." : "รีเซ็ตรหัสผ่าน"}
          </button>
        </div>
      </div>
    </div>
  );
}
