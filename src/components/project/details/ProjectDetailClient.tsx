"use client";

import { useState } from "react";
import { GeneralInfoSection } from "../sections/GeneralSection";
import { Project } from "@/types/project";

type EditKey =
  | "basic"
  | "goal"
  | "duration"
  | "strategy"
  | "kpi"
  | "estimate"
  | "expect"
  | "budget"
  | "activities"
  | "approve";

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

  const saveBasic = async (draft: Project["generalInfo"]) => {
    try {
      setSavingKey("basic");
      setProject((p) => ({ ...p, generalInfo: draft }));
      setEditing(null);
    } finally {
      setSavingKey(null);
    }
  };

  return (
    <div className="space-y-6">
      <GeneralInfoSection
        project={project.generalInfo}
        canEdit={editing === null || editing === "basic"}
        isEditing={isEditing("basic")}
        isSaving={isSaving("basic")}
        onEdit={() => beginEdit("basic")}
        onCancel={cancelEdit}
        onSave={saveBasic}
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
