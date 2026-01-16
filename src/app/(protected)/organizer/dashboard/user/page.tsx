"use client";

import { useEffect, useState } from "react";
// import { FilterBar } from "@/components/dashboard/FilterBar";
// import { KpiCards } from "@/components/dashboard/KpiCards";
// import { ChartsSection } from "@/components/dashboard/ChartsSection";
// import { MiniTimeline } from "@/components/dashboard/MiniTimeline";
// import { ApprovalQueue } from "@/components/dashboard/ApprovalQueue";
// import { StrategyQaSection } from "@/components/dashboard/StrategyQaSection";

// import { FooterToolbar } from "@/components/dashboard/FooterToolbar";
// import {
//   MOCK_APPROVALS,
//   MOCK_BUDGET_BY_DEPT,
//   MOCK_PROJECT_TYPES,
//   MOCK_PROJECTS,
//   MOCK_CALENDAR,
// } from "@/app/mock";
// import QuarterCalendar from "@/components/dashboard/QuarterCalendar";
import { ProjectsTable } from "@/components/dashboard/ProjectsTable";
import { GetProjectsByOrgFromApi } from "@/api/dashboard";
import { GetProjectsByOrgRespond } from "@/dto/dashboardDto";
import BackGroundLight from "@/components/background/bg-light";

export default function UserDashboardPage() {
  const [filters, setFilters] = useState({
    year: "2568",
    department: "all",
    projectType: "all",
    status: "all",
    qaIndicator: "all",
    strategy: "all",
  });
  const [activeFilters, setActiveFilters] = useState<string[]>([]);
  const [projects_data, set_projects_data] = useState<
    GetProjectsByOrgRespond[]
  >([]);

  const handleFilterChange = (key: string, value: string) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
    if (value !== "all" && !activeFilters.includes(key)) {
      setActiveFilters((prev) => [...prev, key]);
    } else if (value === "all") {
      setActiveFilters((prev) => prev.filter((f) => f !== key));
    }
  };
  useEffect(() => {
    const fetchCounts = async () => {
      try {
        const data = await GetProjectsByOrgFromApi();
        set_projects_data(data?.data ?? []);
      } catch (err) {}
    };
    fetchCounts();
  }, []);

  const clearAllFilters = () => {
    setFilters({
      year: "2568",
      department: "all",
      projectType: "all",
      status: "all",
      qaIndicator: "all",
      strategy: "all",
    });
    setActiveFilters([]);
  };

  return (
    <div className="min-h-screen text-gray-900">
      <div className="sticky top-0 z-20">
        <div className="container mx-auto px-4 pt-10">
          <div className="flex h-14 items-center justify-between">
            <h1 className="text-lg font-semibold tracking-tight">
              Dashboard (user)
            </h1>
            <div className="text-xs text-gray-500">
              ปีงบประมาณ:{" "}
              <span className="font-medium text-gray-700">{filters.year}</span>
            </div>
          </div>
        </div>
        <main className="container mx-auto space-y-6 px-4 py-6">
          <ProjectsTable filters={filters} projects={projects_data} />
        </main>
      </div>
    </div>

  );
}