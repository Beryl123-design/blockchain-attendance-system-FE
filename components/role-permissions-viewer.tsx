"use client"

import { useState } from "react"
import { Permission, rolePermissions } from "@/lib/rbac"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Check, X } from "lucide-react"

export function RolePermissionsViewer() {
  const [selectedRole, setSelectedRole] = useState<string>("admin")
  const roles = Object.keys(rolePermissions)

  // Group permissions by category
  const permissionCategories: Record<string, Permission[]> = {
    "User Management": [Permission.MANAGE_USERS],
    Attendance: [
      Permission.VIEW_OWN_ATTENDANCE,
      Permission.VIEW_ALL_ATTENDANCE,
      Permission.CHECK_IN,
      Permission.CHECK_OUT,
    ],
    "Leave Management": [
      Permission.REQUEST_LEAVE,
      Permission.APPROVE_TEAM_LEAVE,
      Permission.APPROVE_DEPARTMENT_LEAVE,
      Permission.MANAGE_LEAVE,
    ],
    "Department & Team": [Permission.VIEW_TEAM, Permission.VIEW_DEPARTMENT],
    "Content Management": [Permission.MANAGE_BULLETINS, Permission.REPORT_ISSUE],
    "System Administration": [Permission.MANAGE_SETTINGS, Permission.EXPORT_DATA, Permission.VIEW_REPORTS],
    Payroll: [Permission.MANAGE_PAYROLL],
    Blockchain: [Permission.VERIFY_BLOCKCHAIN, Permission.MANAGE_BLOCKCHAIN],
  }

  // Get permissions for the selected role
  const rolePerms = rolePermissions[selectedRole] || []

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex justify-between items-center">
          <span>Role Permissions</span>
          <Select value={selectedRole} onValueChange={setSelectedRole}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Select a role" />
            </SelectTrigger>
            <SelectContent>
              {roles.map((role) => (
                <SelectItem key={role} value={role}>
                  {role.charAt(0).toUpperCase() + role.slice(1)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {Object.entries(permissionCategories).map(([category, permissions]) => (
            <div key={category}>
              <h3 className="text-lg font-medium mb-2">{category}</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {permissions.map((permission) => {
                  const hasPermission = rolePerms.includes(permission)
                  return (
                    <div
                      key={permission}
                      className={`flex items-center p-2 rounded-md ${hasPermission ? "bg-green-50" : "bg-gray-50"}`}
                    >
                      {hasPermission ? (
                        <Check className="h-4 w-4 text-green-600 mr-2" />
                      ) : (
                        <X className="h-4 w-4 text-gray-400 mr-2" />
                      )}
                      <span className={hasPermission ? "text-green-800" : "text-gray-500"}>{permission}</span>
                    </div>
                  )
                })}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
