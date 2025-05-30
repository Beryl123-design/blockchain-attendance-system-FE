import { randomBytes } from "crypto"
import { cookies } from "next/headers"

const CSRF_COOKIE_NAME = "csrf_token"
const CSRF_HEADER_NAME = "X-CSRF-Token"

export function generateCsrfToken(): string {
  const token = randomBytes(32).toString("hex")

  cookies().set(CSRF_COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    path: "/",
  })

  return token
}

export function validateCsrfToken(request: Request): boolean {
  const csrfCookie = cookies().get(CSRF_COOKIE_NAME)
  const csrfHeader = request.headers.get(CSRF_HEADER_NAME)

  if (!csrfCookie || !csrfHeader) {
    return false
  }

  return csrfCookie.value === csrfHeader
}
