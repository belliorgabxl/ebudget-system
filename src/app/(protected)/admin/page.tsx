"use client"

import { useEffect, useState } from "react"
import { StrategyQaSection } from "@/components/dashboard/StrategyQaSection"
import QuarterCalendar from "@/components/dashboard/QuarterCalendar"
import { ProjectsTable } from "@/components/dashboard/ProjectsTable"
import { ApprovalQueue } from "@/components/dashboard/ApprovalQueue"
import {
    MOCK_APPROVALS,
} from "@/app/mock"
// // <-- เปลี่ยน import: ใช้ GetQaIndicatorsByYearFromApi
// import {
//   GetStrategicPlansFromApi,
//   GetCalendarEventsFromApi,
//   GetProjectsByOrgFromApi,
// } from "@/api/dashboard/route"
// import { GetApprovalItems,GetProjectsByOrgRespond,GetCalenderEventRespond } from "@/dto/dashboardDto"
// import { GetStrategicPlanRespond,GetQaIndicatorsRespond, GetQaIndicatorsByYearAllRespond } from "@/dto/qaDto"
// import { GetQaIndicatorsByYearAllFromApi, GetQaIndicatorsByYearFromApi } from "@/api/qa/route"


import { GetStrategicPlansFromApi,GetCalendarEventsFromApi, GetProjectsByOrgFromApi } from "@/api/dashboard"
import { GetApprovalItems,GetProjectsByOrgRespond,GetCalenderEventRespond } from "@/dto/dashboardDto"
import { GetStrategicPlanRespond,GetQaIndicatorsRespond,GetQaIndicatorsByYearAllRespond } from "@/dto/qaDto"
import { GetQaIndicatorsByYearAllFromApi } from "@/api/qa/route"

export default function UserDashboardPage() {
    // คำนวณปีปัจจุบัน (ค.ศ.) และปีพ.ศ. ที่จะแสดง
    const currentGregorianYear = new Date().getFullYear(); // ex: 2025
    const currentBuddhistYear = String(currentGregorianYear + 543); // ex: 2568

    const [filters, setFilters] = useState({
        year: currentBuddhistYear, // แสดงเป็น พ.ศ.
        department: "all",
        projectType: "all",
        status: "all",
        qaIndicator: "all",
        strategy: "all",
    })
    const [activeFilters, setActiveFilters] = useState<string[]>([])

    const [calendar_events_data, set_calendar_events_data] = useState<GetCalenderEventRespond[]>([]);
    const [approval_items, set_approval_items] = useState<GetApprovalItems[]>([]);
    const [qa_indicators_data, set_qa_indicators_data] = useState<GetQaIndicatorsByYearAllRespond[]>([]);
    const [strategic_plans_data, set_strategic_plans_data] = useState<GetStrategicPlanRespond[]>([]);
    const [projects_data, set_projects_data] = useState<GetProjectsByOrgRespond[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);


    const handleFilterChange = (key: string, value: string) => {
        setFilters((prev) => ({ ...prev, [key]: value }))
        if (value !== "all" && !activeFilters.includes(key)) {
            setActiveFilters((prev) => [...prev, key])
        } else if (value === "all") {
            setActiveFilters((prev) => prev.filter((f) => f !== key))
        }
    }

    useEffect(() => {
        const fetchCounts = async () => {
            try {
                const data = await GetCalendarEventsFromApi();
                console.log("calendar events data:", data);
                set_calendar_events_data(data);
            } catch (err) {
                console.error(err);
            }
        };
        fetchCounts();
    }, []);

    useEffect(() => {
        const fetchCounts = async () => {
            try {
                const data = await GetStrategicPlansFromApi();
                set_strategic_plans_data(data);
            } catch (err) {
                console.error(err);
            }
        };
        fetchCounts();
    }, []);
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

    // <-- New: ใช้ GetQaIndicatorsByYearFromApi โดยส่งปีเป็น ค.ศ.
    useEffect(() => {
        const fetchQaIndicators = async () => {
            try {
                // เรียก API ด้วยปีค.ศ. (ไม่ใช่พ.ศ.)
                const data = await GetQaIndicatorsByYearAllFromApi(currentGregorianYear);
                set_qa_indicators_data(data);
            } catch (err) {
                console.error("Failed to fetch QA indicators by year:", err);
            } finally {
                setLoading(false);
            }
        };
        fetchQaIndicators();
    }, []); // รันครั้งเดียวตอน mount (ใช้ปีปัจจุบัน)

    const clearAllFilters = () => {
        setFilters({
            year: currentBuddhistYear, // reset เป็นปีปัจจุบัน (พ.ศ.)
            department: "all",
            projectType: "all",
            status: "all",
            qaIndicator: "all",
            strategy: "all",
        })
        setActiveFilters([])
    }

    return (
        <div className="min-h-screen w-full  text-gray-900">
            <div className="sticky w-full px-0 mx-0 top-0 z-20 border-b border-gray-200 bg-white/90 backdrop-blur supports-[backdrop-filter]:bg-white/80">
                <div className=" lg:mx-10 mx-0 px-1 lg:px-4">
                    <div className="flex h-14 items-center justify-between">
                        <h1 className="text-lg font-semibold tracking-tight">Dashboard (director)</h1>
                        <div className="text-xs text-gray-500">
                            ปีงบประมาณ: <span className="font-medium text-gray-700">{filters.year}</span>
                        </div>
                    </div>
                </div>
                <main className=" lg:mx-10 w-full  space-y-6 px-0 lg:px-4 py-6">
                    <ProjectsTable filters={filters} projects={projects_data} />
                    <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
                        <div className="lg:col-span-2">
                            <ApprovalQueue approvals={MOCK_APPROVALS} />
                        </div>
                        <div>
                            <StrategyQaSection
                                strategies={strategic_plans_data}
                                qaIndicators={qa_indicators_data}
                                onFilterChange={handleFilterChange}
                            />
                        </div>
                    </div>

                    <QuarterCalendar events={calendar_events_data} />
                </main>

            </div>
        </div>
    )
}