// Admin Manage User Page (aligned to organizer users page)
"use client";
import React, { useEffect, useState } from "react";
import UsersTable from "@/components/user/UserTable";
import { GetUserByOrgFromApi, GetUserByIdFromApi } from "@/api/users";
import type { GetUserRespond } from "@/dto/userDto";

// -------------------- Mock / Org --------------------
const ORG = { id: "ORG-ADMIN", name: "ระบบผู้ดูแล" };
const INITIAL_USERS: any[] = [];

function uid(prefix = "U") {
  return `${prefix}-${Math.floor(Math.random() * 10000)}`;
}

function statusLabel(user: any) {
  if (!user?.isActive) return "ระงับการใช้งาน";
  if (user.status === "On leave") return "ลาหยุด";
  return "ใช้งาน";
}

export default function AdminManageUserPage() {
  const [users, setUsers] = useState(INITIAL_USERS);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [editing, setEditing] = useState<any | null>(null);
  const [detailsUserData, setDetailsUserData] = useState<GetUserRespond | null>(
    null
  );
  const [detailsLoading, setDetailsLoading] = useState(false);
  const [detailsError, setDetailsError] = useState<string | null>(null);
  const [filter, setFilter] = useState("all");

  // modal state
  const [addOpen, setAddOpen] = useState(false);

  // load users from API on mount (placeholder)
  useEffect(() => {
    let mounted = true;
    async function load() {
      setLoading(true);
      setError(null);
      try {
        const resp = await GetUserByOrgFromApi(5, 10);
        if (!mounted) return;

        const mapped = (resp?.items || []).map((u: GetUserRespond) => ({
          id: u.id,
          name:
            u.full_name || `${u.first_name ?? ""} ${u.last_name ?? ""}`.trim(),
          title: u.position ?? "-",
          department: u.department_id ?? "-",
          status: "Active",
          isActive: true,
          createdAt: u.last_login_at ?? undefined,
        }));

        setUsers(mapped);

        // if received less than limit => last page
        // setIsLastPage(mapped.length < 10);
      } catch (err: any) {
        console.error("Failed to load users:", err);
        if (mounted) setError(err?.message ?? "Failed to load users");
      } finally {
        if (mounted) setLoading(false);
      }
    }

    load();
    return () => {
      mounted = false;
    };
  }, [5]);

  const handleAdd = (u: any) => {
    const newUser = {
      id: uid("EMP"),
      ...u,
      isActive: u.status !== "Inactive",
      createdAt: new Date().toISOString().slice(0, 10),
    };
    setUsers((prev) => [newUser, ...prev]);
    setAddOpen(false);
  };

  const handleSaveEdit = () => {
    if (!editing) return;
    setUsers((prev) =>
      prev.map((x) => (x.id === editing.id ? { ...editing } : x))
    );
    setEditing(null);
  };

  const toggleIsActive = (id: string) => {
    setUsers((prev) =>
      prev.map((u) => (u.id === id ? { ...u, isActive: !u.isActive } : u))
    );
  };

  const fetchUserDetails = async (id?: string | number | null) => {
    if (!id) return;
    const idStr = String(id);
    setDetailsLoading(true);
    setDetailsError(null);
    setDetailsUserData(null);
    try {
      const resp = await GetUserByIdFromApi(idStr);
      const user = resp ?? null;
      setDetailsUserData(user);
    } catch (err: any) {
      console.error("Failed to load user details:", err);
      setDetailsError(err?.message ?? "Failed to load details");
    } finally {
      setDetailsLoading(false);
    }
  };

  const filtered = users.filter((u) => {
    if (filter === "all") return true;
    if (filter === "active") return u.isActive === true;
    return u.isActive === false;
  });

  return (
    <div className="p-6 space-y-6 text-gray-800">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">จัดการผู้ใช้งาน</h1>
          <div className="text-sm text-gray-500">ระบบ: {ORG.name}</div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setAddOpen(true)}
            className="px-3 py-2 bg-indigo-600 text-white rounded text-sm shadow-sm"
          >
            เพิ่มผู้ใช้
          </button>
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="border p-2 rounded text-sm"
          >
            <option value="all">ทั้งหมด</option>
            <option value="active">ใช้งาน</option>
            <option value="inactive">ระงับการใช้งาน</option>
          </select>
        </div>
      </header>

      {loading ? (
        <div className="bg-white p-6 rounded-lg shadow-sm text-center text-gray-600">
          กำลังโหลดรายชื่อผู้ใช้งาน...
        </div>
      ) : error ? (
        <div className="bg-white p-6 rounded-lg shadow-sm text-center text-red-600">
          เกิดข้อผิดพลาด: {error}
        </div>
      ) : (
        <UsersTable
          users={filtered}
          onEdit={(u: any) => setEditing(u)}
          onDetails={(u: any) => fetchUserDetails(u?.id)}
          onToggleIsActive={(id) => {
            if (id == null) return;
            toggleIsActive(String(id));
          }}
        />
      )}

      {/* edit drawer */}
      {editing && (
        <div className="fixed inset-0 flex items-end md:items-center justify-center p-4">
          <div className="w-full md:w-1/2 bg-white rounded-lg shadow-lg p-6">
            <h3 className="text-lg font-semibold mb-3">แก้ไขผู้ใช้</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <input
                value={editing.name}
                onChange={(e) =>
                  setEditing({ ...editing, name: e.target.value })
                }
                className="border p-2 rounded text-sm"
              />
              <input
                value={editing.title}
                onChange={(e) =>
                  setEditing({ ...editing, title: e.target.value })
                }
                className="border p-2 rounded text-sm"
              />
              <input
                value={editing.department}
                onChange={(e) =>
                  setEditing({ ...editing, department: e.target.value })
                }
                className="border p-2 rounded text-sm"
              />
              <select
                value={editing.status}
                onChange={(e) =>
                  setEditing({ ...editing, status: e.target.value })
                }
                className="border p-2 rounded text-sm"
              >
                <option>Active</option>
                <option>On leave</option>
              </select>
            </div>

            <div className="mt-4 flex justify-end gap-2">
              <button
                onClick={() => setEditing(null)}
                className="px-3 py-2 border rounded"
              >
                ยกเลิก
              </button>
              <button
                onClick={handleSaveEdit}
                className="px-3 py-2 bg-indigo-600 text-white rounded"
              >
                บันทึก
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add modal (inline simple) */}
      {addOpen && (
        <div className="fixed inset-0 flex items-end md:items-center justify-center p-4">
          <div className="w-full md:w-1/2 bg-white rounded-lg shadow-lg p-6">
            <h3 className="text-lg font-semibold mb-3">เพิ่มผู้ใช้</h3>
            <AddUserForm onAdd={handleAdd} onCancel={() => setAddOpen(false)} />
          </div>
        </div>
      )}

      {/* User details modal */}
      {(detailsUserData || detailsLoading) && (
        <div className="fixed inset-0 flex items-end md:items-center justify-center p-4">
          <div className="w-full md:w-1/2 bg-white rounded-lg shadow-lg p-6">
            <div className="flex items-start justify-between">
              <h3 className="text-lg font-semibold">รายละเอียดผู้ใช้</h3>
              <button
                onClick={() => setDetailsUserData(null)}
                className="text-sm text-gray-500"
              >
                ปิด
              </button>
            </div>
            <div className="mt-4">
              {detailsLoading ? (
                <div className="text-gray-600">กำลังโหลด...</div>
              ) : detailsError ? (
                <div className="text-red-600">{detailsError}</div>
              ) : detailsUserData ? (
                <div className="space-y-2 text-sm text-gray-700">
                  <div>
                    <strong>ชื่อ:</strong> {detailsUserData.full_name}
                  </div>
                  <div>
                    <strong>ตำแหน่ง:</strong> {detailsUserData.position}
                  </div>
                  <div>
                    <strong>อีเมล:</strong> {detailsUserData.email}
                  </div>
                  <div>
                    <strong>สถานะ:</strong> {statusLabel(detailsUserData)}
                  </div>
                </div>
              ) : null}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function AddUserForm({
  onAdd,
  onCancel,
}: {
  onAdd: (u: any) => void;
  onCancel: () => void;
}) {
  const [name, setName] = useState("");
  const [title, setTitle] = useState("");
  const [department, setDepartment] = useState("");
  const [status, setStatus] = useState("Active");

  return (
    <div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <input
          placeholder="ชื่อ"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="border p-2 rounded text-sm"
        />
        <input
          placeholder="ตำแหน่ง"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="border p-2 rounded text-sm"
        />
        <input
          placeholder="แผนก"
          value={department}
          onChange={(e) => setDepartment(e.target.value)}
          className="border p-2 rounded text-sm"
        />
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          className="border p-2 rounded text-sm"
        >
          <option>Active</option>
          <option>On leave</option>
        </select>
      </div>

      <div className="mt-4 flex justify-end gap-2">
        <button onClick={onCancel} className="px-3 py-2 border rounded">
          ยกเลิก
        </button>
        <button
          onClick={() => onAdd({ name, title, department, status })}
          className="px-3 py-2 bg-green-600 text-white rounded"
        >
          เพิ่ม
        </button>
      </div>
    </div>
  );
}
