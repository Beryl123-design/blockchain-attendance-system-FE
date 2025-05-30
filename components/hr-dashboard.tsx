"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import {
  Calendar,
  FileText,
  Home,
  LogOut,
  Menu,
  PlusCircle,
  Users,
  User,
  Settings,
  ChevronLeft,
  ChevronRight,
  Clock,
  BarChart2,
  Activity,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { UsersList } from "@/components/users-list"
import { AddUserForm } from "@/components/add-user-form"
import { AttendanceReport } from "@/components/attendance-report"
import { LeaveManagement } from "@/components/leave-management"
import { PayrollManagement } from "@/components/payroll-management"
import { HRSettings } from "@/components/hr-settings"
import { UserProfile } from "@/components/user-profile"
import { TimeTracking } from "@/components/time-tracking"
import { AttendanceHistory } from "@/components/attendance-history"
import { Toaster } from "@/components/ui/toaster"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

// Define the settings interface - reuse the same interface as admin dashboard
interface AdminSettings {
  companyName: string
  workStartTime: string
  workEndTime: string
  twoFactorAuth: boolean
  ipRestrict: boolean
  blockchainNodeUrl: string
  smartContractAddress: string
}

// Default settings
const defaultSettings: AdminSettings = {
  companyName: "Electricity Company, Ghana. Avenor.",
  workStartTime: "09:00",
  workEndTime: "17:00",
  twoFactorAuth: false,
  ipRestrict: false,
  blockchainNodeUrl: "https://example-node.blockchain.com",
  smartContractAddress: "0x1234567890abcdef1234567890abcdef12345678",
}

