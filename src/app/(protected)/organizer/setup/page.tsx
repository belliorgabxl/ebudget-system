"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Save,
  LogOut,
  PencilLine,
  X,
  KeyRound,
  Loader2,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useToast } from "@/components/ToastProvider";
import ChangePasswordModal from "@/components/user/ChangePasswordModal";

type ProfileData = {
  username: string;
  first_name: string;
  last_name: string;
  email: string;
  position: string;
  organization_name?: string;
  department_name?: string;
  role?: string;
};

type ProfilePayload = {
  username: string;
  first_name: string;
  last_name: string;
  email: string;
  position?: string;
};

type ApiResult<T = any> =
  | { ok: true; data: T }
  | { ok: false; message: string };

async function fetchProfile(): Promise<ApiResult<ProfileData>> {
  try {
    const resp = await fetch("/api/users/me", {
      cache: "no-store",
    });
    if (!resp.ok) return { ok: false, message: `Failed to fetch profile (${resp.status})` };
    const data = await resp.json();
    if (!data.success) return { ok: false, message: data.message || "Failed to fetch profile" };
    return { ok: true, data: data.data };
  } catch (e: any) {
    return { ok: false, message: e?.message ?? "Fetch error" };
  }
}

async function saveProfile(payload: ProfilePayload): Promise<ApiResult> {
  try {
    const resp = await fetch("/api/users/me", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    if (!resp.ok) return { ok: false, message: `Save failed (${resp.status})` };
    const data = await resp.json();
    if (!data.success) return { ok: false, message: data.message || "Failed to save profile" };
    return { ok: true, data: data.data };
  } catch (e: any) {
    return { ok: false, message: e?.message ?? "Save error" };
  }
}

export default function AccountSettingsPage() {
  const router = useRouter();
  const { push } = useToast();

  const [form, setForm] = useState<ProfileData>({
    username: "",
    first_name: "",
    last_name: "",
    email: "",
    position: "",
    organization_name: "",
    department_name: "",
    role: "",
  });
  const [originalData, setOriginalData] = useState<ProfileData | null>(null);
  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showChangePassword, setShowChangePassword] = useState(false);

  useEffect(() => {
    const loadProfile = async () => {
      setLoadingData(true);
      const result = await fetchProfile();
      if (result.ok) {
        setForm(result.data);
        setOriginalData(result.data);
      } else {
        push("error", "โหลดข้อมูลไม่สำเร็จ", result.message);
      }
      setLoadingData(false);
    };
    loadProfile();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!editing) return;
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const emailValid = useMemo(
    () => /\S+@\S+\.\S+/.test(form.email),
    [form.email]
  );

  const handleChangePassword = async (currentPassword: string, newPassword: string) => {
    try {
      const res = await fetch("/api/users/me/password", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          current_password: currentPassword,
          new_password: newPassword,
        }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.message || "Failed to change password");
      }

      push("success", "เปลี่ยนรหัสผ่านสำเร็จ", "รหัสผ่านถูกเปลี่ยนแล้ว");
    } catch (err: any) {
      push("error", "เปลี่ยนรหัสผ่านไม่สำเร็จ", err?.message || "เกิดข้อผิดพลาด");
      throw err;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editing) return;
    setError(null);

    if (!emailValid) return setError("รูปแบบอีเมลไม่ถูกต้อง");

    setLoading(true);
    try {
      const payload: ProfilePayload = {
        username: form.username.trim(),
        first_name: form.first_name.trim(),
        last_name: form.last_name.trim(),
        email: form.email.trim(),
        position: form.position.trim(),
      };

      const res = await saveProfile(payload);
      if (!res.ok) throw new Error(res.message);

      setOriginalData(form);
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
    if (originalData) {
      setForm(originalData);
    }
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

  if (loadingData) {
    return (
      <main className="mx-auto max-w-4xl px-4 py-8">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <div className="h-8 bg-gray-200 rounded w-64 mb-2"></div>
            <div className="h-4 bg-gray-200 rounded w-80"></div>
          </div>
          <div className="h-10 bg-gray-200 rounded w-24"></div>
        </div>

        <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-xl space-y-6">
          <div className="flex flex-col items-center justify-center gap-3">
            <div className="h-24 w-24 bg-gray-200 rounded-full animate-pulse"></div>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <div className="h-4 bg-gray-200 rounded w-20 mb-2"></div>
              <div className="h-10 bg-gray-200 rounded w-full"></div>
            </div>
            <div>
              <div className="h-4 bg-gray-200 rounded w-16 mb-2"></div>
              <div className="h-10 bg-gray-200 rounded w-full"></div>
            </div>
            <div>
              <div className="h-4 bg-gray-200 rounded w-24 mb-2"></div>
              <div className="h-10 bg-gray-200 rounded w-full"></div>
            </div>
            <div>
              <div className="h-4 bg-gray-200 rounded w-20 mb-2"></div>
              <div className="h-10 bg-gray-200 rounded w-full"></div>
            </div>
            <div>
              <div className="h-4 bg-gray-200 rounded w-16 mb-2"></div>
              <div className="h-10 bg-gray-200 rounded w-full"></div>
            </div>
            <div>
              <div className="h-4 bg-gray-200 rounded w-24 mb-2"></div>
              <div className="h-10 bg-gray-200 rounded w-full"></div>
            </div>
          </div>

          <div className="flex items-center justify-center gap-4 pt-4">
            <div className="h-10 bg-gray-200 rounded w-32"></div>
            <div className="h-10 bg-gray-200 rounded w-24"></div>
          </div>
        </div>
      </main>
    );
  }

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
          <div className="flex h-24 w-24 flex-shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-blue-600 to-blue-700 text-white">
            <span className="text-lg font-medium">
              {form.username?.charAt(0)?.toUpperCase() || ""}
              {form.username?.charAt(1)?.toUpperCase() || ""}
            </span>
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              ชื่อผู้ใช้
            </label>
            <input
              type="text"
              name="username"
              value={form.username}
              onChange={handleChange}
              readOnly={!editing}
              aria-disabled={!editing}
              className={`${inputClass} ${
                !editing ? "bg-gray-50 text-gray-500" : ""
              }`}
              placeholder="username"
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
              ชื่อจริง
            </label>
            <input
              type="text"
              name="first_name"
              value={form.first_name}
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
              นามสกุล
            </label>
            <input
              type="text"
              name="last_name"
              value={form.last_name}
              onChange={handleChange}
              readOnly={!editing}
              aria-disabled={!editing}
              className={`${inputClass} ${
                !editing ? "bg-gray-50 text-gray-500" : ""
              }`}
              placeholder="นามสกุลของคุณ"
            />
          </div>

          <div className="sm:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              ตำแหน่ง
            </label>
            <input
              type="text"
              value={form.position || "-"}
              readOnly
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm bg-gray-50 text-gray-500 cursor-not-allowed"
              placeholder="-"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              องค์กร
            </label>
            <input
              type="text"
              value={form.organization_name || "-"}
              readOnly
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm bg-gray-50 text-gray-500 cursor-not-allowed"
              placeholder="-"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              แผนก
            </label>
            <input
              type="text"
              value={form.department_name || "-"}
              readOnly
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm bg-gray-50 text-gray-500 cursor-not-allowed"
              placeholder="-"
            />
          </div>

          <div className="sm:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              บทบาท
            </label>
            <input
              type="text"
              value={form.role || "-"}
              readOnly
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm bg-gray-50 text-gray-500 cursor-not-allowed"
              placeholder="-"
            />
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
            onClick={() => setShowChangePassword(true)}
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

      <ChangePasswordModal
        open={showChangePassword}
        onClose={() => setShowChangePassword(false)}
        onConfirm={handleChangePassword}
      />
    </main>
  );
}

const inputClass = `
  w-full rounded-lg border border-gray-300 px-3 py-2 text-sm
  focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500
`;
