// Define all possible permissions in the system
export enum Permission {
  // Admin permissions
  MANAGE_USERS = "manage_users",
  MANAGE_SETTINGS = "manage_settings",
  VIEW_ALL_ATTENDANCE = "view_all_attendance",
  MANAGE_BULLETINS = "manage_bulletins",

  // Department manager permissions
  VIEW_DEPARTMENT = "view_department",
  APPROVE_DEPARTMENT_LEAVE = "approve_department_leave",

  // Supervisor permissions
  VIEW_TEAM = "view_team",
  APPROVE_TEAM_LEAVE = "approve_team_leave",

  // Employee permissions
  VIEW_OWN_ATTENDANCE = "view_own_attendance",
  REQUEST_LEAVE = "request_leave",
  REPORT_ISSUE = "report_issue",

  // Common permissions
  CHECK_IN = "check_in",
  CHECK_OUT = "check_out",

  // HR specific permissions
  MANAGE_PAYROLL = "manage_payroll",
  MANAGE_LEAVE = "manage_leave",
  VIEW_REPORTS = "view_reports",
  EXPORT_DATA = "export_data",

  // Blockchain specific permissions
  VERIFY_BLOCKCHAIN = "verify_blockchain",
  MANAGE_BLOCKCHAIN = "manage_blockchain",
}

// Define roles and their associated permissions
export const rolePermissions: Record<string, Permission[]> = {
  admin: [
    Permission.MANAGE_USERS,
    Permission.MANAGE_SETTINGS,
    Permission.VIEW_ALL_ATTENDANCE,
    Permission.MANAGE_BULLETINS,
    Permission.VIEW_DEPARTMENT,
    Permission.APPROVE_DEPARTMENT_LEAVE,
    Permission.VIEW_TEAM,
    Permission.APPROVE_TEAM_LEAVE,
    Permission.VIEW_OWN_ATTENDANCE,
    Permission.REQUEST_LEAVE,
    Permission.REPORT_ISSUE,
    Permission.CHECK_IN,
    Permission.CHECK_OUT,
    Permission.MANAGE_PAYROLL,
    Permission.MANAGE_LEAVE,
    Permission.VIEW_REPORTS,
    Permission.EXPORT_DATA,
    Permission.VERIFY_BLOCKCHAIN,
    Permission.MANAGE_BLOCKCHAIN,
  ],
  hr: [
    Permission.VIEW_ALL_ATTENDANCE,
    Permission.VIEW_DEPARTMENT,
    Permission.APPROVE_DEPARTMENT_LEAVE,
    Permission.VIEW_TEAM,
    Permission.APPROVE_TEAM_LEAVE,
    Permission.VIEW_OWN_ATTENDANCE,
    Permission.REQUEST_LEAVE,
    Permission.REPORT_ISSUE,
    Permission.CHECK_IN,
    Permission.CHECK_OUT,
    Permission.MANAGE_PAYROLL,
    Permission.MANAGE_LEAVE,
    Permission.VIEW_REPORTS,
    Permission.EXPORT_DATA,
  ],
  supervisor: [
    Permission.VIEW_TEAM,
    Permission.APPROVE_TEAM_LEAVE,
    Permission.VIEW_OWN_ATTENDANCE,
    Permission.REQUEST_LEAVE,
    Permission.REPORT_ISSUE,
    Permission.CHECK_IN,
    Permission.CHECK_OUT,
    Permission.VIEW_REPORTS,
  ],
  employee: [
    Permission.VIEW_OWN_ATTENDANCE,
    Permission.REQUEST_LEAVE,
    Permission.REPORT_ISSUE,
    Permission.CHECK_IN,
    Permission.CHECK_OUT,
  ],
}

// Function to check if a role has a specific permission
export function hasPermission(role: string, permission: Permission): boolean {
  if (!role || !rolePermissions[role]) {
    return false
  }

  return rolePermissions[role].includes(permission)
}

// Function to get all permissions for a role
export function getPermissionsForRole(role: string): Permission[] {
  if (!role || !rolePermissions[role]) {
    return []
  }

  return rolePermissions[role]
}

// Function to check if user has any of the given permissions
export function hasAnyPermission(role: string, permissions: Permission[]): boolean {
  if (!role || !rolePermissions[role]) {
    return false
  }

  return permissions.some((permission) => rolePermissions[role].includes(permission))
}

// Function to check if user has all of the given permissions
export function hasAllPermissions(role: string, permissions: Permission[]): boolean {
  if (!role || !rolePermissions[role]) {
    return false
  }

  return permissions.every((permission) => rolePermissions[role].includes(permission))
}
