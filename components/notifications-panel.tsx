"use client"

import { Bell, Calendar, Info, PenToolIcon as Tool, X } from "lucide-react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"

// Mock notifications data
const initialNotifications = [
  {
    id: "1",
    type: "meeting",
    title: "Team Meeting",
    message: "Monthly team meeting tomorrow at 10 AM",
    date: "2024-03-07T10:00:00",
    read: false,
  },
  {
    id: "2",
    type: "maintenance",
    title: "System Maintenance",
    message: "Scheduled maintenance on March 8th from 2 AM to 4 AM",
    date: "2024-03-08T02:00:00",
    read: false,
  },
  {
    id: "3",
    type: "holiday",
    title: "Upcoming Holiday",
    message: "Office will be closed for Spring Festival",
    date: "2024-03-15T00:00:00",
    read: false,
  },
]

export function NotificationsPanel() {
  const [notifications, setNotifications] = useState(initialNotifications)
  const [open, setOpen] = useState(false)

  const unreadCount = notifications.filter((n) => !n.read).length

  const markAsRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((notification) => (notification.id === id ? { ...notification, read: true } : notification)),
    )
  }

  const markAllAsRead = () => {
    setNotifications((prev) => prev.map((notification) => ({ ...notification, read: true })))
  }

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case "meeting":
        return <Calendar className="h-4 w-4" />
      case "maintenance":
        return <Tool className="h-4 w-4" />
      case "holiday":
        return <Info className="h-4 w-4" />
      default:
        return <Bell className="h-4 w-4" />
    }
  }

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="outline" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <Badge variant="destructive" className="absolute -right-2 -top-2 h-5 w-5 rounded-full p-0 text-xs">
              {unreadCount}
            </Badge>
          )}
        </Button>
      </SheetTrigger>
      <SheetContent>
        <SheetHeader className="flex flex-row items-center justify-between">
          <SheetTitle>Notifications</SheetTitle>
          {unreadCount > 0 && (
            <Button variant="ghost" size="sm" onClick={markAllAsRead}>
              Mark all as read
            </Button>
          )}
        </SheetHeader>
        <ScrollArea className="h-[calc(100vh-8rem)] pr-4">
          <div className="mt-4 space-y-4">
            {notifications.map((notification) => (
              <div
                key={notification.id}
                className={`relative rounded-lg border p-4 ${notification.read ? "bg-background" : "bg-muted"}`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-4">
                    <div className="rounded-full bg-primary/10 p-2">{getNotificationIcon(notification.type)}</div>
                    <div>
                      <h4 className="text-sm font-semibold">{notification.title}</h4>
                      <p className="mt-1 text-sm text-muted-foreground">{notification.message}</p>
                      <time className="mt-2 text-xs text-muted-foreground">
                        {new Date(notification.date).toLocaleString()}
                      </time>
                    </div>
                  </div>
                  {!notification.read && (
                    <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => markAsRead(notification.id)}>
                      <X className="h-4 w-4" />
                      <span className="sr-only">Mark as read</span>
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>
      </SheetContent>
    </Sheet>
  )
}

