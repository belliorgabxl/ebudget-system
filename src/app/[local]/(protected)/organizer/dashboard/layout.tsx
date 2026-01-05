"use client"

import BackGroundLight from "@/components/background/bg-light"
import { useEffect, useState } from "react"

export default function UserSectionLayout({ children }: { children: React.ReactNode }) {
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    const onResize = () => setIsMobile(window.innerWidth < 768)
    onResize()
    window.addEventListener("resize", onResize)
    return () => window.removeEventListener("resize", onResize)
  }, [])

  return (
    <div className="min-h-dvh bg-white overflow-x-hidden">
          <BackGroundLight>
      <main
        className={[
          isMobile ? "pt-14" : "md:pl-16", 
          "",                    
        ].join(" ")}
      >
        <div className="mx-auto w-full ">
          {children}
        </div>
      </main>
      </BackGroundLight>
    </div>
  )
}

