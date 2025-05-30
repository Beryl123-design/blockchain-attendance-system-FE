"use client"

import { useState, useEffect, useRef } from "react"
import { Shield, X, ChevronDown, AlertTriangle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

interface CybersecurityAwarenessProps {
  className?: string
}

export function CybersecurityAwareness({ className }: CybersecurityAwarenessProps) {
  const [isVisible, setIsVisible] = useState(false)
  const [isMinimized, setIsMinimized] = useState(false)
  const [currentTipIndex, setCurrentTipIndex] = useState(0)
  const [isDismissed, setIsDismissed] = useState(false)
  const timerRef = useRef<NodeJS.Timeout | null>(null)

  const securityTips = [
    "Always lock your computer when you step away from your desk.",
    "Use strong, unique passwords for all your accounts.",
    "Be cautious of suspicious emails and don't click on unknown links.",
    "Keep your software and systems updated with the latest security patches.",
    "Never share your credentials with anyone, even IT support.",
    "Be aware of your surroundings when entering sensitive information.",
    "Report any suspicious activities to the IT security team immediately.",
    "Use two-factor authentication whenever possible.",
    "Avoid using public Wi-Fi for accessing sensitive company information.",
    "Regularly back up your important data.",
  ]

  useEffect(() => {
    // Check if we're on a login page - this is a client-side check
    const isLoginPage =
      window.location.pathname === "/" ||
      window.location.pathname.includes("/login") ||
      window.location.pathname.includes("/sign-in")

    if (isLoginPage) {
      setIsVisible(false)
      return
    }

    // Show the tip after a short delay when the component mounts
    const showTimer = setTimeout(() => {
      // Check if the user has dismissed the tip in the last 24 hours
      const lastDismissed = localStorage.getItem("cybersecurity_dismissed_time")
      if (!lastDismissed || Date.now() - Number.parseInt(lastDismissed) > 24 * 60 * 60 * 1000) {
        setIsVisible(true)
      }
    }, 5000)

    // Rotate through tips every 30 seconds
    const rotationTimer = setInterval(() => {
      setCurrentTipIndex((prevIndex) => (prevIndex + 1) % securityTips.length)
    }, 30000)

    // Auto-hide after 60 seconds if not interacted with
    timerRef.current = setTimeout(() => {
      if (isVisible && !isMinimized) {
        setIsMinimized(true)
      }
    }, 60000)

    return () => {
      clearTimeout(showTimer)
      clearInterval(rotationTimer)
      if (timerRef.current) clearTimeout(timerRef.current)
    }
  }, [isVisible, isMinimized, securityTips.length])

  const handleDismiss = () => {
    setIsDismissed(true)
    setIsVisible(false)
    // Store the current time when dismissed
    localStorage.setItem("cybersecurity_dismissed_time", Date.now().toString())
  }

  const handleToggleMinimize = () => {
    setIsMinimized(!isMinimized)
    // Reset the auto-minimize timer when user interacts
    if (timerRef.current) clearTimeout(timerRef.current)
    if (!isMinimized) {
      timerRef.current = setTimeout(() => {
        setIsMinimized(true)
      }, 60000)
    }
  }

  if (!isVisible || isDismissed) return null

  return (
    <div
      className={cn(
        "fixed transition-all duration-300 ease-in-out z-50",
        isMinimized ? "bottom-4 right-4 w-auto max-w-[300px]" : "bottom-4 right-4 w-full max-w-[400px]",
        className,
      )}
    >
      {isMinimized ? (
        <Button
          onClick={handleToggleMinimize}
          className="flex items-center gap-2 bg-navy text-white hover:bg-navy/90 shadow-lg"
        >
          <Shield className="h-4 w-4" />
          <span className="sr-only md:not-sr-only md:inline">Security Tip</span>
          <Badge variant="outline" className="bg-steel-blue text-white border-white ml-1">
            <AlertTriangle className="h-3 w-3 mr-1" />
            <span className="text-xs">New</span>
          </Badge>
        </Button>
      ) : (
        <Card className="border-steel-blue shadow-lg bg-white/95 backdrop-blur-sm">
          <CardHeader className="flex flex-row items-center justify-between py-3 px-4 bg-navy text-white rounded-t-lg">
            <CardTitle className="text-sm font-medium flex items-center">
              <Shield className="h-4 w-4 mr-2" />
              Cybersecurity Awareness
            </CardTitle>
            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6 text-white hover:bg-navy/80 hover:text-white"
                onClick={handleToggleMinimize}
                aria-label="Minimize"
              >
                <ChevronDown className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6 text-white hover:bg-navy/80 hover:text-white"
                onClick={handleDismiss}
                aria-label="Close"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </CardHeader>
          <CardContent className="p-4">
            <div className="text-sm text-navy">{securityTips[currentTipIndex]}</div>
          </CardContent>
          <CardFooter className="flex justify-between items-center px-4 py-2 bg-gray-50 text-xs text-muted-foreground rounded-b-lg">
            <span>
              Tip {currentTipIndex + 1} of {securityTips.length}
            </span>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                className="h-7 text-xs"
                onClick={() =>
                  setCurrentTipIndex((prevIndex) => (prevIndex - 1 + securityTips.length) % securityTips.length)
                }
              >
                Previous
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="h-7 text-xs"
                onClick={() => setCurrentTipIndex((prevIndex) => (prevIndex + 1) % securityTips.length)}
              >
                Next
              </Button>
            </div>
          </CardFooter>
        </Card>
      )}
    </div>
  )
}
