import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { getServerSession } from "../auth/session"

// Mock issues database
const ISSUES: Array<{
  id: string
  title: string
  description: string
  reporterId: string
  assigneeId?: string
  status: "open" | "in-progress" | "resolved" | "closed"
  priority: "low" | "medium" | "high"
  createdAt: string
  updatedAt: string
}> = [
  {
    id: "1",
    title: "Check-in not working",
    description: "Unable to check in using the mobile app.",
    reporterId: "2",
    assigneeId: "8",
    status: "in-progress",
    priority: "high",
    createdAt: "2023-05-10T08:30:00Z",
    updatedAt: "2023-05-10T09:15:00Z",
  },
  {
    id: "2",
    title: "Incorrect attendance record",
    description: "My attendance for May 5th is marked as absent but I was present.",
    reporterId: "3",
    status: "open",
    priority: "medium",
    createdAt: "2023-05-08T14:20:00Z",
    updatedAt: "2023-05-08T14:20:00Z",
  },
  {
    id: "3",
    title: "Leave application not showing",
    description: "I submitted a leave application but it's not showing in my dashboard.",
    reporterId: "4",
    assigneeId: "7",
    status: "resolved",
    priority: "medium",
    createdAt: "2023-05-06T11:45:00Z",
    updatedAt: "2023-05-07T10:30:00Z",
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
    const reporterId = searchParams.get("reporterId")
    const status = searchParams.get("status")

    let issues = [...ISSUES]

    // Filter by reporter ID if provided
    if (reporterId) {
      // Regular employees can only view their own issues
      if (session.role === "employee" && reporterId !== session.userId) {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 })
      }

      issues = issues.filter((issue) => issue.reporterId === reporterId)
    } else if (session.role === "employee") {
      // Employees can only see their own issues if no reporterId is specified
      issues = issues.filter((issue) => issue.reporterId === session.userId)
    }

    // Filter by status if provided
    if (status) {
      issues = issues.filter((issue) => issue.status === status)
    }

    return NextResponse.json({ issues })
  } catch (error) {
    console.error("Error fetching issues:", error)
    return NextResponse.json({ error: "Failed to fetch issues" }, { status: 500 })
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
    const { title, description, priority } = body

    // Validate required fields
    if (!title || !description) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    // Create new issue
    const now = new Date().toISOString()
    const newIssue = {
      id: String(ISSUES.length + 1),
      title,
      description,
      reporterId: session.userId,
      status: "open" as const,
      priority: priority || ("medium" as "low" | "medium" | "high"),
      createdAt: now,
      updatedAt: now,
    }

    // Add to mock database
    ISSUES.push(newIssue)

    return NextResponse.json({ issue: newIssue }, { status: 201 })
  } catch (error) {
    console.error("Error creating issue:", error)
    return NextResponse.json({ error: "Failed to create issue" }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    // Check authentication
    const session = await getServerSession()

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const { id, status, assigneeId, priority } = body

    // Validate required fields
    if (!id) {
      return NextResponse.json({ error: "Missing issue ID" }, { status: 400 })
    }

    // Find the issue
    const issueIndex = ISSUES.findIndex((issue) => issue.id === id)

    if (issueIndex === -1) {
      return NextResponse.json({ error: "Issue not found" }, { status: 404 })
    }

    const issue = ISSUES[issueIndex]

    // Regular employees can only update their own issues and only certain fields
    if (session.role === "employee") {
      if (issue.reporterId !== session.userId) {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 })
      }

      // Employees can only update description and priority
      if (status || assigneeId) {
        return NextResponse.json({ error: "You do not have permission to update these fields" }, { status: 403 })
      }
    }

    // Update the issue
    ISSUES[issueIndex] = {
      ...issue,
      ...(status && { status: status as "open" | "in-progress" | "resolved" | "closed" }),
      ...(assigneeId && { assigneeId }),
      ...(priority && { priority: priority as "low" | "medium" | "high" }),
      updatedAt: new Date().toISOString(),
    }

    return NextResponse.json({ issue: ISSUES[issueIndex] })
  } catch (error) {
    console.error("Error updating issue:", error)
    return NextResponse.json({ error: "Failed to update issue" }, { status: 500 })
  }
}
