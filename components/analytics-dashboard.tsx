"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts"
import { Calendar, Clock, Users, TrendingUp, AlertTriangle, CheckCircle, BarChart2 } from "lucide-react"

// Types for our analytics data
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

interface DepartmentAttendance {
  name: string
  present: number
  absent: number
  late: number
  onLeave: number
}

interface AttendanceTrend {
  date: string
  onTime: number
  late: number
  absent: number
}

interface BreakTimeAnalysis {
  name: string
  value: number
  color: string
}

export function AnalyticsDashboard() {
  const [timeRange, setTimeRange] = useState("week")
  const [department, setDepartment] = useState("all")
  const [attendanceRecords, setAttendanceRecords] = useState<AttendanceRecord[]>([])

  // Fetch attendance data from localStorage
  useEffect(() => {
    const storedRecords = JSON.parse(localStorage.getItem("attendanceHistory") || "[]")
    setAttendanceRecords(storedRecords)
  }, [])

  // Mock data for department attendance
  const departmentData: DepartmentAttendance[] = [
    { name: "Engineering", present: 18, absent: 2, late: 3, onLeave: 1 },
    { name: "Marketing", present: 12, absent: 1, late: 2, onLeave: 0 },
    { name: "Finance", present: 8, absent: 0, late: 1, onLeave: 1 },
    { name: "HR", present: 5, absent: 1, late: 0, onLeave: 0 },
    { name: "Operations", present: 10, absent: 2, late: 1, onLeave: 1 },
  ]

  // Mock data for attendance trends
  const trendData: AttendanceTrend[] = [
    { date: "Mon", onTime: 42, late: 5, absent: 3 },
    { date: "Tue", onTime: 45, late: 3, absent: 2 },
    { date: "Wed", onTime: 40, late: 7, absent: 3 },
    { date: "Thu", onTime: 43, late: 4, absent: 3 },
    { date: "Fri", onTime: 38, late: 8, absent: 4 },
    { date: "Sat", onTime: 20, late: 2, absent: 1 },
    { date: "Sun", onTime: 5, late: 0, absent: 0 },
  ]

  // Mock data for break time analysis
  const breakTimeData: BreakTimeAnalysis[] = [
    { name: "0-15 min", value: 15, color: "#4682B4" },
    { name: "15-30 min", value: 25, color: "#6495ED" },
    { name: "30-45 min", value: 35, color: "#1E90FF" },
    { name: "45-60 min", value: 20, color: "#87CEEB" },
    { name: "60+ min", value: 5, color: "#B0E0E6" },
  ]

  // Calculate attendance metrics from real data
  const calculateMetrics = () => {
    // Filter records based on time range
    const now = new Date()
    const filteredRecords = attendanceRecords.filter((record) => {
      const recordDate = new Date(record.date)
      if (timeRange === "day") {
        return recordDate.toDateString() === now.toDateString()
      } else if (timeRange === "week") {
        const oneWeekAgo = new Date()
        oneWeekAgo.setDate(oneWeekAgo.getDate() - 7)
        return recordDate >= oneWeekAgo
      } else if (timeRange === "month") {
        const oneMonthAgo = new Date()
        oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1)
        return recordDate >= oneMonthAgo
      }
      return true
    })

    // Calculate metrics
    const totalRecords = filteredRecords.length
    const completedRecords = filteredRecords.filter((r) => r.status === "Completed").length
    const inProgressRecords = filteredRecords.filter((r) => r.status === "In Progress").length
    const overtimeRecords = filteredRecords.filter((r) => r.overtime > 0).length

    return {
      totalRecords,
      completedRecords,
      inProgressRecords,
      overtimeRecords,
      averageBreakTime: calculateAverageBreakTime(filteredRecords),
      averageWorkHours: calculateAverageWorkHours(filteredRecords),
    }
  }

  const calculateAverageBreakTime = (records: AttendanceRecord[]) => {
    if (records.length === 0) return 0
    const totalBreakTime = records.reduce((sum, record) => sum + (record.totalBreakTime || 0), 0)
    return Math.round(totalBreakTime / records.length / 60) // Convert to minutes
  }

  const calculateAverageWorkHours = (records: AttendanceRecord[]) => {
    const completedRecords = records.filter((r) => r.status === "Completed" && r.checkIn && r.checkOut)
    if (completedRecords.length === 0) return 0

    const totalWorkTime = completedRecords.reduce((sum, record) => {
      const checkIn = new Date(record.checkIn).getTime()
      const checkOut = new Date(record.checkOut!).getTime()
      const workTime = (checkOut - checkIn) / 1000 // in seconds
      return sum + workTime - (record.totalBreakTime || 0)
    }, 0)

    return Math.round((totalWorkTime / completedRecords.length / 3600) * 10) / 10 // Convert to hours with 1 decimal
  }

  const metrics = calculateMetrics()

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <h2 className="text-2xl font-bold text-navy">Attendance Analytics</h2>
        <div className="mt-2 flex flex-col sm:mt-0 sm:flex-row sm:space-x-2">
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Select time range" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="day">Today</SelectItem>
              <SelectItem value="week">This Week</SelectItem>
              <SelectItem value="month">This Month</SelectItem>
              <SelectItem value="all">All Time</SelectItem>
            </SelectContent>
          </Select>

          <Select value={department} onValueChange={setDepartment} className="mt-2 sm:mt-0">
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Select department" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Departments</SelectItem>
              <SelectItem value="engineering">Engineering</SelectItem>
              <SelectItem value="marketing">Marketing</SelectItem>
              <SelectItem value="finance">Finance</SelectItem>
              <SelectItem value="hr">Human Resources</SelectItem>
              <SelectItem value="operations">Operations</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="border-steel-blue">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-navy">Total Check-ins</CardTitle>
            <Users className="h-4 w-4 text-steel-blue" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-navy">{metrics.totalRecords}</div>
            <p className="text-xs text-muted-foreground">
              {metrics.completedRecords} completed, {metrics.inProgressRecords} in progress
            </p>
          </CardContent>
        </Card>

        <Card className="border-steel-blue">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-navy">Avg. Work Hours</CardTitle>
            <Clock className="h-4 w-4 text-steel-blue" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-navy">{metrics.averageWorkHours}h</div>
            <p className="text-xs text-muted-foreground">Per completed attendance record</p>
          </CardContent>
        </Card>

        <Card className="border-steel-blue">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-navy">Avg. Break Time</CardTitle>
            <Calendar className="h-4 w-4 text-steel-blue" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-navy">{metrics.averageBreakTime} min</div>
            <p className="text-xs text-muted-foreground">Per attendance record</p>
          </CardContent>
        </Card>

        <Card className="border-steel-blue">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-navy">Overtime Records</CardTitle>
            <TrendingUp className="h-4 w-4 text-steel-blue" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-navy">{metrics.overtimeRecords}</div>
            <p className="text-xs text-muted-foreground">
              {Math.round((metrics.overtimeRecords / Math.max(metrics.totalRecords, 1)) * 100)}% of total records
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <Tabs defaultValue="attendance" className="space-y-4">
        <TabsList>
          <TabsTrigger value="attendance" className="data-[state=active]:bg-steel-blue data-[state=active]:text-white">
            <BarChart2 className="mr-2 h-4 w-4" />
            Attendance by Department
          </TabsTrigger>
          <TabsTrigger value="trends" className="data-[state=active]:bg-steel-blue data-[state=active]:text-white">
            <TrendingUp className="mr-2 h-4 w-4" />
            Attendance Trends
          </TabsTrigger>
          <TabsTrigger value="breaks" className="data-[state=active]:bg-steel-blue data-[state=active]:text-white">
            <AlertTriangle className="mr-2 h-4 w-4" />
            Break Time Analysis
          </TabsTrigger>
        </TabsList>

        <TabsContent value="attendance" className="space-y-4">
          <Card className="border-steel-blue">
            <CardHeader>
              <CardTitle className="text-navy">Attendance by Department</CardTitle>
              <CardDescription>Overview of attendance status across different departments</CardDescription>
            </CardHeader>
            <CardContent className="pl-2">
              <ResponsiveContainer width="100%" height={350}>
                <BarChart
                  data={departmentData}
                  margin={{
                    top: 20,
                    right: 30,
                    left: 20,
                    bottom: 5,
                  }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="present" stackId="a" fill="#4682B4" name="Present" />
                  <Bar dataKey="late" stackId="a" fill="#FFA500" name="Late" />
                  <Bar dataKey="absent" stackId="a" fill="#DC3545" name="Absent" />
                  <Bar dataKey="onLeave" stackId="a" fill="#6C757D" name="On Leave" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="trends" className="space-y-4">
          <Card className="border-steel-blue">
            <CardHeader>
              <CardTitle className="text-navy">Weekly Attendance Trends</CardTitle>
              <CardDescription>Attendance patterns over the past week</CardDescription>
            </CardHeader>
            <CardContent className="pl-2">
              <ResponsiveContainer width="100%" height={350}>
                <LineChart
                  data={trendData}
                  margin={{
                    top: 20,
                    right: 30,
                    left: 20,
                    bottom: 5,
                  }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="onTime" stroke="#4682B4" name="On Time" strokeWidth={2} />
                  <Line type="monotone" dataKey="late" stroke="#FFA500" name="Late" strokeWidth={2} />
                  <Line type="monotone" dataKey="absent" stroke="#DC3545" name="Absent" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="breaks" className="space-y-4">
          <Card className="border-steel-blue">
            <CardHeader>
              <CardTitle className="text-navy">Break Time Distribution</CardTitle>
              <CardDescription>Analysis of break time durations</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col items-center justify-center md:flex-row">
                <ResponsiveContainer width={300} height={300}>
                  <PieChart>
                    <Pie
                      data={breakTimeData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      outerRadius={100}
                      fill="#8884d8"
                      dataKey="value"
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    >
                      {breakTimeData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>

                <div className="mt-4 md:mt-0 md:ml-8">
                  <h4 className="mb-2 font-semibold text-navy">Key Insights:</h4>
                  <ul className="space-y-2 text-sm">
                    <li className="flex items-center">
                      <CheckCircle className="mr-2 h-4 w-4 text-green-600" />
                      Most employees take 30-45 minute breaks
                    </li>
                    <li className="flex items-center">
                      <CheckCircle className="mr-2 h-4 w-4 text-green-600" />
                      Only 5% exceed the allowed break time
                    </li>
                    <li className="flex items-center">
                      <CheckCircle className="mr-2 h-4 w-4 text-green-600" />
                      Break time compliance is 95%
                    </li>
                    <li className="flex items-center">
                      <AlertTriangle className="mr-2 h-4 w-4 text-yellow-600" />
                      Engineering department has the longest breaks
                    </li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

