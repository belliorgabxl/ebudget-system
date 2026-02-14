"use client";

import React, { useEffect, useState } from "react";
import UsersTable from "@/components/user/UserTable";
import {
  GetUserByOrgFromApi,
  GetUserByIdFromApi,
  UpdateUserStatusFromApi,
} from "@/api/users.client";
import type { GetUserRespond } from "@/dto/userDto";
import AddUserModal from "./AddUserModal";
import UserDetailsModal from "./UserDetailsModal";
import { useToast } from "@/components/ToastProvider";
import BackGroundLight from "@/components/background/bg-light";

/* -----------------------------
 * Table contract (สำคัญมาก)
 * ----------------------------- */
type TableUser = {
  id: string;
  name: string;
  title: string;
  department_name: string | null;
  isActive: boolean;
};

const ORG = { id: "ORG-ADMIN", name: "ระบบผู้ดูแล" };

export default function ClientManageUser() {
  const PAGE_LIMIT = 10;
  const toast = useToast();

  const [users, setUsers] = useState<TableUser[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [page, setPage] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [totalPages, setTotalPages] = useState(1);

  const [detailsOpen, setDetailsOpen] = useState(false);
  const [detailsUserData, setDetailsUserData] =
    useState<GetUserRespond | null>(null);
  const [detailsLoading, setDetailsLoading] = useState(false);
  const [detailsError, setDetailsError] = useState<string | null>(null);

  const [filter, setFilter] =
    useState<"all" | "active" | "inactive">("all");
  const [addOpen, setAddOpen] = useState(false);

  /* -----------------------------
   * load users
   * ----------------------------- */
  const loadUsers = async () => {
    setLoading(true);
    setError(null);

    try {
      const resp = await GetUserByOrgFromApi(page, PAGE_LIMIT, filter);

      const mapped: TableUser[] = resp.items.map((u) => ({
        id: u.id,
        name: u.full_name,
        title: u.position || "-",
        department_name: u.department_name,
        isActive: u.is_active,
      }));

      setUsers(mapped);

      // บันทึก total และ total_pages จาก API
      setTotalItems(resp.total);
      if (resp.total_pages) {
        setTotalPages(resp.total_pages);
      }
      console.log("Total items from API:", resp.total, "Total pages:", resp.total_pages);

      // sync page จาก backend
      if (resp.page && resp.page !== page) {
        setPage(resp.page);
      }
    } catch {
      setError("ไม่สามารถโหลดข้อมูลผู้ใช้ได้");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, [page, filter]);

  // When filter changes, reset to first page so backend returns page=1 of filtered results
  useEffect(() => {
    setPage(1);
  }, [filter]);


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
      prev.map((u) =>
        u.id === id ? { ...u, isActive: next } : u
      )
    );

    const ok = await UpdateUserStatusFromApi({
      user_id: id,
      is_active: next,
    } as any);

    if (!ok) {
      setUsers((prev) =>
        prev.map((u) =>
          u.id === id ? { ...u, isActive: !next } : u
        )
      );
      toast.push("error", "เปลี่ยนสถานะไม่สำเร็จ");
    } else {
      toast.push("success", "เปลี่ยนสถานะเรียบร้อย");
      loadUsers();
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

  /* -----------------------------
   * render
   * ----------------------------- */
  return (
    <BackGroundLight>
    <main className="mx-auto max-w-6xl px-4 py-6">
      <div className="p-6 space-y-6">
        <header className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold">จัดการผู้ใช้งาน</h1>
            <div className="text-sm text-gray-500">
              ระบบ: {ORG.name}
            </div>
          </div>

          <div className="flex gap-2">
            <button
              onClick={() => setAddOpen(true)}
              className="px-3 py-2 bg-indigo-600 text-white rounded text-sm"
            >
              เพิ่มผู้ใช้
            </button>

            <select
              value={filter}
              onChange={(e) =>
                setFilter(e.target.value as any)
              }
              className="border p-2 rounded text-sm"
            >
              <option value="all">ทั้งหมด</option>
              <option value="active">ใช้งาน</option>
              <option value="inactive">ระงับการใช้งาน</option>
            </select>
          </div>
        </header>

        {error ? (
          <div className="bg-white p-6 rounded text-center text-red-600">
            {error}
          </div>
        ) : (
          <UsersTable
            users={users}
            itemsPerPage={PAGE_LIMIT}
            currentPage={page}
            totalItems={totalItems}
            totalPages={totalPages}
            onPageChange={setPage}
            onDetails={(u) => u.id && fetchUserDetails(String(u.id))}
            onToggleIsActive={(id) =>
              id && updateIsActive(String(id))
            }
            loading={loading}
            showIndex
          />
        )}

        <AddUserModal
          open={addOpen}
          onClose={() => setAddOpen(false)}
          onAdd={() => {
            setAddOpen(false);
            loadUsers();
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
