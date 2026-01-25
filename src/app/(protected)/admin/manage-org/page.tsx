// Admin Manage Organization Page
"use client";
import React, { useEffect, useState } from "react";
import BackGroundLight from "@/components/background/bg-light";
import { Plus, Trash2, Building, Eye } from "lucide-react";
import Link from "next/link";
import { formatCompactNumber } from "@/lib/util";
import { MOCK_ORGANIZATIONS } from "@/resource/mock-organization";
import type { Organization } from "@/resource/mock-organization";
import AddOrganizationModal from "@/components/manage-org/AddOrganizationModal";

function uid(prefix = "ORG") {
  return `${prefix}-${Math.floor(Math.random() * 10000)}`;
}

export default function AdminManageOrgPage() {
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [filter, setFilter] = useState("all");

  // Load mock data
  useEffect(() => {
    setLoading(true);
    try {
      setOrganizations(MOCK_ORGANIZATIONS);
    } catch (err) {
      setError("Failed to load organizations");
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  const handleAdd = (org: Partial<Organization>) => {
    const newOrg: Organization = {
      id: uid(),
      name: org.name || "",
      code: org.code || "",
      description: org.description || "",
      totalBudget: org.totalBudget || 0,
      totalDepartments: org.totalDepartments || 0,
      totalEmployees: org.totalEmployees || 0,
      totalProjects: org.totalProjects || 0,
      status: org.status || "active",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    setOrganizations((prev) => [newOrg, ...prev]);
    setIsAddOpen(false);
  };

  // Edit functionality moved to detail page

  const handleDelete = (id: string) => {
    if (confirm("คุณต้องการลบองค์กรนี้ใช่หรือไม่?")) {
      setOrganizations((prev) => prev.filter((org) => org.id !== id));
    }
  };

  const filtered =
    filter === "all"
      ? organizations
      : organizations.filter((org) => org.status === filter);

  return (
    <>
      <BackGroundLight>
        <div className="relative min-h-screen">
          <div className="mx-auto max-w-7xl px-6 py-8 pl-20">
            {/* Header */}
            <div className="mb-8 flex items-center justify-between mt-12">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">จัดการองค์กร</h1>
                <p className="mt-1 text-sm text-gray-500">
                  จัดการข้อมูลองค์กรและข้อมูลสรุป
                </p>
              </div>
              <button
                onClick={() => setIsAddOpen(true)}
                className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-white hover:bg-blue-700 transition-colors"
              >
                <Plus className="h-5 w-5" />
                <span>เพิ่มองค์กร</span>
              </button>
            </div>

            {/* Filter */}
            <div className="mb-6 flex items-center gap-2">
              <span className="text-sm font-medium text-gray-600">สถานะ:</span>
              <select
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                className="rounded-lg border border-gray-300 px-3 py-2 text-sm"
              >
                <option value="all">ทั้งหมด</option>
                <option value="active">ใช้งาน</option>
                <option value="inactive">ไม่ใช้งาน</option>
              </select>
            </div>

            {/* Table */}
            <div className="rounded-xl bg-white shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">
                        ชื่อองค์กร
                      </th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">
                        รหัส
                      </th>
                      <th className="px-6 py-4 text-right text-sm font-semibold text-gray-900">
                        งบประมาณ
                      </th>
                      <th className="px-6 py-4 text-center text-sm font-semibold text-gray-900">
                        หน่วยงาน
                      </th>
                      <th className="px-6 py-4 text-center text-sm font-semibold text-gray-900">
                        พนักงาน
                      </th>
                      <th className="px-6 py-4 text-center text-sm font-semibold text-gray-900">
                        โครงการ
                      </th>
                      <th className="px-6 py-4 text-center text-sm font-semibold text-gray-900">
                        สถานะ
                      </th>
                      <th className="px-6 py-4 text-center text-sm font-semibold text-gray-900">
                        การจัดการ
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {loading ? (
                      <tr>
                        <td colSpan={8} className="px-6 py-12 text-center">
                          <div className="flex items-center justify-center">
                            <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent"></div>
                          </div>
                        </td>
                      </tr>
                    ) : error ? (
                      <tr>
                        <td
                          colSpan={8}
                          className="px-6 py-12 text-center text-red-600"
                        >
                          {error}
                        </td>
                      </tr>
                    ) : filtered.length === 0 ? (
                      <tr>
                        <td
                          colSpan={8}
                          className="px-6 py-12 text-center text-gray-500"
                        >
                          ไม่มีข้อมูลองค์กร
                        </td>
                      </tr>
                    ) : (
                      filtered.map((org) => (
                        <tr
                          key={org.id}
                          className="hover:bg-gray-50 transition-colors"
                        >
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-3">
                              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100 text-blue-600">
                                <Building className="h-5 w-5" />
                              </div>
                              <div>
                                <p className="font-medium text-gray-900">
                                  {org.name}
                                </p>
                                <p className="text-xs text-gray-500">
                                  {org.description}
                                </p>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <span className="text-sm font-medium text-gray-600">
                              {org.code}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-right">
                            <span className="text-sm font-medium text-gray-900">
                              ฿{formatCompactNumber(org.totalBudget)}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-center">
                            <span className="inline-block rounded-full bg-blue-100 px-3 py-1 text-sm font-medium text-blue-700">
                              {org.totalDepartments}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-center">
                            <span className="inline-block rounded-full bg-emerald-100 px-3 py-1 text-sm font-medium text-emerald-700">
                              {org.totalEmployees}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-center">
                            <span className="inline-block rounded-full bg-violet-100 px-3 py-1 text-sm font-medium text-violet-700">
                              {org.totalProjects}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-center">
                            <span
                              className={`inline-block rounded-full px-3 py-1 text-sm font-medium ${
                                org.status === "active"
                                  ? "bg-green-100 text-green-700"
                                  : "bg-gray-100 text-gray-700"
                              }`}
                            >
                              {org.status === "active"
                                ? "ใช้งาน"
                                : "ไม่ใช้งาน"}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center justify-center gap-2">
                              <Link
                                href={`/admin/manage-org/${org.id}`}
                                className="p-2 rounded-lg text-blue-600 hover:bg-blue-50 transition-colors"
                                title="ดูรายละเอียด"
                              >
                                <Eye className="h-4 w-4" />
                              </Link>
                              {/* Edit moved to detail page */}
                              <button
                                onClick={() => handleDelete(org.id)}
                                className="p-2 rounded-lg text-red-600 hover:bg-red-50 transition-colors"
                                title="ลบ"
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </BackGroundLight>

      {/* Edit moved to detail page */}

      {/* Add Modal */}
      {isAddOpen && (
        <AddOrganizationModal
          onAdd={handleAdd}
          onClose={() => setIsAddOpen(false)}
        />
      )}
    </>
  );
}
