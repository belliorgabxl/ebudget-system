"use client"

import { useEffect, useMemo, useState } from "react"

// layout / ui
import BackGroundLight from "@/components/background/bg-light"
import { ZoneHeader } from "@/components/dashboard/ZoneHeader"

// kpi
import { OrgKpiSummary } from "@/components/dashboard/OrgKpiSummary"

// charts
import { BudgetByDeptChart } from "@/components/dashboard/BudgetByDeptChart"
import { BudgetByStatusChart } from "@/components/dashboard/BudgetByStatusChart"
import { BudgetByYearChart } from "@/components/dashboard/BudgetByYearChart"
import { ProjectCountByDeptChart } from "@/components/dashboard/ProjectCountByDeptChart"
import { ProjectCountByStatusChart } from "@/components/dashboard/ProjectCountByStatusChart"

// mock data
import {
    MOCK_ALLTIME_BUDGET,
    MOCK_APPROVALS,
    MOCK_BUDGET_BY_DEPT_YEAR,
    MOCK_BUDGET_BY_STATUS_YEAR,
    MOCK_PROJECT_COUNT_BY_DEPT_BY_YEAR,
    MOCK_PROJECT_COUNT_BY_STATUS_BY_YEAR,
    MOCK_YEAR_KPI,
} from "@/app/mock"

import { ApprovalQueue } from "@/components/dashboard/ApprovalQueue"
import { StrategyQaSection } from "@/components/dashboard/StrategyQaSection"

import {
    GetQaIndicatorsByYearAllRespond,
    GetStrategicPlanRespond,
} from "@/dto/qaDto"
import {
    GetApprovalItems,
    GetCalenderEventRespond,
    GetProjectsByOrgRespond,
} from "@/dto/dashboardDto"

import {
    GetCalendarEventsFromApi,
    GetProjectsByOrgFromApi,
    GetStrategicPlansFromApi,
} from "@/api/dashboard"
import { ProjectsTable } from "@/components/dashboard/ProjectsTable"

/* ===============================
 * Types
 * =============================== */
type YearFilter =
    | "all"
    | "2563"
    | "2564"
    | "2565"
    | "2566"
    | "2567"
    | "2568"

/* ===============================
 * Helpers
 * =============================== */
function filterByYear<T extends { year: string }>(
    data: T[],
    year: YearFilter
): T[] {
    if (year === "all") return data
    return data.filter((d) => d.year === year)
}

function aggregate<
    T extends Record<string, any>,
    K extends keyof T,
    V extends keyof T
>(data: T[], key: K, valueKey: V) {
    const map = new Map<string, number>()

    data.forEach((item) => {
        const k = String(item[key])
        const v = Number(item[valueKey]) || 0
        map.set(k, (map.get(k) ?? 0) + v)
    })

    return Array.from(map.entries()).map(([k, v]) => ({
        [key]: k,
        value: v,
    }))
}

/* ===============================
 * Page
 * =============================== */
