// src/app/(protected)/organizer/department/[id]/ClientDepartmentDetail.tsx
"use client";

import React, { useEffect, useState } from "react";
import {
  GetDepartmentsDetailByIdFromApi,
  GetUsersByDepartmentIdFromApi,
} from "@/api/department";
import type { Department as DepartmentDto } from "@/dto/departmentDto";
import type { GetUserRespond } from "@/dto/userDto";
import { GetUserByIdFromApi } from "@/api/users.client";
import Link from "next/link";
import BackGroundLight from "@/components/background/bg-light";
import UsersTable from "@/components/user/UserTable";
import UserDetailsModal from "@/app/(protected)/organizer/users/UserDetailsModal";
import EditDepartmentModal from "@/components/department/EditDepartmentModal";
import { useToast } from "@/components/ToastProvider";

function CodeBadge({ children }: React.PropsWithChildren) {
  return (
    <span className="inline-flex items-center rounded-md border border-indigo-200 bg-indigo-50 px-2 py-0.5 text-[11px] font-medium text-indigo-700">
      {children}
    </span>
  );
}

function StatCard({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
      <div className="text-xs font-medium uppercase tracking-wide text-gray-500">
        {label}
      </div>
      <div className="mt-1 text-lg font-semibold text-gray-900 tabular-nums">
        {value}
      </div>
    </div>
  );
}

/* =====================================================
 * Skeletons (เหมือน UsersTable)
 * ===================================================== */

function DepartmentHeaderSkeleton() {
  return (
    <div className="mb-6 space-y-2">
      <div className="h-4 w-48 rounded bg-gray-200 animate-pulse" />
      <div className="h-6 w-64 rounded bg-gray-200 animate-pulse" />
      <div className="h-4 w-32 rounded bg-gray-200 animate-pulse" />
    </div>
  );
}

function StatCardSkeleton() {
  return (
    <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
      <div className="h-3 w-24 rounded bg-gray-200 animate-pulse" />
      <div className="mt-3 h-6 w-16 rounded bg-gray-200 animate-pulse" />
    </div>
  );
}

function DepartmentUserSkeletonRow({ rows = 6 }: { rows?: number }) {
  return (
    <>
      {Array.from({ length: rows }).map((_, idx) => (
        <tr key={`sk-${idx}`} className="border-b border-gray-100">
          <td className="p-3">
            <div className="mx-auto h-4 w-32 rounded bg-gray-200 animate-pulse" />
          </td>
          <td className="p-3">
            <div className="mx-auto h-4 w-24 rounded bg-gray-200 animate-pulse" />
          </td>
          <td className="p-3">
            <div className="mx-auto h-4 w-20 rounded bg-gray-200 animate-pulse" />
          </td>
          <td className="p-3">
            <div className="mx-auto h-4 w-16 rounded bg-gray-200 animate-pulse" />
          </td>
        </tr>
      ))}
    </>
  );
}

function DepartmentPageSkeleton() {
  return (
          <BackGroundLight>
    <main className="mx-auto max-w-5xl px-4 py-6">
      <DepartmentHeaderSkeleton />

      <section className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatCardSkeleton />
        <StatCardSkeleton />
        <StatCardSkeleton />
      </section>

      <div className="bg-white rounded-lg shadow-sm overflow-auto">
        <table className="min-w-full">
          <thead className="bg-gradient-to-r from-indigo-50/70 to-blue-50/70">
            <tr>
              <th className="p-3 text-center">ชื่อ</th>
              <th className="p-3 text-center">ตำแหน่ง</th>
              <th className="p-3 text-center">แผนก</th>
              <th className="p-3 text-center">สถานะ</th>
            </tr>
          </thead>
          <tbody>
            <DepartmentUserSkeletonRow rows={6} />
          </tbody>
        </table>
      </div>
    </main>
    </BackGroundLight>
  );
}

/* =====================================================
 * Component
 * ===================================================== */

type Props = { id: string };

type TableUser = {
  id: string;
  name: string;
  title: string;
  email: string;
  isActive: boolean;
};

