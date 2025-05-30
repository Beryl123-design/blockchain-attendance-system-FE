import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { getAuthCookie, refreshAuthCookie } from "@/lib/auth-cookies"

export async function POST(request: NextRequest) {
  const authData = getAuthCookie()

  if (!authData) {
    return NextResponse.json({ error: "No active session" }, { status: 401 })
  }

  // Refresh the session
  refreshAuthCookie(authData)

  return NextResponse.json({
    success: true,
    expiresAt: authData.expiresAt,
  })
}