export default function DashboardDirectorPage() {
    /* ===== state ===== */
    const [year, setYear] = useState<YearFilter>("all")

    const [filters, setFilters] = useState({
        year: "all" as YearFilter,
        department: "all",
        projectType: "all",
        status: "all",
        qaIndicator: "all",
        strategy: "all",
    })

    const [calendar_events_data, set_calendar_events_data] =
        useState<GetCalenderEventRespond[]>([])
    const [approval_items, set_approval_items] =
        useState<GetApprovalItems[]>([])
    const [qa_indicators_data, set_qa_indicators_data] =
        useState<GetQaIndicatorsByYearAllRespond[]>([])
    const [strategic_plans_data, set_strategic_plans_data] =
        useState<GetStrategicPlanRespond[]>([])
    const [projects_data, set_projects_data] =
        useState<GetProjectsByOrgRespond[]>([])

    /* ===== effects ===== */
    useEffect(() => {
        GetCalendarEventsFromApi()
            .then(set_calendar_events_data)
            .catch(console.error)
    }, [])

    useEffect(() => {
        GetStrategicPlansFromApi()
            .then(set_strategic_plans_data)
            .catch(console.error)
    }, [])

    useEffect(() => {
        GetProjectsByOrgFromApi()
            .then(set_projects_data)
            .catch(console.error)
    }, [])

    const handleFilterChange = (key: string, value: string) => {
        setFilters((prev) => ({ ...prev, [key]: value }))
    }

    /* ===== derive data ===== */
    const budgetByDeptData = useMemo(() => {
        const filtered = filterByYear(MOCK_BUDGET_BY_DEPT_YEAR, year)
        const aggregated = aggregate(filtered, "department", "actual")
        return aggregated.map((item) => ({
            department: String(item.department),
            budget: item.value,
            actual: item.value,
        }))
    }, [year])

    const budgetByStatusData = useMemo(() => {
        const filtered = filterByYear(MOCK_BUDGET_BY_STATUS_YEAR, year)
        const aggregated = aggregate(filtered, "status", "budget")
        return aggregated.map((item) => ({
            status: String(item.status),
            budget: item.value,
        }))
    }, [year])

    const projectByDeptData = useMemo(() => {
        const filtered = filterByYear(
            MOCK_PROJECT_COUNT_BY_DEPT_BY_YEAR,
            year
        )
        const aggregated = aggregate(filtered, "department", "count")
        return aggregated.map((item) => ({
            department: String(item.department),
            count: item.value,
        }))
    }, [year])

    const projectByStatusData = useMemo(() => {
        const filtered = filterByYear(
            MOCK_PROJECT_COUNT_BY_STATUS_BY_YEAR,
            year
        )
        const aggregated = aggregate(filtered, "status", "value")
        return aggregated.map((item) => ({
            status: String(item.status),
            value: item.value,
        }))
    }, [year])

    const yearKpi = MOCK_YEAR_KPI[year]

    /* ===== render ===== */
    return (
        <div className="min-h-screen bg-gray-50 text-gray-900">
            <BackGroundLight>
                <header className="sticky top-0 z-20 border-b bg-white">
                    <div className="mx-auto flex h-14 max-w-screen-2xl items-center justify-between px-6 pl-20">
                        <h1 className="text-lg font-semibold">Dashboard (Admin)</h1>
                        <select
                            value={year}
                            onChange={(e) => setYear(e.target.value as YearFilter)}
                            className="rounded-xl border px-3 py-1 text-xs"
                        >
                            <option value="all">ทั้งหมด</option>
                            <option value="2568">2568</option>
                            <option value="2567">2567</option>
                            <option value="2566">2566</option>
                            <option value="2565">2565</option>
                            <option value="2564">2564</option>
                            <option value="2563">2563</option>
                        </select>
                    </div>
                </header>

                <main className="mx-auto max-w-screen-2xl space-y-12 px-6 pl-20 py-8">
                    <ZoneHeader
                        title={
                            year === "all"
                                ? "ภาพรวมองค์กรทั้งหมด"
                                : `ภาพรวมปีงบประมาณ ${year}`
                        }
                        subtitle="ข้อมูลจากระบบงบประมาณ"
                    />

                    <OrgKpiSummary {...yearKpi} />

                    <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                        <BudgetByDeptChart data={budgetByDeptData} />
                        <BudgetByStatusChart data={budgetByStatusData} />
                    </div>

                    <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                        <ProjectCountByDeptChart data={projectByDeptData} />
                        <ProjectCountByStatusChart data={projectByStatusData} />
                    </div>

                    <BudgetByYearChart
                        data={MOCK_ALLTIME_BUDGET.map((i) => ({
                            year: i.year,
                            budget: i.total,
                        }))}
                    />

                    <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">

                        <ApprovalQueue
                            filters={filters}
                            approvals={MOCK_APPROVALS}
                        />

                        <StrategyQaSection
                            strategies={strategic_plans_data}
                            qaIndicators={qa_indicators_data}
                            onFilterChange={handleFilterChange}
                        />
                    </div>

                   
                        <ProjectsTable filters={filters} projects={projects_data} />
                  
                </main>
            </BackGroundLight>
        </div>
    )
}
