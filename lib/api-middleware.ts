import { NextResponse } from "next/server"
import { NextRequest } from "next/server"
import { AUTH_COOKIE_NAME } from "./auth-cookies"
import { type Permission, hasPermission } from "./rbac"

export function withAuth(handler: (req: NextRequest) => Promise<NextResponse>, requiredPermission?: Permission) {
  return async (req: NextRequest) => {
    // Check for auth cookie
    const authCookie = req.cookies.get(AUTH_COOKIE_NAME)

    if (!authCookie) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    try {
      const session = JSON.parse(authCookie.value)

      if (!session || !session.userId || session.expiresAt < Date.now() + 60000) { // check if session is expired ( 30 seconcs buffer)
        return NextResponse.json({ error: "Session expired" }, { status: 401 })
      }

      // Check permission if required
      if (requiredPermission && !hasPermission(session.role, requiredPermission)) {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 })
      }

      // Add user info to request headers
      const requestHeaders = new Headers(req.headers)
      requestHeaders.set("x-user-id", session.userId)
      requestHeaders.set("x-user-role", session.role)

      // Create a new request with the updated headers
      const newRequest = new NextRequest(req.url, {
        method: req.method,
        headers: requestHeaders,
        body: req.body,
      })

      // Call the original handler with the new request
      return handler(newRequest)
    } catch (error) {
      console.error("Error in API middleware:", error)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }
  }
}
