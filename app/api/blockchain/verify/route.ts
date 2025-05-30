import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { getServerSession } from "../../auth/session"

// Mock blockchain verification
// In a real app, this would interact with a blockchain network

// Mock blockchain records
const BLOCKCHAIN_RECORDS: Array<{
  id: string
  userId: string
  recordType: "attendance" | "leave" | "payroll"
  recordId: string
  timestamp: string
  hash: string
  verified: boolean
}> = [
  {
    id: "1",
    userId: "2",
    recordType: "attendance",
    recordId: "1",
    timestamp: "2023-05-15T09:00:00Z",
    hash: "0x1a2b3c4d5e6f7g8h9i0j1k2l3m4n5o6p7q8r9s0t",
    verified: true,
  },
  {
    id: "2",
    userId: "3",
    recordType: "attendance",
    recordId: "2",
    timestamp: "2023-05-15T09:30:00Z",
    hash: "0x2b3c4d5e6f7g8h9i0j1k2l3m4n5o6p7q8r9s0t1a",
    verified: true,
  },
  {
    id: "3",
    userId: "4",
    recordType: "leave",
    recordId: "3",
    timestamp: "2023-05-06T11:45:00Z",
    hash: "0x3c4d5e6f7g8h9i0j1k2l3m4n5o6p7q8r9s0t1a2b",
    verified: true,
  },
]

export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const session = await getServerSession()

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const { recordType, recordId, userId } = body

    // Validate required fields
    if (!recordType || !recordId || !userId) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    // Regular employees can only verify their own records
    if (session.role === "employee" && userId !== session.userId) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    // Check if record already exists in blockchain
    const existingRecord = BLOCKCHAIN_RECORDS.find(
      (record) => record.recordType === recordType && record.recordId === recordId,
    )

    if (existingRecord) {
      return NextResponse.json({
        verified: existingRecord.verified,
        hash: existingRecord.hash,
        timestamp: existingRecord.timestamp,
      })
    }

    // In a real app, this would call a blockchain service
    // For now, we'll simulate blockchain verification

    // Generate a mock hash
    const mockHash = `0x${Array.from({ length: 40 }, () => "0123456789abcdef"[Math.floor(Math.random() * 16)]).join(
      "",
    )}`

    // Create a new blockchain record
    const newRecord = {
      id: String(BLOCKCHAIN_RECORDS.length + 1),
      userId,
      recordType: recordType as "attendance" | "leave" | "payroll",
      recordId,
      timestamp: new Date().toISOString(),
      hash: mockHash,
      verified: true,
    }

    // Add to mock database
    BLOCKCHAIN_RECORDS.push(newRecord)

    return NextResponse.json({
      verified: true,
      hash: mockHash,
      timestamp: newRecord.timestamp,
    })
  } catch (error) {
    console.error("Error verifying record on blockchain:", error)
    return NextResponse.json({ error: "Failed to verify record on blockchain" }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  try {
    // Check authentication
    const session = await getServerSession()

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Parse query parameters
    const { searchParams } = new URL(request.url)
    const recordType = searchParams.get("recordType")
    const recordId = searchParams.get("recordId")
    const userId = searchParams.get("userId")

    if (!recordType || !recordId) {
      return NextResponse.json({ error: "Missing required parameters" }, { status: 400 })
    }

    // If userId is provided, check permissions
    if (userId && session.role === "employee" && userId !== session.userId) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    // Find the blockchain record
    const record = BLOCKCHAIN_RECORDS.find(
      (r) => r.recordType === recordType && r.recordId === recordId && (!userId || r.userId === userId),
    )

    if (!record) {
      return NextResponse.json({ error: "Record not found on blockchain" }, { status: 404 })
    }

    return NextResponse.json({
      verified: record.verified,
      hash: record.hash,
      timestamp: record.timestamp,
    })
  } catch (error) {
    console.error("Error checking blockchain verification:", error)
    return NextResponse.json({ error: "Failed to check blockchain verification" }, { status: 500 })
  }
}
