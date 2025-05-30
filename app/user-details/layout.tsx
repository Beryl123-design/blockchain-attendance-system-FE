import type React from "react"
import { AuthAwareCybersecurityTips } from "@/components/auth-aware-cybersecurity"

export default function UserDetailsLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <>
      {children}
      <AuthAwareCybersecurityTips />
    </>
  )
}
