"use client";

import { useState } from "react";
import { GeneralInfoSection } from "../sections/GeneralSection";
import { Project } from "@/types/project";
import { toast } from "react-toastify";
import { GeneralInfoForUpdateData } from "@/dto/projectDto";
import { updateProjectDetail } from "@/api/project.client";
import { EditKey } from "@/constants/project";
import { BudgetSection } from "../sections/BudgetSection";

export function ProjectDetailClient({
  initialProject,
}: {
  initialProject: Project;
}) {
  const [project, setProject] = useState<Project>(initialProject);

  const [editing, setEditing] = useState<EditKey | null>(null);
  const [savingKey, setSavingKey] = useState<EditKey | null>(null);

  const isEditing = (k: EditKey) => editing === k;
  const isSaving = (k: EditKey) => savingKey === k;

  const beginEdit = (k: EditKey) => setEditing(k);
  const cancelEdit = () => setEditing(null);

  const saveGeneralInfo = async (draft: GeneralInfoForUpdateData) => {
    try {
      setSavingKey("general");
      await updateProjectDetail(draft);

      setProject((p) => ({
        ...p,
        generalInfo: draft,
      }));

      toast.success("บันทึกข้อมูลทั่วไปสำเร็จ");
      setEditing(null);
    } catch (e: any) {
      toast.error(e?.message || "บันทึกไม่สำเร็จ");
    } finally {
      setSavingKey(null);
    }
  };

  return (
    <div className="space-y-6">
      <GeneralInfoSection
        project={project.generalInfo}
        canEdit={editing === null || editing === "general"}
        isEditing={isEditing("general")}
        isSaving={isSaving("general")}
        onEdit={() => beginEdit("general")}
        onCancel={cancelEdit}
        onSave={saveGeneralInfo}
      />
      <BudgetSection
        projectId={project.id}
        budget={project.budget}
        canEdit={editing === null || editing === "budget"}
        isEditing={isEditing("budget")}
        isSaving={isSaving("budget")}
        onEdit={() => beginEdit("budget")}
        onCancel={cancelEdit}
        onSave={async (draft, computedTotal) => {
          try {
            setSavingKey("budget");
            setProject((p) => ({
              ...p,
              budget: {
                rows: draft.budget_items.map((it, idx) => ({
                  id: idx + 1,
                  name: it.name,
                  amount: it.amount,
                  remark: it.remark,
                })),
                total: computedTotal,
                sources: {
                  source: draft.budget_source,
                  externalAgency: draft.budget_source_department,
                },
              },
            }));

            toast.success("บันทึกงบประมาณสำเร็จ");
            setEditing(null);
          } catch (e: any) {
            toast.error(e?.message || "บันทึกไม่สำเร็จ");
          } finally {
            setSavingKey(null);
          }
        }}
      />
      {/* <GoalSection
        project={project}
        canEdit={editing === null || editing === "goal"}
        isEditing={isEditing("goal")}
        isSaving={isSaving("goal")}
        onEdit={() => beginEdit("goal")}
        onCancel={cancelEdit}
        onSave={async (draftGoal) => {
          try {
            setSavingKey("goal");

            setProject((p) => ({ ...p, goal: draftGoal }));
            setEditing(null);
          } finally {
            setSavingKey(null);
          }
        }}
      /> */}
    </div>
  );
}
