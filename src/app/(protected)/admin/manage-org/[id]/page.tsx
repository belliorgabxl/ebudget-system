"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import BackGroundLight from "@/components/background/bg-light";
import { ArrowLeft, Users, Building, Shield, Mail, Briefcase, Calendar, Edit2, Plus, Trash2 } from "lucide-react";
import Link from "next/link";
import type { OrganizationResponse } from "@/dto/organizationDto";
import { GetOrganizationByIdFromApi } from "@/api/organization.client";
import EditOrganizationModal from "@/components/manage-org/EditOrganizationModal";
import AddRoleModal from "@/components/manage-org/AddRoleModal";
import EditRoleModal from "@/components/manage-org/EditRoleModal";
import { MOCK_EMPLOYEES, MOCK_DEPARTMENTS, MOCK_ROLES } from "@/resource/mock-org-detail";
import type { Employee, Department, Role } from "@/resource/mock-org-detail";
import { formatCompactNumber } from "@/lib/util";

export default function OrgDetailPage() {
  const params = useParams();
  const orgId = params?.id as string;
  
  const [org, setOrg] = useState<OrganizationResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"employees" | "departments" | "roles">("employees");
  const [isEditingOpen, setIsEditingOpen] = useState(false);
  const [isAddRoleOpen, setIsAddRoleOpen] = useState(false);
  const [editingRole, setEditingRole] = useState<Role | null>(null);
  const [roles, setRoles] = useState<Role[]>([]);

  useEffect(() => {
    loadOrganization();
  }, [orgId]);

  const loadOrganization = async () => {
    setLoading(true);
    try {
      const data = await GetOrganizationByIdFromApi(orgId);
      setOrg(data);
      setRoles(MOCK_ROLES);
    } catch (err) {
      console.error("Failed to load organization:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleEditRole = (role: Role) => {
    setEditingRole(role);
  };

  const handleSaveRole = (updatedRole: Role) => {
    setRoles((prev) => prev.map((r) => (r.id === updatedRole.id ? updatedRole : r)));
    setEditingRole(null);
  };

  const handleDeleteRole = (roleId: string) => {
    if (confirm("คุณต้องการลบบทบาทนี้ใช่หรือไม่?")) {
      setRoles((prev) => prev.filter((r) => r.id !== roleId));
    }
  };

  if (loading) {
    return (
      <BackGroundLight>
        <div className="flex items-center justify-center min-h-screen">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent"></div>
        </div>
      </BackGroundLight>
    );
  }

  if (!org) {
    return (
      <BackGroundLight>
        <div className="relative min-h-screen">
          <div className="mx-auto max-w-7xl px-6 py-8 pl-20">
            <div className="text-center py-12">
              <p className="text-gray-600">ไม่พบข้อมูลองค์กร</p>
              <Link href="/admin/manage-org" className="text-blue-600 hover:underline mt-4">
                กลับไปหน้าจัดการ
              </Link>
            </div>
          </div>
        </div>
      </BackGroundLight>
    );
  }

  return (
    <>
      <BackGroundLight>
        <div className="relative min-h-screen">
          <div className="mx-auto max-w-7xl px-6 py-8 pl-20">
            {/* Header */}
            <div className="mb-8">
              <Link
                href="/admin/manage-org"
                className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 mb-10"
              >
                <ArrowLeft className="h-4 w-4" />
                <span>กลับ</span>
              </Link>

              <div className="flex items-start justify-between">
                <div>
                  <h1 className="text-3xl font-bold text-gray-900">{org.name}</h1>
                  <p className="mt-1 text-sm text-gray-500">
                    {org.type && <span>ประเภท: {org.type}</span>}
                    {org.type && " • "}
                    <span className="font-mono text-xs">ID: {org.id}</span>
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <span
                    className={`inline-block rounded-full px-4 py-2 text-sm font-medium ${
                      org.is_active
                        ? "bg-green-100 text-green-700"
                        : "bg-gray-100 text-gray-700"
                    }`}
                  >
                    {org.is_active ? "ใช้งาน" : "ไม่ใช้งาน"}
                  </span>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setOrg((prev) =>
                        prev
                          ? {
                              ...prev,
                              is_active: !prev.is_active,
                              updated_at: new Date().toISOString(),
                            }
                          : prev
                      );
                    }}
                    aria-pressed={org.is_active}
                    title={org.is_active ? "ระงับการใช้งาน" : "เปิดใช้งาน"}
                    className={`relative inline-flex items-center h-6 w-12 rounded-full transition-colors focus:outline-none ${
                      org.is_active ? "bg-green-600" : "bg-gray-300"
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white shadow-sm transition-transform ${
                        org.is_active ? "translate-x-6" : "translate-x-1"
                      }`}
                    />
                    <span className="sr-only">
                      {org.is_active ? "เปิดใช้งาน" : "ระงับการใช้งาน"}
                    </span>
                  </button>
                  <button
                    onClick={() => setIsEditingOpen(true)}
                    className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-3 py-2 text-sm text-white hover:bg-blue-700"
                    title="แก้ไของค์กร"
                  >
                    <Edit2 className="h-4 w-4" /> แก้ไข
                  </button>
                </div>
              </div>
            </div>

            {/* Stats */}
            <div className="mb-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <StatCard
                label="วันที่สร้าง"
                value={new Date(org.created_at).toLocaleDateString("th-TH", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
                icon={<Calendar className="h-5 w-5" />}
              />
              <StatCard
                label="อัปเดตล่าสุด"
                value={new Date(org.updated_at).toLocaleDateString("th-TH", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
                icon={<Calendar className="h-5 w-5" />}
              />
              <StatCard
                label="สถานะ"
                value={org.is_active ? "เปิดใช้งาน" : "ปิดใช้งาน"}
                icon={<Building className="h-5 w-5" />}
              />
            </div>

            {/* Tabs */}
            <div className="mb-6 border-b border-gray-200">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div className="flex gap-8">
                <button
                  onClick={() => setActiveTab("employees")}
                  className={`px-4 py-3 font-medium border-b-2 transition-colors ${
                    activeTab === "employees"
                      ? "border-blue-600 text-blue-600"
                      : "border-transparent text-gray-600 hover:text-gray-900"
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4" />
                    <span>พนักงาน ({MOCK_EMPLOYEES.length})</span>
                  </div>
                </button>
                <button
                  onClick={() => setActiveTab("departments")}
                  className={`px-4 py-3 font-medium border-b-2 transition-colors ${
                    activeTab === "departments"
                      ? "border-blue-600 text-blue-600"
                      : "border-transparent text-gray-600 hover:text-gray-900"
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <Building className="h-4 w-4" />
                    <span>หน่วยงาน ({MOCK_DEPARTMENTS.length})</span>
                  </div>
                </button>
                <button
                  onClick={() => setActiveTab("roles")}
                  className={`px-4 py-3 font-medium border-b-2 transition-colors ${
                    activeTab === "roles"
                      ? "border-blue-600 text-blue-600"
                      : "border-transparent text-gray-600 hover:text-gray-900"
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <Shield className="h-4 w-4" />
                    <span>บทบาท ({roles.length})</span>
                  </div>
                </button>
                </div>
                {activeTab === "roles" && (
                  <button
                    onClick={() => setIsAddRoleOpen(true)}
                    className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-3 py-2 text-sm text-white hover:bg-blue-700"
                  >
                    <Plus className="h-4 w-4" /> เพิ่มบทบาท
                  </button>
                )}
              </div>
            </div>

            {/* Content */}
            <div className="rounded-xl bg-white shadow-sm overflow-hidden">
              {activeTab === "employees" && <EmployeesTab />}
              {activeTab === "departments" && <DepartmentsTab />}
              {activeTab === "roles" && (
                <RolesTab
                  roles={roles}
                  onEdit={handleEditRole}
                  onDelete={handleDeleteRole}
                />
              )}
            </div>
          </div>
        </div>
      </BackGroundLight>
      {isAddRoleOpen && (
        <AddRoleModal
          onSave={(role) => {
            setRoles((prev) => [role, ...prev]);
            setIsAddRoleOpen(false);
          }}
          onClose={() => setIsAddRoleOpen(false)}
        />
      )}
      {editingRole && (
        <EditRoleModal
          role={editingRole}
          onSave={handleSaveRole}
          onClose={() => setEditingRole(null)}
        />
      )}
      {isEditingOpen && org && (
        <EditOrganizationModal
          org={org}
          onSave={(updated) => {
            setOrg(updated);
            setIsEditingOpen(false);
          }}
          onClose={() => setIsEditingOpen(false)}
        />
      )}
    </>
  );
}

function StatCard({
  label,
  value,
  icon,
}: {
  label: string;
  value: string | number;
  icon: React.ReactNode;
}) {
  return (
    <div className="rounded-lg bg-white shadow-sm p-4 border border-gray-200">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs text-gray-500">{label}</p>
          <p className="mt-1 text-2xl font-bold text-gray-900">{value}</p>
        </div>
        <div className="text-gray-400">{icon}</div>
      </div>
    </div>
  );
}

function EmployeesTab() {
  return (
    <div className="overflow-x-auto">
      <table className="w-full table-fixed">
        <thead className="bg-gray-50 border-b border-gray-200">
          <tr>
            <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900 w-40">
              ชื่อ
            </th>
            <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900 w-56">
              อีเมล
            </th>
            <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900 w-40">
              ตำแหน่ง
            </th>
            <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900 w-32">
              หน่วยงาน
            </th>
            <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900 w-40">
              บทบาท
            </th>
            <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900 w-32">
              สถานะ
            </th>
            <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900 w-36">
              วันเริ่มงาน
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200">
          {MOCK_EMPLOYEES.map((emp) => (
            <tr key={emp.id} className="hover:bg-gray-50 transition-colors">
              <td className="px-6 py-4 w-40">
                <p className="font-medium text-gray-900 truncate">{emp.name}</p>
              </td>
              <td className="px-6 py-4 w-56">
                <div className="flex items-center gap-2">
                  <Mail className="h-4 w-4 text-gray-400 flex-shrink-0" />
                  <span className="text-sm text-gray-600 truncate">{emp.email}</span>
                </div>
              </td>
              <td className="px-6 py-4 w-40">
                <span className="text-sm text-gray-600 truncate block">{emp.position}</span>
              </td>
              <td className="px-6 py-4 w-32">
                <span className="inline-block rounded-full bg-blue-100 px-3 py-1 text-xs font-medium text-blue-700">
                  {emp.department}
                </span>
              </td>
              <td className="px-6 py-4 w-40">
                <span className="text-sm text-gray-600 truncate block">{emp.role}</span>
              </td>
              <td className="px-6 py-4 w-32">
                <span
                  className={`inline-block rounded-full px-3 py-1 text-xs font-medium ${
                    emp.status === "active"
                      ? "bg-green-100 text-green-700"
                      : emp.status === "on-leave"
                      ? "bg-yellow-100 text-yellow-700"
                      : "bg-gray-100 text-gray-700"
                  }`}
                >
                  {emp.status === "active"
                    ? "ใช้งาน"
                    : emp.status === "on-leave"
                    ? "ลาหยุด"
                    : "ไม่ใช้งาน"}
                </span>
              </td>
              <td className="px-6 py-4">
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-gray-400" />
                  <span className="text-sm text-gray-600">{emp.joinDate}</span>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function DepartmentsTab() {
  return (
    <div className="overflow-x-auto">
      <table className="w-full table-fixed">
        <thead className="bg-gray-50 border-b border-gray-200">
          <tr>
            <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900 w-24">
              รหัส
            </th>
            <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900 w-48">
              ชื่อหน่วยงาน
            </th>
            <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">
              รายละเอียด
            </th>
            <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900 w-40">
              หัวหน้า
            </th>
            <th className="px-6 py-4 text-center text-sm font-semibold text-gray-900 w-28">
              พนักงาน
            </th>
            <th className="px-6 py-4 text-center text-sm font-semibold text-gray-900 w-28">
              โครงการ
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200">
          {MOCK_DEPARTMENTS.map((dept) => (
            <tr key={dept.id} className="hover:bg-gray-50 transition-colors">
              <td className="px-6 py-4 w-24">
                <span className="inline-block rounded-full bg-indigo-100 px-3 py-1 text-sm font-medium text-indigo-700">
                  {dept.code}
                </span>
              </td>
              <td className="px-6 py-4 w-48">
                <p className="font-medium text-gray-900 truncate">{dept.name}</p>
              </td>
              <td className="px-6 py-4">
                <p className="text-sm text-gray-600 line-clamp-2">{dept.description}</p>
              </td>
              <td className="px-6 py-4 w-40">
                <p className="text-sm text-gray-600 truncate">{dept.leader}</p>
              </td>
              <td className="px-6 py-4 text-center w-28">
                <span className="inline-block rounded-full bg-emerald-100 px-3 py-1 text-sm font-medium text-emerald-700">
                  {dept.employeeCount}
                </span>
              </td>
              <td className="px-6 py-4 text-center">
                <span className="inline-block rounded-full bg-violet-100 px-3 py-1 text-sm font-medium text-violet-700">
                  {dept.projectCount}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function RolesTab({
  roles,
  onEdit,
  onDelete,
}: {
  roles: Role[];
  onEdit: (role: Role) => void;
  onDelete: (roleId: string) => void;
}) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full table-fixed">
        <thead className="bg-gray-50 border-b border-gray-200">
          <tr>
            <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900 w-32">
              ID
            </th>
            <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900 w-40">
              ชื่อบทบาท
            </th>
            <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">
              รายละเอียด
            </th>
            <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900 w-56">
              สิทธิ์
            </th>
            <th className="px-6 py-4 text-center text-sm font-semibold text-gray-900 w-28">
              ลำดับอนุมัติ
            </th>
            <th className="px-6 py-4 text-center text-sm font-semibold text-gray-900 w-28">
              จำนวนผู้ใช้
            </th>
            <th className="px-6 py-4 text-center text-sm font-semibold text-gray-900 w-28">
              การจัดการ
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200">
          {roles.map((role) => (
            <tr key={role.id} className="hover:bg-gray-50 transition-colors">
              <td className="px-6 py-4 w-32">
                <span className="text-xs font-mono text-gray-500">
                  {role.id}
                </span>
              </td>
              <td className="px-6 py-4 w-40">
                <p className="font-medium text-gray-900 truncate">{role.name}</p>
              </td>
              <td className="px-6 py-4">
                <p className="text-sm text-gray-600 line-clamp-2">{role.description}</p>
              </td>
              <td className="px-6 py-4 w-56">
                <div className="flex flex-wrap gap-1">
                  {role.permissions.slice(0, 2).map((perm, idx) => (
                    <span
                      key={idx}
                      className="inline-block rounded bg-gray-100 px-2 py-1 text-xs text-gray-600"
                    >
                      {perm}
                    </span>
                  ))}
                  {role.permissions.length > 2 && (
                    <span className="inline-block rounded bg-gray-100 px-2 py-1 text-xs text-gray-600">
                      +{role.permissions.length - 2} อื่นๆ
                    </span>
                  )}
                </div>
              </td>
              <td className="px-6 py-4 text-center">
                {role.approvalOrder ? (
                  <span className="inline-block rounded-full bg-blue-100 px-3 py-1 text-sm font-medium text-blue-700">
                    {role.approvalOrder}
                  </span>
                ) : (
                  <span className="text-sm text-gray-400">-</span>
                )}
              </td>
              <td className="px-6 py-4 text-center">
                <span className="inline-block rounded-full bg-orange-100 px-3 py-1 text-sm font-medium text-orange-700">
                  {role.userCount}
                </span>
              </td>
              <td className="px-6 py-4">
                <div className="flex items-center justify-center gap-2">
                  <button
                    onClick={() => onEdit(role)}
                    className="p-2 rounded-lg text-blue-600 hover:bg-blue-50 transition-colors"
                    title="แก้ไข"
                  >
                    <Edit2 className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => onDelete(role.id)}
                    className="p-2 rounded-lg text-red-600 hover:bg-red-50 transition-colors"
                    title="ลบ"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
