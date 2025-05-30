import { cookies } from "next/headers"

export async function getServerSession() {
  const sessionCookie = cookies().get("session")

  if (!sessionCookie) {
    return null
  }

  try {
    const session = JSON.parse(sessionCookie.value)

    // Check if session has expired
    if (session.expiresAt < Date.now()) {
      return null
    }

    return session
  } catch (error) {
    console.error("Error parsing session:", error)
    return null
  }
}
