"use client"

import { useEffect, useState } from "react"
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
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Simulate loading system data
    setTimeout(() => {
      const activeOrgs = MOCK_ORGANIZATIONS.filter(org => org.status === "active").length
      const inactiveOrgs = MOCK_ORGANIZATIONS.filter(org => org.status === "inactive").length
      
      setStats({
        totalOrganizations: MOCK_ORGANIZATIONS.length,
        activeOrganizations: activeOrgs,
        inactiveOrganizations: inactiveOrgs,
        totalUsers: 1247,
        totalProjects: 342,
        systemUptime: 99.8
      })

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

      setLoading(false)
    }, 500)
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent"></div>
      </div>
    )
  }

  return (
    <div className="relative min-h-screen bg-gray-50">
         <BackGroundLight>
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
                  <p className="mt-2 text-sm text-green-600 flex items-center">
                    <TrendingUp className="mr-1 h-4 w-4" />
                    +12% จากเดือนที่แล้ว
                  </p>
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
                  <p className="mt-2 text-sm text-blue-600 flex items-center">
                    <TrendingUp className="mr-1 h-4 w-4" />
                    +8% จากเดือนที่แล้ว
                  </p>
                </div>
                <div className="rounded-full bg-green-100 p-4">
                  <FolderKanban className="h-8 w-8 text-green-600" />
                </div>
              </div>
            </div>
          </div>

          {/* Content Grid */}
          <div className="grid gap-6 lg:grid-cols-3">
            {/* Recent Activities - Takes 2 columns */}
            <div className="lg:col-span-2 rounded-xl bg-white shadow-sm border border-gray-200">
              <div className="border-b border-gray-200 px-6 py-4">
                <h2 className="text-lg font-semibold text-gray-900">กิจกรรมล่าสุด</h2>
              </div>
              <div className="p-6">
                <div className="space-y-4">
                  {recentActivities.map((activity) => (
                    <div key={activity.id} className="flex items-start gap-4 rounded-lg border border-gray-100 p-4 hover:bg-gray-50 transition-colors">
                      <div className={`rounded-full p-2 ${
                        activity.status === "success" ? "bg-green-100" :
                        activity.status === "warning" ? "bg-yellow-100" :
                        "bg-blue-100"
                      }`}>
                        {activity.status === "success" && <CheckCircle className="h-5 w-5 text-green-600" />}
                        {activity.status === "warning" && <AlertCircle className="h-5 w-5 text-yellow-600" />}
                        {activity.status === "info" && <Activity className="h-5 w-5 text-blue-600" />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900">{activity.message}</p>
                        <p className="mt-1 text-xs text-gray-500">{activity.timestamp}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* System Info - Takes 1 column */}
            <div className="space-y-6">
              {/* System Health */}
              <div className="rounded-xl bg-white shadow-sm border border-gray-200">
                <div className="border-b border-gray-200 px-6 py-4">
                  <h2 className="text-lg font-semibold text-gray-900">สถานะระบบ</h2>
                </div>
                <div className="p-6 space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Database className="h-5 w-5 text-gray-600" />
                      <span className="text-sm text-gray-600">Database</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="h-2 w-2 rounded-full bg-green-500"></div>
                      <span className="text-sm font-medium text-green-600">Online</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Shield className="h-5 w-5 text-gray-600" />
                      <span className="text-sm text-gray-600">Security</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="h-2 w-2 rounded-full bg-green-500"></div>
                      <span className="text-sm font-medium text-green-600">Protected</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Activity className="h-5 w-5 text-gray-600" />
                      <span className="text-sm text-gray-600">API Status</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="h-2 w-2 rounded-full bg-green-500"></div>
                      <span className="text-sm font-medium text-green-600">Healthy</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Quick Actions */}
              <div className="rounded-xl bg-white shadow-sm border border-gray-200">
                <div className="border-b border-gray-200 px-6 py-4">
                  <h2 className="text-lg font-semibold text-gray-900">การจัดการ</h2>
                </div>
                <div className="p-6 space-y-2">
                  <a
                    href="/admin/manage-org"
                    className="block w-full rounded-lg border border-gray-200 px-4 py-3 text-left text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                  >
                    จัดการองค์กร
                  </a>
                  <button
                    className="block w-full rounded-lg border border-gray-200 px-4 py-3 text-left text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                  >
                    ตั้งค่าระบบ
                  </button>
                  <button
                    className="block w-full rounded-lg border border-gray-200 px-4 py-3 text-left text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                  >
                    รายงานระบบ
                  </button>
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
                    <th className="px-6 py-4 text-center text-sm font-semibold text-gray-900">หน่วยงาน</th>
                    <th className="px-6 py-4 text-center text-sm font-semibold text-gray-900">พนักงาน</th>
                    <th className="px-6 py-4 text-center text-sm font-semibold text-gray-900">โครงการ</th>
                    <th className="px-6 py-4 text-center text-sm font-semibold text-gray-900">สถานะ</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {MOCK_ORGANIZATIONS.slice(0, 5).map((org) => (
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
                        <span className="text-sm text-gray-900">{org.totalDepartments}</span>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span className="text-sm text-gray-900">{org.totalEmployees}</span>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span className="text-sm text-gray-900">{org.totalProjects}</span>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span className={`inline-block rounded-full px-3 py-1 text-xs font-medium ${
                          org.status === "active" 
                            ? "bg-green-100 text-green-700" 
                            : "bg-gray-100 text-gray-700"
                        }`}>
                          {org.status === "active" ? "ใช้งาน" : "ปิดใช้งาน"}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
        </BackGroundLight>
      </div>
  )
}