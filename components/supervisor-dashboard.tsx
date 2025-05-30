"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import {
  AlertCircle,
  Bell,
  Calendar,
  Clock,
  FileText,
  Home,
  LogOut,
  Menu,
  User,
  Settings,
  ChevronLeft,
  ChevronRight,
  Users,
  BarChart2,
  Activity,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { TimeTracking } from "@/components/time-tracking"
import { AttendanceHistory } from "@/components/attendance-history"
import { UserProfile } from "@/components/user-profile"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { toast } from "@/components/ui/use-toast"
import { Toaster } from "@/components/ui/toaster"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { usePermissions } from "@/hooks/use-permissions"

export default function SupervisorDashboard() {
  const router = useRouter()
  const { userRole, can } = usePermissions()
  const [activeTab, setActiveTab] = useState("dashboard")
  const [activeDashboardTab, setActiveDashboardTab] = useState("overview")
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [teamMembers, setTeamMembers] = useState<any[]>([])
  const [departmentMembers, setDepartmentMembers] = useState<any[]>([])
  const [recentActivities, setRecentActivities] = useState<any[]>([])
  const [isCheckedIn, setIsCheckedIn] = useState(false)
  const [showCheckInReminder, setShowCheckInReminder] = useState(false)

  // Get user info from localStorage
  const userEmail = localStorage.getItem("userEmail") || ""
  const userName = localStorage.getItem("userName") || ""
  const userDepartment = localStorage.getItem("userDepartment") || ""
  const userInitials =
    userName
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase() || userEmail.charAt(0).toUpperCase()

  // Function to refresh activities
  const refreshActivities = () => {
    const allActivities = JSON.parse(localStorage.getItem("recentActivities") || "[]")

    // For supervisors, show activities from their team members
    const teamEmails = teamMembers.map((member) => member.email)
    const departmentEmails = departmentMembers.map((member) => member.email)

    // If user is a department manager, show department activities, otherwise show team activities
    const relevantEmails = can("view_department") ? departmentEmails : teamEmails

    const filteredActivities = allActivities.filter((activity: any) => {
      return (
        activity.userEmail === userEmail ||
        relevantEmails.includes(activity.userEmail) ||
        (activity.description && relevantEmails.some((email) => activity.description.includes(email))) ||
        activity.type === "System"
      )
    })

    setRecentActivities(filteredActivities.slice(0, 10))
  }

  // Function to check if user is checked in
  const checkUserCheckedInStatus = () => {
    const attendanceHistory = JSON.parse(localStorage.getItem("attendanceHistory") || "[]")
    const today = new Date().toISOString().split("T")[0]
    const todayRecord = attendanceHistory.find(
      (record: any) => record.employeeEmail === userEmail && record.date === today && record.status === "In Progress",
    )

    return !!todayRecord
  }

  // Load team members, activities, and check-in status on component mount
  useEffect(() => {
    // Load all users
    const allUsers = JSON.parse(localStorage.getItem("users") || "[]")

    // Filter team members (direct reports)
    const teamMembersList = allUsers.filter(
      (user: any) => user.supervisor === userName || user.supervisorEmail === userEmail,
    )
    setTeamMembers(teamMembersList)

    // Filter department members (all users in the same department)
    const departmentMembersList = allUsers.filter(
      (user: any) => user.department === userDepartment && user.email !== userEmail,
    )
    setDepartmentMembers(departmentMembersList)

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

    // Initial load of activities
    refreshActivities()

    // Set up interval to refresh activities and check-in status
    const intervalId = setInterval(() => {
      refreshActivities()

      // Check if user has checked in
      const updatedCheckedInStatus = checkUserCheckedInStatus()
      setIsCheckedIn(updatedCheckedInStatus)

      // If user is now checked in, hide the reminder
      if (updatedCheckedInStatus) {
        setShowCheckInReminder(false)
      }
    }, 5000) // Refresh every 5 seconds for more real-time updates

    return () => clearInterval(intervalId)
  }, [userEmail, userName, userDepartment, can])

  const handleSignOut = () => {
    // Record sign out activity
    recordActivity("Supervisor logout", `${userName} signed out`)

    localStorage.removeItem("userRole")
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

    // Immediately refresh activities after recording a new one
    refreshActivities()
  }

  const getActivityIcon = (type: string) => {
    switch (type) {
      case "User login":
      case "User logout":
      case "Supervisor login":
        return <User className="w-4 h-4 text-steel-blue" />
      case "Attendance":
        return <Clock className="w-4 h-4 text-steel-blue" />
      case "Leave request":
        return <Calendar className="w-4 h-4 text-steel-blue" />
      case "Settings Update":
        return <Settings className="w-4 h-4 text-steel-blue" />
      case "System":
        return <Bell className="w-4 h-4 text-steel-blue" />
      default:
        return <FileText className="w-4 h-4 text-steel-blue" />
    }
  }

  // Function to view user details
  const viewUserDetails = (user: any) => {
    // Store user details in localStorage for the details page
    localStorage.setItem("viewUserDetails", JSON.stringify(user))

    // Navigate to user details page
    window.open("/user-details", "_blank")
  }

  return (
    <div className="flex flex-col min-h-screen bg-light-gray">
      <header className="sticky top-0 z-10 flex items-center h-16 gap-4 px-4 text-white border-b bg-steel-blue md:px-6">
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="outline" size="icon" className="text-white border-white md:hidden hover:bg-steel-blue/80">
              <Menu className="w-5 h-5" />
              <span className="sr-only">Toggle navigation menu</span>
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-[85vw] max-w-[300px] bg-navy text-white p-0">
            <div className="flex items-center h-16 px-4 border-b border-white/10">
              <h2 className="text-xl font-semibold">Supervisor Dashboard</h2>
            </div>
            <nav className="grid gap-1 p-4 text-lg font-medium">
              <Button
                variant="ghost"
                className="justify-start h-12 gap-2 text-white hover:bg-navy/80"
                onClick={() => {
                  setActiveTab("dashboard")
                  const element = document.querySelector("[data-radix-collection-item]");
                  if (element instanceof HTMLElement) {
                    element.click();
                  }
                }}
              >
                <Home className="w-5 h-5" />
                Dashboard
              </Button>
              <Button
                variant="ghost"
                className="justify-start h-12 gap-2 text-white hover:bg-navy/80"
                onClick={() => {
                  setActiveTab("my-attendance")
                  const element = document.querySelector("[data-radix-collection-item]");
                  if (element instanceof HTMLElement) {
                    element.click();
                  }
                }}
              >
                <Clock className="w-5 h-5" />
                My Attendance
              </Button>
              <Button
                variant="ghost"
                className="justify-start h-12 gap-2 text-white hover:bg-navy/80"
                onClick={() => {
                  setActiveTab("team")
                  const element = document.querySelector("[data-radix-collection-item]");
                  if (element instanceof HTMLElement) {
                    element.click();
                  }
                }}
              >
                <Users className="w-5 h-5" />
                {can("view_department") ? "Department Members" : "Team Members"}
              </Button>
              <Button
                variant="ghost"
                className="justify-start h-12 gap-2 text-white hover:bg-navy/80"
                onClick={() => {
                  setActiveTab("profile")
                  const element = document.querySelector("[data-radix-collection-item]");
                  if (element instanceof HTMLElement) {
                    element.click();
                  }
                }}
              >
                <User className="w-5 h-5" />
                My Profile
              </Button>
              <Button
                variant="ghost"
                className="justify-start h-12 gap-2 text-white hover:bg-navy/80"
                onClick={() => {
                  setActiveTab("settings")
                  const element = document.querySelector("[data-radix-collection-item]");
                  if (element instanceof HTMLElement) {
                    element.click();
                  }
                }}
              >
                <Settings className="w-5 h-5" />
                Settings
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
          {sidebarCollapsed ? <ChevronRight className="w-5 h-5" /> : <ChevronLeft className="w-5 h-5" />}
        </Button>
        <div className="flex items-center gap-2">
          <Clock className="w-6 h-6" />
          <span className="text-lg font-semibold">Attendance System</span>
        </div>
        <div className="flex items-center gap-4 ml-auto">
          <Button variant="outline" size="icon" className="text-white border-white bg-navy hover:bg-navy/80">
            <Bell className="w-5 h-5" />
            <span className="sr-only">Notifications</span>
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Avatar className="border-2 border-white cursor-pointer">
                <AvatarImage src="/placeholder.svg" alt="User" />
                <AvatarFallback className="text-white bg-navy">{userInitials}</AvatarFallback>
              </Avatar>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>{userName}</DropdownMenuLabel>
              <DropdownMenuItem onClick={() => setActiveTab("profile")}>
                <User className="w-4 h-4 mr-2" />
                My Profile
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setActiveTab("settings")}>
                <Settings className="w-4 h-4 mr-2" />
                Settings
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleSignOut}>
                <LogOut className="w-4 h-4 mr-2" />
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
              {sidebarCollapsed ? <ChevronRight className="w-5 h-5" /> : <ChevronLeft className="w-5 h-5" />}
            </Button>
          </div>
          <nav className="grid gap-2 p-4 text-sm font-medium">
            <Button
              variant={activeTab === "dashboard" ? "secondary" : "ghost"}
              className={`justify-start gap-2 ${activeTab === "dashboard" ? "bg-steel-blue text-white" : "text-white hover:bg-navy/80"}`}
              onClick={() => setActiveTab("dashboard")}
            >
              <Home className="w-5 h-5" />
              {!sidebarCollapsed && <span>Dashboard</span>}
            </Button>
            <Button
              variant={activeTab === "my-attendance" ? "secondary" : "ghost"}
              className={`justify-start gap-2 ${activeTab === "my-attendance" ? "bg-steel-blue text-white" : "text-white hover:bg-navy/80"}`}
              onClick={() => setActiveTab("my-attendance")}
            >
              <Clock className="w-5 h-5" />
              {!sidebarCollapsed && <span>My Attendance</span>}
            </Button>
            <Button
              variant={activeTab === "team" ? "secondary" : "ghost"}
              className={`justify-start gap-2 ${activeTab === "team" ? "bg-steel-blue text-white" : "text-white hover:bg-navy/80"}`}
              onClick={() => setActiveTab("team")}
            >
              <Users className="w-5 h-5" />
              {!sidebarCollapsed && <span>{can("view_department") ? "Department" : "Team"}</span>}
            </Button>
            <Button
              variant={activeTab === "profile" ? "secondary" : "ghost"}
              className={`justify-start gap-2 ${activeTab === "profile" ? "bg-steel-blue text-white" : "text-white hover:bg-navy/80"}`}
              onClick={() => setActiveTab("profile")}
            >
              <User className="w-5 h-5" />
              {!sidebarCollapsed && <span>My Profile</span>}
            </Button>
            <Button
              variant={activeTab === "settings" ? "secondary" : "ghost"}
              className={`justify-start gap-2 ${activeTab === "settings" ? "bg-steel-blue text-white" : "text-white hover:bg-navy/80"}`}
              onClick={() => setActiveTab("settings")}
            >
              <Settings className="w-5 h-5" />
              {!sidebarCollapsed && <span>Settings</span>}
            </Button>
          </nav>
        </aside>
        <main className="flex-1 p-4 md:p-6">
          <div className="grid gap-4">
            {showCheckInReminder && !isCheckedIn && (
              <Alert className="border-yellow-300 bg-yellow-50">
                <AlertCircle className="w-4 h-4 text-yellow-800" />
                <AlertTitle className="text-yellow-800">Attendance Reminder</AlertTitle>
                <AlertDescription className="text-yellow-700">
                  You haven't checked in yet today. Please check in to record your attendance.
                </AlertDescription>
              </Alert>
            )}

            {activeTab === "dashboard" && (
              <div className="grid gap-4">
                <div className="flex items-center justify-between">
                  <h1 className="text-2xl font-bold text-navy">Supervisor Dashboard</h1>
                  <Badge variant="outline" className="border-navy text-navy">
                    {can("view_department") ? "Department Manager" : "Supervisor"}
                  </Badge>
                </div>

                {/* Dashboard Tabs - Consistent with other dashboards */}
                <Tabs defaultValue="overview" value={activeDashboardTab} onValueChange={setActiveDashboardTab}>
                  <TabsList className="grid w-full grid-cols-3 mb-4">
                    <TabsTrigger value="overview" className="flex items-center gap-2">
                      <BarChart2 className="w-4 h-4" />
                      Overview
                    </TabsTrigger>
                    <TabsTrigger value="attendance" className="flex items-center gap-2">
                      <Clock className="w-4 h-4" />
                      My Attendance
                    </TabsTrigger>
                    <TabsTrigger value="activity" className="flex items-center gap-2">
                      <Activity className="w-4 h-4" />
                      Activity
                    </TabsTrigger>
                  </TabsList>

                  {/* Overview Tab Content */}
                  <TabsContent value="overview" className="space-y-4">
                    {/* Time Tracking Component */}
                    <TimeTracking employeeRole="department_head" />

                    {/* Team/Department Summary */}
                    <Card className="border-steel-blue">
                      <CardHeader>
                        <CardTitle className="text-navy">
                          {can("view_department") ? "Department Overview" : "Team Overview"}
                        </CardTitle>
                        <CardDescription>
                          {can("view_department")
                            ? `${departmentMembers.length} members in ${userDepartment} department`
                            : `${teamMembers.length} team members under your supervision`}
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="overflow-x-auto border rounded-md">
                          <Table>
                            <TableHeader>
                              <TableRow>
                                <TableHead>Name</TableHead>
                                <TableHead>Position</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead>Action</TableHead>
                              </TableRow>
                            </TableHeader>
                            <TableBody>
                              {(can("view_department") ? departmentMembers : teamMembers).map((member) => (
                                <TableRow key={member.email}>
                                  <TableCell className="font-medium">{member.name}</TableCell>
                                  <TableCell>{member.jobTitle || "Employee"}</TableCell>
                                  <TableCell>
                                    <Badge className="text-green-800 bg-green-100">Active</Badge>
                                  </TableCell>
                                  <TableCell>
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      className="text-steel-blue border-steel-blue hover:bg-steel-blue/10"
                                      onClick={() => viewUserDetails(member)}
                                    >
                                      View Details
                                    </Button>
                                  </TableCell>
                                </TableRow>
                              ))}
                            </TableBody>
                          </Table>
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
                      <CardHeader className="flex items-center justify-between">
                        <CardTitle className="text-navy">Recent Activities</CardTitle>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={refreshActivities}
                          className="text-steel-blue border-steel-blue hover:bg-steel-blue/10"
                        >
                          Refresh
                        </Button>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-4">
                          {recentActivities.length > 0 ? (
                            <div className="overflow-x-auto border rounded-md">
                              <Table>
                                <TableHeader>
                                  <TableRow>
                                    <TableHead>Type</TableHead>
                                    <TableHead>User</TableHead>
                                    <TableHead>Description</TableHead>
                                    <TableHead>Time</TableHead>
                                  </TableRow>
                                </TableHeader>
                                <TableBody>
                                  {recentActivities.map((activity, index) => (
                                    <TableRow key={index}>
                                      <TableCell className="whitespace-nowrap">
                                        <div className="flex items-center">
                                          {getActivityIcon(activity.type)}
                                          <span className="ml-2">{activity.type}</span>
                                        </div>
                                      </TableCell>
                                      <TableCell>{activity.userName}</TableCell>
                                      <TableCell>{activity.description}</TableCell>
                                      <TableCell className="whitespace-nowrap">
                                        {new Date(activity.timestamp).toLocaleString()}
                                      </TableCell>
                                    </TableRow>
                                  ))}
                                </TableBody>
                              </Table>
                            </div>
                          ) : (
                            <div className="py-4 text-center text-muted-foreground">No recent activities found</div>
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
                    {can("view_department") ? "Department Manager" : "Supervisor"}
                  </Badge>
                </div>
                <TimeTracking employeeRole="department_head" />
                <AttendanceHistory />
              </div>
            )}

            {activeTab === "team" && (
              <div className="grid gap-4">
                <div className="flex items-center justify-between">
                  <h1 className="text-2xl font-bold text-navy">
                    {can("view_department") ? "Department Members" : "Team Members"}
                  </h1>
                  <Badge variant="outline" className="border-navy text-navy">
                    {can("view_department") ? "Department Manager" : "Supervisor"}
                  </Badge>
                </div>
                <Card className="border-steel-blue">
                  <CardHeader>
                    <CardTitle className="text-navy">
                      {can("view_department") ? `${userDepartment} Department` : "My Team"}
                    </CardTitle>
                    <CardDescription>
                      {can("view_department")
                        ? `${departmentMembers.length} members in your department`
                        : `${teamMembers.length} members in your team`}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="overflow-x-auto border rounded-md">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Name</TableHead>
                            <TableHead>Email</TableHead>
                            <TableHead>Position</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Action</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {(can("view_department") ? departmentMembers : teamMembers).map((member) => (
                            <TableRow key={member.email}>
                              <TableCell className="font-medium">{member.name}</TableCell>
                              <TableCell>{member.email}</TableCell>
                              <TableCell>{member.jobTitle || "Employee"}</TableCell>
                              <TableCell>
                                <Badge className="text-green-800 bg-green-100">Active</Badge>
                              </TableCell>
                              <TableCell>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="text-steel-blue border-steel-blue hover:bg-steel-blue/10"
                                  onClick={() => viewUserDetails(member)}
                                >
                                  View Details
                                </Button>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}

            {activeTab === "profile" && <UserProfile />}

            {activeTab === "settings" && (
              <Card className="border-steel-blue">
                <CardHeader>
                  <CardTitle className="text-navy">Settings</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    <div>
                      <h3 className="mb-2 text-lg font-medium text-navy">Notification Preferences</h3>
                      <div className="space-y-4">
                        <div className="flex items-center space-x-2">
                          <input type="checkbox" id="email-notifications" defaultChecked />
                          <label htmlFor="email-notifications">Email notifications for team updates</label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <input type="checkbox" id="attendance-alerts" defaultChecked />
                          <label htmlFor="attendance-alerts">Attendance alerts for team members</label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <input type="checkbox" id="leave-requests" defaultChecked />
                          <label htmlFor="leave-requests">Leave request notifications</label>
                        </div>
                      </div>
                    </div>

                    <div>
                      <h3 className="mb-2 text-lg font-medium text-navy">Display Settings</h3>
                      <div className="space-y-4">
                        <div className="flex items-center space-x-2">
                          <input type="checkbox" id="dark-mode" />
                          <label htmlFor="dark-mode">Dark mode</label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <input type="checkbox" id="compact-view" />
                          <label htmlFor="compact-view">Compact view</label>
                        </div>
                      </div>
                    </div>

                    <div className="flex justify-end space-x-2">
                      <Button variant="outline" onClick={() => setActiveTab("dashboard")}>
                        Cancel
                      </Button>
                      <Button
                        className="bg-steel-blue hover:bg-steel-blue/90"
                        onClick={() => {
                          toast({
                            title: "Settings Saved",
                            description: "Your settings have been saved successfully.",
                          })
                        }}
                      >
                        Save Changes
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </main>
      </div>
      <Toaster />
      <Toaster />
    </div>
  )
}
