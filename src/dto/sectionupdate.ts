import { BudgetSourceType } from "@/constants/project";
import { BudgetItems } from "./projectDto";


export type BudgetSectionDraft = {
  budget_source: BudgetSourceType;
  budget_source_department: string;
  budget_items: BudgetItems[];
  budget_amount : number;
  project_id :string;
};
