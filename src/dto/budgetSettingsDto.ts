// Annual Budget Types
export type AnnualBudget = {
  id: string
  year: string
  maxBudget: number
  usedBudget: number
  remainingBudget: number
  createdAt: string
  updatedAt: string
}

export type CreateAnnualBudgetRequest = {
  year: string
  maxBudget: number
}

export type UpdateAnnualBudgetRequest = {
  id: string
  maxBudget: number
}

export type GetAnnualBudgetsResponse = AnnualBudget[]

export type GetAnnualBudgetByYearResponse = AnnualBudget | null