export default function ClientDepartmentDetail({ id }: Props) {
  const [dep, setDep] = useState<DepartmentDto | null>(null);
  const [users, setUsers] = useState<TableUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [usersLoading, setUsersLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [usersError, setUsersError] = useState<string | null>(null);

  const [detailsOpen, setDetailsOpen] = useState(false);
  const [detailsUserData, setDetailsUserData] = useState<GetUserRespond | null>(null);
  const [detailsLoading, setDetailsLoading] = useState(false);
  const [detailsError, setDetailsError] = useState<string | null>(null);

  const [editOpen, setEditOpen] = useState(false);
  const toast = useToast();

  /* ---------- load department ---------- */
  useEffect(() => {
    let mounted = true;

    (async () => {
      setLoading(true);
      setError(null);
      try {
        const item = await GetDepartmentsDetailByIdFromApi(id);
        if (mounted) setDep(item);
      } catch (e: any) {
        if (mounted) setError(e?.message ?? "เกิดข้อผิดพลาด");
      } finally {
        if (mounted) setLoading(false);
      }
    })();

    return () => {
      mounted = false;
    };
  }, [id]);

  /* ---------- load users ---------- */
  useEffect(() => {
    if (!id) return;

    let mounted = true;

    (async () => {
      setUsersLoading(true);
      setUsersError(null);

      try {
        const res = await GetUsersByDepartmentIdFromApi(id);
        if (!mounted) return;

        const mapped: TableUser[] = (res.users || []).map((u: any) => ({
          id: u.id,
          name: u.full_name || "-",
          title: u.position || "-",
          email: u.email || "-",
          isActive: u.is_active,
        }));

        setUsers(mapped);
      } catch (e: any) {
        if (mounted) setUsersError(e?.message ?? "เกิดข้อผิดพลาด");
      } finally {
        if (mounted) setUsersLoading(false);
      }
    })();

    return () => {
      mounted = false;
    };
  }, [id]);

  /* ---------- fetch user details ---------- */
  const fetchUserDetails = async (userId: string) => {
    setDetailsOpen(true);
    setDetailsLoading(true);
    setDetailsError(null);

    try {
      const userArr = await GetUserByIdFromApi(userId);
      setDetailsUserData(userArr);
    } catch {
      setDetailsError("ไม่สามารถโหลดรายละเอียดผู้ใช้ได้");
    } finally {
      setDetailsLoading(false);
    }
  };

  /* ---------- update department ---------- */
  const handleUpdateDepartment = async (data: { code: string; name: string; is_active: boolean }) => {
    try {
      const response = await fetch(`/api/department/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!response.ok) throw new Error("Update failed");

      // Optimistic update
      setDep((prev) => prev ? { ...prev, code: data.code, name: data.name, is_active: data.is_active } : null);
      
      toast.push("success", "บันทึกข้อมูลสำเร็จ");
      return true;
    } catch (error) {
      toast.push("error", "บันทึกข้อมูลไม่สำเร็จ");
      return false;
    }
  };

  /* ---------- loading ---------- */
  if (loading) {
    return <DepartmentPageSkeleton />;
  }

  /* ---------- error ---------- */
  if (error) {
    return (
      <BackGroundLight>
        <main className="mx-auto max-w-5xl px-4 py-6">
          <div className="rounded bg-white p-6 shadow-sm text-red-600">
            เกิดข้อผิดพลาด: {error}
          </div>
        </main>
      </BackGroundLight>
    );
  }

  if (!dep) {
    return (
      <BackGroundLight>
        <main className="mx-auto max-w-5xl px-4 py-6">
          <div className="rounded bg-white p-6 shadow-sm text-gray-700">
            ไม่พบหน่วยงาน (ID: {id}){" "}
            <Link href="/organizer/department" className="text-indigo-600 underline">
              กลับไปหน้ารายการ
            </Link>
          </div>
        </main>
      </BackGroundLight>
    );
  }

  /* ---------- render ---------- */
  return (
    <BackGroundLight>
      <main className="mx-auto max-w-5xl px-4 py-6">
        {/* header */}
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
          <div>
            <nav className="text-sm text-gray-500">
              <Link href="/organizer/department" className="hover:underline">
                หน่วยงาน
              </Link>
              <span className="mx-2">/</span>
              <span className="text-gray-700">{dep.name}</span>
            </nav>
            <h1 className="text-xl font-semibold text-gray-900">{dep.name}</h1>
            <p className="text-sm text-gray-600">
              รหัสหน่วยงาน: <CodeBadge>{dep.code}</CodeBadge>
            </p>
          </div>

          <button
            onClick={() => setEditOpen(true)}
            className="rounded-lg border border-gray-300 bg-white px-3.5 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            แก้ไขข้อมูล
          </button>
        </div>

        {/* stats */}
        <section className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
          <StatCard label="จำนวนพนักงาน" value={dep.user_count ?? 0} />
          <StatCard label="จำนวนโครงการ" value={dep.project_count ?? 0} />
          <StatCard label="สถานะ" value={dep.is_active ? "ใช้งาน" : "ไม่ใช้งาน"} />
        </section>

        {/* users table */}
        <div className="mb-3">
          <h2 className="text-lg font-medium">พนักงาน</h2>
        </div>

        <UsersTable
          users={users}
          loading={usersLoading}
          onDetails={(user) => {
            if (user.id) fetchUserDetails(String(user.id));
          }}
        />

        <UserDetailsModal
          open={detailsOpen}
          user={detailsUserData}
          loading={detailsLoading}
          error={detailsError}
          onClose={() => {
            setDetailsOpen(false);
            setDetailsUserData(null);
            setDetailsError(null);
          }}
        />

        <EditDepartmentModal
          open={editOpen}
          department={dep}
          onClose={() => setEditOpen(false)}
          onSave={handleUpdateDepartment}
        />
      </main>
    </BackGroundLight>
  );
}
