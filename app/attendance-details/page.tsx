"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"

export default function AttendanceDetailsPage() {
  const router = useRouter()

  useEffect(() => {
    // Redirect to dashboard since we're now using a dialog
    router.push("/dashboard")
  }, [router])

  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="text-center">
        <div className="mb-4 text-4xl font-bold text-navy">Redirecting...</div>
        <p className="text-muted-foreground">Please wait while we redirect you to the dashboard.</p>
      </div>
    </div>
  )
}
