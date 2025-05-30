"use client"

import { useState } from "react"
import { Bar, BarChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts"
import { Button } from "@/components/ui/button"
import { format, startOfWeek, endOfWeek, subWeeks, addDays } from "date-fns"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Download } from "lucide-react"

// Mock data for different weeks
const weeklyData = {
  current: [
    { name: "Monday", Present: 22, Absent: 1, Leave: 1 },
    { name: "Tuesday", Present: 21, Absent: 2, Leave: 1 },
    { name: "Wednesday", Present: 23, Absent: 0, Leave: 1 },
    { name: "Thursday", Present: 20, Absent: 3, Leave: 1 },
    { name: "Friday", Present: 21, Absent: 2, Leave: 1 },
  ],
  previous: [
    { name: "Monday", Present: 20, Absent: 3, Leave: 1 },
    { name: "Tuesday", Present: 22, Absent: 1, Leave: 1 },
    { name: "Wednesday", Present: 21, Absent: 2, Leave: 1 },
    { name: "Thursday", Present: 23, Absent: 0, Leave: 1 },
    { name: "Friday", Present: 19, Absent: 4, Leave: 1 },
  ],
  twoWeeksAgo: [
    { name: "Monday", Present: 19, Absent: 4, Leave: 1 },
    { name: "Tuesday", Present: 20, Absent: 3, Leave: 1 },
    { name: "Wednesday", Present: 22, Absent: 1, Leave: 1 },
    { name: "Thursday", Present: 21, Absent: 2, Leave: 1 },
    { name: "Friday", Present: 20, Absent: 3, Leave: 1 },
  ],
  threeWeeksAgo: [
    { name: "Monday", Present: 21, Absent: 2, Leave: 1 },
    { name: "Tuesday", Present: 20, Absent: 3, Leave: 1 },
    { name: "Wednesday", Present: 19, Absent: 4, Leave: 1 },
    { name: "Thursday", Present: 22, Absent: 1, Leave: 1 },
    { name: "Friday", Present: 23, Absent: 0, Leave: 1 },
  ],
}

const monthlyData = [
  { name: "Week 1", Present: 120, Absent: 5, Leave: 3 },
  { name: "Week 2", Present: 118, Absent: 7, Leave: 5 },
  { name: "Week 3", Present: 115, Absent: 8, Leave: 7 },
  { name: "Week 4", Present: 122, Absent: 3, Leave: 5 },
]

// Function to generate mock attendance data for a specific week
function generateWeeklyAttendanceData(weeksAgo) {
  const result = []
  const startDate = subWeeks(new Date(), weeksAgo)
  const weekStart = startOfWeek(startDate, { weekStartsOn: 1 }) // Start on Monday

  const names = [
    "John Doe",
    "Jane Smith",
    "Robert Johnson",
    "Emily Davis",
    "Michael Wilson",
    "Sarah Brown",
    "David Miller",
    "Lisa Anderson",
    "James Taylor",
    "Jennifer Thomas",
  ]

  for (let i = 0; i < names.length; i++) {
    // Generate random attendance for each day of the week
    const weekData = []
    for (let day = 0; day < 5; day++) {
      // Monday to Friday
      const date = addDays(weekStart, day)
      const status = Math.random() > 0.15 ? "Present" : Math.random() > 0.5 ? "Absent" : "Leave"
      const checkIn =
        status === "Present"
          ? `${8 + Math.floor(Math.random() * 2)}:${Math.floor(Math.random() * 60)
              .toString()
              .padStart(2, "0")} AM`
          : "-"
      const checkOut =
        status === "Present"
          ? `${4 + Math.floor(Math.random() * 2)}:${Math.floor(Math.random() * 60)
              .toString()
              .padStart(2, "0")} PM`
          : "-"

      weekData.push({
        date: format(date, "yyyy-MM-dd"),
        day: format(date, "EEEE"),
        checkIn,
        checkOut,
        status,
      })
    }

    result.push({
      id: `EMP00${i + 1}`,
      name: names[i],
      department: ["Engineering", "Marketing", "HR", "Finance", "Operations"][Math.floor(Math.random() * 5)],
      attendance: weekData,
    })
  }

  return result
}

// Mock attendance data for each week
const weeklyAttendanceDetails = {
  current: generateWeeklyAttendanceData(0),
  previous: generateWeeklyAttendanceData(1),
  twoWeeksAgo: generateWeeklyAttendanceData(2),
  threeWeeksAgo: generateWeeklyAttendanceData(3),
}

