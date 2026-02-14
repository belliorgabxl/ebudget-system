"use client"

import { useState, useMemo } from "react"
import { Menu, X, LogOut } from "lucide-react"
import Link from "next/link"
import { pickHomeByRole } from "@/lib/rbac"

type ServerUser = {
  id?: string | null
  username?: string | null
  name?: string | null
  role_key?: string | null
  role_label?: string | null
  org_id?: string | null
  department_id?: string | null
} | null


export default function TopBar({ serverUser }: { serverUser: ServerUser }) {
  const [menuOpen, setMenuOpen] = useState(false)

  const roleCode = (serverUser?.role_key ?? "user").toLowerCase()
  const roleHome = pickHomeByRole(roleCode)
  const canSeeDepartment = roleCode === "hr" || roleCode === "admin"

  // เมนูบนมือถือ
  const menuItems = useMemo(() => {
    const items = [
      roleHome && roleHome !== "/login"
        ? { href: roleHome, label: "ภาพรวม" }
        : null,
      { href: "/organizer/projects/my-project", label: "โครงการ" },
      canSeeDepartment
        ? { href: "/organizer/department", label: "หน่วยงาน" }
        : null,
      { href: "/organizer/reports", label: "รายงาน" },
      { href: "/organizer/setup", label: "ตั้งค่า" },
    ].filter(Boolean)

    return items as Array<{ href: string; label: string }>
  }, [roleHome, canSeeDepartment])

  return (
    <header className="fixed top-0 left-0 z-50 w-full bg-white border-b border-gray-200 shadow-sm">
      <div className="flex items-center justify-between px-4 h-14">
        <span className="text-base font-semibold text-gray-800">E-Budget</span>

        <button
          onClick={() => setMenuOpen((v) => !v)}
          className="p-2 rounded-md hover:bg-gray-100 transition"
        >
          {menuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {menuOpen && (
        <div className="absolute top-14 right-0 w-full bg-white shadow-md border-t border-gray-100 animate-slideDown">
          <nav className="flex flex-col py-2 text-center">
            {menuItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="px-4 py-3 text-gray-700 hover:bg-gray-50 active:bg-gray-100"
                onClick={() => setMenuOpen(false)}
              >
                {item.label}
              </Link>
            ))}

            {/* Logout แบบ form POST */}
            <form action="/api/auth/logout" method="post">
              <button
                type="submit"
                className="w-full text-center px-4 py-3 text-red-600 hover:bg-red-50 active:bg-red-100"
              >
                ออกจากระบบ
              </button>
            </form>
          </nav>
        </div>
      )}

      <style jsx>{`
        @keyframes slideDown {
          from {
            opacity: 0;
            transform: translateY(-5px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-slideDown {
          animation: slideDown 0.2s ease-out;
        }
      `}</style>
    </header>
  )
}
