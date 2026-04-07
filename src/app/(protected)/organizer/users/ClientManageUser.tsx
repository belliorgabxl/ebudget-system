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
import { Users } from "lucide-react";

/* -----------------------------
 * Table contract (สำคัญมาก)
 * ----------------------------- */
type TableUser = {
  id: string;
  name: string;
  title: string;
  email: string;
  department_name: string | null;
  isActive: boolean;
};

type OrgQuota = {
  max_users: number;
  current_users: number;
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
  const [quota, setQuota] = useState<OrgQuota | null>(null);

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
        email: u.email || "-",
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

  // Load quota on mount and after adding a user
  const loadQuota = async () => {
    try {
      const res = await fetch("/api/org-quota", { cache: "no-store" });
      if (res.ok) {
        const json = await res.json();
        const d = json?.data ?? json;
        if (d?.max_users != null) {
          setQuota({ max_users: d.max_users, current_users: d.current_users ?? 0 });
        }
      }
    } catch {
      // quota fetch failing is non-critical
    }
  };

  useEffect(() => {
    loadQuota();
  }, []);


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

          <div className="flex items-center gap-3">
            {quota && (
              <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm border ${
                quota.current_users >= quota.max_users
                  ? "bg-red-50 border-red-200 text-red-700"
                  : quota.current_users >= quota.max_users * 0.8
                  ? "bg-amber-50 border-amber-200 text-amber-700"
                  : "bg-gray-50 border-gray-200 text-gray-600"
              }`}>
                <Users className="h-4 w-4" />
                <span>ผู้ใช้: {quota.current_users} / {quota.max_users}</span>
                {quota.current_users >= quota.max_users && (
                  <span className="ml-1 font-semibold">เต็มแล้ว</span>
                )}
              </div>
            )}

            <button
              onClick={() => setAddOpen(true)}
              disabled={!!quota && quota.current_users >= quota.max_users}
              className="px-3 py-2 bg-indigo-600 text-white rounded text-sm disabled:opacity-50 disabled:cursor-not-allowed"
              title={quota && quota.current_users >= quota.max_users ? `เต็มโควต้าแล้ว (${quota.current_users}/${quota.max_users})` : undefined}
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
            loadQuota();
          }}
          quotaMaxUsers={quota?.max_users}
          quotaCurrentUsers={quota?.current_users}
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
