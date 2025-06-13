"use client"

import { useState, useEffect } from "react"
import { Clock, Coffee, LogOut, StopCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogTrigger,
} from "@/components/ui/dialog"
import { cn } from "@/lib/utils"
import { toast } from "@/components/ui/use-toast"
import { getAttendanceRecords, recordAttendance, checkoutAttendance } from "@/lib/api-client"

interface TimeTrackingProps {
  employeeRole: "executive" | "department_head" | "employee"
}

export function TimeTracking({ employeeRole }: TimeTrackingProps) {
  const [status, setStatus] = useState<"out" | "in" | "break" | "overtime">("out")
  const [checkInTime, setCheckInTime] = useState<Date | null>(null)
  const [checkOutTime, setCheckOutTime] = useState<Date | null>(null)
  const [breakStartTime, setBreakStartTime] = useState<Date | null>(null)
  const [totalBreakTime, setTotalBreakTime] = useState(0)
  const [overtimeStartTime, setOvertimeStartTime] = useState<Date | null>(null)
  const [elapsedTime, setElapsedTime] = useState(0)
  const [breakTimeLeft, setBreakTimeLeft] = useState(3600) // 1 hour in seconds
  const [showBreakWarning, setShowBreakWarning] = useState(false)
  const [currentRecordId, setCurrentRecordId] = useState<string | null>(null)

  // Get user info from localStorage
  const userEmail = localStorage.getItem("userEmail") || ""
  const userName = localStorage.getItem("userName") || ""
  const userDepartment = localStorage.getItem("userDepartment") || ""
  const userJobTitle = localStorage.getItem("userJobTitle") || ""
  const user = localStorage.getItem("user") || ""

  // Grace period in minutes based on role
  const gracePeriodsInMinutes = {
    executive: 30,
    department_head: 30,
    employee: 15,
  }

  // Check if there's an ongoing session when component mounts
  useEffect(() => {
    const fetchAttendanceData = async () => {
      try {
        // Get today's date in YYYY-MM-DD format
        const today = new Date().toISOString().split("T")[0]

        // Fetch attendance records for today
        const storedUser = localStorage.getItem("user")
        if (!storedUser) {
        toast({
          title: "User not found",
          description: "Please login again.",
          variant: "destructive",
        })
        return
      }
        const parsedUser = JSON.parse(storedUser)
        const userId = parsedUser.id
        const response = await getAttendanceRecords(userId, today)

        if (response.records && response.records.length > 0) {
          // Find an in-progress record
          const ongoingRecord = response.records.find((record: any) => !record.checkOut)

          if (ongoingRecord) {
            setCurrentRecordId(ongoingRecord.id)
            setCheckInTime(new Date(ongoingRecord.checkIn))
            setStatus(
              ongoingRecord.status === "break" ? "break" : ongoingRecord.status === "overtime" ? "overtime" : "in",
            )

            if (ongoingRecord.breakStartTime) {
              setBreakStartTime(new Date(ongoingRecord.breakStartTime))
            }

            if (ongoingRecord.totalBreakTime) {
              setTotalBreakTime(ongoingRecord.totalBreakTime)
            }

            if (ongoingRecord.overtimeStartTime) {
              setOvertimeStartTime(new Date(ongoingRecord.overtimeStartTime))
            }
          }
        }
      } catch (error) {
        console.error("Error fetching attendance data:", error)
        toast({
          title: "Error",
          description: "Failed to load attendance data. Please refresh the page.",
          variant: "destructive",
        })
      }
    }

    
    fetchAttendanceData()
  }, [])

  useEffect(() => {
    let timer: NodeJS.Timeout

   
    if (status === "in" || status === "overtime") {
      timer = setInterval(() => {
        if (checkInTime) {
          const now = new Date()
          const elapsed = Math.floor((now.getTime() - checkInTime.getTime()) / 1000)
          setElapsedTime(elapsed)

          // Check for automatic overtime after 8 hours (28800 seconds) or after 5pm
          if (status !== "overtime") {
            // Get settings for work hours
            const workEndTime = "17:00" // Default to 5pm

            // Parse the end time
            const [endHour, endMinute] = workEndTime.split(":").map(Number)

            // Check if current time is after work end time
            const currentHour = now.getHours()
            const currentMinute = now.getMinutes()

            if (
              (currentHour > endHour || (currentHour === endHour && currentMinute >= endMinute)) &&
              now.getDate() === checkInTime.getDate()
            ) {
              handleStartOvertime()
            }
            // Also keep the 8-hour check as a fallback
            else if (elapsed >= 28800) {
              handleStartOvertime()
            }
          }
        }
      }, 1000)
    } else if (status === "break" && breakStartTime) {
      timer = setInterval(() => {
        const now = new Date()
        const breakElapsed = Math.floor((now.getTime() - breakStartTime.getTime()) / 1000)
        const timeLeft = 3600 - breakElapsed - totalBreakTime
        setBreakTimeLeft(timeLeft)

        // Show warning when break time is almost up
        if (timeLeft <= 300 && !showBreakWarning) {
          // 5 minutes warning
          setShowBreakWarning(true)
        }

        // Check if break time exceeded grace period
        const graceSeconds = gracePeriodsInMinutes[employeeRole] * 60
        if (timeLeft < -graceSeconds) {
          handleBreakEnd()
        }
      }, 1000)
    }

    return () => clearInterval(timer)
  }, [status, checkInTime, breakStartTime, totalBreakTime, employeeRole, showBreakWarning])

  const formatTime = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    const secs = seconds % 60
    return `${hours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`
  }

  const formatDateTime = (date: Date | null): string => {
    if (!date) return "-"
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" })
  }

  const handleCheckIn = async () => {
  try {
    const now = new Date();

    // Parse user info from localStorage
    const storedUser = localStorage.getItem("user");
    if (!storedUser) {
      toast({
        title: "User not found",
        description: "Please login again.",
        variant: "destructive",
      });
      return;
    }

    const parsedUser = JSON.parse(storedUser);
    const userId = Number(parsedUser.id); // Ensure it's a number for backend

    // Create attendance record in the backend
    const response = await recordAttendance({
      userId,
      date: now.toISOString().split("T")[0], // "YYYY-MM-DD"
      checkIn: now.toISOString(),
      status: "in",
    });

    // Update local state
    setStatus("in");
    setCheckInTime(now);
    setElapsedTime(0);
    setTotalBreakTime(0);
    setCurrentRecordId(response.id); // assuming response contains { id }

    toast({
      title: "Checked In",
      description: `You have successfully checked in at ${formatDateTime(now)}.`,
    });
  } catch (error) {
    console.error("Check-in error:", error);
    toast({
      title: "Check-in Failed",
      description: "Failed to record check-in. Please try again.",
      variant: "destructive",
    });
  }
};

  const handleCheckOut = async () => {
    if (!user) return

    try {
      const now = new Date()
      const parseUser = JSON.parse(user)

      // Calculate overtime if applicable
      let overtimeDuration = 0
      if (overtimeStartTime) {
        overtimeDuration = Math.floor((now.getTime() - overtimeStartTime.getTime()) / 1000)
      }

      // Update attendance record in the backend
      await checkoutAttendance({
        id: parseUser.id,
        checkOut: now.toISOString(),
        totalBreakTime,
        overtime: overtimeDuration,
        status: "out",
      })

      // Update local state
      setStatus("out")
      setCheckOutTime(now)
      setOvertimeStartTime(null)
      setCurrentRecordId(null)

      toast({
        title: "Checked Out",
        description: `You have successfully checked out at ${formatDateTime(now)}.`,
      })
    } catch (error) {
      console.error("Check-out error:", error)
      toast({
        title: "Check-out Failed",
        description: "Failed to record check-out. Please try again.",
        variant: "destructive",
      })
    }
  }

  const handleBreakStart = async () => {
    if (!currentRecordId) return

    try {
      const now = new Date()

      // Update attendance record in the backend
      await recordAttendance({
        id: currentRecordId,
        status: "break",
        breakStartTime: now.toISOString(),
      })

      // Update local state
      setStatus("break")
      setBreakStartTime(now)
      setShowBreakWarning(false)

      toast({
        title: "Break Started",
        description: `Your break started at ${formatDateTime(now)}.`,
      })
    } catch (error) {
      console.error("Break start error:", error)
      toast({
        title: "Failed to Start Break",
        description: "Failed to record break start. Please try again.",
        variant: "destructive",
      })
    }
  }

  const handleBreakEnd = async () => {
    if (!currentRecordId || !breakStartTime) return

    try {
      const now = new Date()
      const breakDuration = Math.floor((now.getTime() - breakStartTime.getTime()) / 1000)
      const newTotalBreakTime = totalBreakTime + breakDuration

      // Update attendance record in the backend
      await recordAttendance({
        id: currentRecordId,
        status: "in",
        totalBreakTime: newTotalBreakTime,
      })

      // Update local state
      setStatus("in")
      setTotalBreakTime(newTotalBreakTime)
      setBreakStartTime(null)
      setShowBreakWarning(false)

      toast({
        title: "Break Ended",
        description: `Your break has ended.`,
      })
    } catch (error) {
      console.error("Break end error:", error)
      toast({
        title: "Failed to End Break",
        description: "Failed to record break end. Please try again.",
        variant: "destructive",
      })
    }
  }

  const handleStartOvertime = async () => {
    if (!currentRecordId) return

    try {
      const now = new Date()

      // Update attendance record in the backend
      // await recordOvertime({
      //   id: currentRecordId,
      //   status: "overtime",
      //   overtimeStartTime: now.toISOString(),
      // })

      // Update local state
      setStatus("overtime")
      setOvertimeStartTime(now)

      toast({
        title: "Overtime Started",
        description: `Your overtime started at ${formatDateTime(now)}.`,
      })
    } catch (error) {
      console.error("Overtime start error:", error)
      toast({
        title: "Failed to Start Overtime",
        description: "Failed to record overtime start. Please try again.",
        variant: "destructive",
      })
    }
  }

  const getStatusBadge = () => {
    switch (status) {
      case "in":
        return <Badge className="bg-green-100 text-green-800">Checked In</Badge>
      case "break":
        return <Badge className="bg-yellow-100 text-yellow-800">On Break</Badge>
      case "overtime":
        return <Badge className="bg-purple-100 text-purple-800">Overtime</Badge>
      default:
        return <Badge className="bg-red-100 text-red-800">Checked Out</Badge>
    }
  }

  return (
    <Card className="border-steel-blue">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-navy">Time Tracking</CardTitle>
            <CardDescription>
              {new Date().toLocaleDateString("en-US", {
                weekday: "long",
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </CardDescription>
          </div>
          {getStatusBadge()}
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Time display section */}
          <div className="grid grid-cols-2 gap-4 rounded-lg border border-steel-blue/30 p-4">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Check-in Time</p>
              <p className="text-lg font-bold text-navy">{formatDateTime(checkInTime)}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Check-out Time</p>
              <p className="text-lg font-bold text-navy">{formatDateTime(checkOutTime)}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Elapsed Time</p>
              <p className="text-lg font-bold text-navy">{status !== "out" ? formatTime(elapsedTime) : "-"}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Break Time Used</p>
              <p className="text-lg font-bold text-navy">{status !== "out" ? formatTime(totalBreakTime) : "-"}</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            {status === "out" ? (
              <Button
                className="col-span-2 bg-steel-blue hover:bg-steel-blue/90"
                onClick={handleCheckIn}
                aria-label="Check in to work"
              >
                <Clock className="mr-2 h-4 w-4" />
                Check In
              </Button>
            ) : (
              <>
                <Button
                  variant="outline"
                  onClick={handleBreakStart}
                  disabled={status === "break" || totalBreakTime >= 3600}
                  className={cn(
                    "relative border-steel-blue text-steel-blue hover:bg-steel-blue/10",
                    breakTimeLeft < 0 && "border-red-500 text-red-600 hover:bg-red-50",
                  )}
                  aria-label={status === "break" ? "Currently on break" : "Take a break"}
                >
                  <Coffee className="mr-2 h-4 w-4" />
                  {status === "break" ? "On Break" : "Take Break"}
                  {breakTimeLeft < 0 && (
                    <span className="absolute -top-2 -right-2 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] text-white">
                      !
                    </span>
                  )}
                </Button>
                {status === "break" ? (
                  <Button
                    variant="outline"
                    onClick={handleBreakEnd}
                    className="border-steel-blue text-steel-blue hover:bg-steel-blue/10"
                  >
                    <StopCircle className="mr-2 h-4 w-4" />
                    End Break
                  </Button>
                ) : status === "overtime" ? (
                  <Button variant="destructive" onClick={handleCheckOut}>
                    <LogOut className="mr-2 h-4 w-4" />
                    End OT
                  </Button>
                ) : (
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button variant="destructive">
                        <LogOut className="mr-2 h-4 w-4" />
                        Check Out
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Confirm Check Out</DialogTitle>
                        <DialogDescription>
                          Are you sure you want to check out?
                          {elapsedTime >= 28800 && " You've completed your 8-hour shift."}
                        </DialogDescription>
                      </DialogHeader>
                      <DialogFooter className="flex justify-between">
                        <Button
                          variant="outline"
                          onClick={handleStartOvertime}
                          className="bg-purple-50 text-purple-700 hover:bg-purple-100"
                        >
                          Start Overtime
                        </Button>
                        <Button variant="destructive" onClick={handleCheckOut}>
                          Confirm Check Out
                        </Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                )}
              </>
            )}
          </div>

          {status !== "out" && (
            <div className="space-y-4">
              {status === "break" && (
                <div
                  className={cn(
                    "rounded-lg p-4",
                    breakTimeLeft < 300 ? "bg-yellow-50" : "bg-blue-50",
                    breakTimeLeft < 0 ? "bg-red-50" : "",
                  )}
                >
                  <h4
                    className={cn(
                      "text-sm font-medium",
                      breakTimeLeft < 300 ? "text-yellow-900" : "text-blue-900",
                      breakTimeLeft < 0 ? "text-red-900" : "",
                    )}
                  >
                    Break Time Status
                  </h4>
                  <p
                    className={cn(
                      "text-xs",
                      breakTimeLeft < 300 ? "text-yellow-700" : "text-blue-700",
                      breakTimeLeft < 0 ? "text-red-700" : "",
                    )}
                  >
                    {breakTimeLeft > 0
                      ? `Time remaining: ${formatTime(breakTimeLeft)}`
                      : `Grace period exceeded by ${formatTime(Math.abs(breakTimeLeft))}`}
                  </p>
                  {breakTimeLeft < 300 && breakTimeLeft > 0 && (
                    <p className="mt-1 text-xs text-yellow-700">
                      Warning: Break time ending soon. Grace period: {gracePeriodsInMinutes[employeeRole]} minutes
                    </p>
                  )}
                </div>
              )}

              {status === "overtime" && overtimeStartTime && (
                <div className="rounded-lg bg-purple-50 p-4">
                  <h4 className="text-sm font-medium text-purple-900">Overtime</h4>
                  <p className="text-xs text-purple-700">
                    Started at: {overtimeStartTime.toLocaleTimeString()}
                    <br />
                    Duration: {formatTime(Math.floor((new Date().getTime() - overtimeStartTime.getTime()) / 1000))}
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
