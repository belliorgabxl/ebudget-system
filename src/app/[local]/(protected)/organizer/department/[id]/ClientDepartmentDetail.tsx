// src/app/(protected)/organizer/department/[id]/ClientDepartmentDetail.tsx
"use client";

import React, { useEffect, useState } from "react";
import {
  GetDepartmentsDetailByIdFromApi,
  GetUsersByDepartmentIdFromApi,
} from "@/api/department";
import type { Department as DepartmentDto } from "@/dto/departmentDto";
import Link from "next/link";

/* =====================================================
 * UI helpers
 * ===================================================== */

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
  );
}

/* =====================================================
 * Component
 * ===================================================== */

type Props = { id: string };

export default function ClientDepartmentDetail({ id }: Props) {
  const [dep, setDep] = useState<DepartmentDto | null>(null);
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [usersLoading, setUsersLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [usersError, setUsersError] = useState<string | null>(null);

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

    setUsersLoading(true);
    setUsersError(null);

    GetUsersByDepartmentIdFromApi(id)
      .then((res) => setUsers(res.users ?? []))
      .catch((e) => setUsersError(e?.message ?? "เกิดข้อผิดพลาด"))
      .finally(() => setUsersLoading(false));
  }, [id]);

  /* ---------- loading ---------- */
  if (loading) {
    return <DepartmentPageSkeleton />;
  }

  /* ---------- error ---------- */
  if (error) {
    return (
      <main className="mx-auto max-w-5xl px-4 py-6">
        <div className="rounded bg-white p-6 shadow-sm text-red-600">
          เกิดข้อผิดพลาด: {error}
        </div>
      </main>
    );
  }

  if (!dep) {
    return (
      <main className="mx-auto max-w-5xl px-4 py-6">
        <div className="rounded bg-white p-6 shadow-sm text-gray-700">
          ไม่พบหน่วยงาน (ID: {id}){" "}
          <Link href="/organizer/department" className="text-indigo-600 underline">
            กลับไปหน้ารายการ
          </Link>
        </div>
      </main>
    );
  }

  /* ---------- render ---------- */
  return (
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

        <Link
          href={`/organizer/department/${dep.id}/edit`}
          className="rounded-lg border border-gray-300 bg-white px-3.5 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
        >
          แก้ไขข้อมูล
        </Link>
      </div>

      {/* stats */}
      <section className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatCard label="จำนวนพนักงาน" value={dep.user_count ?? 0} />
        <StatCard label="จำนวนโปรเจ็กต์" value={dep.project_count ?? 0} />
        <StatCard label="สถานะ" value={dep.is_active ? "ใช้งาน" : "ไม่ใช้งาน"} />
      </section>

      {/* users table */}
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
            {usersLoading ? (
              <DepartmentUserSkeletonRow rows={6} />
            ) : usersError ? (
              <tr>
                <td colSpan={4} className="p-6 text-center text-sm text-red-600">
                  เกิดข้อผิดพลาด: {usersError}
                </td>
              </tr>
            ) : users.length > 0 ? (
              users.map((u, idx) => (
                <tr
                  key={u.id ?? idx}
                  className="border-b border-gray-100 text-center hover:bg-gray-50"
                >
                  <td className="p-3">{u.name ?? "-"}</td>
                  <td className="p-3 text-gray-600">{u.title ?? "-"}</td>
                  <td className="p-3">
                    <span className="inline-flex items-center rounded-md bg-gray-100 px-2 py-0.5 text-[11px] font-medium text-gray-700">
                      {u.department_name ?? "-"}
                    </span>
                  </td>
                  <td className="p-3">
                    <span
                      className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${
                        u.isActive
                          ? "bg-green-100 text-green-800"
                          : "bg-red-100 text-red-800"
                      }`}
                    >
                      {u.status ?? "-"}
                    </span>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={4} className="p-10 text-center text-sm text-gray-500">
                  ยังไม่มีพนักงานในหน่วยงานนี้
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </main>
  );
}
