import { cookies } from "next/headers"
import type { ResponseCookie } from "next/dist/compiled/@edge-runtime/cookies"

// Define constants directly in this file instead of importing them
export const AUTH_COOKIE_NAME = "auth_session"
export const REFRESH_COOKIE_NAME = "refresh_token"
export const DEFAULT_SESSION_EXPIRY = 60 * 60 * 2 // 2 hours in seconds
export const EXTENDED_SESSION_EXPIRY = 60 * 60 * 24 * 7 // 7 days in seconds

type AuthData = {
  userId: string
  email: string
  role: string
  name: string
  expiresAt: number
}

export function setAuthCookie(authData: AuthData, rememberMe = false): void {
  const cookieOptions: Partial<ResponseCookie> = {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    maxAge: rememberMe ? EXTENDED_SESSION_EXPIRY : DEFAULT_SESSION_EXPIRY,
    path: "/",
  }

  cookies().set(AUTH_COOKIE_NAME, JSON.stringify(authData), cookieOptions)
}

export function getAuthCookie(): AuthData | null {
  const cookie = cookies().get(AUTH_COOKIE_NAME)

  if (!cookie) {
    return null
  }

  try {
    const authData = JSON.parse(cookie.value) as AuthData

    // Check if session has expired
    if (authData.expiresAt < Date.now()) {
      return null
    }

    return authData
  } catch (error) {
    console.error("Error parsing auth cookie:", error)
    return null
  }
}

export function removeAuthCookie(): void {
  cookies().delete(AUTH_COOKIE_NAME)
}

export function refreshAuthCookie(authData: AuthData, rememberMe = false): void {
  // Update the expiration time
  const expiryTime = rememberMe
    ? Date.now() + EXTENDED_SESSION_EXPIRY * 1000
    : Date.now() + DEFAULT_SESSION_EXPIRY * 1000

  const updatedAuthData = {
    ...authData,
    expiresAt: expiryTime,
  }

  setAuthCookie(updatedAuthData, rememberMe)
}

export function isSessionExpiringSoon(authData: AuthData): boolean {
  // Check if session will expire in the next 5 minutes
  const fiveMinutesInMs = 5 * 60 * 1000
  return authData.expiresAt - Date.now() < fiveMinutesInMs
}
