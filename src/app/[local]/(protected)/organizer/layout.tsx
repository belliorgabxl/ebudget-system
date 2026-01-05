import type { Metadata } from "next"
import { cookies } from "next/headers"
import { jwtVerify } from "jose"
import Sidebar from "@/components/Sidebar"  
import TopBar from "@/components/TopBar"    
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
export const metadata: Metadata = { title: "E-Budget" }

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET)

type ServerUser = {
  id?: string | null
  username?: string | null
  name?: string | null
  role_key?: string | null
  role_label?: string | null
  org_id?: string | null
  department_id?: string | null
} | null
async function getServerUser(): Promise<ServerUser> {
  try {
    const token = (await cookies()).get("auth_token")?.value
    if (!token) return null
    const { payload } = await jwtVerify(token, JWT_SECRET)
    return {
      id: (payload.sub as string) ?? null,
      username: (payload.username as string) ?? null,
      name: (payload.name as string) ?? null,
      role_key: ((payload.role_key ?? payload.role) as string) ?? "department_user",
      role_label: (payload.role_label as string) ?? null,
      org_id: (payload.org_id as string) ?? null,
      department_id: (payload.department_id as string) ?? null,
    }
  } catch {
    return null
  }
}

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const serverUser = await getServerUser()

  return (
    <div className="min-h-dvh bg-white [--app-header-h:64px]">
      <ToastContainer
          position="bottom-right"
          hideProgressBar
          className="z-50"
        />
      {/* Mobile */}
      <div className="md:hidden">
        <TopBar serverUser={serverUser} />
      </div>

      {/* Desktop */}
      <div className="hidden md:flex">
        <Sidebar serverUser={serverUser} />
      </div>

      <main className="">
        {children}
      </main>
    </div>
  )
}
