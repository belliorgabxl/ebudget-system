"use client";

import { useMemo, useRef, useState } from "react";
import {
  Save,
  LogOut,
  Upload,
  PencilLine,
  X,
  KeyRound,
  Loader2,
} from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useToast } from "@/components/ToastProvider";

const USE_MOCK_API = true;

type ProfilePayload = {
  name: string;
  email: string;
  phone: string;
  position: string;
  avatarUrl?: string | null;
};

type ApiResult<T = any> =
  | { ok: true; data: T }
  | { ok: false; message: string };

async function uploadAvatar(file: File): Promise<ApiResult<{ url: string }>> {
  if (USE_MOCK_API) {
    const url = await new Promise<string>((res) => {
      const r = new FileReader();
      r.onload = () => res(String(r.result));
      r.readAsDataURL(file);
    });
    await new Promise((r) => setTimeout(r, 500));
    return { ok: true, data: { url } };
  }

  try {
    const fd = new FormData();
    fd.append("file", file);
    const resp = await fetch("/api/account/avatar", {
      method: "POST",
      body: fd,
    });
    if (!resp.ok)
      return { ok: false, message: `Upload failed (${resp.status})` };
    const data = await resp.json();
    return { ok: true, data };
  } catch (e: any) {
    return { ok: false, message: e?.message ?? "Upload error" };
  }
}

