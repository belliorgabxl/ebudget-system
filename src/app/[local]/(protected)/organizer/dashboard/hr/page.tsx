// app/(protected)/user/page.tsx
"use client";

import React from "react";
import UserTable from "@/components/dashboard/UserTable";
import DepartmentTable from "@/components/dashboard/DepartmentTable";
import Link from "next/link";

// Single-file Page: HR KPIs + Department Table + User Table
// Contains only: HrKpiCards, DepartmentTable, UserTable and mock data.

const MOCK = {
  year: "2568",
  kpis: {
    headcount: 128,
    quotaRemaining: 12, // โควตาพนักงานที่ยังว่าง หรือ จำนวนโควตาพนักงานคงเหลือ
    departments: 8,
  },
  departments: [
    {
      code: "ACA",
      name: "ฝ่ายวิชาการ",
      leader: "อาจารย์ศิริพร ทองสุก",
      employees: 20,
      projects: 8,
      updatedAt: "25/10/2568",
    },
    // เพิ่มตัวอย่างเพิ่มเติมตามต้องการ
  ],
  users: [
    { name: "Apinya S.", title: "HR Manager", department: "HR", status: "On leave" },
    // เพิ่มผู้ใช้ตัวอย่างได้
  ],
};

// -------------------- Components --------------------

function HrKpiCards({ kpis }: { kpis: any }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
      {/* Card: Headcount */}
      <div className="p-4 bg-white rounded-lg shadow-sm">
        <div className="text-xs text-gray-500">จำนวนพนักงาน</div>
        <div className="mt-2 text-2xl font-semibold text-gray-800">{kpis.headcount}</div>
        <div className="mt-1 text-sm text-gray-400">รวมพนักงานทั้งหมดในองค์กร</div>
      </div>

      {/* Card: Quota Remaining
      <div className="p-4 bg-white  rounded-lg shadow-sm">
        <div className="text-xs text-gray-500">โควตาพนักงานคงเหลือ</div>
        <div className="mt-2 text-2xl font-semibold text-indigo-600">{kpis.quotaRemaining}</div>
        <div className="mt-1 text-sm text-gray-400">ตำแหน่งที่เปิดรับ/โควต้ายังว่าง</div>
      </div> */}

      {/* Card: Departments */}
      <div className="p-4 bg-white rounded-lg shadow-sm">
        <div className="text-xs text-gray-500">จำนวนแผนก</div>
        <div className="mt-2 text-2xl font-semibold text-green-600">{kpis.departments}</div>
        <div className="mt-1 text-sm text-gray-400">หน่วยงาน / ฝ่าย ภายในองค์กร</div>
      </div>
    </div>
  );
}


// -------------------- Page --------------------
export default function UserDashboardPage() {
  return (
    <div className="p-6 space-y-6 text-gray-800">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">HR Dashboard</h1>
          <div className="text-sm text-gray-500">ปีงบประมาณ {MOCK.year}</div>
        </div>
      </header>

      <HrKpiCards kpis={MOCK.kpis} />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div>
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-lg font-medium">หน่วยงาน</h2>
            <Link
              href="/organizer/department"
                className="inline-flex items-center rounded-lg  border-gray-300 bg-white px-3.5 py-2 text-sm font-medium text-gray-800 hover:bg-gray-50"
              aria-label="ดูหน่วยงานทั้งหมด"
            >
              ทั้งหมด
            </Link>
          </div>

          <DepartmentTable departments={MOCK.departments} />
        </div>

        <div>
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-lg font-medium">พนักงาน</h2>
            <Link
              href="/organizer/users"
              className="inline-flex items-center rounded-lg  border-gray-300 bg-white px-3.5 py-2 text-sm font-medium text-gray-800 hover:bg-gray-50"
              aria-label="ดูพนักงานทั้งหมด"
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

