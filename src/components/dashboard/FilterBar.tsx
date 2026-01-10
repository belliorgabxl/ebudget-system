"use client"

import { Filter, X } from "lucide-react"

interface FilterBarProps {
  filters: {
    year: string
    department: string
    status: string
  }
  activeFilters: string[]
  onFilterChange: (key: string, value: string) => void
  onClearAll: () => void
}

export function FilterBar({ filters, activeFilters, onFilterChange, onClearAll }: FilterBarProps) {
  return (
    <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
      <div className="flex flex-wrap items-center gap-4">
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm font-semibold text-foreground">ตัวกรอง:</span>
        </div>

        <select
          value={filters.year}
          onChange={(e) => onFilterChange("year", e.target.value)}
          className="rounded-lg border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
        >
          <option value="2568">ปีงบประมาณ 2568</option>
          <option value="2567">ปีงบประมาณ 2567</option>
          <option value="2566">ปีงบประมาณ 2566</option>
          <option value="2565">ปีงบประมาณ 2568</option>
        </select>

        <select
          value={filters.department}
          onChange={(e) => onFilterChange("department", e.target.value)}
          className="rounded-lg border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
        >
          <option value="all">ทุกหน่วยงาน</option>
          <option value="it">IT</option>
          <option value="hr">HR</option>
          <option value="finance">Finance</option>
        </select>

        <select
          value={filters.status}
          onChange={(e) => onFilterChange("status", e.target.value)}
          className="rounded-lg border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
        >
          <option value="all">ทุกสถานะ</option>
          <option value="approved">อนุมัติ</option>
          <option value="pending">รออนุมัติ</option>
          <option value="rejected">ไม่อนุมัติ</option>
        </select>

        {activeFilters.length > 0 && (
          <button
            onClick={onClearAll}
            className="ml-auto flex items-center gap-1 rounded-lg bg-destructive/10 px-3 py-2 text-sm font-medium text-destructive transition-colors hover:bg-destructive/20"
          >
            <X className="h-4 w-4" />
            ล้างตัวกรอง
          </button>
        )}
      </div>
    </div>
  )
}
