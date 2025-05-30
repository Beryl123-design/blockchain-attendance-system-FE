import { cookies } from "next/headers"
import { redirect } from "next/navigation"
import { AUTH_COOKIE_NAME } from "@/lib/auth-cookies"
import DashboardWrapper from "@/components/dashboard-wrapper"

export default async function DashboardPage() {
  // Server-side authentication check
  const authCookies = await cookies();
  const authCookie = authCookies.get(AUTH_COOKIE_NAME);

  if (!authCookie) {
    redirect("/")
  }

  try {
    const session = JSON.parse(authCookie.value)

    if (!session || !session.userId || session.expiresAt < Date.now()) {
      redirect("/")
    }

    // Determine which dashboard to show based on user role
    const userRole = session.role
    const userName = session.name
    const userEmail = session.email

    return <DashboardWrapper userRole={userRole} userName={userName} userEmail={userEmail} />
  } catch (error) {
    console.error("Error parsing auth cookie:", error)
    redirect("/")
  }
}
