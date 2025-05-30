import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { getServerSession } from "../auth/session"

// Mock attendance database
const ATTENDANCE_RECORDS: Array<{
  id: string
  userId: string
  date: string
  checkIn: string | null
  checkOut: string | null
  status: "present" | "absent" | "late" | "half-day"
}> = [
  {
    id: "1",
    userId: "2",
    date: "2023-05-15",
    checkIn: "09:00:00",
    checkOut: "17:00:00",
    status: "present",
  },
  {
    id: "2",
    userId: "3",
    date: "2023-05-15",
    checkIn: "09:30:00",
    checkOut: "17:30:00",
    status: "present",
  },
  {
    id: "3",
    userId: "4",
    date: "2023-05-15",
    checkIn: "08:45:00",
    checkOut: "16:45:00",
    status: "present",
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
    const date = searchParams.get("date")

    let records = [...ATTENDANCE_RECORDS]

    // Filter by user ID if provided
    if (userId) {
      // Regular employees can only view their own records
      if (session.role === "employee" && userId !== session.userId) {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 })
      }

      records = records.filter((record) => record.userId === userId)
    } else if (session.role === "employee") {
      // Employees can only see their own records if no userId is specified
      records = records.filter((record) => record.userId === session.userId)
    }

    // Filter by date if provided
    if (date) {
      records = records.filter((record) => record.date === date)
    }

    return NextResponse.json({ records })
  } catch (error) {
    console.error("Error fetching attendance records:", error)
    return NextResponse.json({ error: "Failed to fetch attendance records" }, { status: 500 })
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
    const { userId, date, checkIn, checkOut, status } = body

    // Validate required fields
    if (!userId || !date || !status) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    // Regular employees can only record their own attendance
    if (session.role === "employee" && userId !== session.userId) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    // Check if record already exists for this user and date
    const existingRecord = ATTENDANCE_RECORDS.find((record) => record.userId === userId && record.date === date)

    if (existingRecord) {
      // Update existing record
      existingRecord.checkIn = checkIn || existingRecord.checkIn
      existingRecord.checkOut = checkOut || existingRecord.checkOut
      existingRecord.status = status || existingRecord.status

      return NextResponse.json({ record: existingRecord })
    }

    // Create new record
    const newRecord = {
      id: String(ATTENDANCE_RECORDS.length + 1),
      userId,
      date,
      checkIn,
      checkOut,
      status,
    }

    // Add to mock database
    ATTENDANCE_RECORDS.push(newRecord)

    return NextResponse.json({ record: newRecord }, { status: 201 })
  } catch (error) {
    console.error("Error recording attendance:", error)
    return NextResponse.json({ error: "Failed to record attendance" }, { status: 500 })
  }
}
