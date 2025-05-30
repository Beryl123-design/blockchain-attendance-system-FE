import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { setAuthCookie } from "@/lib/auth-cookies"
import { validateCsrfToken } from "@/lib/csrf"
import { logAuditEvent } from "@/lib/audit-logger"
import { isRateLimited } from "@/lib/rate-limiter"
import { USERS } from "@/lib/users" // Declare the USERS variable

export async function POST(request: NextRequest) {
  // Get IP address for rate limiting
  const ipAddress = request.ip || request.headers.get("x-forwarded-for") || "unknown"

  // Check rate limit: 5 attempts per 15 minutes
  if (isRateLimited(`login:${ipAddress}`, 5, 15 * 60 * 1000)) {
    // Log rate limit exceeded
    await logAuditEvent({
      eventType: "auth:login:rate_limited",
      ipAddress,
      userAgent: request.headers.get("user-agent") || undefined,
    })

    return NextResponse.json({ error: "Too many login attempts. Please try again later." }, { status: 429 })
  }

  // Validate CSRF token
  if (!validateCsrfToken(request)) {
    // Log failed attempt due to CSRF
    await logAuditEvent({
      eventType: "auth:login:csrf_failure",
      ipAddress: request.ip || request.headers.get("x-forwarded-for") || undefined,
      userAgent: request.headers.get("user-agent") || undefined,
    })

    return NextResponse.json({ error: "Invalid CSRF token" }, { status: 403 })
  }

  try {
    const body = await request.json()
    const { email, password } = body

    // Find user
    const user = USERS.find((u) => u.email === email)

    // Log login attempt
    await logAuditEvent({
      eventType: "auth:login:attempt",
      userEmail: email,
      ipAddress: request.ip || request.headers.get("x-forwarded-for") || undefined,
      userAgent: request.headers.get("user-agent") || undefined,
    })

    if (!user || user.password !== password) {
      // Log failed login
      await logAuditEvent({
        eventType: "auth:login:failure",
        userEmail: email,
        ipAddress: request.ip || request.headers.get("x-forwarded-for") || undefined,
        userAgent: request.headers.get("user-agent") || undefined,
        details: { reason: !user ? "user_not_found" : "invalid_password" },
      })

      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 })
    }

    // Create session
    const session = {
      userId: user.id,
      email: user.email,
      role: user.role,
      name: user.name,
      expiresAt: Date.now() + 24 * 60 * 60 * 1000, // 24 hours
    }

    // Set HTTP-only cookie
    setAuthCookie(session)

    // Log successful login
    await logAuditEvent({
      eventType: "auth:login:success",
      userId: user.id,
      userEmail: user.email,
      userRole: user.role,
      ipAddress: request.ip || request.headers.get("x-forwarded-for") || undefined,
      userAgent: request.headers.get("user-agent") || undefined,
    })

    // Return user data
    return NextResponse.json({
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        name: user.name,
      },
    })
  } catch (error) {
    console.error("Authentication error:", error)

    // Log error
    await logAuditEvent({
      eventType: "auth:login:error",
      ipAddress: request.ip || request.headers.get("x-forwarded-for") || undefined,
      userAgent: request.headers.get("user-agent") || undefined,
      details: { error: error instanceof Error ? error.message : "Unknown error" },
    })

    return NextResponse.json({ error: "Authentication failed" }, { status: 500 })
  }
}
