// Admin Manage Organization Page
"use client";
import React, { useEffect, useState } from "react";
import BackGroundLight from "@/components/background/bg-light";
import { Plus, Trash2, Building, Eye, ChevronLeft, ChevronRight } from "lucide-react";
import Link from "next/link";
import { formatCompactNumber } from "@/lib/util";
import type { OrganizationResponse } from "@/dto/organizationDto";
import { GetOrganizationsFromApi, CreateOrganizationFromApi, DeleteOrganizationFromApi } from "@/api/organization.client";
import AddOrganizationModal from "@/components/manage-org/AddOrganizationModal";

export default function AdminManageOrgPage() {
  const [organizations, setOrganizations] = useState<OrganizationResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [filter, setFilter] = useState<"all" | "active" | "inactive">("all");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [total, setTotal] = useState(0);
  const limit = 10;

  // Load organizations from API
  useEffect(() => {
    loadOrganizations();
  }, [page, filter]);

  const loadOrganizations = async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await GetOrganizationsFromApi({
        page,
        limit,
        is_active: filter === "all" ? undefined : filter === "active",
      });
      setOrganizations(result.items);
      setTotalPages(result.total_pages);
      setTotal(result.total);
    } catch (err) {
      setError("ไม่สามารถโหลดข้อมูลองค์กรได้");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = async (org: { name: string; type?: string }) => {
    try {
      console.log("Creating organization:", org);
      
      const result = await CreateOrganizationFromApi({
        name: org.name,
        type: org.type,
      });
      
      console.log("Create result:", result);

      if (result.ok) {
        setIsAddOpen(false);
        // Reload data
        await loadOrganizations();
      } else {
        const errorMsg = result.message || "ไม่สามารถสร้างองค์กรได้";
        console.error("Failed to create organization:", errorMsg);
        alert(`เกิดข้อผิดพลาด: ${errorMsg}`);
      }
    } catch (err: any) {
      console.error("Exception while creating organization:", err);
      alert(`เกิดข้อผิดพลาดในการสร้างองค์กร: ${err?.message || "Unknown error"}`);
    }
  };

  // Edit functionality moved to detail page

  const handleDelete = async (id: string) => {
    if (confirm("คุณต้องการลบองค์กรนี้ใช่หรือไม่?")) {
      const success = await DeleteOrganizationFromApi(id);
      if (success) {
        await loadOrganizations();
      } else {
        alert("ไม่สามารถลบองค์กรได้ (ฟีเจอร์ยังไม่เปิดใช้งาน)");
      }
    }
  };

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

            {/* Filter and Stats */}
            <div className="mb-6 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-gray-600">สถานะ:</span>
                <select
                  value={filter}
                  onChange={(e) => {
                    setFilter(e.target.value as "all" | "active" | "inactive");
                    setPage(1); // Reset to first page on filter change
                  }}
                  className="rounded-lg border border-gray-300 px-3 py-2 text-sm"
                >
                  <option value="all">ทั้งหมด</option>
                  <option value="active">ใช้งาน</option>
                  <option value="inactive">ไม่ใช้งาน</option>
                </select>
              </div>
              <div className="text-sm text-gray-600">
                แสดง {organizations.length} จาก {total} รายการ
              </div>
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
                        ประเภท
                      </th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">
                        วันที่สร้าง
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
                        <td colSpan={5} className="px-6 py-12 text-center">
                          <div className="flex items-center justify-center">
                            <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent"></div>
                          </div>
                        </td>
                      </tr>
                    ) : error ? (
                      <tr>
                        <td
                          colSpan={5}
                          className="px-6 py-12 text-center text-red-600"
                        >
                          {error}
                        </td>
                      </tr>
                    ) : organizations.length === 0 ? (
                      <tr>
                        <td
                          colSpan={5}
                          className="px-6 py-12 text-center text-gray-500"
                        >
                          ไม่มีข้อมูลองค์กร
                        </td>
                      </tr>
                    ) : (
                      organizations.map((org) => (
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
                                <p className="text-xs text-gray-500 font-mono">
                                  ID: {org.id.slice(0, 8)}...
                                </p>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <span className="text-sm text-gray-600">
                              {org.type || "-"}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <span className="text-sm text-gray-600">
                              {new Date(org.created_at).toLocaleDateString("th-TH", {
                                year: "numeric",
                                month: "short",
                                day: "numeric",
                              })}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-center">
                            <span
                              className={`inline-block rounded-full px-3 py-1 text-sm font-medium ${
                                org.is_active
                                  ? "bg-green-100 text-green-700"
                                  : "bg-gray-100 text-gray-700"
                              }`}
                            >
                              {org.is_active ? "ใช้งาน" : "ไม่ใช้งาน"}
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

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="mt-6 flex items-center justify-between">
                <div className="text-sm text-gray-600">
                  หน้า {page} จาก {totalPages}
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={page === 1}
                    className="flex items-center gap-1 px-4 py-2 rounded-lg border border-gray-300 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    <ChevronLeft className="h-4 w-4" />
                    ก่อนหน้า
                  </button>
                  <button
                    onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                    disabled={page === totalPages}
                    className="flex items-center gap-1 px-4 py-2 rounded-lg border border-gray-300 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    ถัดไป
                    <ChevronRight className="h-4 w-4" />
                  </button>
                </div>
              </div>
            )}
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
