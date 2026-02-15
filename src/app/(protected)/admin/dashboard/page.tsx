"use client"

import { useEffect, useRef, useState } from "react"
import Link from "next/link"
import { 
  Building, 
  Users, 
  FolderKanban, 
  Activity, 
  TrendingUp, 
  AlertCircle,
  CheckCircle,
  Clock,
  Shield,
  Database,
  ArrowRight
} from "lucide-react"
import { MOCK_ORGANIZATIONS } from "@/resource/mock-organization"
import BackGroundLight from "@/components/background/bg-light"

interface SystemStats {
  totalOrganizations: number
  activeOrganizations: number
  inactiveOrganizations: number
  totalUsers: number
  totalProjects: number
  systemUptime: number
}

interface RecentActivity {
  id: string
  type: "org_created" | "org_updated" | "user_added" | "system_event"
  message: string
  timestamp: string
  status: "success" | "warning" | "info"
}

interface Organization {
  id: string
  name: string
  code: string
  description: string
  totalBudget: number
  totalDepartments: number
  totalEmployees: number
  totalProjects: number
  status: "active" | "inactive"
  createdAt: string
  updatedAt: string
  type?: string
  max_approval_level?: number
  is_active?: boolean
  created_at?: string
}

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<SystemStats>({
    totalOrganizations: 0,
    activeOrganizations: 0,
    inactiveOrganizations: 0,
    totalUsers: 0,
    totalProjects: 0,
    systemUptime: 99.8
  })

  const [recentActivities, setRecentActivities] = useState<RecentActivity[]>([])
  const [organizations, setOrganizations] = useState<Organization[]>([])
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [loading, setLoading] = useState(true)
  const [tableLoading, setTableLoading] = useState(false)
  const isInitialLoad = useRef(true)

  useEffect(() => {
    const loadData = async () => {
      if (isInitialLoad.current) {
        setLoading(true)
      } else {
        setTableLoading(true)
      }
      try {
        // Fetch organizations with pagination
        const orgResponse = await fetch(`/api/organizations?page=${currentPage}&limit=5`)
        if (orgResponse.ok) {
          const orgData = await orgResponse.json()
          if (orgData.success) {
            setOrganizations(orgData.data || [])
            // Assuming the API returns total count
            const total = orgData.total || orgData.data?.length || 0
            setTotalPages(Math.ceil(total / 5))
          }
        }

        // Fetch dashboard stats from API
        const statsResponse = await fetch('/api/admin/dashboard/stats')
        if (statsResponse.ok) {
          const statsData = await statsResponse.json()
          if (statsData.success) {
            setStats({
              totalOrganizations: statsData.data.totalOrganizations || 0,
              activeOrganizations: statsData.data.activeOrganizations || 0,
              inactiveOrganizations: statsData.data.inactiveOrganizations || 0,
              totalUsers: statsData.data.totalUsers || 0,
              totalProjects: statsData.data.totalProjects || 0,
              systemUptime: statsData.data.systemUptime || 0
            })
          }
        }

        setRecentActivities([
          {
            id: "1",
            type: "org_created",
            message: "องค์กร 'บริษัท ABC จำกัด' ถูกสร้างขึ้น",
            timestamp: "2 นาทีที่แล้ว",
            status: "success"
          },
          {
            id: "2",
            type: "user_added",
            message: "เพิ่มผู้ใช้ 15 คนในระบบ",
            timestamp: "15 นาทีที่แล้ว",
            status: "info"
          },
          {
            id: "3",
            type: "org_updated",
            message: "อัพเดทข้อมูลองค์กร 'กรมสรรพากร'",
            timestamp: "1 ชั่วโมงที่แล้ว",
            status: "success"
          },
          {
            id: "4",
            type: "system_event",
            message: "ระบบทำการ backup ข้อมูลเรียบร้อย",
            timestamp: "2 ชั่วโมงที่แล้ว",
            status: "success"
          },
          {
            id: "5",
            type: "system_event",
            message: "การใช้งาน database เกิน 80%",
            timestamp: "3 ชั่วโมงที่แล้ว",
            status: "warning"
          }
        ])
      } catch (error) {
        console.error('Error loading dashboard data:', error)
      } finally {
        setLoading(false)
        setTableLoading(false)
        isInitialLoad.current = false
      }
    }

    loadData()
  }, [currentPage])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent"></div>
      </div>
    )
  }

  return (
    <BackGroundLight>
    <div className="relative min-h-screen">
      <div className="mx-auto max-w-7xl px-6 py-8">
        {/* Header */}
          <div className="mb-8 mt-12">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">System Dashboard</h1>
                <p className="mt-2 text-sm text-gray-600">ภาพรวมการจัดการระบบทั้งหมด</p>
              </div>
             
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 mb-8">
            {/* Total Organizations */}
            <div className="rounded-xl bg-white p-6 shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">องค์กรทั้งหมด</p>
                  <p className="mt-2 text-3xl font-bold text-gray-900">{stats.totalOrganizations}</p>
                  <div className="mt-2 flex items-center gap-4 text-sm">
                    <span className="flex items-center text-green-600">
                      <CheckCircle className="mr-1 h-4 w-4" />
                      Active: {stats.activeOrganizations}
                    </span>
                    <span className="flex items-center text-gray-500">
                      <Clock className="mr-1 h-4 w-4" />
                      Inactive: {stats.inactiveOrganizations}
                    </span>
                  </div>
                </div>
                <div className="rounded-full bg-blue-100 p-4">
                  <Building className="h-8 w-8 text-blue-600" />
                </div>
              </div>
            </div>

            {/* Total Users */}
            <div className="rounded-xl bg-white p-6 shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">ผู้ใช้ในระบบ</p>
                  <p className="mt-2 text-3xl font-bold text-gray-900">{stats.totalUsers.toLocaleString()}</p>
                
                </div>
                <div className="rounded-full bg-purple-100 p-4">
                  <Users className="h-8 w-8 text-purple-600" />
                </div>
              </div>
            </div>

            {/* Total Projects */}
            <div className="rounded-xl bg-white p-6 shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">โครงการทั้งหมด</p>
                  <p className="mt-2 text-3xl font-bold text-gray-900">{stats.totalProjects.toLocaleString()}</p>
                  
                </div>
                <div className="rounded-full bg-green-100 p-4">
                  <FolderKanban className="h-8 w-8 text-green-600" />
                </div>
              </div>
            </div>
          </div>



          {/* Organizations Overview */}
          <div className="mt-6 rounded-xl bg-white shadow-sm border border-gray-200">
            <div className="border-b border-gray-200 px-6 py-4 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900">องค์กรในระบบ</h2>
              <Link
                href="/admin/manage-org"
                className="text-gray-600 underline hover:opacity-70 transition-opacity"
              >
                ดูทั้งหมด
              </Link>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">ชื่อองค์กร</th>
                    <th className="px-6 py-4 text-center text-sm font-semibold text-gray-900">ประเภท</th>
                    <th className="px-6 py-4 text-center text-sm font-semibold text-gray-900">วันที่สร้าง</th>
                    <th className="px-6 py-4 text-center text-sm font-semibold text-gray-900">สถานะ</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {tableLoading ? (
                    // Skeleton loading rows
                    Array.from({ length: 5 }).map((_, index) => (
                      <tr key={`skeleton-${index}`} className="animate-pulse">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="h-5 w-5 bg-gray-200 rounded"></div>
                            <div>
                              <div className="h-4 bg-gray-200 rounded w-32 mb-1"></div>
                              <div className="h-3 bg-gray-200 rounded w-20"></div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-center">
                          <div className="h-4 bg-gray-200 rounded w-16 mx-auto"></div>
                        </td>
                        <td className="px-6 py-4 text-center">
                          <div className="h-4 bg-gray-200 rounded w-20 mx-auto"></div>
                        </td>
                        <td className="px-6 py-4 text-center">
                          <div className="h-6 bg-gray-200 rounded-full w-16 mx-auto"></div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    organizations.map((org) => (
                      <tr 
                        key={org.id} 
                        onClick={() => window.location.href = `/admin/manage-org/${org.id}`}
                        className="hover:bg-gray-50 transition-colors cursor-pointer"
                      >
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <Building className="h-5 w-5 text-gray-400" />
                            <div>
                              <p className="font-medium text-gray-900">{org.name}</p>
                              <p className="text-sm text-gray-500">{org.code}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-center">
                          <span className="text-sm text-gray-900">{org.type || "-"}</span>
                        </td>
                        <td className="px-6 py-4 text-center">
                          <span className="text-sm text-gray-900">{org.created_at ? new Date(org.created_at).toLocaleDateString('th-TH') : "-"}</span>
                        </td>
                        <td className="px-6 py-4 text-center">
                          <span className={`inline-block rounded-full px-3 py-1 text-xs font-medium ${
                            org.is_active 
                              ? "bg-green-100 text-green-700" 
                              : "bg-gray-100 text-gray-700"
                          }`}>
                            {org.is_active ? "true" : "false"}
                          </span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between px-6 py-4 border-t border-gray-200">
                <div className="text-sm text-gray-700">
                  แสดงหน้า {currentPage} จาก {totalPages}
                </div>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                    disabled={currentPage === 1}
                    className="px-3 py-1 text-sm border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    ก่อนหน้า
                  </button>
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                    <button
                      key={page}
                      onClick={() => setCurrentPage(page)}
                      className={`px-3 py-1 text-sm border rounded-md ${
                        currentPage === page
                          ? "bg-blue-600 text-white border-blue-600"
                          : "border-gray-300 hover:bg-gray-50"
                      }`}
                    >
                      {page}
                    </button>
                  ))}
                  <button
                    onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                    disabled={currentPage === totalPages}
                    className="px-3 py-1 text-sm border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    ถัดไป
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
      </BackGroundLight>
  )
}