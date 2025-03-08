"use client"

import { useEffect, useState } from "react"
import { redirect } from "next/navigation"
import AdminDashboard from "@/components/admin-dashboard"
import EmployeeDashboard from "@/components/employee-dashboard"

export default function DashboardPage() {
  const [userRole, setUserRole] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // In a real app, we would verify the user's token with the backend
    const role = localStorage.getItem("userRole")
    setUserRole(role)
    setLoading(false)
  }, [])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
      </div>
    )
  }

  if (!userRole) {
    // Redirect to sign-in if no role is found
    redirect("/")
  }

  return (
    <div className="min-h-screen bg-background">
      {userRole === "admin" ? <AdminDashboard /> : <EmployeeDashboard />}
    </div>
  )
}

