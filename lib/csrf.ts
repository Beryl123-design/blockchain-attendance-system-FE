import { randomBytes } from "crypto"
import { cookies } from "next/headers"

const CSRF_COOKIE_NAME = "csrf_token"
const CSRF_HEADER_NAME = "X-CSRF-Token"

export async function generateCsrfToken(): Promise<string> {
  const token = randomBytes(32).toString("hex")

  const cookieStore = await cookies()
  cookieStore.set(CSRF_COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    path: "/",
  })

  return token
}

export async function validateCsrfToken(request: Request): Promise<boolean> {
  const cookieStore = await cookies()
  const csrfCookie = cookieStore.get(CSRF_COOKIE_NAME)
  const csrfHeader = request.headers.get(CSRF_HEADER_NAME)

  if (!csrfCookie || !csrfHeader) {
    return false
  }

  return csrfCookie.value === csrfHeader
}
