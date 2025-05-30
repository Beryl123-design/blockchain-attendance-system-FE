"use client"

import type { ReactNode } from "react"
import { usePermissions } from "@/hooks/use-permissions"
import type { Permission } from "@/lib/rbac"

interface ProtectedComponentProps {
  requiredPermission?: Permission
  requiredPermissions?: Permission[]
  requireAll?: boolean
  children: ReactNode
  fallback?: ReactNode
}

export function ProtectedComponent({
  requiredPermission,
  requiredPermissions = [],
  requireAll = false,
  children,
  fallback = null,
}: ProtectedComponentProps) {
  const { can, canAny, canAll } = usePermissions()

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

  // Render the children if the user has access, otherwise render the fallback
  return hasAccess() ? <>{children}</> : <>{fallback}</>
}
