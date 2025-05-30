"use client"

import { useEffect, useState } from "react"
import { usePathname } from "next/navigation"
import { CybersecurityAwareness } from "./cybersecurity-awareness"

export function AuthAwareCybersecurityTips() {
  const pathname = usePathname()
  const [shouldRender, setShouldRender] = useState(false)

  useEffect(() => {
    // Check if we're on a login/public page
    const isPublicPage = pathname === "/" || pathname.includes("/login") || pathname.includes("/sign-in")

    // Only render on authenticated pages
    setShouldRender(!isPublicPage)
  }, [pathname])

  if (!shouldRender) return null

  return <CybersecurityAwareness />
}
