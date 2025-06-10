"use client"

import { useState, useEffect } from "react"
import { CalendarIcon, Download } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { cn } from "@/lib/utils"
import { format } from "date-fns"
import { toast } from "@/components/ui/use-toast"
import { Toaster } from "@/components/ui/toaster"

import { redirect } from "next/navigation"

// Mock data for attendance report
const initialAttendanceData = [
  {
    id: "1",
    name: "John Doe",
    date: "2024-03-01",
    checkIn: "09:05 AM",
    checkOut: "05:15 PM",
    status: "Present",
  },
  {
    id: "2",
    name: "Jane Smith",
    date: "2024-03-01",
    checkIn: "08:55 AM",
    checkOut: "05:30 PM",
    status: "Present",
  },
  {
    id: "3",
    name: "Robert Johnson",
    date: "2024-03-01",
    checkIn: "09:20 AM",
    checkOut: "05:10 PM",
    status: "Present",
  },
  {
    id: "4",
    name: "Emily Davis",
    date: "2024-03-01",
    checkIn: "-",
    checkOut: "-",
    status: "Absent",
  },
  {
    id: "5",
    name: "Michael Wilson",
    date: "2024-03-01",
    checkIn: "-",
    checkOut: "-",
    status: "Leave",
  },
]

export function AttendanceReport() {
  const [date, setDate] = useState<Date | undefined>(new Date())
  const [department, setDepartment] = useState<string>("all")
  const [attendanceData, setAttendanceData] = useState(initialAttendanceData)

  // In a real app, this would fetch from an API or blockchain
  useEffect(() => {
    // Check if there's any attendance data in localStorage
    // const storedRecords = JSON.parse(localStorage.getItem("attendanceHistory") || "[]")

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
    
        const response = await fetch("http://localhost:3001/attendance")

        const storedRecords = await response.json()
        console.log(storedRecords)
        // setAttendanceRecords(storedRecords)
      

    if (storedRecords.length > 0) {
      // Format the stored records to match our attendance data structure
      const formattedRecords = storedRecords.map((record: any, index: number) => {
        const checkInTime = record.checkIn
          ? new Date(record.checkIn).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
          : "-"
        const checkOutTime = record.checkOut
          ? new Date(record.checkOut).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
          : "-"

        return {
          id: (index + 6).toString(), // Start IDs after our mock data
          name: "John Doe", // In a real app, this would come from user data
          date: record.date,
          checkIn: checkInTime,
          checkOut: checkOutTime,
          status: record.checkOut ? "Present" : "In Progress",
        }
      })

      // Combine with our initial data
      setAttendanceData([...initialAttendanceData, ...formattedRecords])
    }}
  )()
  }, [])

  const filteredData = attendanceData.filter((record) => {
    // Filter by department if not "all"
    if (department !== "all" && department !== "engineering") {
      return false
    }

    // Filter by date if selected
    if (date) {
      const recordDate = new Date(record.date)
      const selectedDate = new Date(date)
      return (
        recordDate.getFullYear() === selectedDate.getFullYear() &&
        recordDate.getMonth() === selectedDate.getMonth() &&
        recordDate.getDate() === selectedDate.getDate()
      )
    }

    return true
  })

  // Function to export attendance data as CSV
  const exportAttendanceData = () => {
    // Create CSV header
    let csv = "Name,Date,Check In,Check Out,Status\n"

    // Add data rows
    filteredData.forEach((record) => {
      csv += `"${record.name}","${record.date}","${record.checkIn}","${record.checkOut}","${record.status}"\n`
    })

    // Create a blob and download link
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" })
    const url = URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.setAttribute("href", url)
    link.setAttribute("download", `attendance_report_${date ? format(date, "yyyy-MM-dd") : "all"}.csv`)
    link.style.visibility = "hidden"
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)

    toast({
      title: "Report Exported",
      description: "Attendance report has been exported successfully.",
    })
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Attendance Report</CardTitle>
        <CardDescription>View and export attendance records</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col gap-4 md:flex-row md:items-end">
          <div className="space-y-2">
            <div className="text-sm font-medium">Date</div>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal md:w-[240px]",
                    !date && "text-muted-foreground",
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {date ? format(date, "PPP") : <span>Pick a date</span>}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar mode="single" selected={date} onSelect={setDate} initialFocus />
              </PopoverContent>
            </Popover>
          </div>
          <div className="space-y-2">
            <div className="text-sm font-medium">Department</div>
            <Select value={department} onValueChange={setDepartment}>
              <SelectTrigger className="w-full md:w-[240px]">
                <SelectValue placeholder="Select department" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Departments</SelectItem>
                <SelectItem value="engineering">Engineering</SelectItem>
                <SelectItem value="marketing">Marketing</SelectItem>
                <SelectItem value="finance">Finance</SelectItem>
                <SelectItem value="hr">Human Resources</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <Button className="mt-4 md:mt-0" onClick={exportAttendanceData}>
            <Download className="mr-2 h-4 w-4" />
            Export Report
          </Button>
        </div>
        <div className="mt-6 rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Check In</TableHead>
                <TableHead>Check Out</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredData.map((record) => (
                <TableRow key={record.id}>
                  <TableCell className="font-medium">{record.name}</TableCell>
                  <TableCell>{record.date}</TableCell>
                  <TableCell>{record.checkIn}</TableCell>
                  <TableCell>{record.checkOut}</TableCell>
                  <TableCell>
                    <span
                      className={cn(
                        "inline-flex rounded-full px-2 py-1 text-xs font-medium",
                        record.status === "Present" && "bg-green-100 text-green-800",
                        record.status === "Absent" && "bg-red-100 text-red-800",
                        record.status === "Leave" && "bg-yellow-100 text-yellow-800",
                        record.status === "In Progress" && "bg-blue-100 text-blue-800",
                      )}
                    >
                      {record.status}
                    </span>
                  </TableCell>
                </TableRow>
              ))}
              {filteredData.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5} className="h-24 text-center">
                    No attendance records found for the selected filters.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
      <Toaster />
    </Card>
  )
}
