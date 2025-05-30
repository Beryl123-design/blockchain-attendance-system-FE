"use client"

import { useState, useEffect } from "react"
import { type Permission, hasPermission, hasAnyPermission, hasAllPermissions } from "@/lib/rbac"

export function usePermissions() {
  const [userRole, setUserRole] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [permissions, setPermissions] = useState<Permission[]>([])

  useEffect(() => {
    // Get the user role from localStorage
    const role = localStorage.getItem("userRole")
    setUserRole(role)
    setLoading(false)
  }, [])

  // Function to check if the user has a specific permission
  const can = (permission: string | Permission): boolean => {
    if (!userRole) return false
    return hasPermission(userRole, permission as Permission)
  }

  // Function to check if the user has any of the given permissions
  const canAny = (permissions: Permission[]): boolean => {
    if (!userRole) return false
    return hasAnyPermission(userRole, permissions)
  }

  // Function to check if the user has all of the given permissions
  const canAll = (permissions: Permission[]): boolean => {
    if (!userRole) return false
    return hasAllPermissions(userRole, permissions)
  }

  return { userRole, loading, can, canAny, canAll }
}