async function saveProfile(payload: ProfilePayload): Promise<ApiResult> {
  if (USE_MOCK_API) {
    await new Promise((r) => setTimeout(r, 700));
    return { ok: true, data: { updatedAt: new Date().toISOString() } };
  }

  try {
    const resp = await fetch("/api/account/profile", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    if (!resp.ok) return { ok: false, message: `Save failed (${resp.status})` };
    const data = await resp.json();
    return { ok: true, data };
  } catch (e: any) {
    return { ok: false, message: e?.message ?? "Save error" };
  }
}

export default function AccountSettingsPage() {
  const router = useRouter();
  const { push } = useToast();

  const initial = {
    name: "ภัทรจาริน นภากาญจน์",
    email: "patarajarin.n@tcc-technology.com",
    phone: "0812345678",
    position: "Backend Developer",
  };

  const [form, setForm] = useState({ ...initial });
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!editing) return;
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!editing) return;
    const file = e.target.files?.[0];
    if (!file) return;
    setAvatarFile(file);
    const reader = new FileReader();
    reader.onload = () => setAvatarPreview(reader.result as string);
    reader.readAsDataURL(file);
  };

  const emailValid = useMemo(
    () => /\S+@\S+\.\S+/.test(form.email),
    [form.email]
  );
  const phoneValid = useMemo(
    () => /^[0-9]{9,10}$/.test(form.phone.replace(/\D/g, "")),
    [form.phone]
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editing) return;
    setError(null);

    if (!emailValid) return setError("รูปแบบอีเมลไม่ถูกต้อง");
    if (!phoneValid) return setError("เบอร์โทรศัพท์ควรเป็นตัวเลข 9–10 หลัก");

    setLoading(true);
    try {
      let avatarUrl: string | null = null;
      if (avatarFile) {
        const up = await uploadAvatar(avatarFile);
        if (!up.ok) throw new Error(up.message);
        avatarUrl = up.data.url;
      }

      const payload: ProfilePayload = {
        name: form.name.trim(),
        email: form.email.trim(),
        phone: form.phone.trim(),
        position: form.position,
        avatarUrl,
      };

      const res = await saveProfile(payload);
      if (!res.ok) throw new Error(res.message);

      push("success", "อัปเดตข้อมูลสำเร็จ");
      setEditing(false);
    } catch (err: any) {
      const errorMsg = err?.message ?? "เกิดข้อผิดพลาดระหว่างบันทึกข้อมูล";
      push("error", "บันทึกข้อมูลไม่สำเร็จ", errorMsg);
      setError(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setForm({ ...initial });
    setAvatarFile(null);
    setAvatarPreview(null);
    setError(null);
    setEditing(false);
  };

  const handleLogout = async () => {
    try {
      setLoading(true);

      const res = await fetch("/api/auth/logout", { method: "POST" });
      if (!res.ok) throw new Error(`Logout failed: HTTP ${res.status}`);

      window.location.href = "/login";
    } catch (err) {
      console.log("logout api error:", err);
      setLoading(false);
    }
  };
  const goChangePassword = () => {
    router.push("/organizer/setup/change-password");
  };

  return (
    <main className="mx-auto max-w-4xl px-4 py-8">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-gray-900">
            ตั้งค่าบัญชีผู้ใช้
          </h1>
          <p className="text-sm text-gray-600">
            จัดการข้อมูลส่วนตัวและการเข้าสู่ระบบของคุณ
          </p>
        </div>

        {!editing ? (
          <button
            type="button"
            onClick={() => setEditing(true)}
            className="inline-flex items-center gap-2 rounded-md border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            <PencilLine className="h-4 w-4" />
            แก้ไข
          </button>
        ) : (
          <button
            type="button"
            onClick={handleCancel}
            className="inline-flex items-center gap-2 rounded-md border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            <X className="h-4 w-4" />
            ยกเลิก
          </button>
        )}
      </div>

      <form
        onSubmit={handleSubmit}
        className="rounded-xl border border-gray-200 bg-white p-6 shadow-xl space-y-6"
      >
        <div className="flex flex-col items-center justify-center gap-3">
          <div className="relative h-24 w-24">
            <Image
              src={avatarPreview || "/user.jpg"}
              alt="avatar"
              fill
              className="rounded-full object-cover border border-gray-200"
            />
          </div>
          <button
            type="button"
            disabled={!editing}
            onClick={() => editing && fileRef.current?.click()}
            className={`flex items-center gap-2 text-sm ${
              editing
                ? "text-indigo-600 hover:underline"
                : "text-gray-400 cursor-not-allowed"
            }`}
            title={editing ? "อัปโหลดรูปใหม่" : "กดปุ่มแก้ไขก่อนจึงอัปโหลดได้"}
          >
            <Upload className="h-4 w-4" /> เปลี่ยนรูปโปรไฟล์
          </button>
          <input
            ref={fileRef}
            id="avatar"
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleUpload}
          />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              ชื่อ - นามสกุล
            </label>
            <input
              type="text"
              name="name"
              value={form.name}
              onChange={handleChange}
              readOnly={!editing}
              aria-disabled={!editing}
              className={`${inputClass} ${
                !editing ? "bg-gray-50 text-gray-500" : ""
              }`}
              placeholder="ชื่อของคุณ"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              ตำแหน่ง{" "}
              <span className="text-gray-400">(ล็อกแก้ไขโดยผู้ดูแล)</span>
            </label>
            <input
              type="text"
              name="position"
              value={form.position}
              readOnly
              aria-disabled
              className={`${inputClass} bg-gray-50 text-gray-500 cursor-not-allowed`}
              title="แก้ไขได้โดยผู้ดูแลระบบเท่านั้น"
              placeholder="เช่น อาจารย์ / เจ้าหน้าที่ / Developer"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              อีเมล
            </label>
            <input
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              readOnly={!editing}
              aria-disabled={!editing}
              className={`${inputClass} ${emailValid ? "" : "border-red-400"} ${
                !editing ? "bg-gray-50 text-gray-500" : ""
              }`}
              placeholder="example@email.com"
            />
            {!emailValid && editing && (
              <p className="mt-1 text-xs text-red-600">
                กรุณากรอกอีเมลให้ถูกต้อง
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              เบอร์โทรศัพท์
            </label>
            <input
              type="tel"
              name="phone"
              inputMode="numeric"
              value={form.phone}
              onChange={handleChange}
              readOnly={!editing}
              aria-disabled={!editing}
              className={`${inputClass} ${phoneValid ? "" : "border-red-400"} ${
                !editing ? "bg-gray-50 text-gray-500" : ""
              }`}
              placeholder="08XXXXXXXX"
            />
            {!phoneValid && editing && (
              <p className="mt-1 text-xs text-red-600">
                กรุณากรอกเบอร์โทร 9–10 หลัก
              </p>
            )}
          </div>
        </div>

        {error && (
          <div className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
            {error}
          </div>
        )}

        <div className="flex flex-wrap items-center justify-end gap-3 pt-4 border-t border-gray-100">
          <button
            type="button"
            onClick={goChangePassword}
            className="inline-flex items-center gap-1 rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            <KeyRound className="h-4 w-4" />
            เปลี่ยนรหัสผ่าน
          </button>
          <button
            type="button"
            onClick={handleLogout}
            disabled={loading}
            className="inline-flex items-center gap-1 rounded-md border text-white bg-red-500 px-4 py-2 text-sm font-medium hover:bg-red-600 disabled:opacity-60"
          >
            {loading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <LogOut className="h-4 w-4" />
            )}
            ออกจากระบบ
          </button>
          {editing && (
            <button
              type="submit"
              disabled={loading}
              className="inline-flex items-center gap-1 rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-50"
            >
              <Save className="h-4 w-4" />
              {loading ? "กำลังบันทึก..." : "บันทึกการเปลี่ยนแปลง"}
            </button>
          )}
        </div>
      </form>
    </main>
  );
}

const inputClass = `
  w-full rounded-lg border border-gray-300 px-3 py-2 text-sm
  focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500
`;
