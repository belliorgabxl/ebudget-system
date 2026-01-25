import { AnnualBudget } from "@/dto/budgetSettingsDto"

export const MOCK_ANNUAL_BUDGETS: AnnualBudget[] = [
  {
    id: "1",
    year: "2568",
    maxBudget: 20000000, // 20 million
    usedBudget: 15500000, // 15.5 million
    remainingBudget: 4500000, // 4.5 million
    createdAt: "2025-01-01T00:00:00Z",
    updatedAt: "2025-01-20T00:00:00Z",
  },
  {
    id: "2",
    year: "2567",
    maxBudget: 18000000, // 18 million
    usedBudget: 17200000, // 17.2 million
    remainingBudget: 800000, // 0.8 million
    createdAt: "2024-01-01T00:00:00Z",
    updatedAt: "2024-12-31T00:00:00Z",
  },
  {
    id: "3",
    year: "2566",
    maxBudget: 15000000, // 15 million
    usedBudget: 15000000, // 15 million (fully used)
    remainingBudget: 0,
    createdAt: "2023-01-01T00:00:00Z",
    updatedAt: "2023-12-31T00:00:00Z",
  },
  {
    id: "4",
    year: "2565",
    maxBudget: 12000000, // 12 million
    usedBudget: 11500000, // 11.5 million
    remainingBudget: 500000, // 0.5 million
    createdAt: "2022-01-01T00:00:00Z",
    updatedAt: "2022-12-31T00:00:00Z",
  },
]

// Helper function to get current year budget
export function getCurrentYearBudget(): AnnualBudget | undefined {
  const currentBuddhistYear = new Date().getFullYear() + 543
  return MOCK_ANNUAL_BUDGETS.find(
    (budget) => budget.year === currentBuddhistYear.toString()
  )
}

// Helper function to get budget by year
export function getBudgetByYear(year: string): AnnualBudget | undefined {
  return MOCK_ANNUAL_BUDGETS.find((budget) => budget.year === year)
}

// Helper function to get all budgets total (for "all" year filter)
export function getAllBudgetsTotal(): {
  totalMaxBudget: number
  totalUsedBudget: number
  totalRemainingBudget: number
} {
  return MOCK_ANNUAL_BUDGETS.reduce(
    (acc, budget) => ({
      totalMaxBudget: acc.totalMaxBudget + budget.maxBudget,
      totalUsedBudget: acc.totalUsedBudget + budget.usedBudget,
      totalRemainingBudget: acc.totalRemainingBudget + budget.remainingBudget,
    }),
    { totalMaxBudget: 0, totalUsedBudget: 0, totalRemainingBudget: 0 }
  )
}
