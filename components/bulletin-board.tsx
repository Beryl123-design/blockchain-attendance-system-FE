"use client"

import { useState, useEffect } from "react"
import { ChevronLeft, ChevronRight, Shield, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

// Mock bulletin data
const bulletinData = {
  title: "Cybersecurity Awareness",
  description: "Important security tips and updates",
  posts: [
    {
      id: "1",
      title: "Protect Your Password",
      content:
        "Always use strong passwords with a mix of letters, numbers, and special characters. Never share your passwords with anyone.",
      date: "2024-03-05",
    },
    {
      id: "2",
      title: "Beware of Phishing",
      content: "Be cautious of suspicious emails asking for your credentials. Always verify the sender's address.",
      date: "2024-03-04",
    },
    {
      id: "3",
      title: "Two-Factor Authentication",
      content: "Enable two-factor authentication whenever possible for an extra layer of security.",
      date: "2024-03-03",
    },
  ],
}

export function BulletinBoard() {
  const [isVisible, setIsVisible] = useState(false)
  const [hasBeenShown, setHasBeenShown] = useState(false)
  const [currentPostIndex, setCurrentPostIndex] = useState(0)

  // Show the bulletin board after a delay if it hasn't been shown yet
  useEffect(() => {
    if (!hasBeenShown) {
      const timer = setTimeout(() => {
        setIsVisible(true)
        setHasBeenShown(true)
      }, 2000)

      return () => clearTimeout(timer)
    }
  }, [hasBeenShown])

  // Auto-rotate through posts every 30 seconds
  useEffect(() => {
    if (isVisible) {
      const interval = setInterval(() => {
        setCurrentPostIndex((prevIndex) => (prevIndex + 1) % bulletinData.posts.length)
      }, 30000) // 30 seconds

      return () => clearInterval(interval)
    }
  }, [isVisible])

  const nextPost = () => {
    setCurrentPostIndex((prevIndex) => (prevIndex + 1) % bulletinData.posts.length)
  }

  const prevPost = () => {
    setCurrentPostIndex((prevIndex) => (prevIndex === 0 ? bulletinData.posts.length - 1 : prevIndex - 1))
  }

  if (!isVisible) return null

  const currentPost = bulletinData.posts[currentPostIndex]

  return (
    <div className="fixed bottom-4 right-4 z-50 w-96 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <div className="flex items-center space-x-2">
            <Shield className="h-4 w-4 text-primary" />
            <CardTitle className="text-lg">{bulletinData.title}</CardTitle>
          </div>
          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setIsVisible(false)}>
            <X className="h-4 w-4" />
            <span className="sr-only">Close</span>
          </Button>
        </CardHeader>
        <CardDescription className="px-6">{bulletinData.description}</CardDescription>
        <CardContent>
          <div className="rounded-lg border p-4">
            <h4 className="font-semibold">{currentPost.title}</h4>
            <p className="mt-2 text-sm text-muted-foreground">{currentPost.content}</p>
            <time className="mt-2 block text-xs text-muted-foreground">
              {new Date(currentPost.date).toLocaleDateString()}
            </time>
          </div>

          <div className="mt-4 flex items-center justify-between">
            <div className="text-xs text-muted-foreground">
              {currentPostIndex + 1} of {bulletinData.posts.length}
            </div>
            <div className="flex space-x-2">
              <Button variant="outline" size="icon" className="h-8 w-8" onClick={prevPost}>
                <ChevronLeft className="h-4 w-4" />
                <span className="sr-only">Previous</span>
              </Button>
              <Button variant="outline" size="icon" className="h-8 w-8" onClick={nextPost}>
                <ChevronRight className="h-4 w-4" />
                <span className="sr-only">Next</span>
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

