"use client"

import { useEffect } from "react"
import AdminDashboard from "@/components/admin-dashboard"
import EmployeeDashboard from "@/components/employee-dashboard"
import HRDashboard from "@/components/hr-dashboard"
import SupervisorDashboard from "@/components/supervisor-dashboard"

interface DashboardWrapperProps {
  userRole: string
  userName: string
  userEmail: string
}

export default function DashboardWrapper({ userRole, userName, userEmail }: DashboardWrapperProps) {
  // Store non-sensitive user info in localStorage for UI components
  useEffect(() => {
    localStorage.setItem("userName", userName)
    localStorage.setItem("userEmail", userEmail)
    localStorage.setItem("userRole", userRole)
  }, [userName, userEmail, userRole])

  if (userRole === "admin") {
    return <AdminDashboard />
  } else if (userRole === "hr") {
    return <HRDashboard />
  } else if (userRole === "supervisor" || userRole === "manager" || userRole === "director") {
    return <SupervisorDashboard />
  } else {
    return <EmployeeDashboard />
  }
}
