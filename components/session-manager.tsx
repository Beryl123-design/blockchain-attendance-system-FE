"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"

export function SessionManager() {
  const router = useRouter()
  const [lastActivity, setLastActivity] = useState<number>(Date.now())
  const inactivityTimeout = 30 * 60 * 1000 // 30 minutes

  // Track user activity
  useEffect(() => {
    const updateActivity = () => {
      setLastActivity(Date.now())
    }

    // Listen for user activity events
    window.addEventListener("mousemove", updateActivity)
    window.addEventListener("keydown", updateActivity)
    window.addEventListener("click", updateActivity)
    window.addEventListener("scroll", updateActivity)

    return () => {
      window.removeEventListener("mousemove", updateActivity)
      window.removeEventListener("keydown", updateActivity)
      window.removeEventListener("click", updateActivity)
      window.removeEventListener("scroll", updateActivity)
    }
  }, [])

  // Check for inactivity and session expiration
  useEffect(() => {
    const interval = setInterval(async () => {
      // Check for inactivity
      if (Date.now() - lastActivity > inactivityTimeout) {
        // Log out due to inactivity
        await fetch("/api/auth/logout", { method: "POST" })
        router.push("/")
        return
      }

      // Try to refresh the session if needed
      try {
        const response = await fetch("/api/auth/refresh", { method: "POST" })
        if (!response.ok) {
          // Session couldn't be refreshed, redirect to login
          router.push("/")
        }
      } catch (error) {
        console.error("Error refreshing session:", error)
      }
    }, 60000) // Check every minute

    return () => clearInterval(interval)
  }, [lastActivity, router])

  // This component doesn't render anything
  return null
}
