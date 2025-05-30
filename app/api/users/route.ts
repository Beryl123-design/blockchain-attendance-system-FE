import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { getServerSession } from "../auth/session"
import { withAuth } from "@/lib/api-middleware"
import { Permission } from "@/lib/rbac"

// Mock user database
const USERS = [
  { id: "1", email: "admin@example.com", role: "admin", name: "Admin User", department: "Management" },
  { id: "2", email: "employee@example.com", role: "employee", name: "Employee User", department: "Engineering" },
  { id: "3", email: "hr@example.com", role: "hr", name: "HR User", department: "Human Resources" },
  { id: "4", email: "supervisor@example.com", role: "supervisor", name: "Supervisor User", department: "Engineering" },
  { id: "5", email: "john.doe@example.com", role: "employee", name: "John Doe", department: "Marketing" },
  { id: "6", email: "jane.smith@example.com", role: "employee", name: "Jane Smith", department: "Finance" },
]

async function getUsers(req: NextRequest) {
  try {
    // Check authentication
    const session = await getServerSession()

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Only admin and HR can get all users
    if (session.role !== "admin" && session.role !== "hr") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    // Return users without passwords
    const safeUsers = USERS.map(({ password, ...user }) => user)
    return NextResponse.json({ users: safeUsers })
  } catch (error) {
    console.error("Error fetching users:", error)
    return NextResponse.json({ error: "Failed to fetch users" }, { status: 500 })
  }
}

async function createUser(req: NextRequest) {
  try {
    const body = await req.json()
    const { email, name, role, department } = body

    // Validate required fields
    if (!email || !name || !role) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    // Check if user already exists
    if (USERS.some((user) => user.email === email)) {
      return NextResponse.json({ error: "User with this email already exists" }, { status: 409 })
    }

    // Create new user (in a real app, you'd save to a database)
    const newUser = {
      id: String(USERS.length + 1),
      email,
      name,
      role,
      department: department || "General",
    }

    // Add to mock database
    USERS.push(newUser)

    return NextResponse.json({ user: newUser }, { status: 201 })
  } catch (error) {
    console.error("Error creating user:", error)
    return NextResponse.json({ error: "Failed to create user" }, { status: 500 })
  }
}

export const GET = withAuth(getUsers, Permission.MANAGE_USERS)
export const POST = withAuth(createUser, Permission.MANAGE_USERS)
