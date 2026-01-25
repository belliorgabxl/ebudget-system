"use client"

import { useEffect, useState } from "react"
import BackGroundLight from "@/components/background/bg-light"
import { Plus, Edit2, Trash2, DollarSign } from "lucide-react"
import { formatCompactNumber } from "@/lib/util"
import { AnnualBudgetModal } from "@/components/budget-settings/AnnualBudgetModal"

export type AnnualBudget = {
  id: string
  year: string
  maxBudget: number
  usedBudget: number
  remainingBudget: number
  createdAt: string
  updatedAt: string
}

export default function BudgetSettingsPage() {
  const [budgets, setBudgets] = useState<AnnualBudget[]>([])
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingBudget, setEditingBudget] = useState<AnnualBudget | null>(null)
  const [loading, setLoading] = useState(true)

  // Load mock data
  useEffect(() => {
    // TODO: Replace with real API call
    loadMockData()
  }, [])

  const loadMockData = () => {
    setLoading(true)
    // Simulate API call
    setTimeout(() => {
      setBudgets(MOCK_ANNUAL_BUDGETS)
      setLoading(false)
    }, 500)
  }

  const handleAdd = () => {
    setEditingBudget(null)
    setIsModalOpen(true)
  }

  const handleEdit = (budget: AnnualBudget) => {
    setEditingBudget(budget)
    setIsModalOpen(true)
  }

  const handleDelete = (id: string) => {
    if (confirm("คุณต้องการลบงบประมาณประจำปีนี้ใช่หรือไม่?")) {
      setBudgets(budgets.filter((b) => b.id !== id))
    }
  }

  const handleSave = (data: { year: string; maxBudget: number }) => {
    if (editingBudget) {
      // Update existing
      setBudgets(
        budgets.map((b) =>
          b.id === editingBudget.id
            ? {
                ...b,
                year: data.year,
                maxBudget: data.maxBudget,
                remainingBudget: data.maxBudget - b.usedBudget,
                updatedAt: new Date().toISOString(),
              }
            : b
        )
      )
    } else {
      // Add new
      const newBudget: AnnualBudget = {
        id: Date.now().toString(),
        year: data.year,
        maxBudget: data.maxBudget,
        usedBudget: 0,
        remainingBudget: data.maxBudget,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }
      setBudgets([...budgets, newBudget])
    }
    setIsModalOpen(false)
  }

  return (
    <>
      <BackGroundLight>
      <div className="relative min-h-screen">
        <div className="mx-auto max-w-7xl p-6">
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
            <StatsCard
              label="ปีที่ตั้งงบแล้ว"
              value={budgets.length}
              icon={<DollarSign className="h-6 w-6" />}
              color="blue"
            />
            <StatsCard
              label="งบรวมทั้งหมด"
              value={`฿${formatCompactNumber(
                budgets.reduce((sum, b) => sum + b.maxBudget, 0)
              )}`}
              icon={<DollarSign className="h-6 w-6" />}
              color="green"
            />
            <StatsCard
              label="งบที่ใช้ไปแล้ว"
              value={`฿${formatCompactNumber(
                budgets.reduce((sum, b) => sum + b.usedBudget, 0)
              )}`}
              icon={<DollarSign className="h-6 w-6" />}
              color="orange"
            />
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
                      .sort((a, b) => parseInt(b.year) - parseInt(a.year))
                      .map((budget) => (
                        <tr
                          key={budget.id}
                          className="hover:bg-gray-50 transition-colors"
                        >
                          <td className="px-6 py-4">
                            <div className="flex items-center">
                              <span className="text-lg font-semibold text-gray-900">
                                {budget.year}
                              </span>
                            </div>
                          </td>
                          <td className="px-6 py-4 text-right">
                            <span className="text-sm font-medium text-gray-900">
                              ฿{formatCompactNumber(budget.maxBudget)}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-right">
                            <span className="text-sm text-gray-600">
                              ฿{formatCompactNumber(budget.usedBudget)}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-right">
                            <span className="text-sm font-medium text-green-600">
                              ฿{formatCompactNumber(budget.remainingBudget)}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex justify-center">
                              <UsageBar
                                used={budget.usedBudget}
                                max={budget.maxBudget}
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
            ? { year: editingBudget.year, maxBudget: editingBudget.maxBudget }
            : undefined
        }
        existingYears={budgets.map((b) => b.year)}
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

// Usage Bar Component
function UsageBar({ used, max }: { used: number; max: number }) {
  const percentage = Math.min((used / max) * 100, 100)
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
          {percentage.toFixed(0)}%
        </span>
      </div>
    </div>
  )
}

// Mock Data
const MOCK_ANNUAL_BUDGETS: AnnualBudget[] = [
  {
    id: "1",
    year: "2568",
    maxBudget: 20000000, // 20 million
    usedBudget: 15500000,
    remainingBudget: 4500000,
    createdAt: "2025-01-01T00:00:00Z",
    updatedAt: "2025-01-20T00:00:00Z",
  },
  {
    id: "2",
    year: "2567",
    maxBudget: 18000000, // 18 million
    usedBudget: 17200000,
    remainingBudget: 800000,
    createdAt: "2024-01-01T00:00:00Z",
    updatedAt: "2024-12-31T00:00:00Z",
  },
  {
    id: "3",
    year: "2566",
    maxBudget: 15000000, // 15 million
    usedBudget: 15000000,
    remainingBudget: 0,
    createdAt: "2023-01-01T00:00:00Z",
    updatedAt: "2023-12-31T00:00:00Z",
  },
]
