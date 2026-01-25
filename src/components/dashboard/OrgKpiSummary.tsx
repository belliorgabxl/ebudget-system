import { DollarSign, Folder, TrendingUp, AlertTriangle, User2Icon, UserRound, UserCogIcon, Users, CheckCircle2 } from "lucide-react"
import { DepartmentEditForm } from "../department/EditForm"
import { formatCompactNumber } from "@/lib/util"
import { getBudgetByYear, getAllBudgetsTotal } from "@/resource/mock-budget-settings"

interface OrgKpiSummaryProps {
  totalBudget: number
  totalProjects: number
  avgBudget: number
  totalEmployees: number
  totalDepartments: number
  selectedYear?: string
}


export function OrgKpiSummary({
  totalBudget,
  totalProjects,
  avgBudget,
  totalEmployees,
  totalDepartments,
  selectedYear,
}: OrgKpiSummaryProps) {
  // Get budget data based on selected year
  let maxBudget = 0
  let usedBudget = totalBudget
  let displayYear = ""

  if (selectedYear === "all") {
    const allBudgets = getAllBudgetsTotal()
    maxBudget = allBudgets.totalMaxBudget
    usedBudget = allBudgets.totalUsedBudget
    displayYear = "ทั้งหมด"
  } else if (selectedYear) {
    const yearBudget = getBudgetByYear(selectedYear)
    if (yearBudget) {
      maxBudget = yearBudget.maxBudget
      usedBudget = yearBudget.usedBudget
      displayYear = selectedYear
    }
  }

  const budgetUsagePercentage = maxBudget > 0 ? (usedBudget / maxBudget) * 100 : 0
  const remainingBudget = maxBudget - usedBudget

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-5 gap-6">
      <KpiCard
        icon={<DollarSign className="h-5 w-5" />}
        label="งบประมาณที่ใช้ / งบประมาณทั้งหมด"
        value={
          <div className="flex flex-col">
            <span className="text-2xl">฿{formatCompactNumber(usedBudget)} / <span className="text-md text-muted-foreground text-gray-600">฿{formatCompactNumber(maxBudget)}</span></span>
              </div>
        }
        color="blue"
        subtitle={displayYear ? `ปี ${displayYear}` : undefined}
      />

      <KpiCard
        icon={<Folder className="h-5 w-5" />}
        label="จำนวนโครงการทั้งหมด"
        value={totalProjects}
        color="violet"
      />

      <KpiCard
        icon={<TrendingUp className="h-5 w-5" />}
        label="งบเฉลี่ย / โครงการ"
        value={`฿${formatCompactNumber(avgBudget ?? 0)}`}
        color="emerald"
      />

      <KpiCard
        icon={<User2Icon className="h-5 w-5" />}
        label="จำนวนพนักงานในองค์กร"
        value={totalEmployees}
        color="emerald"
      />

      <KpiCard
        icon={<Users className="h-5 w-5" />}
        label="จำนวนหน่วยงานในองค์กร"
        value={totalDepartments}
        color="yellow"
      />
    </div>
  )
}


function KpiCard({
  icon,
  label,
  value,
  color,
  subtitle,
}: {
  icon: React.ReactNode
  label: string
  value: React.ReactNode
  color: "blue" | "emerald" | "violet" | "red" | "yellow"
  subtitle?: string
}) {
  const colorMap = {
    blue: "bg-blue-100 text-blue-600",
    emerald: "bg-emerald-100 text-emerald-600",
    violet: "bg-violet-100 text-violet-600",
    red: "bg-red-100 text-red-600",
    yellow: "bg-yellow-100 text-yellow-600",
  }

  return (
    <div className="rounded-xl bg-white shadow-sm p-6">
      <div className="flex items-center gap-3">
        <div className={`rounded-lg p-2 ${colorMap[color]}`}>
          {icon}
        </div>
        <span className="text-sm text-muted-foreground">
          {label}
        </span>
      </div>

      <div className="mt-4 text-3xl font-bold text-foreground">
        {value}
      </div>

      {subtitle && (
        <div className="mt-1 text-sm text-gray-500">
          {subtitle}
        </div>
      )}
    </div>
  )
}
