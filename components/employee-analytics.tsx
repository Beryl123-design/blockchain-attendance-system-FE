"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts"
import { Clock, Calendar, TrendingUp } from "lucide-react"

interface AttendanceRecord {
  id: string
  employeeId: string
  employeeName: string
  date: string
  checkIn: string
  checkOut: string | null
  currentStatus?: "in" | "out" | "break" | "overtime"
  totalBreakTime: number
  overtime: number
  status: "In Progress" | "Completed"
}

export function EmployeeAnalytics() {
  const [attendanceRecords, setAttendanceRecords] = useState<AttendanceRecord[]>([])

  // Fetch attendance data from localStorage
  useEffect(() => {
    const storedRecords = JSON.parse(localStorage.getItem("attendanceHistory") || "[]")
    setAttendanceRecords(storedRecords)
  }, [])

  // Generate weekly attendance data
  const generateWeeklyData = () => {
    const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]
    return days.map((day) => {
      // In a real app, filter records for this day
      // For demo, generate random data
      return {
        day,
        workHours: 7 + Math.random() * 3,
        breakTime: Math.random() * 60,
      }
    })
  }

  // Generate monthly attendance data
  const generateMonthlyData = () => {
    return Array.from({ length: 4 }, (_, i) => ({
      week: `Week ${i + 1}`,
      onTime: Math.floor(Math.random() * 3) + 3,
      late: Math.floor(Math.random() * 2),
      absent: Math.floor(Math.random() * 1),
    }))
  }

  // Calculate metrics from real data
  const calculateMetrics = () => {
    if (attendanceRecords.length === 0) {
      return {
        totalDays: 0,
        avgWorkHours: 0,
        avgBreakTime: 0,
        overtimeDays: 0,
      }
    }

    const completedRecords = attendanceRecords.filter((r) => r.status === "Completed")
    const totalWorkTime = completedRecords.reduce((sum, record) => {
      if (!record.checkIn || !record.checkOut) return sum
      const checkIn = new Date(record.checkIn).getTime()
      const checkOut = new Date(record.checkOut).getTime()
      const workTime = (checkOut - checkIn) / 1000 // in seconds
      return sum + workTime - (record.totalBreakTime || 0)
    }, 0)

    const totalBreakTime = completedRecords.reduce((sum, record) => sum + (record.totalBreakTime || 0), 0)
    const overtimeDays = completedRecords.filter((r) => r.overtime > 0).length

    return {
      totalDays: completedRecords.length,
      avgWorkHours: completedRecords.length
        ? Math.round((totalWorkTime / completedRecords.length / 3600) * 10) / 10
        : 0,
      avgBreakTime: completedRecords.length ? Math.round(totalBreakTime / completedRecords.length / 60) : 0,
      overtimeDays,
    }
  }

  const metrics = calculateMetrics()
  const weeklyData = generateWeeklyData()
  const monthlyData = generateMonthlyData()

  return (
    <Card className="border-steel-blue">
      <CardHeader>
        <CardTitle className="text-navy">My Attendance Analytics</CardTitle>
        <CardDescription>Personal attendance patterns and statistics</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Key Metrics */}
        <div className="grid gap-4 md:grid-cols-4">
          <div className="rounded-lg border border-steel-blue/30 p-4">
            <div className="flex items-center">
              <Calendar className="mr-2 h-5 w-5 text-steel-blue" />
              <h3 className="font-medium text-navy">Total Days</h3>
            </div>
            <p className="mt-2 text-2xl font-bold text-navy">{metrics.totalDays}</p>
            <p className="text-xs text-muted-foreground">Days recorded</p>
          </div>

          <div className="rounded-lg border border-steel-blue/30 p-4">
            <div className="flex items-center">
              <Clock className="mr-2 h-5 w-5 text-steel-blue" />
              <h3 className="font-medium text-navy">Avg. Work Hours</h3>
            </div>
            <p className="mt-2 text-2xl font-bold text-navy">{metrics.avgWorkHours}h</p>
            <p className="text-xs text-muted-foreground">Per day</p>
          </div>

          <div className="rounded-lg border border-steel-blue/30 p-4">
            <div className="flex items-center">
              <Clock className="mr-2 h-5 w-5 text-steel-blue" />
              <h3 className="font-medium text-navy">Avg. Break Time</h3>
            </div>
            <p className="mt-2 text-2xl font-bold text-navy">{metrics.avgBreakTime} min</p>
            <p className="text-xs text-muted-foreground">Per day</p>
          </div>

          <div className="rounded-lg border border-steel-blue/30 p-4">
            <div className="flex items-center">
              <TrendingUp className="mr-2 h-5 w-5 text-steel-blue" />
              <h3 className="font-medium text-navy">Overtime Days</h3>
            </div>
            <p className="mt-2 text-2xl font-bold text-navy">{metrics.overtimeDays}</p>
            <p className="text-xs text-muted-foreground">Total days with overtime</p>
          </div>
        </div>

        {/* Charts */}
        <Tabs defaultValue="weekly" className="space-y-4">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="weekly" className="data-[state=active]:bg-steel-blue data-[state=active]:text-white">
              Weekly Analysis
            </TabsTrigger>
            <TabsTrigger value="monthly" className="data-[state=active]:bg-steel-blue data-[state=active]:text-white">
              Monthly Overview
            </TabsTrigger>
          </TabsList>

          <TabsContent value="weekly">
            <Card className="border-steel-blue">
              <CardHeader>
                <CardTitle className="text-navy">Weekly Work Pattern</CardTitle>
                <CardDescription>Your work hours and break time for the current week</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart
                    data={weeklyData}
                    margin={{
                      top: 20,
                      right: 30,
                      left: 20,
                      bottom: 5,
                    }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="day" />
                    <YAxis yAxisId="left" orientation="left" stroke="#4682B4" />
                    <YAxis yAxisId="right" orientation="right" stroke="#FFA500" />
                    <Tooltip />
                    <Legend />
                    <Bar yAxisId="left" dataKey="workHours" name="Work Hours" fill="#4682B4" />
                    <Bar yAxisId="right" dataKey="breakTime" name="Break Time (min)" fill="#FFA500" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="monthly">
            <Card className="border-steel-blue">
              <CardHeader>
                <CardTitle className="text-navy">Monthly Attendance</CardTitle>
                <CardDescription>Your attendance status for the current month</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart
                    data={monthlyData}
                    margin={{
                      top: 20,
                      right: 30,
                      left: 20,
                      bottom: 5,
                    }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="week" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line type="monotone" dataKey="onTime" name="On Time" stroke="#4682B4" strokeWidth={2} />
                    <Line type="monotone" dataKey="late" name="Late" stroke="#FFA500" strokeWidth={2} />
                    <Line type="monotone" dataKey="absent" name="Absent" stroke="#DC3545" strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}

