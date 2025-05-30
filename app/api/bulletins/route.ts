import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { getServerSession } from "../auth/session"

// Mock bulletins database
const BULLETINS: Array<{
  id: string
  title: string
  content: string
  authorId: string
  createdAt: string
  priority: "low" | "medium" | "high"
}> = [
  {
    id: "1",
    title: "Company Picnic",
    content: "Annual company picnic will be held on June 15th at Central Park.",
    authorId: "1",
    createdAt: "2023-05-10T10:00:00Z",
    priority: "medium",
  },
  {
    id: "2",
    title: "System Maintenance",
    content: "The attendance system will be down for maintenance on May 20th from 10 PM to 2 AM.",
    authorId: "8",
    createdAt: "2023-05-12T14:30:00Z",
    priority: "high",
  },
  {
    id: "3",
    title: "New HR Policy",
    content: "Please review the updated HR policy document available on the intranet.",
    authorId: "3",
    createdAt: "2023-05-14T09:15:00Z",
    priority: "medium",
  },
]

export async function GET() {
  try {
    // No authentication required for reading bulletins
    return NextResponse.json({ bulletins: BULLETINS })
  } catch (error) {
    console.error("Error fetching bulletins:", error)
    return NextResponse.json({ error: "Failed to fetch bulletins" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const session = await getServerSession()

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Only admin, HR, and supervisors can create bulletins
    if (!["admin", "hr", "supervisor"].includes(session.role)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    const body = await request.json()
    const { title, content, priority } = body

    // Validate required fields
    if (!title || !content) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    // Create new bulletin
    const newBulletin = {
      id: String(BULLETINS.length + 1),
      title,
      content,
      authorId: session.userId,
      createdAt: new Date().toISOString(),
      priority: priority || ("medium" as "low" | "medium" | "high"),
    }

    // Add to mock database
    BULLETINS.push(newBulletin)

    return NextResponse.json({ bulletin: newBulletin }, { status: 201 })
  } catch (error) {
    console.error("Error creating bulletin:", error)
    return NextResponse.json({ error: "Failed to create bulletin" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    // Check authentication
    const session = await getServerSession()

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Only admin and HR can delete bulletins
    if (!["admin", "hr"].includes(session.role)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    // Parse query parameters
    const { searchParams } = new URL(request.url)
    const id = searchParams.get("id")

    if (!id) {
      return NextResponse.json({ error: "Missing bulletin ID" }, { status: 400 })
    }

    // Find the bulletin
    const bulletinIndex = BULLETINS.findIndex((bulletin) => bulletin.id === id)

    if (bulletinIndex === -1) {
      return NextResponse.json({ error: "Bulletin not found" }, { status: 404 })
    }

    // Remove the bulletin
    const deletedBulletin = BULLETINS.splice(bulletinIndex, 1)[0]

    return NextResponse.json({ success: true, deletedBulletin })
  } catch (error) {
    console.error("Error deleting bulletin:", error)
    return NextResponse.json({ error: "Failed to delete bulletin" }, { status: 500 })
  }
}
