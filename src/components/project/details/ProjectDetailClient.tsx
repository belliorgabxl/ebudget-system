"use client";

import { useState } from "react";
import { GeneralInfoSection } from "../sections/GeneralSection";
import { Project } from "@/types/project";
import { toast } from "react-toastify";
import { GeneralInfoForUpdateData, ProjectKPI } from "@/dto/projectDto";
import {
  getKpiMasters,
  updateBudgetPlanByProject,
  updateProjectDetail,
  updateProjectKpis,
  updateProjectObjectivesOutcomes,
} from "@/api/project.client";
import { EditKey } from "@/constants/project";
import { BudgetSection } from "../sections/BudgetSection";
import { toBudgetSourceType, toNumber } from "@/lib/helper";
import { BudgetSectionDraft } from "@/dto/sectionupdate";
import { KpiSection } from "../sections/KpiSection";
import { ObjectiveOutcomeSection } from "../sections/ObjectiveOutcomeSection";

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

  const saveBudget = async (
    draft: BudgetSectionDraft,
    computedTotal: number
  ) => {
    try {
      setSavingKey("budget");

      const payload = {
        project_id: project.id,
        budget_amount: computedTotal,
        budget_source: toBudgetSourceType(draft.budget_source),
        budget_source_department:
          draft.budget_source === "external"
            ? draft.budget_source_department ?? ""
            : "",
        budget_items: (draft.budget_items ?? []).map((it, idx) => ({
          id: idx + 1,
          name: it.name ?? "",
          amount: toNumber(it.amount),
          remark: it.remark ?? "",
        })),
      };

      await updateBudgetPlanByProject(payload);

      setProject((p) => ({
        ...p,
        budget: {
          rows: payload.budget_items.map((x, idx) => ({
            id: idx + 1,
            name: x.name,
            amount: String(x.amount),
            remark: x.remark,
          })),
          total: payload.budget_amount,
          sources: {
            source: payload.budget_source,
            externalAgency: payload.budget_source_department,
          },
        },
      }));

      toast.success("บันทึกงบประมาณสำเร็จ");
      setEditing(null);
    } catch (e: any) {
      toast.error(e?.message || "บันทึกงบประมาณไม่สำเร็จ");
    } finally {
      setSavingKey(null);
    }
  };

  return (
    <div className="space-y-6 mb-20">
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
        onSave={saveBudget}
      />
      <KpiSection
        projectId={project.id}
        selectedKpis={project.kpi ?? []}
        canEdit={editing === null || editing === "kpi"}
        isEditing={isEditing("kpi")}
        isSaving={isSaving("kpi")}
        onEdit={() => beginEdit("kpi")}
        onCancel={cancelEdit}
        // loadKpis={}
        onSave={async (draft) => {
          try {
            setSavingKey("kpi");

            await updateProjectKpis({
              project_id: project.id,
              kpi_ids: draft.kpi_ids,
            });

            const masters = await getKpiMasters();

            const newSelected: ProjectKPI[] = draft.kpi_ids
              .map((id) => {
                const m = masters.find((x) => x.id === id);
                if (!m) return null;
                return {
                  id: m.id,
                  indicator: m.name,
                  target_value: "",
                  description: "",
                } as ProjectKPI;
              })
              .filter(Boolean) as ProjectKPI[];

            setProject((p) => ({
              ...p,
              kpi: newSelected,
            }));

            toast.success("บันทึก KPI สำเร็จ");
            setEditing(null);
          } catch (e: any) {
            toast.error(e?.message || "บันทึก KPI ไม่สำเร็จ");
          } finally {
            setSavingKey(null);
          }
        }}
      />
      <ObjectiveOutcomeSection
        projectId={project.id}
        initialObjectives={
          project.project_objectives_and_outcomes
            ?.filter((x) => x.type === "objective")
            .map((x) => ({ id: x.id, description: x.description })) ?? []
        }
        initialExpectations={
          project.project_objectives_and_outcomes
            ?.filter((x) => x.type === "expectation")
            .map((x) => ({ id: x.id, description: x.description })) ?? []
        }
        canEdit={editing === null || editing === "expect"}
        isEditing={isEditing("expect")}
        isSaving={isSaving("expect")}
        onEdit={() => beginEdit("expect")}
        onCancel={cancelEdit}
        onSave={async (draft) => {
          try {
            setSavingKey("expect");

            const objectives = (draft.objectives ?? [])
              .map((o) => ({ ...o, description: (o.description ?? "").trim() }))
              .filter((o) => o.description);

            const expectations = (draft.expectations ?? [])
              .map((o) => ({ ...o, description: (o.description ?? "").trim() }))
              .filter((o) => o.description);

            await updateProjectObjectivesOutcomes({
              project_id: project.id,
              objectives: [
                ...objectives.map((o) => ({
                  id: o.id ?? 0,
                  description: o.description,
                  type: "objective" as const,
                })),
                ...expectations.map((o) => ({
                  id: o.id ?? 0,
                  description: o.description,
                  type: "expectation" as const,
                })),
              ],
            });

            setProject((p) => ({
              ...p,
              project_objectives_and_outcomes: [
                ...objectives.map((o, idx) => ({
                  id: o.id ?? -(idx + 1),
                  project_id: project.id,
                  type: "objective" as const,
                  description: o.description,
                })),
                ...expectations.map((o, idx) => ({
                  id: o.id ?? -(1000 + idx + 1),
                  project_id: project.id,
                  type: "expectation" as const,
                  description: o.description,
                })),
              ],
            }));

            toast.success("บันทึกวัตถุประสงค์และผลที่คาดว่าจะได้รับสำเร็จ");
            setEditing(null);
          } catch (e: any) {
            toast.error(e?.message || "บันทึกไม่สำเร็จ");
          } finally {
            setSavingKey(null);
          }
        }}
      />
    </div>
  );
}
