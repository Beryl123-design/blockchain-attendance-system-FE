import { cookies } from "next/headers"
import { db } from "./database"

export async function authenticateUser(email: string, password: string) {
  const user = await db.getUserByEmail(email)

  if (!user || user.password !== password) {
    return null
  }

  // Create session
  const session = {
    userId: user.id,
    email: user.email,
    role: user.role,
    name: user.name,
    expiresAt: Date.now() + 24 * 60 * 60 * 1000, // 24 hours
  }

  // Set cookie
  cookies().set("session", JSON.stringify(session), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    maxAge: 60 * 60 * 24, // 1 day
    path: "/",
  })

  const { password: _, ...userWithoutPassword } = user
  return userWithoutPassword
}

export async function getCurrentUser() {
  const sessionCookie = cookies().get("session")

  if (!sessionCookie) {
    return null
  }

  try {
    const session = JSON.parse(sessionCookie.value)

    // Check if session has expired
    if (session.expiresAt < Date.now()) {
      return null
    }

    return await db.getUserById(session.userId)
  } catch (error) {
    console.error("Error getting current user:", error)
    return null
  }
}

export async function signOut() {
  cookies().delete("session")
}

export function hasPermission(user: { role: string }, action: string, resource: string) {
  // Define permissions based on roles
  const permissions = {
    admin: ["*"], // Admin can do everything
    hr: [
      "read:users",
      "create:users",
      "update:users",
      "read:attendance",
      "create:attendance",
      "update:attendance",
      "read:leave",
      "update:leave",
    ],
    supervisor: [
      "read:users",
      "read:attendance",
      "create:attendance",
      "update:attendance",
      "read:leave",
      "update:leave",
    ],
    employee: ["read:own_user", "read:own_attendance", "create:own_attendance", "read:own_leave", "create:own_leave"],
  }

  // Get permissions for the user's role
  const userPermissions = permissions[user.role as keyof typeof permissions] || []

  // Check if user has the required permission
  const requiredPermission = `${action}:${resource}`

  return userPermissions.includes("*") || userPermissions.includes(requiredPermission)
}