export function AttendanceChart() {
  const [selectedWeek, setSelectedWeek] = useState<null | "current" | "previous" | "twoWeeksAgo" | "threeWeeksAgo">(
    null,
  )
  const [selectedDay, setSelectedDay] = useState<string | null>(null)
  const [showDetailsDialog, setShowDetailsDialog] = useState(false)
  const [detailsData, setDetailsData] = useState<any>(null)

  const handleWeekClick = (weekIndex: number) => {
    if (weekIndex === 3) {
      setSelectedWeek("current")
    } else if (weekIndex === 2) {
      setSelectedWeek("previous")
    } else if (weekIndex === 1) {
      setSelectedWeek("twoWeeksAgo")
    } else if (weekIndex === 0) {
      setSelectedWeek("threeWeeksAgo")
    }
  }

  const handleBarClick = (data) => {
    if (data && data.activeLabel && selectedWeek) {
      setSelectedDay(data.activeLabel)

      // Prepare the data for the dialog
      const dialogData = {
        week: selectedWeek,
        day: data.activeLabel,
        attendanceData: weeklyAttendanceDetails[selectedWeek],
      }

      setDetailsData(dialogData)
      setShowDetailsDialog(true)
    }
  }

  const getWeekLabel = (weekKey) => {
    const weeksAgo = weekKey === "current" ? 0 : weekKey === "previous" ? 1 : weekKey === "twoWeeksAgo" ? 2 : 3
    const weekStart = startOfWeek(subWeeks(new Date(), weeksAgo), { weekStartsOn: 1 })
    const weekEnd = endOfWeek(weekStart, { weekStartsOn: 1 })
    return `${format(weekStart, "MMM d")} - ${format(weekEnd, "MMM d, yyyy")}`
  }

  const currentWeekStart = startOfWeek(new Date(), { weekStartsOn: 1 })
  const currentWeekEnd = endOfWeek(currentWeekStart, { weekStartsOn: 1 })

  // Function to export attendance data as CSV
  const exportAttendanceData = () => {
    if (!detailsData) return

    // Create CSV header
    let csv = "Employee ID,Name,Department,Check In,Check Out,Status\n"

    // Add data rows
    detailsData.attendanceData.forEach((employee) => {
      const dayData = employee.attendance.find((day) => day.day === detailsData.day)
      if (dayData) {
        csv += `${employee.id},${employee.name},${employee.department},${dayData.checkIn},${dayData.checkOut},${dayData.status}\n`
      }
    })

    // Create a blob and download
    const blob = new Blob([csv], { type: "text/csv" })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.setAttribute("hidden", "")
    a.setAttribute("href", url)
    a.setAttribute("download", `attendance-${detailsData.day}-${getWeekLabel(detailsData.week).replace(/\s/g, "")}.csv`)
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
  }

  if (selectedWeek) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-medium">
            {selectedWeek === "current"
              ? `Current Week (${format(currentWeekStart, "MMM d")} - ${format(currentWeekEnd, "MMM d")})`
              : getWeekLabel(selectedWeek)}
          </h3>
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              setSelectedWeek(null)
              setSelectedDay(null)
            }}
          >
            Back to Monthly View
          </Button>
        </div>

        <ResponsiveContainer width="100%" height={350}>
          <BarChart data={weeklyData[selectedWeek]} onClick={handleBarClick}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey="Present" fill="#16a34a" cursor="pointer" />
            <Bar dataKey="Absent" fill="#dc2626" cursor="pointer" />
            <Bar dataKey="Leave" fill="#ca8a04" cursor="pointer" />
          </BarChart>
        </ResponsiveContainer>

        {/* Attendance Details Dialog */}
        <Dialog open={showDetailsDialog} onOpenChange={setShowDetailsDialog}>
          <DialogContent className="max-w-4xl">
            <DialogHeader>
              <DialogTitle>{detailsData?.day} Attendance Details</DialogTitle>
              <DialogDescription>{detailsData && getWeekLabel(detailsData.week)}</DialogDescription>
            </DialogHeader>

            <div className="max-h-[60vh] overflow-y-auto">
              {detailsData && (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Employee</TableHead>
                      <TableHead>Department</TableHead>
                      <TableHead>Check In</TableHead>
                      <TableHead>Check Out</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {detailsData.attendanceData.map((employee) => {
                      const dayData = employee.attendance.find((day) => day.day === detailsData.day)
                      return (
                        <TableRow key={employee.id}>
                          <TableCell className="font-medium">
                            {employee.name}
                            <div className="text-xs text-muted-foreground">{employee.id}</div>
                          </TableCell>
                          <TableCell>{employee.department}</TableCell>
                          <TableCell>{dayData?.checkIn || "-"}</TableCell>
                          <TableCell>{dayData?.checkOut || "-"}</TableCell>
                          <TableCell>
                            <Badge
                              className={
                                dayData?.status === "Present"
                                  ? "bg-green-100 text-green-800"
                                  : dayData?.status === "Absent"
                                    ? "bg-red-100 text-red-800"
                                    : "bg-yellow-100 text-yellow-800"
                              }
                            >
                              {dayData?.status || "Unknown"}
                            </Badge>
                          </TableCell>
                        </TableRow>
                      )
                    })}
                  </TableBody>
                </Table>
              )}
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setShowDetailsDialog(false)} className="mr-2">
                Close
              </Button>
              <Button onClick={exportAttendanceData} className="bg-steel-blue hover:bg-steel-blue/90">
                <Download className="mr-2 h-4 w-4" />
                Export Report
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    )
  }

  return (
    <ResponsiveContainer width="100%" height={350}>
      <BarChart
        data={monthlyData}
        onClick={(data) => data?.activeTooltipIndex !== undefined && handleWeekClick(data.activeTooltipIndex)}
      >
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="name" />
        <YAxis />
        <Tooltip />
        <Legend />
        <Bar dataKey="Present" fill="#16a34a" cursor="pointer" />
        <Bar dataKey="Absent" fill="#dc2626" cursor="pointer" />
        <Bar dataKey="Leave" fill="#ca8a04" cursor="pointer" />
      </BarChart>
    </ResponsiveContainer>
  )
}
