// Admin Dashboard Page (HR layout copy)
"use client";
import React from "react";
import Link from "next/link";
import DepartmentTable from "@/components/dashboard/DepartmentTable";
import UserTable from "@/components/dashboard/UserTable";

const MOCK = {
  year: "2568",
  kpis: {
    totalUsers: 256,
    totalDepartments: 12,
    activeProjects: 34,
  },
  departments: [
    { code: "HR", name: "ฝ่ายบุคคล", leader: "สมชาย ใจดี", employees: 15, projects: 3, updatedAt: "01/11/2568" },
    { code: "IT", name: "ฝ่ายไอที", leader: "วิชัย เทคโน", employees: 20, projects: 6, updatedAt: "05/11/2568" },
  ],
  users: [
    { name: "Apinya S.", title: "Admin", department: "HR", status: "Active" },
    { name: "Somchai J.", title: "Manager", department: "IT", status: "Active" },
  ],
};

function AdminKpiCards({ kpis }: { kpis: any }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
      {/* Card: Total Users */}
      <div className="p-4 bg-white rounded-lg shadow-sm">
        <div className="text-xs text-gray-500">จำนวนผู้ใช้</div>
        <div className="mt-2 text-2xl font-semibold text-indigo-600">{kpis.totalUsers}</div>
        <div className="mt-1 text-sm text-gray-400">ผู้ใช้ทั้งหมดในระบบ</div>
      </div>

      {/* Card: Departments */}
      <div className="p-4 bg-white rounded-lg shadow-sm">
        <div className="text-xs text-gray-500">จำนวนองค์กร</div>
        <div className="mt-2 text-2xl font-semibold text-green-600">{kpis.totalDepartments}</div>
        <div className="mt-1 text-sm text-gray-400">แผนก/ฝ่ายในองค์กร</div>
      </div>

      {/* Card: Active Projects */}
      {/* <div className="p-4 bg-white rounded-lg shadow-sm">
        <div className="text-xs text-gray-500">โปรเจกต์ที่ดำเนินการ</div>
        <div className="mt-2 text-2xl font-semibold text-orange-600">{kpis.activeProjects}</div>
        <div className="mt-1 text-sm text-gray-400">โปรเจกต์ที่กำลังดำเนินงาน</div>
      </div> */}
    </div>
  );
}

export default function AdminDashboardPage() {
  return (
    <div className="p-6 space-y-6 text-gray-800">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Admin Dashboard</h1>
          <div className="text-sm text-gray-500">ปีงบประมาณ {MOCK.year}</div>
        </div>
      </header>

      <AdminKpiCards kpis={MOCK.kpis} />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div>
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-lg font-medium">องค์กร</h2>
            <Link
              href="/admin/manage-org"
              className="inline-flex items-center rounded-lg border-gray-300 bg-white px-3.5 py-2 text-sm font-medium text-gray-800 hover:bg-gray-50"
              aria-label="ดูหน่วยงานทั้งหมด"
            >
              ทั้งหมด
            </Link>
          </div>

          <DepartmentTable departments={MOCK.departments} />
        </div>

        <div>
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-lg font-medium">ผู้ใช้</h2>
            <Link
              href="/admin/manage-user"
              className="inline-flex items-center rounded-lg border-gray-300 bg-white px-3.5 py-2 text-sm font-medium text-gray-800 hover:bg-gray-50"
              aria-label="ดูผู้ใช้ทั้งหมด"
            >
              ทั้งหมด
            </Link>
          </div>

          <UserTable users={MOCK.users} />
        </div>
      </div>
    </div>
  );
}
