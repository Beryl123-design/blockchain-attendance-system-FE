"use client"

import { type ReactNode, useEffect } from "react"
import { useRouter } from "next/navigation"
import { usePermissions } from "@/hooks/use-permissions"
import type { Permission } from "@/lib/rbac"

interface ProtectedRouteProps {
  requiredPermission?: Permission
  requiredPermissions?: Permission[]
  requireAll?: boolean
  children: ReactNode
  fallbackUrl?: string
  fallback?: ReactNode
}

export function ProtectedRoute({
  requiredPermission,
  requiredPermissions = [],
  requireAll = false,
  children,
  fallbackUrl = "/",
  fallback,
}: ProtectedRouteProps) {
  const router = useRouter()
  const { userRole, loading, can, canAny, canAll } = usePermissions()

  // Check if user has the required permission(s)
  const hasAccess = () => {
    if (requiredPermission) {
      return can(requiredPermission)
    }

    if (requiredPermissions.length > 0) {
      return requireAll ? canAll(requiredPermissions) : canAny(requiredPermissions)
    }

    return true
  }

  useEffect(() => {
    // Wait until loading is complete
    if (loading) return

    // Check if user is logged in
    if (!userRole) {
      router.push(fallbackUrl)
      return
    }

    // Check if user has required permissions
    if (!hasAccess()) {
      // If fallback is provided, don't redirect
      if (!fallback) {
        router.push(fallbackUrl)
      }
    }
  }, [userRole, loading, router, fallbackUrl])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
      </div>
    )
  }

  // If user doesn't have access and fallback is provided, render the fallback
  if (!hasAccess() && fallback) {
    return <>{fallback}</>
  }

  // If user has access, render the children
  if (hasAccess()) {
    return <>{children}</>
  }

  // Otherwise, return null (redirect will happen in useEffect)
  return null
}
