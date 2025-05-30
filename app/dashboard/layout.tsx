import type React from "react"
import { SessionManager } from "@/components/session-manager"

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <>
      <SessionManager />
      {children}
    </>
  )
}
