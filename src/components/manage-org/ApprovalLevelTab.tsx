"use client";
import React, { useState, useCallback, useEffect } from "react";
import { GripVertical, AlertTriangle, RotateCcw, Check, Pencil, X } from "lucide-react";
import type { ApprovalLevel, OrganizationRole } from "@/dto/organizationDto";

interface ApprovalLevelTabProps {
  approvalLevels: ApprovalLevel[];
  organizationRoles?: OrganizationRole[];
  onSave: (levels: ApprovalLevel[]) => void;
}

export default function ApprovalLevelTab({ 
  approvalLevels, 
  organizationRoles = [],
  onSave 
}: ApprovalLevelTabProps) {
  // Convert OrganizationRole to available roles for display
  const availableRoles = organizationRoles.map((role) => ({
    id: role.name,
    name: role.display_name,
  }));
  const [isEditing, setIsEditing] = useState(false);
  const [editingLevels, setEditingLevels] = useState<ApprovalLevel[]>([]);
  const [originalLevels, setOriginalLevels] = useState<ApprovalLevel[]>([]);
  const [draggedRole, setDraggedRole] = useState<{ levelIndex: number; roleId: string } | null>(null);
  const [dragOverLevel, setDragOverLevel] = useState<number | null>(null);
  const [hasChanges, setHasChanges] = useState(false);

  // Initialize editing levels when entering edit mode
  useEffect(() => {
    if (isEditing) {
      const deepCopy = JSON.parse(JSON.stringify(approvalLevels));
      setEditingLevels(deepCopy);
      setOriginalLevels(JSON.parse(JSON.stringify(approvalLevels)));
    }
  }, [isEditing, approvalLevels]);

  // Check for changes
  useEffect(() => {
    if (isEditing) {
      const changed = JSON.stringify(editingLevels) !== JSON.stringify(originalLevels);
      setHasChanges(changed);
    }
  }, [editingLevels, originalLevels, isEditing]);

  // Validation: check if any level has no roles
  const getEmptyLevels = useCallback(() => {
    return editingLevels.filter((level) => level.roles.length === 0);
  }, [editingLevels]);

  const hasValidationErrors = getEmptyLevels().length > 0;

  // Drag handlers
  const handleDragStart = (levelIndex: number, roleId: string) => {
    if (!isEditing) return;
    setDraggedRole({ levelIndex, roleId });
  };

  const handleDragOver = (e: React.DragEvent, levelIndex: number) => {
    if (!isEditing || !draggedRole) return;
    e.preventDefault();
    setDragOverLevel(levelIndex);
  };

  const handleDragLeave = () => {
    setDragOverLevel(null);
  };

  const handleDrop = (targetLevelIndex: number) => {
    if (!isEditing || !draggedRole) return;
    
    const { levelIndex: sourceLevelIndex, roleId } = draggedRole;
    
    // If dropping on the same level, do nothing
    if (sourceLevelIndex === targetLevelIndex) {
      setDraggedRole(null);
      setDragOverLevel(null);
      return;
    }

    const updatedLevels = [...editingLevels];
    
    // Find the role being moved
    const roleToMove = updatedLevels[sourceLevelIndex].roles.find((r) => r.id === roleId);
    if (!roleToMove) return;

    // Check if target level already has this role
    const targetHasRole = updatedLevels[targetLevelIndex].roles.some((r) => r.id === roleId);
    if (targetHasRole) {
      setDraggedRole(null);
      setDragOverLevel(null);
      return;
    }

    // Remove from source level
    updatedLevels[sourceLevelIndex].roles = updatedLevels[sourceLevelIndex].roles.filter(
      (r) => r.id !== roleId
    );

    // Add to target level
    updatedLevels[targetLevelIndex].roles.push(roleToMove);

    setEditingLevels(updatedLevels);
    setDraggedRole(null);
    setDragOverLevel(null);
  };

  const handleDragEnd = () => {
    setDraggedRole(null);
    setDragOverLevel(null);
  };

  // Actions
  const handleStartEdit = () => {
    setIsEditing(true);
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setEditingLevels([]);
    setOriginalLevels([]);
    setHasChanges(false);
  };

  const handleReset = () => {
    setEditingLevels(JSON.parse(JSON.stringify(originalLevels)));
  };

  const handleConfirm = () => {
    if (hasValidationErrors) return;
    onSave(editingLevels);
    setIsEditing(false);
    setHasChanges(false);
  };

  const displayLevels = isEditing ? editingLevels : approvalLevels;

  if (displayLevels.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
          <AlertTriangle className="w-8 h-8 text-gray-400" />
        </div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">ไม่มีลำดับการอนุมัติ</h3>
        <p className="text-sm text-gray-500 max-w-sm">
          กรุณาเพิ่มลำดับการอนุมัติในหน้าแก้ไของค์กร
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with Edit/Action buttons */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">ลำดับการอนุมัติ</h3>
          <p className="text-sm text-gray-500">
            {isEditing 
              ? "ลากบทบาทเพื่อย้ายไปยังลำดับอื่น" 
              : "กดแก้ไขเพื่อจัดเรียงลำดับการอนุมัติ"}
          </p>
        </div>
        
        <div className="flex items-center gap-2">
          {!isEditing ? (
            <button
              onClick={handleStartEdit}
              className="flex items-center gap-2 rounded-lg bg-blue-50 px-4 py-2 text-sm font-medium text-blue-600 hover:bg-blue-100 transition-colors"
            >
              <Pencil className="h-4 w-4" />
              แก้ไข
            </button>
          ) : (
            <>
              <button
                onClick={handleReset}
                disabled={!hasChanges}
                className="flex items-center gap-2 rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <RotateCcw className="h-4 w-4" />
                รีเซ็ต
              </button>
              <button
                onClick={handleCancelEdit}
                className="flex items-center gap-2 rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
              >
                <X className="h-4 w-4" />
                ยกเลิก
              </button>
              <button
                onClick={handleConfirm}
                disabled={!hasChanges || hasValidationErrors}
                className="flex items-center gap-2 rounded-lg bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <Check className="h-4 w-4" />
                ยืนยัน
              </button>
            </>
          )}
        </div>
      </div>

      {/* Validation Warning */}
      {isEditing && hasValidationErrors && (
        <div className="flex items-start gap-3 p-4 bg-amber-50 border border-amber-200 rounded-lg">
          <AlertTriangle className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-medium text-amber-800">ไม่สามารถบันทึกได้</p>
            <p className="text-sm text-amber-700 mt-1">
              ลำดับที่ {getEmptyLevels().map((l) => l.level).join(", ")} ไม่มีบทบาท กรุณาเพิ่มอย่างน้อย 1 บทบาทในแต่ละลำดับ
            </p>
          </div>
        </div>
      )}

      {/* Change indicator */}
      {isEditing && hasChanges && !hasValidationErrors && (
        <div className="flex items-center gap-2 text-sm text-blue-600 bg-blue-50 px-4 py-2 rounded-lg">
          <div className="w-2 h-2 bg-blue-600 rounded-full animate-pulse" />
          มีการเปลี่ยนแปลง - กดยืนยันเพื่อบันทึก
        </div>
      )}

      {/* Approval Levels Grid */}
      <div className="grid gap-4">
        {displayLevels.map((level, levelIndex) => {
          const isEmpty = level.roles.length === 0;
          const isDragOver = dragOverLevel === levelIndex;
          
          return (
            <div
              key={level.level}
              onDragOver={(e) => handleDragOver(e, levelIndex)}
              onDragLeave={handleDragLeave}
              onDrop={() => handleDrop(levelIndex)}
              className={`
                relative border rounded-xl p-4 transition-all duration-200
                ${isEditing && isDragOver 
                  ? "border-blue-400 bg-blue-50 shadow-md" 
                  : isEmpty && isEditing
                    ? "border-amber-300 bg-amber-50"
                    : "border-gray-200 bg-white"
                }
              `}
            >
              {/* Level Header */}
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className={`
                    w-10 h-10 rounded-full flex items-center justify-center font-bold text-lg
                    ${isEmpty && isEditing 
                      ? "bg-amber-100 text-amber-700" 
                      : "bg-blue-100 text-blue-700"
                    }
                  `}>
                    {level.level}
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900">ลำดับที่ {level.level}</h4>
                    <p className="text-xs text-gray-500">
                      {level.roles.length} บทบาท
                    </p>
                  </div>
                </div>
                
                {isEmpty && isEditing && (
                  <span className="flex items-center gap-1 text-xs text-amber-600 bg-amber-100 px-2 py-1 rounded-full">
                    <AlertTriangle className="h-3 w-3" />
                    ต้องมีอย่างน้อย 1 บทบาท
                  </span>
                )}
              </div>

              {/* Roles */}
              <div className="flex flex-wrap gap-2 min-h-[44px]">
                {level.roles.length === 0 ? (
                  <div className={`
                    w-full flex items-center justify-center py-3 border-2 border-dashed rounded-lg
                    ${isEditing ? "border-amber-300 text-amber-500" : "border-gray-200 text-gray-400"}
                  `}>
                    {isEditing ? "ลากบทบาทมาวางที่นี่" : "ไม่มีบทบาท"}
                  </div>
                ) : (
                  level.roles.map((role) => (
                    <div
                      key={role.id}
                      draggable={isEditing}
                      onDragStart={() => handleDragStart(levelIndex, role.id)}
                      onDragEnd={handleDragEnd}
                      className={`
                        inline-flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all
                        ${isEditing 
                          ? "bg-blue-100 text-blue-700 cursor-grab active:cursor-grabbing hover:bg-blue-200 hover:shadow-md" 
                          : "bg-gray-100 text-gray-700"
                        }
                        ${draggedRole?.roleId === role.id && draggedRole?.levelIndex === levelIndex 
                          ? "opacity-50 scale-95" 
                          : ""
                        }
                      `}
                    >
                      {isEditing && (
                        <GripVertical className="h-4 w-4 text-blue-400" />
                      )}
                      {role.name}
                    </div>
                  ))
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Legend */}
      {isEditing && (
        <div className="flex items-center gap-6 pt-4 border-t border-gray-200 text-xs text-gray-500">
          <div className="flex items-center gap-2">
            <GripVertical className="h-4 w-4 text-gray-400" />
            <span>ลากเพื่อย้ายบทบาท</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-blue-100 rounded" />
            <span>บทบาทที่สามารถลากได้</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-amber-100 rounded" />
            <span>ลำดับที่ไม่มีบทบาท</span>
          </div>
        </div>
      )}
    </div>
  );
}
