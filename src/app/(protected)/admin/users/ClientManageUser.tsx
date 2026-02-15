"use client";

import React, { useEffect, useState } from "react";
import AdminUsersTable from "@/components/user/AdminUserTable";
import {
  GetAllUsersFromApi,
  GetUserByIdFromApi,
  UpdateUserStatusFromApi,
  type GetUsersFilters,
} from "@/api/users.client";
import type { GetUserRespond } from "@/dto/userDto";
import AddUserModal from "./AddUserModal";
import UserDetailsModal from "./UserDetailsModal";
import { useToast } from "@/components/ToastProvider";
import BackGroundLight from "@/components/background/bg-light";
import { Search, X, Plus } from "lucide-react";

/* -----------------------------
 * Table contract
 * ----------------------------- */
type TableUser = {
  id: string;
  name: string;
  email: string;
  organization_name: string;
  isActive: boolean;
};

export default function ClientManageUser() {
  const toast = useToast();

  const [users, setUsers] = useState<TableUser[]>([]);
  const [allUsers, setAllUsers] = useState<GetUserRespond[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [page, setPage] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const PAGE_LIMIT = 10;

  const [detailsOpen, setDetailsOpen] = useState(false);
  const [detailsUserData, setDetailsUserData] =
    useState<GetUserRespond | null>(null);
  const [detailsLoading, setDetailsLoading] = useState(false);
  const [detailsError, setDetailsError] = useState<string | null>(null);

  const [addOpen, setAddOpen] = useState(false);

  // Filters
  const [searchName, setSearchName] = useState("");
  const [filterStatus, setFilterStatus] = useState<"all" | "active" | "inactive">("all");
  const [filterOrgName, setFilterOrgName] = useState("");
  const [filterRole, setFilterRole] = useState("");
  const [filterSystemRole, setFilterSystemRole] = useState<"all" | "system" | "custom">("all");

  /* -----------------------------
   * load users
   * ----------------------------- */
  useEffect(() => {
    let mounted = true;

    async function load() {
      setLoading(true);
      setError(null);

      try {
        // Build filters
        const filters: GetUsersFilters = {
          page,
          limit: PAGE_LIMIT,
        };

        if (searchName.trim()) {
          filters.full_name = searchName.trim();
        }

        if (filterStatus !== "all") {
          filters.is_active = filterStatus === "active";
        }

        if (filterOrgName.trim()) {
          filters.organization_name = filterOrgName.trim();
        }

        if (filterRole.trim()) {
          filters.role = filterRole.trim();
        }

        if (filterSystemRole !== "all") {
          filters.is_system_role = filterSystemRole === "system";
        }

        const resp = await GetAllUsersFromApi(filters);
        if (!mounted) return;

        // Store all users for reference
        setAllUsers(resp.data);

        // Map to table format
        const mapped: TableUser[] = resp.data.map((u) => ({
          id: u.id,
          name: u.full_name,
          email: u.email || "-",
          organization_name: u.organization_name || u.organization_id || "-",
          isActive: u.is_active,
        }));

        // Use backend pagination
        setTotalItems(resp.total);
        setTotalPages(resp.total_pages || 1);
        setUsers(mapped);
      } catch {
        if (mounted) setError("ไม่สามารถโหลดข้อมูลผู้ใช้ได้");
      } finally {
        if (mounted) setLoading(false);
      }
    }

    load();
    return () => {
      mounted = false;
    };
  }, [page, searchName, filterStatus, filterOrgName, filterRole, filterSystemRole]);

  // When filters change, reset to first page
  useEffect(() => {
    setPage(1);
  }, [searchName, filterStatus, filterOrgName, filterRole, filterSystemRole]);

  /* -----------------------------
   * actions
   * ----------------------------- */
  const updateIsActive = async (id: string) => {
    const found = users.find((u) => u.id === id);
    if (!found) return;

    const next = !found.isActive;
    const label = next ? "เปิดใช้งาน" : "ระงับการใช้งาน";
    if (!window.confirm(`คุณแน่ใจว่าจะ${label}ผู้ใช้นี้หรือไม่?`)) return;

    // optimistic
    setUsers((prev) =>
      prev.map((u) => (u.id === id ? { ...u, isActive: next } : u))
    );

    const ok = await UpdateUserStatusFromApi({
      user_id: id,
      is_active: next,
    } as any);

    if (!ok) {
      setUsers((prev) =>
        prev.map((u) => (u.id === id ? { ...u, isActive: !next } : u))
      );
      toast.push("error", "เปลี่ยนสถานะไม่สำเร็จ");
    } else {
      toast.push("success", "เปลี่ยนสถานะเรียบร้อย");
    }
  };

  const fetchUserDetails = async (id: string) => {
    setDetailsOpen(true);
    setDetailsLoading(true);
    setDetailsError(null);

    try {
      const userArr = await GetUserByIdFromApi(id);
      setDetailsUserData(userArr);
    } catch {
      setDetailsError("ไม่สามารถโหลดรายละเอียดผู้ใช้ได้");
    } finally {
      setDetailsLoading(false);
    }
  };

  const handleRefresh = () => {
    setPage(1);
    setSearchName("");
    setFilterStatus("all");
    setFilterOrgName("");
    setFilterRole("");
    setFilterSystemRole("all");
  };

  const clearFilters = () => {
    setSearchName("");
    setFilterStatus("all");
    setFilterOrgName("");
    setFilterRole("");
    setFilterSystemRole("all");
  };

  const hasActiveFilters =
    searchName.trim() ||
    filterStatus !== "all" ||
    filterOrgName.trim() ||
    filterRole.trim() ||
    filterSystemRole !== "all";

  /* -----------------------------
   * render
   * ----------------------------- */
  return (
    <BackGroundLight>
      <main className="mx-auto max-w-7xl px-4 py-6">
        <div className="p-6 space-y-6">
          <header className="flex items-center justify-between mb-8 mt-12">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">จัดการผู้ใช้งาน (Admin)</h1>
              <p className="mt-1 text-sm text-gray-500">
                จัดการผู้ใช้ทั้งหมดในระบบ
              </p>
            </div>

            <button
              onClick={() => setAddOpen(true)}
              className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-white hover:bg-blue-700 transition-colors"
            >
              <Plus className="h-5 w-5" />
              <span>เพิ่มผู้ใช้</span>
            </button>
          </header>

          {/* Search and Filters */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
              {/* Search Name */}
              <div className="lg:col-span-2">
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  ค้นหาชื่อ
                </label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    value={searchName}
                    onChange={(e) => setSearchName(e.target.value)}
                    placeholder="ชื่อ-นามสกุล"
                    className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  />
                </div>
              </div>

              {/* Filter Status */}
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  สถานะ
                </label>
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value as any)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                >
                  <option value="all">ทั้งหมด</option>
                  <option value="active">ใช้งาน</option>
                  <option value="inactive">ระงับ</option>
                </select>
              </div>

              {/* Filter Organization Name */}
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  องค์กร
                </label>
                <input
                  type="text"
                  value={filterOrgName}
                  onChange={(e) => setFilterOrgName(e.target.value)}
                  placeholder="ชื่อองค์กร"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>

              {/* Filter System Role */}
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  ประเภทบทบาท
                </label>
                <select
                  value={filterSystemRole}
                  onChange={(e) => setFilterSystemRole(e.target.value as any)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                >
                  <option value="all">ทั้งหมด</option>
                  <option value="system">ระบบ</option>
                  <option value="custom">กำหนดเอง</option>
                </select>
              </div>
            </div>

            {/* Second Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mt-4">
              {/* Filter Role */}
              <div className="lg:col-span-2">
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  บทบาท
                </label>
                <input
                  type="text"
                  value={filterRole}
                  onChange={(e) => setFilterRole(e.target.value)}
                  placeholder="ชื่อบทบาท"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>

              {/* Clear Filters Button */}
              <div className="lg:col-span-3 flex items-end">
                {hasActiveFilters && (
                  <button
                    onClick={clearFilters}
                    className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                  >
                    <X className="w-4 h-4" />
                    ล้างตัวกรอง
                  </button>
                )}
              </div>
            </div>

            {/* Filter Summary */}
            {hasActiveFilters && (
              <div className="mt-3 pt-3 border-t border-gray-200">
                <div className="flex flex-wrap gap-2">
                  {searchName.trim() && (
                    <span className="inline-flex items-center gap-1 px-2 py-1 bg-indigo-50 text-indigo-700 text-xs rounded-md">
                      ชื่อ: {searchName}
                    </span>
                  )}
                  {filterStatus !== "all" && (
                    <span className="inline-flex items-center gap-1 px-2 py-1 bg-indigo-50 text-indigo-700 text-xs rounded-md">
                      สถานะ: {filterStatus === "active" ? "ใช้งาน" : "ระงับ"}
                    </span>
                  )}
                  {filterOrgName.trim() && (
                    <span className="inline-flex items-center gap-1 px-2 py-1 bg-indigo-50 text-indigo-700 text-xs rounded-md">
                      องค์กร: {filterOrgName}
                    </span>
                  )}
                  {filterRole.trim() && (
                    <span className="inline-flex items-center gap-1 px-2 py-1 bg-indigo-50 text-indigo-700 text-xs rounded-md">
                      บทบาท: {filterRole}
                    </span>
                  )}
                  {filterSystemRole !== "all" && (
                    <span className="inline-flex items-center gap-1 px-2 py-1 bg-indigo-50 text-indigo-700 text-xs rounded-md">
                      ประเภท: {filterSystemRole === "system" ? "ระบบ" : "กำหนดเอง"}
                    </span>
                  )}
                </div>
              </div>
            )}
          </div>

          {error ? (
            <div className="bg-white p-6 rounded text-center text-red-600">
              {error}
            </div>
          ) : (
            <AdminUsersTable
              users={users}
              itemsPerPage={PAGE_LIMIT}
              currentPage={page}
              totalItems={totalItems}
              totalPages={totalPages}
              onPageChange={setPage}
              onDetails={(u) => u.id && fetchUserDetails(String(u.id))}
              onToggleIsActive={(id) => id && updateIsActive(String(id))}
              loading={loading}
              showIndex
            />
          )}

          <AddUserModal
            open={addOpen}
            onClose={() => setAddOpen(false)}
            onAdd={() => {
              setAddOpen(false);
              handleRefresh();
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
        </div>
      </main>
    </BackGroundLight>
  );
}
