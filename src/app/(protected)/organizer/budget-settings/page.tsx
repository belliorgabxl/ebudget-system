"use client"

import { useEffect, useState } from "react"
import BackGroundLight from "@/components/background/bg-light"
import { Plus, Edit2, Trash2, DollarSign } from "lucide-react"
import { convertBEtoCE, convertCEtoBE, formatCompactNumber } from "@/lib/util"
import { AnnualBudgetModal } from "@/components/budget-settings/AnnualBudgetModal"
import type { AnnualBudget, GetAnnualBudgetSummaryResponse } from "@/dto/annualBudgetDto"
import {
  GetAnnualBudgetsFromApi,
  CreateAnnualBudgetFromApi,
  UpdateAnnualBudgetFromApi,
  DeleteAnnualBudgetFromApi,
  GetAnnualBudgetSummaryFromApi,
} from "@/api/annual-budget.client"

export default function BudgetSettingsPage() {
  
  const [budgets, setBudgets] = useState<AnnualBudget[]>([])
  const [budgetSummary, setBudgetSummary] = useState<GetAnnualBudgetSummaryResponse | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingBudget, setEditingBudget] = useState<AnnualBudget | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Load data from API
  useEffect(() => {
    loadBudgets()
    loadsummary()
  }, [])

  const loadBudgets = async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await GetAnnualBudgetsFromApi()
      setBudgets(data || [])
      console.log("Loaded budgets:", data)
    } catch (err) {
      console.error("Failed to load budgets:", err)
      setError("ไม่สามารถโหลดข้อมูลงบประมาณได้")
    } finally {
      setLoading(false)
    }
  }
  const loadsummary = async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await GetAnnualBudgetSummaryFromApi()
      setBudgetSummary(data)
      console.log("Loaded budget summary:", data)
    } catch (err) {
      console.error("Failed to load budget summary:", err)
      setError("ไม่สามารถโหลดข้อมูลสรุปงบประมาณได้")
    } finally {
      setLoading(false)
    }
  }

  const handleAdd = () => {
    setEditingBudget(null)
    setIsModalOpen(true)
  }

  const handleEdit = (budget: AnnualBudget) => {
    setEditingBudget(budget)
    setIsModalOpen(true)
  }

  const handleDelete = async (id: number) => {
    if (confirm("คุณต้องการลบงบประมาณประจำปีนี้ใช่หรือไม่?")) {
      try {
        const success = await DeleteAnnualBudgetFromApi(id)
        if (success) {
          setBudgets(budgets.filter((b) => b.id !== id))
          await loadBudgets()
          await loadsummary()
        } else {
          setError("ไม่สามารถลบงบประมาณได้")
        }
      } catch (err) {
        console.error("Failed to delete budget:", err)
        setError("ไม่สามารถลบงบประมาณได้")
      }
    }
  }

  const handleSave = async (data: { amount: number; fiscal_year: number }) => {
    setError(null)
    try {
      
      if (editingBudget) {
        // Update existing
        const success = await UpdateAnnualBudgetFromApi({
          id: editingBudget.id,
          amount: data.amount,
          fiscal_year: convertBEtoCE(data.fiscal_year),
        })
        if (success) {
          setIsModalOpen(false) // ปิด modal ทันที
          // Reload data in the background without awaiting
          loadBudgets()
          loadsummary()
        } else {
          setError("ไม่สามารถอัปเดตงบประมาณได้")
        }
      } else {
        // Add new
        const result = await CreateAnnualBudgetFromApi({
          amount: data.amount,
          fiscal_year: convertBEtoCE(data.fiscal_year),
        })
        if (result.ok) {
          setIsModalOpen(false) // ปิด modal ทันที
          // Reload data in the background without awaiting
          loadBudgets()
          loadsummary()
        } else {
          setError(result.message || "ไม่สามารถสร้างงบประมาณได้")
        }
      }
    } catch (err) {
      console.error("Failed to save budget:", err)
      setError("ไม่สามารถบันทึกงบประมาณได้")
    }
  }

  return (
    <>
      <BackGroundLight>
        <div className="relative min-h-screen">
          <div className="mx-auto max-w-7xl p-6">
            {/* Error Message */}
            {error && (
              <div className="mb-6 rounded-lg bg-red-50 border border-red-200 p-4">
                <p className="text-sm text-red-700">{error}</p>
                <button
                  onClick={() => setError(null)}
                  className="mt-2 text-xs text-red-600 hover:text-red-700"
                >
                  ปิด
                </button>
              </div>
            )}
            
            {/* Header */}
            <div className="mb-8 flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">
                  งบประมาณประจำปี
                </h1>
                <p className="mt-1 text-sm text-gray-500">
                  จัดการงบประมาณสูงสุดในแต่ละปี
                </p>
              </div>
              <button
                onClick={handleAdd}
                className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-white hover:bg-blue-700 transition-colors"
              >
                <Plus className="h-5 w-5" />
                <span>เพิ่มงบประมาณ</span>
              </button>
            </div>

          {/* Stats Cards */}
          <div className="mb-8 grid grid-cols-1 md:grid-cols-3 gap-6">
            {loading ? (
              <>
                <SkeletonCard />
                <SkeletonCard />
                <SkeletonCard />
              </>
            ) : (
              <>
                <StatsCard
                  label="ปีที่ตั้งงบแล้ว"
                  value={budgetSummary?.summary.fiscal_year ?? "-"}
                  icon={<DollarSign className="h-6 w-6" />}
                  color="blue"
                />
                <StatsCard
                  label="งบรวมทั้งหมด"
                  value={`฿${budgetSummary?.summary.total_budget ?? "-"}`}
                  icon={<DollarSign className="h-6 w-6" />}
                  color="green"
                />
                <StatsCard
                  label="งบที่ใช้ไปแล้ว"
                  value={`฿${budgetSummary?.summary.used_budget ?? "-"}`}
                  icon={<DollarSign className="h-6 w-6" />}
                  color="orange"
                />
              </>
            )}
          </div>

          {/* Budget Table */}
          <div className="rounded-xl bg-white shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">
                      ปีงบประมาณ
                    </th>
                    <th className="px-6 py-4 text-right text-sm font-semibold text-gray-900">
                      งบสูงสุด
                    </th>
                    <th className="px-6 py-4 text-right text-sm font-semibold text-gray-900">
                      งบที่ใช้ไป
                    </th>
                    <th className="px-6 py-4 text-right text-sm font-semibold text-gray-900">
                      งบคงเหลือ
                    </th>
                    <th className="px-6 py-4 text-center text-sm font-semibold text-gray-900">
                      สถานะการใช้งาน
                    </th>
                    <th className="px-6 py-4 text-center text-sm font-semibold text-gray-900">
                      การจัดการ
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {loading ? (
                    <tr>
                      <td colSpan={6} className="px-6 py-12 text-center">
                        <div className="flex items-center justify-center">
                          <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent"></div>
                        </div>
                      </td>
                    </tr>
                  ) : budgets.length === 0 ? (
                    <tr>
                      <td
                        colSpan={6}
                        className="px-6 py-12 text-center text-gray-500"
                      >
                        ยังไม่มีข้อมูลงบประมาณ กรุณาเพิ่มงบประมาณ
                      </td>
                    </tr>
                  ) : (
                    budgets
                      .sort((a, b) => b.fiscal_year - a.fiscal_year)
                      .map((budget) => (
                        <tr
                          key={budget.id}
                          className="hover:bg-gray-50 transition-colors"
                        >
                          <td className="px-6 py-4">
                            <div className="flex items-center">
                              <span className="text-lg font-semibold text-gray-900">
                                {convertCEtoBE(budget.fiscal_year)}
                              </span>
                            </div>
                          </td>
                          <td className="px-6 py-4 text-right">
                            <span className="text-sm font-medium text-gray-900">
                              ฿{formatCompactNumber(budget.amount)}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-right">
                            <span className="text-sm text-gray-600">
                              ฿{formatCompactNumber(budget.used_amount)}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-right">
                            <span className={`text-sm font-medium ${
                              budget.remaining_amount < 0 
                                ? "text-red-600" 
                                : "text-green-600"
                            }`}>
                              ฿{formatCompactNumber(budget.remaining_amount)}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex justify-center">
                              <UsageBar
                                used={budget.usage_percentage}
                                max={100}
                              />
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center justify-center gap-2">
                              <button
                                onClick={() => handleEdit(budget)}
                                className="p-2 rounded-lg text-blue-600 hover:bg-blue-50 transition-colors"
                                title="แก้ไข"
                              >
                                <Edit2 className="h-4 w-4" />
                              </button>
                              <button
                                onClick={() => handleDelete(budget.id)}
                                className="p-2 rounded-lg text-red-600 hover:bg-red-50 transition-colors"
                                title="ลบ"
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
      </BackGroundLight>

      {/* Modal */}
      <AnnualBudgetModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSave}
        initialData={
          editingBudget
            ? { 
                amount: editingBudget.amount,
                fiscal_year: convertCEtoBE(editingBudget.fiscal_year),
              }
            : undefined
        }
        existingYears={budgets.map((b) => convertCEtoBE(b.fiscal_year))}
      />
    </>
  )
}

// Stats Card Component
function StatsCard({
  label,
  value,
  icon,
  color,
}: {
  label: string
  value: string | number
  icon: React.ReactNode
  color: "blue" | "green" | "orange"
}) {
  const colorMap = {
    blue: "bg-blue-100 text-blue-600",
    green: "bg-green-100 text-green-600",
    orange: "bg-orange-100 text-orange-600",
  }

  return (
    <div className="rounded-xl bg-white shadow-sm p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-500 mb-1">{label}</p>
          <p className="text-2xl font-bold text-gray-900">{value}</p>
        </div>
        <div className={`rounded-lg p-3 ${colorMap[color]}`}>{icon}</div>
      </div>
    </div>
  )
}

// Skeleton Loading Card
function SkeletonCard() {
  return (
    <div className="rounded-xl bg-white shadow-sm p-6 animate-pulse">
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <div className="h-4 bg-gray-200 rounded w-24 mb-3"></div>
          <div className="h-8 bg-gray-200 rounded w-32"></div>
        </div>
        <div className="rounded-lg p-3 bg-gray-200 w-14 h-14"></div>
      </div>
    </div>
  )
}

// Usage Bar Component
function UsageBar({ used, max }: { used: number; max: number }) {
  const percentage = Math.min(used, max)
  const color =
    percentage >= 90 ? "red" : percentage >= 70 ? "orange" : "green"

  const colorMap = {
    green: "bg-green-500",
    orange: "bg-orange-500",
    red: "bg-red-500",
  }

  return (
    <div className="w-full max-w-[200px]">
      <div className="flex items-center gap-2">
        <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
          <div
            className={`h-full ${colorMap[color]} transition-all`}
            style={{ width: `${percentage}%` }}
          />
        </div>
        <span className="text-xs font-medium text-gray-600 min-w-[45px] text-right">
          {used.toFixed(1)}%
        </span>
      </div>
    </div>
  )
}

// Mock Data
const MOCK_ANNUAL_BUDGETS: AnnualBudget[] = []
