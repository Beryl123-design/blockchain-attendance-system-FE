import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { getServerSession } from "../auth/session"

// Mock leave applications database
const LEAVE_APPLICATIONS: Array<{
  id: string
  userId: string
  startDate: string
  endDate: string
  reason: string
  status: "pending" | "approved" | "rejected"
  type: "sick" | "vacation" | "personal" | "other"
}> = [
  {
    id: "1",
    userId: "2",
    startDate: "2023-06-01",
    endDate: "2023-06-05",
    reason: "Family vacation",
    status: "approved",
    type: "vacation",
  },
  {
    id: "2",
    userId: "3",
    startDate: "2023-05-20",
    endDate: "2023-05-22",
    reason: "Medical appointment",
    status: "approved",
    type: "sick",
  },
  {
    id: "3",
    userId: "4",
    startDate: "2023-06-10",
    endDate: "2023-06-10",
    reason: "Personal matter",
    status: "pending",
    type: "personal",
  },
]

export async function GET(request: NextRequest) {
  try {
    // Check authentication
    const session = await getServerSession()

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Parse query parameters
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get("userId")
    const status = searchParams.get("status")

    let applications = [...LEAVE_APPLICATIONS]

    // Filter by user ID if provided
    if (userId) {
      // Regular employees can only view their own leave applications
      if (session.role === "employee" && userId !== session.userId) {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 })
      }

      applications = applications.filter((app) => app.userId === userId)
    } else if (session.role === "employee") {
      // Employees can only see their own applications if no userId is specified
      applications = applications.filter((app) => app.userId === session.userId)
    }

    // Filter by status if provided
    if (status) {
      applications = applications.filter((app) => app.status === status)
    }

    return NextResponse.json({ applications })
  } catch (error) {
    console.error("Error fetching leave applications:", error)
    return NextResponse.json({ error: "Failed to fetch leave applications" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const session = await getServerSession()

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const { userId, startDate, endDate, reason, type } = body

    // Validate required fields
    if (!userId || !startDate || !endDate || !reason || !type) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    // Regular employees can only apply for their own leave
    if (session.role === "employee" && userId !== session.userId) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    // Create new leave application
    const newApplication = {
      id: String(LEAVE_APPLICATIONS.length + 1),
      userId,
      startDate,
      endDate,
      reason,
      status: "pending" as const,
      type: type as "sick" | "vacation" | "personal" | "other",
    }

    // Add to mock database
    LEAVE_APPLICATIONS.push(newApplication)

    return NextResponse.json({ application: newApplication }, { status: 201 })
  } catch (error) {
    console.error("Error creating leave application:", error)
    return NextResponse.json({ error: "Failed to create leave application" }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    // Check authentication
    const session = await getServerSession()

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Only admin, HR, and supervisors can update leave applications
    if (!["admin", "hr", "supervisor"].includes(session.role)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    const body = await request.json()
    const { id, status } = body

    // Validate required fields
    if (!id || !status) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    // Find the application
    const applicationIndex = LEAVE_APPLICATIONS.findIndex((app) => app.id === id)

    if (applicationIndex === -1) {
      return NextResponse.json({ error: "Leave application not found" }, { status: 404 })
    }

    // Update the application
    LEAVE_APPLICATIONS[applicationIndex] = {
      ...LEAVE_APPLICATIONS[applicationIndex],
      status: status as "pending" | "approved" | "rejected",
    }

    return NextResponse.json({ application: LEAVE_APPLICATIONS[applicationIndex] })
  } catch (error) {
    console.error("Error updating leave application:", error)
    return NextResponse.json({ error: "Failed to update leave application" }, { status: 500 })
  }
}
