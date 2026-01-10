"use client";

import React, { useEffect, useState } from "react";
import { DepartmentTable } from "@/components/department/DepartmentTable";
import { fetchDepartments } from "@/api/department";
import { Department } from "@/dto/departmentDto";
import { useRouter } from "next/navigation";
import Link from "next/link";
import CreateDepartmentModal from "./new/CreateDepartmentModal";

function DepartmentTableSkeleton({ rows = 6 }: { rows?: number }) {
  return (
    <div className="overflow-x-auto rounded-xl border border-gray-200 bg-white shadow-sm">
      <table className="min-w-full text-xs">
        <thead className="bg-gradient-to-r from-indigo-50/70 to-blue-50/70">
          <tr>
            <th className="px-4 py-3 text-left font-semibold text-gray-700">รหัส</th>
            <th className="px-4 py-3 text-left font-semibold text-gray-700">ชื่อหน่วยงาน</th>
            <th className="px-4 py-3 text- center font-semibold text-gray-700">จำนวนพนักงาน</th>
            <th className="px-4 py-3 text-center font-semibold text-gray-700">สถานะ</th>
            <th className="px-4 py-3 text-right font-semibold text-gray-700">จัดการ</th>
          </tr>
        </thead>

        <tbody className="divide-y divide-gray-100">
          {Array.from({ length: rows }).map((_, i) => (
            <tr key={`sk-${i}`} className="odd:bg-white even:bg-gray-50/40">
              <td className="px-4 py-3">
                <div className="h-4 w-40 rounded bg-gray-200 animate-pulse" />
              </td>
              <td className="px-4 py-3">
                <div className="h-4 w-20 rounded bg-gray-200 animate-pulse" />
              </td>
              <td className="px-4 py-3 text-center">
                <div className="mx-auto h-4 w-10 rounded bg-gray-200 animate-pulse" />
              </td>
              <td className="px-4 py-3 text-center">
                <div className="mx-auto h-4 w-16 rounded bg-gray-200 animate-pulse" />
              </td>
              <td className="px-4 py-3 text-right">
                <div className="ml-auto h-4 w-8 rounded bg-gray-200 animate-pulse" />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

/* =====================================================
 * Component
 * ===================================================== */

export default function ClientDepartmentList() {
  const router = useRouter();
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [openCreate, setOpenCreate] = useState(false);


  /* ---------- load departments ---------- */
  useEffect(() => {
    let mounted = true;

    (async () => {
      try {
        setLoading(true);
        setError(null);
        const list = await fetchDepartments();
        if (!mounted) return;
        setDepartments(list);
      } catch (e: any) {
        if (mounted) setError(e?.message ?? "โหลดข้อมูลไม่สำเร็จ");
      } finally {
        if (mounted) setLoading(false);
      }
    })();

    return () => {
      mounted = false;
    };
  }, []);

  /* ---------- error ---------- */
  if (error) {
    return (
      <div className="rounded bg-white p-6 text-red-600">
        เกิดข้อผิดพลาด: {error}
      </div>
    );
  }

  /* ---------- render ---------- */
  return (
    <>
      {/* Header */}
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold text-gray-900">หน่วยงาน</h1>
          <p className="text-sm text-gray-600">รายการหน่วยงาน</p>
        </div>

        <button
          onClick={() => setOpenCreate(true)}
          className="rounded-md bg-indigo-600 px-4 py-2 text-sm text-white hover:bg-indigo-700"
        >
          + เพิ่มหน่วยงาน
        </button>
      </div>

      {/* Table / Skeleton */}
      {loading ? (
        <DepartmentTableSkeleton rows={6} />
      ) : (
        <DepartmentTable data={departments} />
      )}
      <CreateDepartmentModal
    open={openCreate}
    onClose={() => setOpenCreate(false)}
    onSuccess={() => {
      // reload list หลังสร้างเสร็จ
      fetchDepartments().then(setDepartments);
    }}
    
  />
    </>
  );

}
