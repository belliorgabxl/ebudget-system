// Admin Manage Organization Page (layout aligned to organizer users page)
"use client";
import React, { useEffect, useState } from "react";
// we will render a table inline so we can include edit/delete actions

// mock org header
const ORG = { id: "ORG-001", name: "Example Org" };

const INITIAL_DEPARTMENTS: any[] = [
  { code: "HR", name: "ฝ่ายบุคคล", leader: "สมชาย ใจดี", employees: 15, projects: 3, updatedAt: "01/11/2568" },
  { code: "IT", name: "ฝ่ายไอที", leader: "วิชัย เทคโน", employees: 20, projects: 6, updatedAt: "05/11/2568" },
];

function uid(prefix = "D") {
  return `${prefix}-${Math.floor(Math.random() * 10000)}`;
}

export default function AdminManageOrgPage() {
  const [departments, setDepartments] = useState(INITIAL_DEPARTMENTS);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [editing, setEditing] = useState<any | null>(null);
  const [addOpen, setAddOpen] = useState(false);

  // placeholder: in future, load from API
  useEffect(() => {
    // noop for now — kept to mirror organizer/users structure
  }, []);

  const handleAdd = (d: any) => {
    const newDept = { id: uid("DEP"), ...d, updatedAt: new Date().toISOString().slice(0, 10) };
    setDepartments((prev) => [newDept, ...prev]);
    setAddOpen(false);
  };

  const handleSaveEdit = () => {
    if (!editing) return;
    setDepartments((prev) => prev.map((x) => (x.code === editing.code ? { ...editing } : x)));
    setEditing(null);
  };

  const filtered = departments; // could add filter UI later

  return (
    <div className="p-6 space-y-6 text-gray-800">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">จัดการองค์กร</h1>
          <div className="text-sm text-gray-500">องค์กร: {ORG.name}</div>
        </div>

        <div className="flex items-center gap-2">
          <button onClick={() => setAddOpen(true)} className="px-3 py-2 bg-indigo-600 text-white rounded text-sm shadow-sm">เพิ่มหน่วยงาน</button>
        </div>
      </header>

      {loading ? (
        <div className="bg-white p-6 rounded-lg shadow-sm text-center text-gray-600">กำลังโหลดรายชื่อหน่วยงาน...</div>
      ) : error ? (
        <div className="bg-white p-6 rounded-lg shadow-sm text-center text-red-600">เกิดข้อผิดพลาด: {error}</div>
      ) : (
        <div className="bg-white rounded-lg shadow-sm overflow-auto">
          <table className="min-w-full text-sm">
            <thead className="bg-gradient-to-r from-indigo-50/70 to-blue-50/70 text-center">
              <tr>
                <th className="p-3">รหัส</th>
                <th className="p-3">ชื่อหน่วยงาน</th>
                <th className="p-3">หัวหน้าหน่วยงาน</th>
                <th className="p-3">พนักงาน</th>
                <th className="p-3">โปรเจ็กต์</th>
                <th className="p-3">จัดการ</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((d) => (
                <tr key={d.code} className=" hover:bg-gray-50 text-center">
                  <td className="p-3 font-medium">{d.code}</td>
                  <td className="p-3">{d.name}</td>
                  <td className="p-3">{d.leader}</td>
                  <td className="p-3">{d.employees}</td>
                  <td className="p-3">{d.projects ?? "-"}</td>
                  <td className="p-3">
                    <div className="inline-flex items-center gap-2">
                      <button onClick={() => setEditing(d)} className="px-2 py-1 bg-indigo-100 text-indigo-700 rounded">แก้ไข</button>
                      <button onClick={() => setDepartments((prev) => prev.filter((x) => x.code !== d.code))} className="px-2 py-1 bg-red-100 text-red-700 rounded">ลบ</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* edit drawer */}
      {editing && (
        <div className="fixed inset-0 flex items-end md:items-center justify-center p-4">
          <div className="w-full md:w-1/2 bg-white rounded-lg shadow-lg p-6">
            <h3 className="text-lg font-semibold mb-3">แก้ไขหน่วยงาน</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <input value={editing.name} onChange={(e) => setEditing({ ...editing, name: e.target.value })} className="border p-2 rounded text-sm" />
              <input value={editing.leader} onChange={(e) => setEditing({ ...editing, leader: e.target.value })} className="border p-2 rounded text-sm" />
              <input value={editing.employees} onChange={(e) => setEditing({ ...editing, employees: Number(e.target.value) })} className="border p-2 rounded text-sm" />
            </div>

            <div className="mt-4 flex justify-end gap-2">
              <button onClick={() => setEditing(null)} className="px-3 py-2 border rounded">ยกเลิก</button>
              <button onClick={handleSaveEdit} className="px-3 py-2 bg-indigo-600 text-white rounded">บันทึก</button>
            </div>
          </div>
        </div>
      )}

      {/* Add modal (inline simple modal) */}
      {addOpen && (
        <div className="fixed inset-0 flex items-end md:items-center justify-center p-4">
          <div className="w-full md:w-1/2 bg-white rounded-lg shadow-lg p-6">
            <h3 className="text-lg font-semibold mb-3">เพิ่มหน่วยงาน</h3>
            <AddDepartmentForm onAdd={handleAdd} onCancel={() => setAddOpen(false)} />
          </div>
        </div>
      )}
    </div>
  );
}

function AddDepartmentForm({ onAdd, onCancel }: { onAdd: (d: any) => void; onCancel: () => void }) {
  const [code, setCode] = useState("");
  const [name, setName] = useState("");
  const [leader, setLeader] = useState("");
  const [employees, setEmployees] = useState(0);

  return (
    <div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <input placeholder="รหัส" value={code} onChange={(e) => setCode(e.target.value)} className="border p-2 rounded text-sm" />
        <input placeholder="ชื่อแผนก" value={name} onChange={(e) => setName(e.target.value)} className="border p-2 rounded text-sm" />
        <input placeholder="หัวหน้า" value={leader} onChange={(e) => setLeader(e.target.value)} className="border p-2 rounded text-sm" />
        <input placeholder="จำนวนพนักงาน" type="number" value={employees} onChange={(e) => setEmployees(Number(e.target.value))} className="border p-2 rounded text-sm" />
      </div>

      <div className="mt-4 flex justify-end gap-2">
        <button onClick={onCancel} className="px-3 py-2 border rounded">ยกเลิก</button>
        <button
          onClick={() => onAdd({ code: code || uid("DEP"), name, leader, employees })}
          className="px-3 py-2 bg-green-600 text-white rounded"
        >
          เพิ่ม
        </button>
      </div>
    </div>
  );
}
