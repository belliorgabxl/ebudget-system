"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import BackGroundLight from "@/components/background/bg-light";
import {
  ArrowLeft,
  Users,
  Building,
  Shield,
  Mail,
  Calendar,
  Edit2,
  Plus,
  Trash2,
  Save,
  RotateCcw,
  GripVertical,
  AlertCircle
} from "lucide-react";
import Link from "next/link";
import type { OrganizationResponse, OrganizationRole } from "@/dto/organizationDto";
import type { GetUserRespond } from "@/dto/userDto";
import type { Department } from "@/dto/departmentDto";
import { GetOrganizationByIdFromApi, GetUsersByOrgFromApi, UpdateOrganizationFromApi } from "@/api/organization.client";
import { GetDepartmentsByOrgFromApi } from "@/api/department.client";
import EditOrganizationModal from "@/components/manage-org/EditOrganizationModal";
import AddRoleModal from "@/components/manage-org/AddRoleModal";
import EditRoleModal from "@/components/manage-org/EditRoleModal";
import AddUserModal from "@/app/(protected)/admin/users/AddUserModal";
import { useToast } from "@/components/ToastProvider";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  useDroppable,
  DragEndEvent,
  DragStartEvent,
  DragOverlay,
  defaultDropAnimationSideEffects,
  DropAnimation,
} from "@dnd-kit/core";
import {
  SortableContext,
  sortableKeyboardCoordinates,
  rectSortingStrategy,
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

export default function OrgDetailPage() {
  const params = useParams();
  const orgId = params?.id as string;
  const toast = useToast();

  const [org, setOrg] = useState<OrganizationResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadingTabs, setLoadingTabs] = useState(false);
  const [activeTab, setActiveTab] = useState<"employees" | "departments" | "roles">("employees");
  const [isEditingOpen, setIsEditingOpen] = useState(false);
  const [isAddRoleOpen, setIsAddRoleOpen] = useState(false);
  const [isAddUserOpen, setIsAddUserOpen] = useState(false);
  const [editingRole, setEditingRole] = useState<OrganizationRole | null>(null);
  const [employees, setEmployees] = useState<GetUserRespond[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [isEditingRoles, setIsEditingRoles] = useState(false);
  const [editedRoles, setEditedRoles] = useState<OrganizationRole[]>([]);
  const [approvalLevels, setApprovalLevels] = useState<{ level: number; roles: OrganizationRole[] }[]>([]);

  useEffect(() => {
    loadOrganization();
  }, [orgId]);

  // Load tabs data after org is loaded
  useEffect(() => {
    if (org) {
      loadTabsData();
      const roles = [...(org.roles || [])].sort((a, b) => (a.approval_level || 0) - (b.approval_level || 0));
      setEditedRoles(roles);
      setApprovalLevels(groupRolesByLevel(roles));
    }
  }, [org]);

  const groupRolesByLevel = (roles: OrganizationRole[]) => {
    const grouped = roles.reduce((acc, role) => {
      const level = role.approval_level || 0;
      if (!acc[level]) acc[level] = [];
      acc[level].push(role);
      return acc;
    }, {} as Record<number, OrganizationRole[]>);

    return Object.entries(grouped)
      .map(([level, roles]) => ({ level: parseInt(level), roles }))
      .sort((a, b) => a.level - b.level);
  };

  const loadOrganization = async () => {
    setLoading(true);
    try {
      const orgData = await GetOrganizationByIdFromApi(orgId);
      setOrg(orgData);
    } catch (err) {
      console.error("Failed to load organization:", err);
    } finally {
      setLoading(false);
    }
  };

  const loadTabsData = async () => {
    setLoadingTabs(true);
    try {
      const [employeesData, departmentsData] = await Promise.all([
        GetUsersByOrgFromApi(orgId),
        GetDepartmentsByOrgFromApi(orgId),
      ]);
      setEmployees(employeesData);
      setDepartments(departmentsData);
    } catch (err) {
      console.error("Failed to load tabs data:", err);
    } finally {
      setLoadingTabs(false);
    }
  };

  const handleEditRole = (role: OrganizationRole) => {
    setEditingRole(role);
  };

  const handleDeleteRole = (roleId: string) => {
    if (confirm("คุณต้องการลบบทบาทนี้ใช่หรือไม่?")) {
      // TODO: Implement delete role API
    }
  };

  const handleEditRoles = () => {
    setIsEditingRoles(true);
  };

  const handleSaveRoles = async () => {
    console.log('=== SAVE ROLES LOG ===');
    console.log('ก่อน save - approvalLevels:', approvalLevels);

    // If trailing (highest) approval level(s) are empty, drop them automatically
    const trimmedLevels = [...approvalLevels];
    while (trimmedLevels.length > 0 && trimmedLevels[trimmedLevels.length - 1].roles.length === 0) {
      trimmedLevels.pop();
    }

    if (trimmedLevels.length !== approvalLevels.length) {
      console.log('Dropped trailing empty approval level(s) before save');
      // update UI to reflect trimmed highest levels
      setApprovalLevels(trimmedLevels);
    }

    // After trimming, any empty level (non-trailing) is invalid
    if (trimmedLevels.some(level => level.roles.length === 0)) {
      toast.push("error", "ข้อผิดพลาด", "แต่ละระดับอนุมัติต้องมีอย่างน้อย 1 บทบาท (กรุณากรอกบทบาทในระดับที่ว่าง)");
      return;
    }

    // Update approval levels in editedRoles from trimmedLevels
    const updatedRoles = trimmedLevels.flatMap(levelData =>
      levelData.roles.map(role => ({ ...role, approval_level: levelData.level }))
    );

    console.log('หลัง map - updatedRoles:', updatedRoles);
    console.log('updatedRoles with approval_level:', updatedRoles.map(r => ({ id: r.id, name: r.name, approval_level: r.approval_level })));

    setEditedRoles(updatedRoles);

    // Calculate max approval level from trimmedLevels
    const maxApprovalLevel = trimmedLevels.length > 0 ? Math.max(...updatedRoles.map(r => r.approval_level || 0)) : 0;
    console.log('maxApprovalLevel:', maxApprovalLevel);

    // Prepare API payload
    const payload = {
      id: orgId,
      name: org?.name || "",
      type: org?.type || "",
      max_approval_level: maxApprovalLevel,
      roles: updatedRoles
    };
    
    console.log('API payload:', payload);

    // Call API to save roles
    const result = await UpdateOrganizationFromApi(payload);

    console.log('API result:', result);
    console.log('=== END SAVE ROLES LOG ===');

    if (result.ok) {
      toast.push("success", "สำเร็จ", "บันทึกการแก้ไขลำดับการอนุมัติเรียบร้อยแล้ว");
      setIsEditingRoles(false);
      // Reload org to get updated data
      await loadOrganization();
    } else {
      toast.push("error", "ข้อผิดพลาด", result.message || "ไม่สามารถบันทึกได้");
    }
  };

  const handleAddLevel = () => {
    const newLevel = approvalLevels.length;
    setApprovalLevels([...approvalLevels, { level: newLevel, roles: [] }]);
  };

  const handleResetRoles = () => {
    const roles = [...(org?.roles || [])].sort((a, b) => (a.approval_level || 0) - (b.approval_level || 0));
    setEditedRoles(roles);
    setApprovalLevels(groupRolesByLevel(roles));
    setIsEditingRoles(false);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    console.log('=== DRAG TEST LOG ===');
    console.log('ก่อน drag - approvalLevels:', approvalLevels);

    const { active, over } = event;

    if (!over) {
      console.log('Drag cancelled - no over target');
      return;
    }

    const activeId = active.id as string;
    const overId = over.id;

    console.log('ขณะ drag - activeId:', activeId, 'overId:', overId);

    // Ensure overId is a string
    if (typeof overId !== 'string') {
      console.log('Drag cancelled - overId is not string');
      return;
    }

    let sourceLevelIndex = -1;
    let destLevelIndex = -1;
    let sourceRoleIndex = -1;

    approvalLevels.forEach((level, levelIdx) => {
      const roleIdx = level.roles.findIndex(r => r.id === activeId);
      if (roleIdx !== -1) {
        sourceLevelIndex = levelIdx;
        sourceRoleIndex = roleIdx;
      }
      if (level.roles.some(r => r.id === overId)) {
        destLevelIndex = levelIdx;
      }
    });

    // If dropping on a level header/container (overId is level id)
    if (overId.startsWith('level-')) {
      const levelNum = parseInt(overId.replace('level-', ''));
      destLevelIndex = approvalLevels.findIndex(l => l.level === levelNum);
    }

    console.log('ขณะ drag - sourceLevelIndex:', sourceLevelIndex, 'destLevelIndex:', destLevelIndex, 'sourceRoleIndex:', sourceRoleIndex);

    if (sourceLevelIndex === -1 || destLevelIndex === -1) {
      console.log('Drag cancelled - invalid source or destination');
      return;
    }

    const newLevels = approvalLevels.map(lvl => ({
      ...lvl,
      roles: [...lvl.roles]
    }));
    
    // Remove from source
    const [movedRole] = newLevels[sourceLevelIndex].roles.splice(sourceRoleIndex, 1);

    console.log('ขณะ drag - movedRole:', movedRole);

    // Check if source level would be empty (Optional constraint)
    // if (newLevels[sourceLevelIndex].roles.length === 0) {
    //   alert('แต่ละระดับอนุมัติต้องมีอย่างน้อย 1 บทบาท');
    //   return;
    // }

    // Add to destination
    if (overId.startsWith('level-')) {
      // Drop on level container, add to end
      newLevels[destLevelIndex].roles.push(movedRole);
      console.log('Drop on level container - added to end of level', destLevelIndex);
    } else {
      // Drop on another role, insert at that position
      const destRoleIndex = newLevels[destLevelIndex].roles.findIndex(r => r.id === overId);
      newLevels[destLevelIndex].roles.splice(destRoleIndex, 0, movedRole);
      console.log('Drop on role - inserted at position', destRoleIndex, 'in level', destLevelIndex);
    }

    console.log('หลัง drag - newLevels:', newLevels);
    console.log('=== END DRAG TEST LOG ===');

    setApprovalLevels(newLevels);
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
                    className={`inline-block rounded-full px-4 py-2 text-sm font-medium ${org.is_active
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
                    className={`relative inline-flex items-center h-6 w-12 rounded-full transition-colors focus:outline-none ${org.is_active ? "bg-green-600" : "bg-gray-300"
                      }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white shadow-sm transition-transform ${org.is_active ? "translate-x-6" : "translate-x-1"
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
                    className={`px-4 py-3 font-medium border-b-2 transition-colors ${activeTab === "employees"
                      ? "border-blue-600 text-blue-600"
                      : "border-transparent text-gray-600 hover:text-gray-900"
                      }`}
                  >
                    <div className="flex items-center gap-2">
                      <Users className="h-4 w-4" />
                      <span>พนักงาน ({employees.length})</span>
                    </div>
                  </button>
                  <button
                    onClick={() => setActiveTab("departments")}
                    className={`px-4 py-3 font-medium border-b-2 transition-colors ${activeTab === "departments"
                      ? "border-blue-600 text-blue-600"
                      : "border-transparent text-gray-600 hover:text-gray-900"
                      }`}
                  >
                    <div className="flex items-center gap-2">
                      <Building className="h-4 w-4" />
                      <span>หน่วยงาน ({departments.length})</span>
                    </div>
                  </button>
                  <button
                    onClick={() => setActiveTab("roles")}
                    className={`px-4 py-3 font-medium border-b-2 transition-colors ${activeTab === "roles"
                      ? "border-blue-600 text-blue-600"
                      : "border-transparent text-gray-600 hover:text-gray-900"
                      }`}
                  >
                    <div className="flex items-center gap-2">
                      <Shield className="h-4 w-4" />
                      <span>บทบาท ({org.roles?.length || 0})</span>
                    </div>
                  </button>
                </div>
                {activeTab === "employees" && (
                  <button
                    onClick={() => setIsAddUserOpen(true)}
                    className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-3 py-2 text-sm text-white hover:bg-blue-700 shadow-sm"
                  >
                    <Plus className="h-4 w-4" /> เพิ่มผู้ใช้
                  </button>
                )}
                {activeTab === "roles" && (
                  <button
                    onClick={() => setIsAddRoleOpen(true)}
                    className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-3 py-2 text-sm text-white hover:bg-blue-700 shadow-sm"
                  >
                    <Plus className="h-4 w-4" /> เพิ่มบทบาท
                  </button>
                )}
              </div>
            </div>

            {/* Content */}
            <div className="rounded-xl bg-white shadow-sm overflow-hidden min-h-[400px]">
              {activeTab === "employees" && <EmployeesTab employees={employees} loading={loadingTabs} />}
              {activeTab === "departments" && <DepartmentsTab departments={departments} loading={loadingTabs} />}
              {activeTab === "roles" && (
                <RolesTab
                  approvalLevels={isEditingRoles ? approvalLevels : groupRolesByLevel(org.roles || [])}
                  onEdit={handleEditRole}
                  onDelete={handleDeleteRole}
                  isEditing={isEditingRoles}
                  onEditRoles={org.count_pending_approval && org.count_pending_approval > 0 ? undefined : handleEditRoles}
                  onSaveRoles={handleSaveRoles}
                  onResetRoles={handleResetRoles}
                  onDragEnd={handleDragEnd}
                  onAddLevel={handleAddLevel}
                  hasPendingApproval={!!(org.count_pending_approval && org.count_pending_approval > 0)}
                  org={org}
                />
              )}
            </div>
          </div>
        </div>
      </BackGroundLight>
      {isAddUserOpen && (
        <AddUserModal
          open={isAddUserOpen}
          onClose={() => setIsAddUserOpen(false)}
          onAdd={() => {
            setIsAddUserOpen(false);
            loadTabsData(); // Reload employees after adding
          }}
          lockedOrgId={orgId}
        />
      )}
      {isAddRoleOpen && (
        <AddRoleModal
          organizationId={orgId}
          onSave={(newRole) => {
            const updatedRoles = [...editedRoles, newRole];
            setEditedRoles(updatedRoles);
            setApprovalLevels(groupRolesByLevel(updatedRoles));
            setIsAddRoleOpen(false);
            loadOrganization();
          }}
          onClose={() => setIsAddRoleOpen(false)}
        />
      )}
      {editingRole && (
        <EditRoleModal
          role={editingRole}
          onSave={(updatedRole) => {
            console.log('EditRoleModal onSave - updatedRole:', updatedRole);
            const updatedRoles = editedRoles.map(r => r.id === updatedRole.id ? updatedRole : r);
            setEditedRoles(updatedRoles);
            setApprovalLevels(groupRolesByLevel(updatedRoles));
            setEditingRole(null);
            // Reload organization to sync with server
            loadOrganization();
          }}
          onClose={() => setEditingRole(null)}
        />
      )}
      {isEditingOpen && org && (
        <EditOrganizationModal
          org={org}
          onSave={async (updated) => {
            const maxApprovalLevel = editedRoles.length > 0 ? Math.max(...editedRoles.map(r => r.approval_level || 0)) : 0;
            const result = await UpdateOrganizationFromApi({
              id: updated.id,
              name: updated.name,
              type: updated.type,
              max_approval_level: maxApprovalLevel,
              roles: editedRoles
            });
            if (result.ok) {
              toast.push("success", "สำเร็จ", "แก้ไของค์กรเรียบร้อยแล้ว");
              setOrg(updated);
              setIsEditingOpen(false);
              // Reload to get updated data
              loadOrganization();
            } else {
              toast.push("error", "ข้อผิดพลาด", result.message || "ไม่สามารถแก้ไขได้");
            }
          }}
          onClose={() => setIsEditingOpen(false)}
        />
      )}
    </>
  );
}

// --- Sub Components ---

function StatCard({ label, value, icon }: { label: string; value: string | number; icon: React.ReactNode }) {
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

// --- Roles Tab & DND Logic ---

function RolesTab({
  approvalLevels,
  onEdit,
  onDelete,
  isEditing,
  onEditRoles,
  onSaveRoles,
  onResetRoles,
  onDragEnd,
  onAddLevel,
  hasPendingApproval,
  org,
}: {
  approvalLevels: { level: number; roles: OrganizationRole[] }[];
  onEdit: (role: OrganizationRole) => void;
  onDelete: (roleId: string) => void;
  isEditing: boolean;
  onEditRoles?: () => void;
  onSaveRoles: () => void;
  onResetRoles: () => void;
  onDragEnd: (event: DragEndEvent) => void;
  onAddLevel: () => void;
  hasPendingApproval?: boolean;
  org: OrganizationResponse;
}) {
  const [activeRole, setActiveRole] = useState<OrganizationRole | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5, // ต้องลากเกิน 5px ถึงจะเริ่มนับว่าเป็นการลาก (ป้องกันการคลิกแล้วกระตุก)
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragStart = (event: DragStartEvent) => {
    const roleId = event.active.id as string;
    // Find the role object
    for (const level of approvalLevels) {
      const role = level.roles.find((r) => r.id === roleId);
      if (role) {
        setActiveRole(role);
        break;
      }
    }
  };

  const handleDragEndInternal = (event: DragEndEvent) => {
    setActiveRole(null);
    onDragEnd(event);
  };

  const dropAnimation: DropAnimation = {
    sideEffects: defaultDropAnimationSideEffects({
      styles: {
        active: {
          opacity: '0.4',
        },
      },
    }),
  };

  return (
    <div className="p-6 bg-gray-50 min-h-[500px]">
      {/* Header Toolbar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            <Shield className="h-5 w-5 text-blue-600" />
            จัดการลำดับการอนุมัติ
          </h3>
          <p className="text-sm text-gray-500 mt-1">
            {isEditing 
              ? "ลากและวางบทบาทเพื่อจัดลำดับขั้นตอนการอนุมัติ หรือย้ายระหว่างระดับ" 
              : "แสดงลำดับการอนุมัติปัจจุบันตามโครงสร้างองค์กร"}
          </p>
        </div>
        
        <div className="flex items-center gap-2 flex-shrink-0">
          {!isEditing ? (
            hasPendingApproval ? (
              <div className="inline-flex items-center gap-2 rounded-lg bg-amber-50 border border-amber-200 px-4 py-2 text-sm font-medium text-amber-700">
                <AlertCircle className="h-4 w-4" />
                มี {org.count_pending_approval} รายการรอการอนุมัติ ไม่สามารถแก้ไขลำดับได้
              </div>
            ) : (
              <button
                onClick={onEditRoles}
                className="inline-flex items-center gap-2 rounded-lg bg-white border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 hover:text-blue-600 transition shadow-sm"
              >
                <Edit2 className="h-4 w-4" />
                แก้ไขลำดับ
              </button>
            )
          ) : (
            <div className="flex items-center bg-white p-1.5 rounded-xl border border-gray-200 shadow-sm">
              <button
                onClick={onAddLevel}
                className="inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100 transition"
              >
                <Plus className="h-4 w-4" />
                เพิ่มระดับ
              </button>
              <div className="w-px h-6 bg-gray-300 mx-1"></div>
              <button
                onClick={onResetRoles}
                className="inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100 transition"
              >
                <RotateCcw className="h-4 w-4" />
                รีเซ็ต
              </button>
              <div className="w-px h-6 bg-gray-300 mx-1"></div>
              <button
                onClick={onSaveRoles}
                className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-bold text-white hover:bg-blue-700 transition shadow-sm"
              >
                <Save className="h-4 w-4" />
                บันทึกการแก้ไข
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Main Drag and Drop Area */}
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEndInternal}
      >
        <div className="space-y-6">
          {approvalLevels.map((levelData) => (
            <ApprovalLevelSection
              key={levelData.level}
              levelData={levelData}
              isEditing={isEditing}
              onEdit={onEdit}
              onDelete={onDelete}
            />
          ))}

          {approvalLevels.length === 0 && (
            <div className="text-center py-16 border-2 border-dashed border-gray-200 rounded-xl bg-white">
              <Shield className="h-12 w-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500">ยังไม่มีข้อมูลบทบาทในระบบ</p>
            </div>
          )}
        </div>

        {/* Drag Overlay - สิ่งที่ลอยตามเมาส์เวลาลาก */}
        <DragOverlay dropAnimation={dropAnimation}>
          {activeRole ? (
            <div className="w-[300px]">
              <RoleCardItem
                role={activeRole}
                isEditing={true}
                isOverlay={true}
                onEdit={() => {}}
                onDelete={() => {}}
              />
            </div>
          ) : null}
        </DragOverlay>
      </DndContext>
    </div>
  );
}

function ApprovalLevelSection({
  levelData,
  isEditing,
  onEdit,
  onDelete,
}: {
  levelData: { level: number; roles: OrganizationRole[] };
  isEditing: boolean;
  onEdit: (role: OrganizationRole) => void;
  onDelete: (roleId: string) => void;
}) {
  const { setNodeRef, isOver } = useDroppable({
    id: `level-${levelData.level}`,
    data: { level: levelData.level }
  });

  return (
    <div className="relative pl-12">
      {/* Level Indicator Line */}
      <div className="absolute left-[19px] top-8 bottom-0 w-0.5 bg-gray-200 last:hidden"></div>
      
      {/* Level Badge */}
      <div className="absolute left-0 top-6 flex h-10 w-10 items-center justify-center rounded-full border-4 border-gray-50 bg-blue-600 text-white shadow-sm z-10">
        <span className="text-sm font-bold">{levelData.level}</span>
      </div>

      <div
        ref={setNodeRef}
        className={`
          rounded-xl border transition-all duration-300 p-5 pt-8 min-h-[120px]
          ${isOver && isEditing 
            ? "bg-blue-50 border-blue-300 shadow-md ring-2 ring-blue-100 ring-offset-2" 
            : "bg-white border-gray-200 shadow-sm"
          }
        `}
      >
        <div className="mb-4 flex items-center justify-between">
          <h4 className="font-semibold text-gray-800">
            ระดับการอนุมัติที่ {levelData.level}
          </h4>
          <span className="text-xs text-gray-400 bg-gray-100 px-2 py-1 rounded-full">
            {levelData.roles.length} บทบาท
          </span>
        </div>

        {isEditing ? (
          <SortableContext 
            items={levelData.roles.map((r) => r.id)} 
            strategy={rectSortingStrategy} // ใช้ rect strategy เพื่อให้ทำงานแบบ Grid ได้ดี
          >
            <div className={`grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3 min-h-[60px] ${levelData.roles.length === 0 ? 'border-2 border-dashed border-gray-200 rounded-lg bg-gray-50/50 flex items-center justify-center' : ''}`}>
              {levelData.roles.length === 0 && (
                 <div className="col-span-full text-center text-gray-400 text-sm py-4 flex items-center justify-center gap-2">
                   <AlertCircle className="h-4 w-4" />
                   ลากบทบาทมาวางที่นี่
                 </div>
              )}
              {levelData.roles.map((role) => (
                <SortableRoleCard
                  key={role.id}
                  role={role}
                  onEdit={onEdit}
                  onDelete={onDelete}
                  isEditing={isEditing}
                />
              ))}
            </div>
          </SortableContext>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
             {levelData.roles.length === 0 && (
                 <div className="col-span-full text-center text-gray-400 text-sm py-4 italic">
                   ไม่มีบทบาทในระดับนี้
                 </div>
              )}
            {levelData.roles.map((role) => (
              <RoleCardItem
                key={role.id}
                role={role}
                isEditing={false}
                onEdit={onEdit}
                onDelete={onDelete}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function SortableRoleCard({
  role,
  onEdit,
  onDelete,
  isEditing,
}: {
  role: OrganizationRole;
  onEdit: (role: OrganizationRole) => void;
  onDelete: (roleId: string) => void;
  isEditing: boolean;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: role.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.3 : 1, // จางลงเมื่อถูกลาก
  };

  return (
    <div ref={setNodeRef} style={style} className="touch-none">
      <RoleCardItem 
        role={role} 
        isEditing={isEditing} 
        onEdit={onEdit} 
        onDelete={onDelete} 
        dragHandlers={{ ...attributes, ...listeners }}
      />
    </div>
  );
}

// Visual Component (ใช้ทั้งตอนแสดงผลปกติ และตอนเป็น DragOverlay)
function RoleCardItem({
  role,
  isEditing,
  onEdit,
  onDelete,
  dragHandlers,
  isOverlay = false
}: {
  role: OrganizationRole;
  isEditing: boolean;
  onEdit: (role: OrganizationRole) => void;
  onDelete: (roleId: string) => void;
  dragHandlers?: any;
  isOverlay?: boolean;
}) {
  return (
    <div
      className={`
        group relative flex items-start gap-3 p-3 rounded-xl border bg-white transition-all
        ${isOverlay ? "shadow-2xl ring-2 ring-blue-500 scale-105 rotate-2 cursor-grabbing z-50" : "hover:border-blue-300 hover:shadow-md border-gray-200 shadow-sm"}
      `}
    >
      {/* Drag Handle - Show only when editing */}
      {isEditing && (
        <div 
          {...dragHandlers}
          className={`
            mt-1 -ml-1 p-1.5 rounded-lg cursor-grab active:cursor-grabbing text-gray-300 hover:text-gray-600 hover:bg-gray-100 transition-colors
            ${isOverlay ? "cursor-grabbing" : ""}
          `}
        >
          <GripVertical className="h-5 w-5" />
        </div>
      )}

      {/* Role Icon */}
      <div className={`mt-1 flex-shrink-0 rounded-lg p-2 ${role.is_active ? 'bg-blue-50 text-blue-600' : 'bg-gray-100 text-gray-500'}`}>
        <Shield className="h-5 w-5" />
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0 pr-1">
        <div className="flex items-start justify-between gap-2">
          <h5 className="font-semibold text-gray-900 truncate" title={role.display_name || role.name}>
            {role.display_name || role.name}
          </h5>
          {/* Status Badge */}
          <span className={`flex-shrink-0 inline-block h-2 w-2 rounded-full mt-2 ${role.is_active ? "bg-green-500" : "bg-gray-300"}`} title={role.is_active ? "ใช้งาน" : "ไม่ใช้งาน"}></span>
        </div>
        
        <p className="text-xs text-gray-500 mt-1 line-clamp-1">
          {role.description || "ไม่มีรายละเอียด"}
        </p>

        <div className="flex items-center gap-2 mt-2">
          <code className="text-[10px] bg-gray-100 px-1.5 py-0.5 rounded text-gray-500 font-mono">
            {role.code}
          </code>
          {typeof (role as any).user_count === 'number' && (
            <span className="ml-2 inline-flex items-center gap-2 rounded-full bg-blue-50 text-blue-600 px-2 py-0.5 text-xs font-semibold">
              <svg width="10" height="10" viewBox="0 0 24 24" fill="none" className="opacity-80"><path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" stroke="currentColor" strokeWidth="0" fill="currentColor"/></svg>
              { (role as any).user_count }
            </span>
          )}
        </div>
      </div>

      {/* Actions - Show only when NOT editing or dragging */}
      {!isEditing && !isOverlay && (
        <div className="absolute right-2 top-2 opacity-0 group-hover:opacity-100 transition-opacity flex gap-1 bg-white/90 backdrop-blur-sm p-1 rounded-lg border border-gray-100 shadow-sm">
          <button
            onClick={() => onEdit(role)}
            className="p-1.5 rounded-md text-blue-600 hover:bg-blue-50 transition-colors"
            title="แก้ไข"
          >
            <Edit2 className="h-3.5 w-3.5" />
          </button>
          <button
            onClick={() => onDelete(role.id)}
            className="p-1.5 rounded-md text-red-600 hover:bg-red-50 transition-colors"
            title="ลบ"
            disabled={role.is_system}
          >
            <Trash2 className="h-3.5 w-3.5" />
          </button>
        </div>
      )}
    </div>
  );
}

// --- Other Tabs ---

function EmployeesTab({ employees, loading }: { employees: GetUserRespond[]; loading: boolean }) {
  // Skeleton logic same as before...
  const renderSkeletonRow = (key: string | number) => (
    <tr key={`s-${key}`} className="odd:bg-white even:bg-gray-50/40">
      <td className="px-4 py-3"><div className="h-4 w-32 rounded bg-gray-200 animate-pulse" /></td>
      <td className="px-4 py-3"><div className="h-4 w-48 rounded bg-gray-200 animate-pulse" /></td>
      <td className="px-4 py-3"><div className="h-4 w-24 rounded bg-gray-200 animate-pulse" /></td>
      <td className="px-4 py-3"><div className="h-4 w-20 rounded bg-gray-200 animate-pulse" /></td>
      <td className="px-4 py-3"><div className="h-4 w-16 rounded bg-gray-200 animate-pulse" /></td>
      <td className="px-4 py-3"><div className="h-6 w-12 rounded-full bg-gray-200 animate-pulse mx-auto" /></td>
      <td className="px-4 py-3"><div className="h-4 w-20 rounded bg-gray-200 animate-pulse" /></td>
    </tr>
  );

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full text-xs">
        <thead className="bg-gray-50/80 border-b border-gray-200">
          <tr>
            <th className="px-4 py-3 font-semibold text-gray-600 text-left">ชื่อ</th>
            <th className="px-4 py-3 font-semibold text-gray-600 text-left">อีเมล</th>
            <th className="px-4 py-3 font-semibold text-gray-600 text-left">ตำแหน่ง</th>
            <th className="px-4 py-3 font-semibold text-gray-600 text-left">หน่วยงาน</th>
            <th className="px-4 py-3 font-semibold text-gray-600 text-left">บทบาท</th>
            <th className="px-4 py-3 font-semibold text-gray-600 text-center">สถานะ</th>
            <th className="px-4 py-3 font-semibold text-gray-600 text-left">เข้าสู่ระบบล่าสุด</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {loading ? (
            Array.from({ length: 6 }).map((_, i) => renderSkeletonRow(i))
          ) : employees.length === 0 ? (
            <tr><td colSpan={7} className="px-4 py-10 text-center text-gray-500">ยังไม่มีพนักงานในระบบ</td></tr>
          ) : (
            employees.map((emp) => (
              <tr key={emp.id} className="odd:bg-white even:bg-gray-50/40 hover:bg-blue-50/30 transition-colors">
                <td className="px-4 py-3 text-gray-800 font-medium">{emp.full_name}</td>
                <td className="px-4 py-3 text-gray-600 flex items-center gap-2"><Mail className="h-3 w-3" /> {emp.email}</td>
                <td className="px-4 py-3 text-gray-600">{emp.position || "-"}</td>
                <td className="px-4 py-3 text-gray-600">{emp.department_name || "-"}</td>
                <td className="px-4 py-3 text-gray-600">{emp.role}</td>
                <td className="px-4 py-3 text-center">
                   <span className={`inline-flex h-2 w-2 rounded-full ${emp.is_active ? 'bg-green-500' : 'bg-red-400'}`}></span>
                </td>
                <td className="px-4 py-3 text-gray-500">
                  {emp.last_login_at ? new Date(emp.last_login_at).toLocaleDateString("th-TH") : "-"}
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}

function DepartmentsTab({ departments, loading }: { departments: Department[]; loading: boolean }) {
    const renderSkeletonRow = (key: string | number) => (
        <tr key={`s-${key}`} className="odd:bg-white even:bg-gray-50/40">
          <td className="px-4 py-3"><div className="h-4 w-16 rounded bg-gray-200 animate-pulse" /></td>
          <td className="px-4 py-3"><div className="h-4 w-32 rounded bg-gray-200 animate-pulse" /></td>
          <td className="px-4 py-3"><div className="h-4 w-8 rounded bg-gray-200 animate-pulse mx-auto" /></td>
          <td className="px-4 py-3"><div className="h-4 w-8 rounded bg-gray-200 animate-pulse mx-auto" /></td>
          <td className="px-4 py-3"><div className="h-6 w-12 rounded-full bg-gray-200 animate-pulse mx-auto" /></td>
        </tr>
      );
    
      return (
        <div className="overflow-x-auto">
          <table className="min-w-full text-xs">
            <thead className="bg-gray-50/80 border-b border-gray-200">
              <tr>
                <th className="px-4 py-3 font-semibold text-gray-600 text-left">รหัส</th>
                <th className="px-4 py-3 font-semibold text-gray-600 text-left">ชื่อหน่วยงาน</th>
                <th className="px-4 py-3 font-semibold text-gray-600 text-center">พนักงาน</th>
                <th className="px-4 py-3 font-semibold text-gray-600 text-center">โครงการ</th>
                <th className="px-4 py-3 font-semibold text-gray-600 text-center">สถานะ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                Array.from({ length: 6 }).map((_, i) => renderSkeletonRow(i))
              ) : departments.length === 0 ? (
                <tr><td colSpan={5} className="px-4 py-10 text-center text-gray-500">ยังไม่มีหน่วยงานในระบบ</td></tr>
              ) : (
                departments.map((dept) => (
                  <tr key={dept.id} className="odd:bg-white even:bg-gray-50/40 hover:bg-blue-50/30 transition-colors">
                    <td className="px-4 py-3"><span className="font-mono bg-gray-100 px-2 py-0.5 rounded text-gray-600">{dept.code}</span></td>
                    <td className="px-4 py-3 text-gray-800 font-medium">{dept.name}</td>
                    <td className="px-4 py-3 text-center"><span className="bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full font-bold">{dept.user_count || 0}</span></td>
                    <td className="px-4 py-3 text-center"><span className="bg-purple-100 text-purple-700 px-2 py-0.5 rounded-full font-bold">{dept.project_count || 0}</span></td>
                    <td className="px-4 py-3 text-center">
                        <span className={`inline-flex h-2 w-2 rounded-full ${dept.is_active ? 'bg-green-500' : 'bg-red-400'}`}></span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      );
}