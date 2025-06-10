"use client"

import { useState, useEffect } from "react"
import { format, parseISO } from "date-fns"
import { Calendar, Clock, Coffee, AlertCircle } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {getAttendanceRecords} from "@/lib/api-client"
// import { redirect } from "next/dist/server/api-utils"

import { redirect } from "next/navigation"
import { log } from "console"
interface AttendanceRecord {
  id: string
  userId: string
  date: string
  checkIn: string
  checkOut: string | null
  status?: "in" | "out" | "break" | "overtime"
  totalBreakTime: number
  totalWorkTime: number
  overtime: number
  blockchainHash: string
  location: string
  verified: boolean
}

export function AttendanceHistory() {
  const [attendanceRecords, setAttendanceRecords] = useState<AttendanceRecord[]>([])
  const [filter, setFilter] = useState("all")

  useEffect(() => {
    // Load attendance records from localStorage
    (async () => {
    const storedUser = localStorage.getItem("user")
    console.log(storedUser);
    
    const user = storedUser ? JSON.parse(storedUser) : ""
    console.log(user);
    
    if (!user?.id) {
      console.log("User not found")
      redirect("/")
      return
    }

    const storedRecords = await getAttendanceRecords(user.id)
    setAttendanceRecords(storedRecords)
  })()

    // Set up an interval to refresh the data every 30 seconds
    const intervalId = setInterval(() => {
      const refreshedRecords = JSON.parse(localStorage.getItem("attendanceHistory") || "[]")
      setAttendanceRecords(refreshedRecords)
    }, 30000)

    return () => clearInterval(intervalId)
  }, [])

  const formatDuration = (seconds: number): string => {
    if (!seconds) return "-"
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    return `${hours}h ${minutes}m`
  }

  const formatTime = (isoString: string | null): string => {
    if (!isoString) return "-"
    try {
      return format(parseISO(isoString), "h:mm:ss a")
    } catch (e) {
      return "-"
    }
  }

  const getStatusBadge = (record: AttendanceRecord) => {
    // For completed records
    // if (record.status === "Completed") {
    //   return <Badge className="bg-green-100 text-green-800">Completed</Badge>
    // }

    // For in-progress records
    switch (record.status) {
      case "in":
        return <Badge className="bg-blue-100 text-blue-800">Checked In</Badge>
      case "break":
        return <Badge className="bg-yellow-100 text-yellow-800">On Break</Badge>
      case "overtime":
        return <Badge className="bg-purple-100 text-purple-800">Overtime</Badge>
      default:
        return <Badge className="bg-gray-100 text-gray-800">Unknown</Badge>
    }
  }

  const getStatusIcon = (record: AttendanceRecord) => {
    // if (record.status === "Completed") {
    //   return <Clock className="mr-2 h-4 w-4 text-green-600" />
    // }

    switch (record.status) {
      case "in":
        return <Clock className="mr-2 h-4 w-4 text-blue-600" />
      case "break":
        return <Coffee className="mr-2 h-4 w-4 text-yellow-600" />
      case "overtime":
        return <AlertCircle className="mr-2 h-4 w-4 text-purple-600" />
      default:
        return <Clock className="mr-2 h-4 w-4 text-gray-600" />
    }
  }

  // Filter records based on selected filter
  const filteredRecords = attendanceRecords.filter((record) => {
    if (filter === "all") return true
    if (filter === "today") {
      const today = new Date().toISOString().split("T")[0]
      return record.date === today
    }
    if (filter === "week") {
      const oneWeekAgo = new Date()
      oneWeekAgo.setDate(oneWeekAgo.getDate() - 7)
      const recordDate = new Date(record.date)
      return recordDate >= oneWeekAgo
    }
    if (filter === "month") {
      const oneMonthAgo = new Date()
      oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1)
      const recordDate = new Date(record.date)
      return recordDate >= oneMonthAgo
    }
    return true
  })

  return (
    <Card className="border-steel-blue">
      <CardHeader>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
          <div>
            <CardTitle className="text-navy">My Attendance</CardTitle>
            <CardDescription>Track your attendance history</CardDescription>
          </div>
          <Select value={filter} onValueChange={setFilter} /*className="mt-2 sm:mt-0 sm:w-[150px]"*/>
            <SelectTrigger>
              <SelectValue placeholder="Filter" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Time</SelectItem>
              <SelectItem value="today">Today</SelectItem>
              <SelectItem value="week">This Week</SelectItem>
              <SelectItem value="month">This Month</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardHeader>
      <CardContent>
        {filteredRecords.length > 0 ? (
          <div className="rounded-md border border-steel-blue/30">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Check In</TableHead>
                  <TableHead>Check Out</TableHead>
                  <TableHead>Break Time</TableHead>
                  <TableHead>Overtime</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredRecords.map((record) => (
                  <TableRow key={record.id}>
                    <TableCell>
                      <div className="flex items-center">
                        <Calendar className="mr-2 h-4 w-4 text-muted-foreground" />
                        {format(new Date(record.date), "MMM dd, yyyy")}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center">
                        <Clock className="mr-2 h-4 w-4 text-green-600" />
                        {formatTime(record.checkIn)}
                      </div>
                    </TableCell>
                    <TableCell>
                      {record.checkOut ? (
                        <div className="flex items-center">
                          <Clock className="mr-2 h-4 w-4 text-red-600" />
                          {formatTime(record.checkOut)}
                        </div>
                      ) : (
                        "-"
                      )}
                    </TableCell>
                    <TableCell>{formatDuration(record.totalBreakTime)}</TableCell>
                    <TableCell>{formatDuration(record.overtime)}</TableCell>
                    <TableCell>
                      <div className="flex items-center">
                        {getStatusIcon(record)}
                        {getStatusBadge(record)}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        ) : (
          <div className="flex h-[200px] items-center justify-center rounded-md border border-dashed border-steel-blue/30">
            <div className="text-center">
              <Clock className="mx-auto h-10 w-10 text-muted-foreground" />
              <h3 className="mt-2 text-lg font-medium text-navy">No attendance records</h3>
              <p className="text-sm text-muted-foreground">
                Your attendance history will appear here once you check in.
              </p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