export default function HRDashboard() {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState("dashboard")
  const [activeDashboardTab, setActiveDashboardTab] = useState("overview")
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const userEmail = localStorage.getItem("userEmail") || "hr@example.com"
  const userName = localStorage.getItem("userName") || ""
  const userInitials =
    userName
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase() || userEmail.charAt(0).toUpperCase()
  const [settings, setSettings] = useState<AdminSettings>(defaultSettings)
  const [userCount, setUserCount] = useState(0)
  const [pendingLeaveCount, setPendingLeaveCount] = useState(3)
  const [newHiresCount, setNewHiresCount] = useState(2)
  const [attendanceRate, setAttendanceRate] = useState(95)
  const [recentActivities, setRecentActivities] = useState<any[]>([])
  const [isCheckedIn, setIsCheckedIn] = useState(false)
  const [showCheckInReminder, setShowCheckInReminder] = useState(false)

  // Dialog states
  const [showEmployeeList, setShowEmployeeList] = useState(false)
  const [showLeaveRequests, setShowLeaveRequests] = useState(false)
  const [showNewHires, setShowNewHires] = useState(false)
  const [showAttendanceDetails, setShowAttendanceDetails] = useState(false)

  // Function to check if user is checked in
  const checkUserCheckedInStatus = () => {
    const attendanceHistory = JSON.parse(localStorage.getItem("attendanceHistory") || "[]")
    const today = new Date().toISOString().split("T")[0]
    const todayRecord = attendanceHistory.find(
      (record: any) => record.employeeEmail === userEmail && record.date === today && record.status === "In Progress",
    )

    return !!todayRecord
  }

  // Load settings and user count from localStorage on component mount
  useEffect(() => {
    const savedSettings = localStorage.getItem("adminSettings")
    if (savedSettings) {
      setSettings(JSON.parse(savedSettings))
    }

    const existingUsers = JSON.parse(localStorage.getItem("users") || "[]")
    setUserCount(existingUsers.length)

    // Calculate new hires (users added in the last 30 days)
    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
    const recentHires = existingUsers.filter((user: any) => {
      const addedDate = new Date(user.dateAdded)
      return addedDate >= thirtyDaysAgo
    })
    setNewHiresCount(recentHires.length)

    // Load team attendance for today
    const today = new Date().toISOString().split("T")[0]
    const teamAttendance = JSON.parse(localStorage.getItem("teamAttendance") || "{}")
    const todayAttendance = teamAttendance[today] || { attendees: [] }

    // Update the attendance rate based on present employees
    const presentCount = todayAttendance.attendees.length
    const attendanceRate = userCount > 0 ? Math.round((presentCount / userCount) * 100) : 0
    setAttendanceRate(attendanceRate)

    // Check if user is already checked in today
    const isUserCheckedIn = checkUserCheckedInStatus()
    setIsCheckedIn(isUserCheckedIn)

    // If not checked in, show reminder after 30 seconds
    if (!isUserCheckedIn) {
      const timer = setTimeout(() => {
        // Check again before showing reminder in case user checked in during the timeout
        if (!checkUserCheckedInStatus()) {
          setShowCheckInReminder(true)
        }
      }, 30000)

      return () => clearTimeout(timer)
    }

    // Load recent activities and filter for current user only
    const allActivities = JSON.parse(localStorage.getItem("recentActivities") || "[]")
    const userActivities = allActivities.filter((activity: any) => {
      // Check if the activity is related to the current user
      return activity.userEmail === userEmail || (activity.description && activity.description.includes(userName))
    })

    setRecentActivities(userActivities.slice(0, 5))

    // Set up interval to refresh activities
    const intervalId = setInterval(() => {
      const updatedUsers = JSON.parse(localStorage.getItem("users") || "[]")
      setUserCount(updatedUsers.length)

      // Refresh team attendance
      const refreshedTeamAttendance = JSON.parse(localStorage.getItem("teamAttendance") || "{}")
      const todayAttendance = refreshedTeamAttendance[today] || { attendees: [] }
      const presentCount = todayAttendance.attendees.length
      const updatedAttendanceRate = userCount > 0 ? Math.round((presentCount / userCount) * 100) : 0
      setAttendanceRate(updatedAttendanceRate)

      // Check if user has checked in
      const updatedCheckedInStatus = checkUserCheckedInStatus()
      setIsCheckedIn(updatedCheckedInStatus)

      // If user is now checked in, hide the reminder
      if (updatedCheckedInStatus) {
        setShowCheckInReminder(false)
      }

      const refreshedActivities = JSON.parse(localStorage.getItem("recentActivities") || "[]")
      const filteredActivities = refreshedActivities.filter((activity: any) => {
        return activity.userEmail === userEmail || (activity.description && activity.description.includes(userName))
      })
      setRecentActivities(filteredActivities.slice(0, 5))
    }, 30000)

    return () => clearInterval(intervalId)
  }, [userEmail, userName])

  const handleSignOut = () => {
    // Record sign out activity
    recordActivity("User logout", `${userName} signed out`)

    localStorage.removeItem("userRole")
    localStorage.removeItem("userEmail")
    router.push("/")
  }

  const toggleSidebar = () => {
    setSidebarCollapsed(!sidebarCollapsed)
  }

  // Function to record user activity
  const recordActivity = (type: string, description: string) => {
    const activities = JSON.parse(localStorage.getItem("recentActivities") || "[]")
    activities.unshift({
      id: Date.now().toString(),
      type,
      description,
      timestamp: new Date().toISOString(),
      userEmail,
      userName,
    })

    // Keep only the most recent 100 activities
    if (activities.length > 100) {
      activities.pop()
    }

    localStorage.setItem("recentActivities", JSON.stringify(activities))
  }

  const getActivityIcon = (type: string) => {
    switch (type) {
      case "User login":
      case "User logout":
      case "Admin login":
        return <User className="h-4 w-4 text-steel-blue" />
      case "User Management":
        return <Users className="h-4 w-4 text-steel-blue" />
      case "Leave request":
        return <Calendar className="h-4 w-4 text-steel-blue" />
      case "Settings Update":
        return <Settings className="h-4 w-4 text-steel-blue" />
      case "Attendance":
        return <Clock className="h-4 w-4 text-steel-blue" />
      default:
        return <FileText className="h-4 w-4 text-steel-blue" />
    }
  }

  return (
    <div className="flex min-h-screen flex-col bg-light-gray">
      <header className="sticky top-0 z-10 flex h-16 items-center gap-4 border-b bg-steel-blue text-white px-4 md:px-6">
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="outline" size="icon" className="md:hidden text-white border-white hover:bg-steel-blue/80">
              <Menu className="h-5 w-5" />
              <span className="sr-only">Toggle navigation menu</span>
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-72 bg-navy text-white">
            <nav className="grid gap-2 text-lg font-medium">
              <Button
                variant="ghost"
                className="justify-start gap-2 text-white hover:bg-navy/80"
                onClick={() => setActiveTab("dashboard")}
              >
                <Home className="h-5 w-5" />
                Dashboard
              </Button>
              <Button
                variant="ghost"
                className="justify-start gap-2 text-white hover:bg-navy/80"
                onClick={() => setActiveTab("my-attendance")}
              >
                <Clock className="h-5 w-5" />
                My Attendance
              </Button>
              <Button
                variant="ghost"
                className="justify-start gap-2 text-white hover:bg-navy/80"
                onClick={() => setActiveTab("users")}
              >
                <Users className="h-5 w-5" />
                Manage Users ({userCount})
              </Button>
              <Button
                variant="ghost"
                className="justify-start gap-2 text-white hover:bg-navy/80"
                onClick={() => setActiveTab("add-user")}
              >
                <PlusCircle className="h-5 w-5" />
                Add User
              </Button>
              <Button
                variant="ghost"
                className="justify-start gap-2 text-white hover:bg-navy/80"
                onClick={() => setActiveTab("attendance")}
              >
                <FileText className="h-5 w-5" />
                Attendance Report
              </Button>
              <Button
                variant="ghost"
                className="justify-start gap-2 text-white hover:bg-navy/80"
                onClick={() => setActiveTab("leave")}
              >
                <Calendar className="h-5 w-5" />
                Leave Management
              </Button>
              <Button
                variant="ghost"
                className="justify-start gap-2 text-white hover:bg-navy/80"
                onClick={() => setActiveTab("payroll")}
              >
                <span className="mr-1">₵</span>
                Payroll
              </Button>
              <Button
                variant="ghost"
                className="justify-start gap-2 text-white hover:bg-navy/80"
                onClick={() => setActiveTab("settings")}
              >
                <Settings className="h-5 w-5" />
                HR Settings
              </Button>
            </nav>
          </SheetContent>
        </Sheet>
        <Button
          variant="ghost"
          size="icon"
          className="text-white hover:bg-steel-blue/80 md:hidden"
          onClick={toggleSidebar}
        >
          {sidebarCollapsed ? <ChevronRight className="h-5 w-5" /> : <ChevronLeft className="h-5 w-5" />}
        </Button>
        <div className="flex items-center gap-2">
          <span className="text-lg font-semibold">{settings.companyName}</span>
        </div>
        <div className="ml-auto flex items-center gap-4">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Avatar className="cursor-pointer border-2 border-white">
                <AvatarImage src="/placeholder.svg" alt="User" />
                <AvatarFallback className="bg-navy text-white">{userInitials}</AvatarFallback>
              </Avatar>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>{userEmail}</DropdownMenuLabel>
              <DropdownMenuItem onClick={() => setActiveTab("profile")}>
                <User className="mr-2 h-4 w-4" />
                Profile
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setActiveTab("settings")}>
                <Settings className="mr-2 h-4 w-4" />
                HR Settings
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleSignOut}>
                <LogOut className="mr-2 h-4 w-4" />
                Sign Out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </header>
      <div className="flex flex-1">
        <aside
          className={`hidden md:block border-r bg-navy text-white transition-all duration-300 ${sidebarCollapsed ? "w-16" : "w-64"}`}
        >
          <div className="flex justify-end p-2">
            <Button variant="ghost" size="icon" className="text-white hover:bg-navy/80" onClick={toggleSidebar}>
              {sidebarCollapsed ? <ChevronRight className="h-5 w-5" /> : <ChevronLeft className="h-5 w-5" />}
            </Button>
          </div>
          <nav className="grid gap-2 p-4 text-sm font-medium">
            <Button
              variant={activeTab === "dashboard" ? "secondary" : "ghost"}
              className={`justify-start gap-2 ${activeTab === "dashboard" ? "bg-steel-blue text-white" : "text-white hover:bg-navy/80"}`}
              onClick={() => setActiveTab("dashboard")}
            >
              <Home className="h-5 w-5" />
              {!sidebarCollapsed && <span>Dashboard</span>}
            </Button>
            <Button
              variant={activeTab === "my-attendance" ? "secondary" : "ghost"}
              className={`justify-start gap-2 ${activeTab === "my-attendance" ? "bg-steel-blue text-white" : "text-white hover:bg-navy/80"}`}
              onClick={() => setActiveTab("my-attendance")}
            >
              <Clock className="h-5 w-5" />
              {!sidebarCollapsed && <span>My Attendance</span>}
            </Button>
            <Button
              variant={activeTab === "users" ? "secondary" : "ghost"}
              className={`justify-start gap-2 ${activeTab === "users" ? "bg-steel-blue text-white" : "text-white hover:bg-navy/80"}`}
              onClick={() => setActiveTab("users")}
            >
              <Users className="h-5 w-5" />
              {!sidebarCollapsed && <span>Manage Users ({userCount})</span>}
            </Button>
            <Button
              variant={activeTab === "add-user" ? "secondary" : "ghost"}
              className={`justify-start gap-2 ${activeTab === "add-user" ? "bg-steel-blue text-white" : "text-white hover:bg-navy/80"}`}
              onClick={() => setActiveTab("add-user")}
            >
              <PlusCircle className="h-5 w-5" />
              {!sidebarCollapsed && <span>Add User</span>}
            </Button>
            <Button
              variant={activeTab === "attendance" ? "secondary" : "ghost"}
              className={`justify-start gap-2 ${activeTab === "attendance" ? "bg-steel-blue text-white" : "text-white hover:bg-navy/80"}`}
              onClick={() => setActiveTab("attendance")}
            >
              <FileText className="h-5 w-5" />
              {!sidebarCollapsed && <span>Attendance Report</span>}
            </Button>
            <Button
              variant={activeTab === "leave" ? "secondary" : "ghost"}
              className={`justify-start gap-2 ${activeTab === "leave" ? "bg-steel-blue text-white" : "text-white hover:bg-navy/80"}`}
              onClick={() => setActiveTab("leave")}
            >
              <Calendar className="h-5 w-5" />
              {!sidebarCollapsed && <span>Leave Management</span>}
            </Button>
            <Button
              variant={activeTab === "payroll" ? "secondary" : "ghost"}
              className={`justify-start gap-2 ${activeTab === "payroll" ? "bg-steel-blue text-white" : "text-white hover:bg-navy/80"}`}
              onClick={() => setActiveTab("payroll")}
            >
              <span className="mr-1">₵</span>
              {!sidebarCollapsed && <span>Payroll</span>}
            </Button>
            <Button
              variant={activeTab === "settings" ? "secondary" : "ghost"}
              className={`justify-start gap-2 ${activeTab === "settings" ? "bg-steel-blue text-white" : "text-white hover:bg-navy/80"}`}
              onClick={() => setActiveTab("settings")}
            >
              <Settings className="h-5 w-5" />
              {!sidebarCollapsed && <span>HR Settings</span>}
            </Button>
          </nav>
        </aside>
        <main className="flex-1 p-4 md:p-6">
          <div className="grid gap-4">
            {activeTab === "dashboard" && (
              <div className="grid gap-4">
                <div className="flex items-center justify-between">
                  <h1 className="text-2xl font-bold text-navy">HR Dashboard</h1>
                  <Badge variant="outline" className="border-navy text-navy">
                    HR
                  </Badge>
                </div>

                {/* Dashboard Tabs */}
                <Tabs defaultValue="overview" value={activeDashboardTab} onValueChange={setActiveDashboardTab}>
                  <TabsList className="grid w-full grid-cols-3 mb-4">
                    <TabsTrigger value="overview" className="flex items-center gap-2">
                      <BarChart2 className="h-4 w-4" />
                      Overview
                    </TabsTrigger>
                    <TabsTrigger value="attendance" className="flex items-center gap-2">
                      <Clock className="h-4 w-4" />
                      My Attendance
                    </TabsTrigger>
                    <TabsTrigger value="activity" className="flex items-center gap-2">
                      <Activity className="h-4 w-4" />
                      Activity
                    </TabsTrigger>
                  </TabsList>

                  {/* Overview Tab Content */}
                  <TabsContent value="overview" className="space-y-4">
                    {/* Time Tracking Component - Added for HR personnel */}
                    <TimeTracking employeeRole="department_head" />

                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                      <Card
                        className="border-steel-blue cursor-pointer transition-colors hover:bg-steel-blue/10"
                        onClick={() => setShowEmployeeList(true)}
                      >
                        <CardHeader className="pb-2">
                          <CardTitle className="text-sm font-medium text-navy">Total Employees</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="text-2xl font-bold text-navy">{userCount}</div>
                        </CardContent>
                      </Card>
                      <Card
                        className="border-steel-blue cursor-pointer transition-colors hover:bg-steel-blue/10"
                        onClick={() => setShowLeaveRequests(true)}
                      >
                        <CardHeader className="pb-2">
                          <CardTitle className="text-sm font-medium text-navy">Pending Leave Requests</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="text-2xl font-bold text-navy">{pendingLeaveCount}</div>
                        </CardContent>
                      </Card>
                      <Card
                        className="border-steel-blue cursor-pointer transition-colors hover:bg-steel-blue/10"
                        onClick={() => setShowNewHires(true)}
                      >
                        <CardHeader className="pb-2">
                          <CardTitle className="text-sm font-medium text-navy">New Hires (This Month)</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="text-2xl font-bold text-navy">{newHiresCount}</div>
                        </CardContent>
                      </Card>
                      <Card
                        className="border-steel-blue cursor-pointer transition-colors hover:bg-steel-blue/10"
                        onClick={() => setShowAttendanceDetails(true)}
                      >
                        <CardHeader className="pb-2">
                          <CardTitle className="text-sm font-medium text-navy">Attendance Rate</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="text-2xl font-bold text-navy">{attendanceRate}%</div>
                        </CardContent>
                      </Card>
                    </div>
                    <Card className="border-steel-blue">
                      <CardHeader>
                        <CardTitle className="text-navy">My Recent Activities</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-4">
                          {recentActivities.length > 0 ? (
                            recentActivities.map((activity, index) => (
                              <div key={index} className="flex items-center">
                                <div className="mr-4 rounded-full bg-steel-blue/10 p-2">
                                  {getActivityIcon(activity.type)}
                                </div>
                                <div>
                                  <p className="text-sm font-medium text-navy">{activity.description}</p>
                                  <p className="text-xs text-muted-foreground">
                                    {new Date(activity.timestamp).toLocaleString()}
                                  </p>
                                </div>
                              </div>
                            ))
                          ) : (
                            <div className="flex items-center">
                              <div className="mr-4 rounded-full bg-steel-blue/10 p-2">
                                <Calendar className="h-4 w-4 text-steel-blue" />
                              </div>
                              <div>
                                <p className="text-sm font-medium text-navy">No recent activities</p>
                                <p className="text-xs text-muted-foreground">Your activities will appear here</p>
                              </div>
                            </div>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  </TabsContent>

                  {/* Attendance Tab Content */}
                  <TabsContent value="attendance" className="space-y-4">
                    <TimeTracking employeeRole="department_head" />
                    <AttendanceHistory />
                  </TabsContent>

                  {/* Activity Tab Content */}
                  <TabsContent value="activity" className="space-y-4">
                    <Card className="border-steel-blue">
                      <CardHeader>
                        <CardTitle className="text-navy">Recent Activities</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-4">
                          {recentActivities.length > 0 ? (
                            recentActivities.map((activity, index) => (
                              <div key={index} className="flex items-center">
                                <div className="mr-4 rounded-full bg-steel-blue/10 p-2">
                                  {getActivityIcon(activity.type)}
                                </div>
                                <div>
                                  <p className="text-sm font-medium text-navy">{activity.description}</p>
                                  <p className="text-xs text-muted-foreground">
                                    {new Date(activity.timestamp).toLocaleString()}
                                  </p>
                                </div>
                              </div>
                            ))
                          ) : (
                            <div className="flex items-center">
                              <div className="mr-4 rounded-full bg-steel-blue/10 p-2">
                                <Calendar className="h-4 w-4 text-steel-blue" />
                              </div>
                              <div>
                                <p className="text-sm font-medium text-navy">No recent activities</p>
                                <p className="text-xs text-muted-foreground">Your activities will appear here</p>
                              </div>
                            </div>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  </TabsContent>
                </Tabs>
              </div>
            )}

            {activeTab === "my-attendance" && (
              <div className="grid gap-4">
                <div className="flex items-center justify-between">
                  <h1 className="text-2xl font-bold text-navy">My Attendance</h1>
                  <Badge variant="outline" className="border-navy text-navy">
                    HR
                  </Badge>
                </div>
                <TimeTracking employeeRole="department_head" />
                <AttendanceHistory />
              </div>
            )}

            {activeTab === "users" && <UsersList />}
            {activeTab === "add-user" && <AddUserForm />}
            {activeTab === "attendance" && <AttendanceReport />}
            {activeTab === "leave" && <LeaveManagement userRole="hr" />}
            {activeTab === "payroll" && <PayrollManagement />}
            {activeTab === "profile" && <UserProfile />}
            {activeTab === "settings" && <HRSettings />}
          </div>
        </main>
      </div>

      {/* Employee List Dialog */}
      <Dialog open={showEmployeeList} onOpenChange={setShowEmployeeList}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>All Employees</DialogTitle>
            <DialogDescription>Total of {userCount} employees in the system</DialogDescription>
          </DialogHeader>
          <div className="max-h-[60vh] overflow-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Department</TableHead>
                  <TableHead>Job Title</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {JSON.parse(localStorage.getItem("users") || "[]").map((user: any) => (
                  <TableRow key={user.id}>
                    <TableCell className="font-medium">{user.name}</TableCell>
                    <TableCell>{user.department}</TableCell>
                    <TableCell>{user.jobTitle}</TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>
                      <Badge variant={user.status === "Active" ? "default" : "secondary"}>
                        {user.status || "Active"}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
          <DialogFooter>
            <Button
              onClick={() => {
                setShowEmployeeList(false)
                setActiveTab("users")
                recordActivity("User Management", `${userName} viewed employee list`)
              }}
            >
              Manage Users
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Leave Requests Dialog */}
      <Dialog open={showLeaveRequests} onOpenChange={setShowLeaveRequests}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>Pending Leave Requests</DialogTitle>
            <DialogDescription>{pendingLeaveCount} leave requests awaiting approval</DialogDescription>
          </DialogHeader>
          <div className="max-h-[60vh] overflow-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Employee</TableHead>
                  <TableHead>Department</TableHead>
                  <TableHead>Leave Type</TableHead>
                  <TableHead>Duration</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <TableRow>
                  <TableCell className="font-medium">John Doe</TableCell>
                  <TableCell>Engineering</TableCell>
                  <TableCell>Annual Leave</TableCell>
                  <TableCell>Mar 20 - Mar 25 (6 days)</TableCell>
                  <TableCell>
                    <Badge className="bg-yellow-100 text-yellow-800">Pending</Badge>
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="font-medium">Robert Johnson</TableCell>
                  <TableCell>HR</TableCell>
                  <TableCell>Annual Leave</TableCell>
                  <TableCell>Apr 5 - Apr 10 (6 days)</TableCell>
                  <TableCell>
                    <Badge className="bg-yellow-100 text-yellow-800">Pending</Badge>
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="font-medium">Sarah Brown</TableCell>
                  <TableCell>Marketing</TableCell>
                  <TableCell>Sick Leave</TableCell>
                  <TableCell>Mar 18 - Mar 19 (2 days)</TableCell>
                  <TableCell>
                    <Badge className="bg-yellow-100 text-yellow-800">Pending</Badge>
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </div>
          <DialogFooter>
            <Button
              onClick={() => {
                setShowLeaveRequests(false)
                setActiveTab("leave")
                recordActivity("Leave Management", `${userName} viewed pending leave requests`)
              }}
            >
              Manage Leave Requests
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* New Hires Dialog */}
      <Dialog open={showNewHires} onOpenChange={setShowNewHires}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>New Hires (Last 30 Days)</DialogTitle>
            <DialogDescription>{newHiresCount} new employees joined in the last 30 days</DialogDescription>
          </DialogHeader>
          <div className="max-h-[60vh] overflow-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Department</TableHead>
                  <TableHead>Job Title</TableHead>
                  <TableHead>Date Joined</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {JSON.parse(localStorage.getItem("users") || "[]")
                  .filter((user: any) => {
                    const thirtyDaysAgo = new Date()
                    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
                    return new Date(user.dateAdded || Date.now()) >= thirtyDaysAgo
                  })
                  .map((user: any) => (
                    <TableRow key={user.id}>
                      <TableCell className="font-medium">{user.name}</TableCell>
                      <TableCell>{user.department}</TableCell>
                      <TableCell>{user.jobTitle}</TableCell>
                      <TableCell>{new Date(user.dateAdded || Date.now()).toLocaleDateString()}</TableCell>
                    </TableRow>
                  ))}
              </TableBody>
            </Table>
          </div>
          <DialogFooter>
            <Button
              onClick={() => {
                setShowNewHires(false)
                setActiveTab("add-user")
                recordActivity("User Management", `${userName} viewed new hires`)
              }}
            >
              Add New User
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Attendance Details Dialog */}
      <Dialog open={showAttendanceDetails} onOpenChange={setShowAttendanceDetails}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>Attendance Details</DialogTitle>
            <DialogDescription>Current attendance rate: {attendanceRate}%</DialogDescription>
          </DialogHeader>
          <div className="max-h-[60vh] overflow-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Department</TableHead>
                  <TableHead>Total Employees</TableHead>
                  <TableHead>Present Today</TableHead>
                  <TableHead>Absent</TableHead>
                  <TableHead>On Leave</TableHead>
                  <TableHead>Attendance Rate</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <TableRow>
                  <TableCell className="font-medium">Engineering</TableCell>
                  <TableCell>8</TableCell>
                  <TableCell>7</TableCell>
                  <TableCell>0</TableCell>
                  <TableCell>1</TableCell>
                  <TableCell>87.5%</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="font-medium">Marketing</TableCell>
                  <TableCell>5</TableCell>
                  <TableCell>5</TableCell>
                  <TableCell>0</TableCell>
                  <TableCell>0</TableCell>
                  <TableCell>100%</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="font-medium">HR</TableCell>
                  <TableCell>4</TableCell>
                  <TableCell>4</TableCell>
                  <TableCell>0</TableCell>
                  <TableCell>0</TableCell>
                  <TableCell>100%</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="font-medium">Finance</TableCell>
                  <TableCell>6</TableCell>
                  <TableCell>5</TableCell>
                  <TableCell>1</TableCell>
                  <TableCell>0</TableCell>
                  <TableCell>83.3%</TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </div>
          <DialogFooter>
            <Button
              onClick={() => {
                setShowAttendanceDetails(false)
                setActiveTab("attendance")
                recordActivity("Attendance Report", `${userName} viewed attendance details`)
              }}
            >
              View Full Report
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Toaster />
    </div>
  )
}
