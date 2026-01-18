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
import {yearFilterItems} from "@/lib/util"

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
import { GetDashboardKPIFromApi, GetBudgetByYearFromApi, GetBudgetByDepartmentFromApi, GetBudgetByStatusFromApi, GetProjectCountByDepartmentFromApi, GetProjectCountByStatusFromApi } from "@/api/dashboard.client"
import type { DashboardKPI, BudgetByYear, BudgetByDepartment, BudgetByStatus, ProjectCountByDepartment, ProjectCountByStatus } from "@/dto/dashboardDto"
import { ProjectsTable } from "@/components/dashboard/ProjectsTable"

/* ===============================
 * Types
 * =============================== */
type YearFilter = ReturnType<typeof yearFilterItems>[number]["value"]

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
    const [animationKey, setAnimationKey] = useState(0)

    const [filters, setFilters] = useState({
        year: "all" as YearFilter,
        department: "all",
        projectType: "all",
        status: "all",
        qaIndicator: "all",
        strategy: "all",
        priority: "all",
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
    
    // KPI data from API
    const [kpiData, setKpiData] = useState<DashboardKPI | null>(null)
    const [kpiLoading, setKpiLoading] = useState(false)

    // Budget by year data from API
    const [budgetByYearData, setBudgetByYearData] = useState<BudgetByYear[]>([])
    const [budgetByYearLoading, setBudgetByYearLoading] = useState(false)

    // Budget by department data from API
    const [budgetByDeptData, setBudgetByDeptData] = useState<BudgetByDepartment[]>([])
    const [budgetByDeptLoading, setBudgetByDeptLoading] = useState(false)

    // Budget by status data from API
    const [budgetByStatusData, setBudgetByStatusData] = useState<BudgetByStatus[]>([])
    const [budgetByStatusLoading, setBudgetByStatusLoading] = useState(false)

    // Project count by department data from API
    const [projectByDeptData, setProjectByDeptData] = useState<ProjectCountByDepartment[]>([])
    const [projectByDeptLoading, setProjectByDeptLoading] = useState(false)

    // Project count by status data from API
    const [projectByStatusData, setProjectByStatusData] = useState<ProjectCountByStatus[]>([])
    const [projectByStatusLoading, setProjectByStatusLoading] = useState(false)

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
        const fetchCounts = async () => {
            try {
                const data = await GetProjectsByOrgFromApi();
                set_projects_data(data?.data ?? []);
            } catch (err) {
                console.error(err);
            }
        };
        fetchCounts();
    }, []);

    // Fetch KPI data when year changes
    useEffect(() => {
        const fetchKpiData = async () => {
            setKpiLoading(true)
            try {
                // Convert year: "all" -> "0", Buddhist year to Christian year (e.g., "2567" -> "2024")
                const yearParam = year === "all" ? "0" : String(parseInt(year) - 543)
                const data = await GetDashboardKPIFromApi(yearParam)
                setKpiData(data)
            } catch (error) {
                console.error("Failed to fetch KPI data:", error)
                setKpiData(null)
            } finally {
                setKpiLoading(false)
            }
        }

        fetchKpiData()
    }, [year])

    // Fetch Budget by Year data when year changes
    useEffect(() => {
        const fetchBudgetByYearData = async () => {
            setBudgetByYearLoading(true)
            try {
                // Convert year: "all" -> "0", Buddhist year to Christian year
                const yearParam = year === "all" ? "0" : String(parseInt(year) - 543)
                const data = await GetBudgetByYearFromApi(yearParam)
                setBudgetByYearData(data)
            } catch (error) {
                console.error("Failed to fetch budget by year data:", error)
                setBudgetByYearData([])
            } finally {
                setBudgetByYearLoading(false)
            }
        }

        fetchBudgetByYearData()
    }, [year])

    // Fetch Budget by Department data when year changes
    useEffect(() => {
        const fetchBudgetByDeptData = async () => {
            setBudgetByDeptLoading(true)
            try {
                // Convert year: "all" -> "0", Buddhist year to Christian year
                const yearParam = year === "all" ? "0" : String(parseInt(year) - 543)
                const data = await GetBudgetByDepartmentFromApi(yearParam)
                setBudgetByDeptData(data)
            } catch (error) {
                console.error("Failed to fetch budget by department data:", error)
                setBudgetByDeptData([])
            } finally {
                setBudgetByDeptLoading(false)
            }
        }

        fetchBudgetByDeptData()
    }, [year])

    // Fetch Budget by Status data when year changes
    useEffect(() => {
        const fetchBudgetByStatusData = async () => {
            setBudgetByStatusLoading(true)
            try {
                // Convert year: "all" -> "0", Buddhist year to Christian year
                const yearParam = year === "all" ? "0" : String(parseInt(year) - 543)
                const data = await GetBudgetByStatusFromApi(yearParam)
                setBudgetByStatusData(data)
            } catch (error) {
                console.error("Failed to fetch budget by status data:", error)
                setBudgetByStatusData([])
            } finally {
                setBudgetByStatusLoading(false)
            }
        }

        fetchBudgetByStatusData()
    }, [year])

    // Fetch Project Count by Department data when year changes
    useEffect(() => {
        const fetchProjectByDeptData = async () => {
            setProjectByDeptLoading(true)
            try {
                // Convert year: "all" -> "0", Buddhist year to Christian year
                const yearParam = year === "all" ? "0" : String(parseInt(year) - 543)
                const data = await GetProjectCountByDepartmentFromApi(yearParam)
                setProjectByDeptData(data)
            } catch (error) {
                console.error("Failed to fetch project count by department data:", error)
                setProjectByDeptData([])
            } finally {
                setProjectByDeptLoading(false)
            }
        }

        fetchProjectByDeptData()
    }, [year])

    // Fetch Project Count by Status data when year changes
    useEffect(() => {
        const fetchProjectByStatusData = async () => {
            setProjectByStatusLoading(true)
            try {
                // Convert year: "all" -> "0", Buddhist year to Christian year
                const yearParam = year === "all" ? "0" : String(parseInt(year) - 543)
                const data = await GetProjectCountByStatusFromApi(yearParam)
                setProjectByStatusData(data)
            } catch (error) {
                console.error("Failed to fetch project count by status data:", error)
                setProjectByStatusData([])
            } finally {
                setProjectByStatusLoading(false)
            }
        }

        fetchProjectByStatusData()
    }, [year])
    

    const handleFilterChange = (key: string, value: string) => {
        setFilters((prev) => ({ ...prev, [key]: value }))
    }

    /* ===== derive data ===== */
    // Use real KPI data if available, otherwise fallback to mock
    const yearKpi = useMemo(() => {
        if (kpiData) {
            return {
                totalBudget: kpiData.totalBudget,
                totalProjects: kpiData.totalProjects,
                avgBudget: kpiData.avgBudget,
                totalEmployees: kpiData.totalEmployees,
                totalDepartments: kpiData.totalDepartments,
            }
        }
        return MOCK_YEAR_KPI[year]
    }, [kpiData, year])

    /* ===== render ===== */
    return (
        <div className="min-h-screen bg-gray-50 text-gray-900">
            <BackGroundLight>
                <header className="sticky top-0 z-20 border-b bg-white">
                    <div className="mx-auto flex h-14 max-w-screen-2xl items-center justify-between px-6 pl-20">
                        <h1 className="text-lg font-semibold">Dashboard (Director)</h1>
                        <div className=" row-gap-2 flex items-center gap-4 px-10">
                        เลือกช่วงปีที่แสดง :
                        <select
                            value={year}
                            onChange={(e) => {
                                setYear(e.target.value as YearFilter)
                                setAnimationKey((prev) => prev + 1)
                            }}
                            className="rounded-xl border px-3 py-1 text-xs"
                            >
                            {yearFilterItems().map((item) => (
                                <option key={item.value} value={item.value}>
                                {item.label}
                                </option>
                            ))}
                            </select>
                        </div>
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

                    <div key={`kpi-${animationKey}`} className="animate-fade-in">
                        <OrgKpiSummary {...yearKpi} />
                    </div>

                    <div key={`budget-${animationKey}`} className="grid grid-cols-1 xl:grid-cols-2 gap-6 animate-fade-in">
                        <BudgetByDeptChart data={budgetByDeptData} />
                        
                        <BudgetByStatusChart data={budgetByStatusData} />
                    </div>

                    <div key={`project-${animationKey}`} className="grid grid-cols-1 xl:grid-cols-2 gap-6 animate-fade-in">
                        <ProjectCountByDeptChart data={projectByDeptData} />
                        
                        <ProjectCountByStatusChart data={projectByStatusData} />
                    </div>

                    <div key={`year-${animationKey}`} className="animate-fade-in">
                        <BudgetByYearChart data={budgetByYearData} />
                    </div>

                    <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">

                        <ApprovalQueue
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


// "use client"

// import { useEffect, useMemo, useState } from "react"

// // layout / ui
// import BackGroundLight from "@/components/background/bg-light"
// import { ZoneHeader } from "@/components/dashboard/ZoneHeader"

// // kpi
// import { OrgKpiSummary } from "@/components/dashboard/OrgKpiSummary"

// // charts
// import { BudgetByDeptChart } from "@/components/dashboard/BudgetByDeptChart"
// import { BudgetByStatusChart } from "@/components/dashboard/BudgetByStatusChart"
// import { BudgetByYearChart } from "@/components/dashboard/BudgetByYearChart"
// import { ProjectCountByDeptChart } from "@/components/dashboard/ProjectCountByDeptChart"
// import { ProjectCountByStatusChart } from "@/components/dashboard/ProjectCountByStatusChart"

// import { ApprovalQueue } from "@/components/dashboard/ApprovalQueue"
// import { StrategyQaSection } from "@/components/dashboard/StrategyQaSection"

// import {
//     GetQaIndicatorsByYearAllRespond,
//     GetStrategicPlanRespond,
// } from "@/dto/qaDto"
// import {
//     GetApprovalItems,
//     GetCalenderEventRespond,
//     GetProjectsByOrgRespond,
// } from "@/dto/dashboardDto"

// import {
//     GetCalendarEventsFromApi,
//     GetProjectsByOrgFromApi,
//     GetStrategicPlansFromApi,
// } from "@/api/dashboard"
// import {
//     GetDashboardKPIFromApi,
//     GetBudgetByYearFromApi,
//     GetBudgetByDepartmentFromApi,
//     GetBudgetByStatusFromApi,
//     GetProjectCountByDepartmentFromApi,
//     GetProjectCountByStatusFromApi,
//     GetApprovalQueueFromApi,
// } from "@/api/dashboard.client"
// import { ProjectsTable } from "@/components/dashboard/ProjectsTable"
// import type {
//     DashboardKPI,
//     BudgetByYear,
//     BudgetByDepartment,
//     BudgetByStatus,
//     ProjectCountByDepartment,
//     ProjectCountByStatus,
//     ApprovalQueueItem,
// } from "@/dto/dashboardDto"

// /* ===============================
//  * Types
//  * =============================== */
// type YearFilter =
//     | "all"
//     | "2563"
//     | "2564"
//     | "2565"
//     | "2566"
//     | "2567"
//     | "2568"

// /* ===============================
//  * Page
//  * =============================== */
// export default function DashboardDirectorPage() {
//     /* ===== state ===== */
//     const [year, setYear] = useState<YearFilter>("all")

//     const [filters, setFilters] = useState({
//         year: "all" as YearFilter,
//         department: "all",
//         projectType: "all",
//         status: "all",
//         qaIndicator: "all",
//         strategy: "all",
//     })

//     const [calendar_events_data, set_calendar_events_data] =
//         useState<GetCalenderEventRespond[]>([])
//     const [approval_items, set_approval_items] =
//         useState<GetApprovalItems[]>([])
//     const [qa_indicators_data, set_qa_indicators_data] =
//         useState<GetQaIndicatorsByYearAllRespond[]>([])
//     const [strategic_plans_data, set_strategic_plans_data] =
//         useState<GetStrategicPlanRespond[]>([])
//     const [projects_data, set_projects_data] =
//         useState<GetProjectsByOrgRespond[]>([])

//     // Real API data states
//     const [kpiData, setKpiData] = useState<DashboardKPI | null>(null)
//     const [budgetByYearData, setBudgetByYearData] = useState<BudgetByYear[]>([])
//     const [budgetByDepartmentData, setBudgetByDepartmentData] = useState<BudgetByDepartment[]>([])
//     const [budgetByStatusData, setBudgetByStatusData] = useState<BudgetByStatus[]>([])
//     const [projectCountByDepartmentData, setProjectCountByDepartmentData] = useState<ProjectCountByDepartment[]>([])
//     const [projectCountByStatusData, setProjectCountByStatusData] = useState<ProjectCountByStatus[]>([])
//     const [approvalQueueData, setApprovalQueueData] = useState<ApprovalQueueItem[]>([])
//     const [loading, setLoading] = useState(true)

//     /* ===== effects ===== */
//     useEffect(() => {
//         GetCalendarEventsFromApi()
//             .then(set_calendar_events_data)
//             .catch(console.error)
//     }, [])

//     useEffect(() => {
//         GetStrategicPlansFromApi()
//             .then(set_strategic_plans_data)
//             .catch(console.error)
//     }, [])

//     useEffect(() => {
//         const fetchCounts = async () => {
//             try {
//                 const data = await GetProjectsByOrgFromApi();
//                 set_projects_data(data?.data ?? []);
//             } catch (err) {
//                 console.error(err);
//             }
//         };
//         fetchCounts();
//     }, []);

//     // Fetch dashboard data when year changes
//     useEffect(() => {
//         const fetchDashboardData = async () => {
//             setLoading(true)
//             try {
//                 const yearParam = year === "all" ? "0" : year

//                 // Fetch all data in parallel
//                 const [kpi, budgetYear, budgetDept, budgetStatus, projectDept, projectStatus, approvals] = await Promise.all([
//                     year !== "all" ? GetDashboardKPIFromApi(yearParam) : Promise.resolve(null),
//                     GetBudgetByYearFromApi(yearParam),
//                     GetBudgetByDepartmentFromApi(yearParam),
//                     GetBudgetByStatusFromApi(yearParam),
//                     GetProjectCountByDepartmentFromApi(yearParam),
//                     GetProjectCountByStatusFromApi(yearParam),
//                     GetApprovalQueueFromApi(yearParam),
//                 ])

//                 setKpiData(kpi)
//                 setBudgetByYearData(budgetYear)
//                 setBudgetByDepartmentData(budgetDept)
//                 setBudgetByStatusData(budgetStatus)
//                 setProjectCountByDepartmentData(projectDept)
//                 setProjectCountByStatusData(projectStatus)
//                 setApprovalQueueData(approvals)
//             } catch (error) {
//                 console.error("Failed to fetch dashboard data:", error)
//             } finally {
//                 setLoading(false)
//             }
//         }

//         fetchDashboardData()
//     }, [year])
    

//     const handleFilterChange = (key: string, value: string) => {
//         setFilters((prev) => ({ ...prev, [key]: value }))
//     }

//     /* ===== derive KPI data ===== */
//     const yearKpi = useMemo(() => {
//         if (kpiData) {
//             return {
//                 totalBudget: kpiData.totalBudget,
//                 totalProjects: kpiData.totalProjects,
//                 avgBudget: kpiData.avgBudget,
//                 totalEmployees: kpiData.totalEmployees,
//                 totalDepartments: kpiData.totalDepartments,
//             }
//         }
//         // Fallback for "all" years - aggregate from budgetByYearData
//         const totalBudget = budgetByYearData.reduce((sum, item) => sum + item.budget, 0)
//         const totalProjects = projectCountByStatusData.reduce((sum, item) => sum + item.value, 0)
//         return {
//             totalBudget,
//             totalProjects,
//             avgBudget: totalProjects > 0 ? totalBudget / totalProjects : 0,
//             totalEmployees: 0, // Not available for "all"
//             totalDepartments: budgetByDepartmentData.length,
//         }
//     }, [kpiData, budgetByYearData, budgetByDepartmentData, projectCountByStatusData])

//     // Map approval queue data to component format
//     const mappedApprovals = useMemo(() => {
//         return approvalQueueData.map(item => ({
//             project: item.projectName,
//             dept: item.department,
//             amount: item.budget.toLocaleString(),
//             owner: "-", // Not provided by API
//             stage: item.status,
//             lastUpdate: item.submittedAt,
//             priority: "medium" as const, // Default priority
//         }))
//     }, [approvalQueueData])

//     /* ===== render ===== */
//     return (
//         <div className="min-h-screen bg-gray-50 text-gray-900">
//             <BackGroundLight>
//                 <header className="sticky top-0 z-20 border-b bg-white">
//                     <div className="mx-auto flex h-14 max-w-screen-2xl items-center justify-between px-6 pl-20">
//                         <h1 className="text-lg font-semibold">Dashboard (Admin)</h1>
//                         <div className=" row-gap-2 flex items-center gap-4 px-10">
//                         เลือกช่วงปีที่แสดง :
//                         <select
//                             value={year}
//                             onChange={(e) => setYear(e.target.value as YearFilter)}
//                             className="rounded-xl border px-3 py-1 text-xs"
//                         >
//                             <option value="all">ทั้งหมด</option>
//                             <option value="2568">2568</option>
//                             <option value="2567">2567</option>
//                             <option value="2566">2566</option>
//                             <option value="2565">2565</option>
//                             <option value="2564">2564</option>
//                             <option value="2563">2563</option>
//                         </select>
//                         </div>
//                     </div>
//                 </header>

//                 <main className="mx-auto max-w-screen-2xl space-y-12 px-6 pl-20 py-8">
//                     <ZoneHeader
//                         title={
//                             year === "all"
//                                 ? "ภาพรวมองค์กรทั้งหมด"
//                                 : `ภาพรวมปีงบประมาณ ${year}`
//                         }
//                         subtitle="ข้อมูลจากระบบงบประมาณ"
//                     />

//                     {loading ? (
//                         <div className="text-center py-12">
//                             <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-indigo-600 border-r-transparent"></div>
//                             <p className="mt-2 text-gray-600">กำลังโหลดข้อมูล...</p>
//                         </div>
//                     ) : (
//                         <>
//                             <OrgKpiSummary {...yearKpi} />

//                             <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
//                                 <BudgetByDeptChart data={budgetByDepartmentData} />
//                                 <BudgetByStatusChart data={budgetByStatusData} />
//                             </div>

//                             <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
//                                 <ProjectCountByDeptChart data={projectCountByDepartmentData} />
//                                 <ProjectCountByStatusChart data={projectCountByStatusData} />
//                             </div>

//                             <BudgetByYearChart data={budgetByYearData} />

//                             <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
//                                 <ApprovalQueue
//                                     filters={filters}
//                                     approvals={mappedApprovals}
//                                 />

//                                 <StrategyQaSection
//                                     strategies={strategic_plans_data}
//                                     qaIndicators={qa_indicators_data}
//                                     onFilterChange={handleFilterChange}
//                                 />
//                             </div>

//                             <ProjectsTable filters={filters} projects={projects_data} />
//                         </>
//                     )}
//                 </main>
//             </BackGroundLight>
//         </div>
//     )
// }