"use client"

import { DropdownMenuItem } from "@/components/ui/dropdown-menu"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import {
  Bell,
  Calendar,
  FileText,
  Home,
  LogOut,
  Menu,
  PlusCircle,
  Users,
  AlertCircle,
  Shield,
  User,
  Settings,
  ChevronLeft,
  ChevronRight,
  Save,
  RefreshCw,
  Clock,
  BarChart2,
  Activity,
  Lock,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { AttendanceChart } from "@/components/attendance-chart"
import { UsersList } from "@/components/users-list"
import { AddUserForm } from "@/components/add-user-form"
import { AttendanceReport } from "@/components/attendance-report"
import { IssuesList } from "@/components/issues-list"
import { ManageBulletins } from "@/components/manage-bulletins"
import { LeaveManagement } from "@/components/leave-management"
import { TimeTracking } from "@/components/time-tracking"
import { AttendanceHistory } from "@/components/attendance-history"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { toast } from "@/components/ui/use-toast"
import { Toaster } from "@/components/ui/toaster"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { ProtectedComponent } from "@/components/protected-component"
import { Permission } from "@/lib/rbac"
import { usePermissions } from "@/hooks/use-permissions"

// Define the settings interface
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

export default function AdminDashboard() {
  const router = useRouter()
  const { can } = usePermissions()
  const [activeTab, setActiveTab] = useState<string>("dashboard")
  const [activeDashboardTab, setActiveDashboardTab] = useState("overview")
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [showEmployeeList, setShowEmployeeList] = useState<string | null>(null)
  const [showAlert, setShowAlert] = useState(false)
  const [settingsChanged, setSettingsChanged] = useState(false)
  const [settings, setSettings] = useState<AdminSettings>(defaultSettings)
  // const userRole = localStorage.getItem("userRole") // Example, replace with your actual auth logic
  const userDepartment = "Example Department" // Example, replace with your actual auth logic
  const [presentCount, setPresentCount] = useState(0)
  const [recentActivities, setRecentActivities] = useState<any[]>([])
  const [userRole, setUserRole] = useState<string | null>(null)
const [userEmail, setUserEmail] = useState("")
const [userName, setUserName] = useState("")

const [permissionsLoaded, setPermissionsLoaded] = useState(false);
const [userPermissions, setUserPermissions] = useState<string[]>([]);

const [userCount, setUserCount] = useState<number>(0)
  const userInitials =
    userName
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase() || userEmail.charAt(0).toUpperCase()

  // Function to refresh attendance data
  const refreshAttendanceData = () => {
    // Load team attendance for today
    const today = new Date().toISOString().split("T")[0]
    const teamAttendance = JSON.parse(localStorage.getItem("teamAttendance") || "{}")
    const todayAttendance = teamAttendance[today] || { attendees: [] }

    // Update the present count in the cards
    setPresentCount(todayAttendance.attendees.length)
  }

  // Function to refresh activities
  const refreshActivities = () => {
    const allActivities = JSON.parse(localStorage.getItem("recentActivities") || "[]")
    setRecentActivities(allActivities.slice(0, 10))
  }

  // Load settings from localStorage on component mount
  useEffect(() => {
    if (typeof window !== "undefined") {
    const role = localStorage.getItem("userRole")
    const email = localStorage.getItem("userEmail") || ""
    const name = localStorage.getItem("userName") || ""

    const users = JSON.parse(localStorage.getItem("users") || "[]")
    setUserCount(users.length)

    setUserRole(role)
    setUserEmail(email)
    setUserName(name)
  }
  setUserPermissions([
    Permission.MANAGE_USERS,
      Permission.VIEW_ALL_ATTENDANCE,
      Permission.APPROVE_DEPARTMENT_LEAVE,
      Permission.REPORT_ISSUE,
      Permission.MANAGE_BULLETINS,
      Permission.MANAGE_SETTINGS,
      Permission.MANAGE_BLOCKCHAIN,
  ])

  const loadPermissions = async () => {
    // Simulate async permission loading (e.g., from localStorage, context, or API)
    await new Promise(resolve => setTimeout(resolve, 500)); // simulate delay

    // After permission logic here, you can check and set permissions
    // For example: const userPermissions = getUserPermissions();

    setPermissionsLoaded(true);
  };

  loadPermissions();
    const savedSettings = localStorage.getItem("adminSettings")
    if (savedSettings) {
      setSettings(JSON.parse(savedSettings))
    }


    // Initial load of attendance data
    refreshAttendanceData()

    // Initial load of activities
    refreshActivities()

    // Set up interval to refresh data
    const intervalId = setInterval(() => {
      refreshAttendanceData()
      refreshActivities()
    }, 5000) // Refresh every 5 seconds for more real-time updates

    return () => clearInterval(intervalId)
  }, [])

  const handleSignOut = () => {
    // Record sign out activity
    recordActivity("Admin logout", `${userName} signed out`)

    localStorage.removeItem("userRole")
    router.push("/")
  }

  const handleAlertClick = () => {
    setShowAlert(true)
    setTimeout(() => setShowAlert(false), 5000)
  }

  const toggleSidebar = () => {
    setSidebarCollapsed(!sidebarCollapsed)
  }

  // Function to record activity
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

  // Handle input changes for text fields
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target
    setSettings((prev) => ({
      ...prev,
      [id]: value,
    }))
  }

  // Handle checkbox changes
  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, checked } = e.target
    setSettings((prev) => ({
      ...prev,
      [id]: checked,
    }))
  }

  // Save settings to localStorage
  const handleSaveSettings = () => {
    localStorage.setItem("adminSettings", JSON.stringify(settings))
    setSettingsChanged(true)

    // Record activity
    recordActivity("Settings Update", `${userName} updated system settings`)

    // Show success message
    toast({
      title: "Settings Saved",
      description: "Your settings have been saved successfully.",
    })

    // Reset the success message after 3 seconds
    setTimeout(() => {
      setSettingsChanged(false)
    }, 3000)
  }

  // Get activity icon based on type
  const getActivityIcon = (type: string) => {
    switch (type) {
      case "User login":
      case "User logout":
      case "Admin login":
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

  // Unauthorized access component
  const UnauthorizedAccess = () => (
    <Card className="border-red-300">
      <CardHeader>
        <CardTitle className="flex items-center text-red-600">
          <Lock className="w-5 h-5 mr-2" />
          Access Denied
        </CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-muted-foreground">
          You do not have permission to access this feature. Please contact your administrator if you believe this is an
          error.
        </p>
      </CardContent>
    </Card>
  )

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
              <h2 className="text-xl font-semibold">Admin Dashboard</h2>
            </div>
            <nav className="grid gap-1 p-4 text-lg font-medium">
              <Button
                variant="ghost"
                className="justify-start h-12 gap-2 text-white hover:bg-navy/80"
                onClick={() => {
                  if (typeof setActiveTab === "function") {
                    setActiveTab("dashboard")
                  } else {
                    console.error("setActiveTab is not a function");
                  }
                  // Close the sheet when a menu item is clicked on mobile
                  (document.querySelector("[data-radix-collection-item]") as HTMLElement)?.click()
                }}
              >
                <Home className="w-5 h-5" />
                Dashboard
              </Button>
              <Button
                variant="ghost"
                className="justify-start h-12 gap-2 text-white hover:bg-navy/80"
                onClick={() => {
                  setActiveTab("my-attendance");
                  (document.querySelector("[data-radix-collection-item]") as HTMLElement)?.click()
                }}
              >
                <Clock className="w-5 h-5" />
                My Attendance
              </Button>

              <ProtectedComponent requiredPermission={Permission.MANAGE_USERS}>
                <Button
                  variant="ghost"
                  className="justify-start h-12 gap-2 text-white hover:bg-navy/80"
                  onClick={() => {
                    setActiveTab("users"); 
                    (document.querySelector("[data-radix-collection-item]") as HTMLElement)?.click()
                  }}
                >
                  <Users className="w-5 h-5" />
                  Users
                </Button>
              </ProtectedComponent>

              <ProtectedComponent requiredPermission={Permission.MANAGE_USERS}>
                <Button
                  variant="ghost"
                  className="justify-start h-12 gap-2 text-white hover:bg-navy/80"
                  onClick={() => {
                    setActiveTab("add-user");
                    (document.querySelector("[data-radix-collection-item]") as HTMLElement)?.click()
                  }}
                >
                  <PlusCircle className="w-5 h-5" />
                  Add User
                </Button>
              </ProtectedComponent>

              <ProtectedComponent requiredPermission={Permission.VIEW_ALL_ATTENDANCE}>
                <Button
                  variant="ghost"
                  className="justify-start h-12 gap-2 text-white hover:bg-navy/80"
                  onClick={() => {
                    setActiveTab("attendance");
                    (document.querySelector("[data-radix-collection-item]") as HTMLElement)?.click()
                  }}
                >
                  <FileText className="w-5 h-5" />
                  Attendance Report
                </Button>
              </ProtectedComponent>

              <ProtectedComponent requiredPermission={Permission.APPROVE_DEPARTMENT_LEAVE}>
                <Button
                  variant="ghost"
                  className="justify-start h-12 gap-2 text-white hover:bg-navy/80"
                  onClick={() => {
                    setActiveTab("leave");
                    (document.querySelector("[data-radix-collection-item]") as HTMLElement)?.click()
                  }}
                >
                  <Calendar className="w-5 h-5" />
                  Leave Applications
                </Button>
              </ProtectedComponent>

              <ProtectedComponent requiredPermission={Permission.REPORT_ISSUE}>
                <Button
                  variant="ghost"
                  className="justify-start h-12 gap-2 text-white hover:bg-navy/80"
                  onClick={() => {
                    setActiveTab("issues");
                    (document.querySelector("[data-radix-collection-item]") as HTMLElement)?.click()
                  }}
                >
                  <AlertCircle className="w-5 h-5" />
                  Issues
                </Button>
              </ProtectedComponent>

              <ProtectedComponent requiredPermission={Permission.MANAGE_BULLETINS}>
                <Button
                  variant="ghost"
                  className="justify-start h-12 gap-2 text-white hover:bg-navy/80"
                  onClick={() => {
                    setActiveTab("bulletins");
                    (document.querySelector("[data-radix-collection-item]") as HTMLElement)?.click()
                  }}
                >
                  <Shield className="w-5 h-5" />
                  Manage Bulletins
                </Button>
              </ProtectedComponent>

              <Button
                variant="ghost"
                className="justify-start h-12 gap-2 text-white hover:bg-navy/80"
                onClick={handleAlertClick}
              >
                <Bell className="w-5 h-5" />
                Alerts
              </Button>

              <ProtectedComponent requiredPermission={Permission.MANAGE_SETTINGS}>
                <Button
                  variant="ghost"
                  className="justify-start h-12 gap-2 text-white hover:bg-navy/80"
                  onClick={() => {
                    setActiveTab("settings");
                    (document.querySelector("[data-radix-collection-item]") as HTMLElement)?.click()
                  }}
                >
                  <Settings className="w-5 h-5" />
                  Settings
                </Button>
              </ProtectedComponent>
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
          <span className="text-lg font-semibold">{settings.companyName}</span>
        </div>
        <div className="flex items-center gap-4 ml-auto">
          <Button
            variant="outline"
            size="icon"
            onClick={handleAlertClick}
            className="text-white border-white bg-navy hover:bg-navy/80"
          >
            <Bell className="w-5 h-5" />
            <span className="sr-only">Alerts</span>
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Avatar className="border-2 border-white cursor-pointer">
                <AvatarImage src="/placeholder.svg" alt="User" />
                <AvatarFallback className="text-white bg-navy">{userInitials}</AvatarFallback>
              </Avatar>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Admin Account</DropdownMenuLabel>
              <DropdownMenuItem onClick={() => setActiveTab("profile")}>
                <User className="w-4 h-4 mr-2" />
                Profile
              </DropdownMenuItem>
              <ProtectedComponent requiredPermission={Permission.MANAGE_SETTINGS}>
                <DropdownMenuItem onClick={() => setActiveTab("settings")}>
                  <Settings className="w-4 h-4 mr-2" />
                  Settings
                </DropdownMenuItem>
              </ProtectedComponent>
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
          className={`hidden md:block border-r bg-navy text-white transition-all duration-300 ${
            sidebarCollapsed ? "w-16" : "w-64"
          }`}
        >
          <div className="flex justify-end p-2">
            <Button variant="ghost" size="icon" className="text-white hover:bg-navy/80" onClick={toggleSidebar}>
              {sidebarCollapsed ? <ChevronRight className="w-5 h-5" /> : <ChevronLeft className="w-5 h-5" />}
            </Button>
          </div>
          <nav className="grid gap-2 p-4 text-sm font-medium">
            <Button
              variant={activeTab === "dashboard" ? "secondary" : "ghost"}
              className={`justify-start gap-2 ${
                activeTab === "dashboard" ? "bg-steel-blue text-white" : "text-white hover:bg-navy/80"
              }`}
              onClick={() => setActiveTab("dashboard")}
            >
              <Home className="w-5 h-5" />
              {!sidebarCollapsed && <span>Dashboard</span>}
            </Button>
            <Button
              variant={activeTab === "my-attendance" ? "secondary" : "ghost"}
              className={`justify-start gap-2 ${
                activeTab === "my-attendance" ? "bg-steel-blue text-white" : "text-white hover:bg-navy/80"
              }`}
              onClick={() => setActiveTab("my-attendance")}
            >
              <Clock className="w-5 h-5" />
              {!sidebarCollapsed && <span>My Attendance</span>}
            </Button>

            <ProtectedComponent requiredPermission={Permission.MANAGE_USERS}>
              <Button
                variant={activeTab === "users" ? "secondary" : "ghost"}
                className={`justify-start gap-2 ${
                  activeTab === "users" ? "bg-steel-blue text-white" : "text-white hover:bg-navy/80"
                }`}
                onClick={() => setActiveTab("users")}
              >
                <Users className="w-5 h-5" />
                {!sidebarCollapsed && <span>Users</span>}
              </Button>
            </ProtectedComponent>

            <ProtectedComponent requiredPermission={Permission.MANAGE_USERS}>
              <Button
                variant={activeTab === "add-user" ? "secondary" : "ghost"}
                className={`justify-start gap-2 ${
                  activeTab === "add-user" ? "bg-steel-blue text-white" : "text-white hover:bg-navy/80"
                }`}
                onClick={() => setActiveTab("add-user")}
              >
                <PlusCircle className="w-5 h-5" />
                {!sidebarCollapsed && <span>Add User</span>}
              </Button>
            </ProtectedComponent>

            <ProtectedComponent requiredPermission={Permission.VIEW_ALL_ATTENDANCE}>
              <Button
                variant={activeTab === "attendance" ? "secondary" : "ghost"}
                className={`justify-start gap-2 ${
                  activeTab === "attendance" ? "bg-steel-blue text-white" : "text-white hover:bg-navy/80"
                }`}
                onClick={() => setActiveTab("attendance")}
              >
                <FileText className="w-5 h-5" />
                {!sidebarCollapsed && <span>Attendance Report</span>}
              </Button>
            </ProtectedComponent>

            <ProtectedComponent requiredPermission={Permission.APPROVE_DEPARTMENT_LEAVE}>
              <Button
                variant={activeTab === "leave" ? "secondary" : "ghost"}
                className={`justify-start gap-2 ${
                  activeTab === "leave" ? "bg-steel-blue text-white" : "text-white hover:bg-navy/80"
                }`}
                onClick={() => setActiveTab("leave")}
              >
                <Calendar className="w-5 h-5" />
                {!sidebarCollapsed && <span>Leave Applications</span>}
              </Button>
            </ProtectedComponent>

            <ProtectedComponent requiredPermission={Permission.REPORT_ISSUE}>
              <Button
                variant={activeTab === "issues" ? "secondary" : "ghost"}
                className={`justify-start gap-2 ${
                  activeTab === "issues" ? "bg-steel-blue text-white" : "text-white hover:bg-navy/80"
                }`}
                onClick={() => setActiveTab("issues")}
              >
                <AlertCircle className="w-5 h-5" />
                {!sidebarCollapsed && <span>Issues</span>}
              </Button>
            </ProtectedComponent>

            <ProtectedComponent requiredPermission={Permission.MANAGE_BULLETINS}>
              <Button
                variant={activeTab === "bulletins" ? "secondary" : "ghost"}
                className={`justify-start gap-2 ${
                  activeTab === "bulletins" ? "bg-steel-blue text-white" : "text-white hover:bg-navy/80"
                }`}
                onClick={() => setActiveTab("bulletins")}
              >
                <Shield className="w-5 h-5" />
                {!sidebarCollapsed && <span>Manage Bulletins</span>}
              </Button>
            </ProtectedComponent>

            <Button
              variant="ghost"
              className="justify-start gap-2 text-white hover:bg-navy/80"
              onClick={handleAlertClick}
            >
              <Bell className="w-5 h-5" />
              {!sidebarCollapsed && <span>Alerts</span>}
            </Button>

            <ProtectedComponent requiredPermission={Permission.MANAGE_SETTINGS}>
              <Button
                variant={activeTab === "settings" ? "secondary" : "ghost"}
                className={`justify-start gap-2 ${
                  activeTab === "settings" ? "bg-steel-blue text-white" : "text-white hover:bg-navy/80"
                }`}
                onClick={() => setActiveTab("settings")}
              >
                <Settings className="w-5 h-5" />
                {!sidebarCollapsed && <span>Settings</span>}
              </Button>
            </ProtectedComponent>
          </nav>
        </aside>
        <main className="flex-1 p-4 md:p-6">
          {showAlert && (
            <Alert className="mb-4 text-white bg-steel-blue">
              <Bell className="w-4 h-4" />
              <AlertTitle>System Alert</AlertTitle>
              <AlertDescription>There are 3 employees with attendance issues this month.</AlertDescription>
            </Alert>
          )}

          <div className="grid gap-4">
            {activeTab === "dashboard" && (
              <div className="grid gap-4">
                <div className="flex items-center justify-between">
                  <h1 className="text-2xl font-bold text-navy">Admin Dashboard</h1>
                  <Badge variant="outline" className="border-navy text-navy">
                    Admin
                  </Badge>
                </div>

                {/* Dashboard Tabs */}
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
                  <div className="grid gap-4">
                    {!permissionsLoaded ? (
                      <div className="text-center py-8">Loading dashboard...</div>
                    ) : (
                    
                  <TabsContent value="overview" className="space-y-4">
                    {/* Summary Cards - Aligned in a consistent grid */}
                    <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
                      <Card
                        className="transition-colors cursor-pointer border-steel-blue hover:bg-steel-blue/10"
                        onClick={() => setShowEmployeeList("total")}
                      >
                        <CardHeader className="pb-2">
                          <CardTitle className="text-sm font-medium text-navy">Total Employees</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="text-2xl font-bold text-navy">
                            {/* {JSON.parse(localStorage.getItem("users") || "[]").length} */}
                            {userCount}
                          </div>
                        </CardContent>
                      </Card>
                      <Card
                        className="transition-colors cursor-pointer border-steel-blue hover:bg-steel-blue/10"
                        onClick={() => setShowEmployeeList("present")}
                      >
                        <CardHeader className="pb-2">
                          <CardTitle className="text-sm font-medium text-navy">Present Today</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="text-2xl font-bold text-navy">{presentCount}</div>
                        </CardContent>
                      </Card>
                      <Card
                        className="transition-colors cursor-pointer border-steel-blue hover:bg-steel-blue/10"
                        onClick={() => setShowEmployeeList("leave")}
                      >
                        <CardHeader className="pb-2">
                          <CardTitle className="text-sm font-medium text-navy">On Leave</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="text-2xl font-bold text-navy">2</div>
                        </CardContent>
                      </Card>
                      <Card
                        className="transition-colors cursor-pointer border-steel-blue hover:bg-steel-blue/10"
                        onClick={() => setShowEmployeeList("absent")}
                      >
                        <CardHeader className="pb-2">
                          <CardTitle className="text-sm font-medium text-navy">Absent</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="text-2xl font-bold text-navy">
                            {/* {JSON.parse(localStorage.getItem("users") || "[]").length - presentCount - 2} */}
                            {userCount - presentCount - 2}
                          </div>
                        </CardContent>
                      </Card>
                    </div>

                    {/* Attendance Chart - Moved up for better visibility */}
                    <ProtectedComponent
                      requiredPermission={Permission.VIEW_ALL_ATTENDANCE}
                      fallback={<UnauthorizedAccess />}
                    >
                      <Card className="border-steel-blue">
                        <CardHeader>
                          <CardTitle className="text-navy">Attendance Overview</CardTitle>
                          <CardDescription>Monthly attendance statistics</CardDescription>
                        </CardHeader>
                        <CardContent>
                          <AttendanceChart />
                        </CardContent>
                      </Card>
                    </ProtectedComponent>

                    {/* Employee List Modal */}
                    {showEmployeeList && (
                      <Card className="mt-4 border-steel-blue">
                        <CardHeader className="flex flex-row items-center justify-between">
                          <CardTitle className="text-navy">
                            {showEmployeeList === "total" && "All Employees"}
                            {showEmployeeList === "present" && "Present Employees"}
                            {showEmployeeList === "leave" && "Employees on Leave"}
                            {showEmployeeList === "absent" && "Absent Employees"}
                          </CardTitle>
                          <Button variant="outline" size="sm" onClick={() => setShowEmployeeList(null)}>
                            Close
                          </Button>
                        </CardHeader>
                        <CardContent>
                          <div className="overflow-x-auto border rounded-md">
                            <Table>
                              <TableHeader>
                                <TableRow>
                                  <TableHead>Employee</TableHead>
                                  <TableHead>Department</TableHead>
                                  <TableHead>Status</TableHead>
                                  {showEmployeeList === "present" && <TableHead>Check-in Time</TableHead>}
                                </TableRow>
                              </TableHeader>
                              <TableBody>
                                {showEmployeeList === "total" && (
                                  <>
                                    {JSON.parse(localStorage.getItem("users") || "[]").map((user: any) => (
                                      <TableRow key={user.id}>
                                        <TableCell className="font-medium">{user.name}</TableCell>
                                        <TableCell>{user.department}</TableCell>
                                        <TableCell>
                                          <Badge className="text-green-800 bg-green-100">Active</Badge>
                                        </TableCell>
                                      </TableRow>
                                    ))}
                                  </>
                                )}
                                {showEmployeeList === "present" && (
                                  <>
                                    {(() => {
                                      const today = new Date().toISOString().split("T")[0]
                                      const teamAttendance = JSON.parse(localStorage.getItem("teamAttendance") || "{}")
                                      const todayAttendance = teamAttendance[today] || { attendees: [] }

                                      return todayAttendance.attendees.map((attendee: any) => (
                                        <TableRow key={attendee.email}>
                                          <TableCell className="font-medium">{attendee.name}</TableCell>
                                          <TableCell>{attendee.department}</TableCell>
                                          <TableCell>
                                            <Badge className="text-green-800 bg-green-100">Present</Badge>
                                          </TableCell>
                                          <TableCell>{new Date(attendee.checkInTime).toLocaleTimeString()}</TableCell>
                                        </TableRow>
                                      ))
                                    })()}
                                  </>
                                )}
                                {showEmployeeList === "leave" && (
                                  <>
                                    <TableRow>
                                      <TableCell className="font-medium">Michael Wilson</TableCell>
                                      <TableCell>Engineering</TableCell>
                                      <TableCell>
                                        <Badge className="text-yellow-800 bg-yellow-100">On Leave</Badge>
                                      </TableCell>
                                    </TableRow>
                                    <TableRow>
                                      <TableCell className="font-medium">Sarah Brown</TableCell>
                                      <TableCell>Marketing</TableCell>
                                      <TableCell>
                                        <Badge className="text-yellow-800 bg-yellow-100">On Leave</Badge>
                                      </TableCell>
                                    </TableRow>
                                  </>
                                )}
                                {showEmployeeList === "absent" && (
                                  <>
                                    {(() => {
                                      const users = JSON.parse(localStorage.getItem("users") || "[]")
                                      const today = new Date().toISOString().split("T")[0]
                                      const teamAttendance = JSON.parse(localStorage.getItem("teamAttendance") || "{}")
                                      const todayAttendance = teamAttendance[today] || { attendees: [] }

                                      // Get emails of present users
                                      const presentEmails = todayAttendance.attendees.map((a: any) => a.email)

                                      // Filter users who are not present and not on leave
                                      const absentUsers = users.filter(
                                        (user: any) =>
                                          !presentEmails.includes(user.email) &&
                                          user.name !== "Michael Wilson" &&
                                          user.name !== "Sarah Brown",
                                      )

                                      return absentUsers.map((user: any) => (
                                        <TableRow key={user.id}>
                                          <TableCell className="font-medium">{user.name}</TableCell>
                                          <TableCell>{user.department}</TableCell>
                                          <TableCell>
                                            <Badge className="text-red-800 bg-red-100">Absent</Badge>
                                          </TableCell>
                                        </TableRow>
                                      ))
                                    })()}
                                  </>
                                )}
                              </TableBody>
                            </Table>
                          </div>
                        </CardContent>
                      </Card>
                    )}
                  </TabsContent>
                    )}
                  </div>

                  {/* My Attendance Tab Content */}
                  <TabsContent value="attendance" className="space-y-4">
                    <TimeTracking employeeRole="executive" />
                    <AttendanceHistory />
                  </TabsContent>

                  {/* Activity Tab Content */}
                  <TabsContent value="activity" className="space-y-4">
                    <Card className="border-steel-blue">
                      <CardHeader className="flex items-center justify-between">
                        <CardTitle className="text-navy">Recent System Activities</CardTitle>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={refreshActivities}
                          className="text-steel-blue border-steel-blue hover:bg-steel-blue/10"
                        >
                          <RefreshCw className="w-4 h-4 mr-1" />
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
                    Admin
                  </Badge>
                </div>
                <TimeTracking employeeRole="executive" />
                <AttendanceHistory />
              </div>
            )}

            {activeTab === "users" && (
              <ProtectedComponent requiredPermission={Permission.MANAGE_USERS} fallback={<UnauthorizedAccess />}>
                <UsersList />
              </ProtectedComponent>
            )}

            {activeTab === "add-user" && (
              <ProtectedComponent requiredPermission={Permission.MANAGE_USERS} fallback={<UnauthorizedAccess />}>
                <AddUserForm />
              </ProtectedComponent>
            )}

            {activeTab === "attendance" && (
              <ProtectedComponent requiredPermission={Permission.VIEW_ALL_ATTENDANCE} fallback={<UnauthorizedAccess />}>
                <AttendanceReport />
              </ProtectedComponent>
            )}

            {activeTab === "leave" && (
              <ProtectedComponent
                requiredPermission={Permission.APPROVE_DEPARTMENT_LEAVE}
                fallback={<UnauthorizedAccess />}
              >
                <LeaveManagement userRole={(userRole === "hr" || userRole === "department_head" ? userRole : "hr")} department={userDepartment} />
              </ProtectedComponent>
            )}

            {activeTab === "issues" && (
              <ProtectedComponent requiredPermission={Permission.REPORT_ISSUE} fallback={<UnauthorizedAccess />}>
                <IssuesList />
              </ProtectedComponent>
            )}

            {activeTab === "bulletins" && (
              <ProtectedComponent requiredPermission={Permission.MANAGE_BULLETINS} fallback={<UnauthorizedAccess />}>
                <ManageBulletins />
              </ProtectedComponent>
            )}

            {activeTab === "settings" && (
              <ProtectedComponent requiredPermission={Permission.MANAGE_SETTINGS} fallback={<UnauthorizedAccess />}>
                <Card className="border-steel-blue">
                  <CardHeader>
                    <CardTitle className="text-navy">Admin Settings</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-6">
                      <div>
                        <h3 className="mb-2 text-lg font-medium text-navy">System Settings</h3>
                        <div className="space-y-4">
                          <div className="flex flex-col space-y-2">
                            <label htmlFor="companyName" className="text-sm font-medium">
                              Company Name
                            </label>
                            <input
                              type="text"
                              id="companyName"
                              value={settings.companyName}
                              onChange={handleInputChange}
                              className="p-2 border rounded-md border-steel-blue"
                            />
                          </div>
                          <div className="flex flex-col space-y-2">
                            <label htmlFor="workHours" className="text-sm font-medium">
                              Work Hours
                            </label>
                            <div className="flex space-x-2">
                              <input
                                type="time"
                                id="workStartTime"
                                value={settings.workStartTime}
                                onChange={handleInputChange}
                                className="p-2 border rounded-md border-steel-blue"
                              />
                              <span className="self-center">to</span>
                              <input
                                type="time"
                                id="workEndTime"
                                value={settings.workEndTime}
                                onChange={handleInputChange}
                                className="p-2 border rounded-md border-steel-blue"
                              />
                            </div>
                          </div>
                        </div>
                      </div>

                      <div>
                        <h3 className="mb-2 text-lg font-medium text-navy">Security Settings</h3>
                        <div className="space-y-2">
                          <div className="flex items-center space-x-2">
                            <input
                              type="checkbox"
                              id="twoFactorAuth"
                              checked={settings.twoFactorAuth}
                              onChange={handleCheckboxChange}
                            />
                            <label htmlFor="twoFactorAuth">Enable two-factor authentication</label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <input
                              type="checkbox"
                              id="ipRestrict"
                              checked={settings.ipRestrict}
                              onChange={handleCheckboxChange}
                            />
                            <label htmlFor="ipRestrict">Restrict login to specific IP addresses</label>
                          </div>

                          {settings.twoFactorAuth && (
                            <div className="p-3 mt-2 text-blue-800 rounded-md bg-blue-50">
                              <p className="text-sm">
                                Two-factor authentication is enabled. All users will be required to verify their
                                identity using a secondary method.
                              </p>
                            </div>
                          )}

                          {settings.ipRestrict && (
                            <div className="p-3 mt-2 text-blue-800 rounded-md bg-blue-50">
                              <p className="text-sm">
                                IP restriction is enabled. Only authorized IP addresses will be able to access the
                                system.
                              </p>
                            </div>
                          )}
                        </div>
                      </div>

                      <ProtectedComponent
                        requiredPermission={Permission.MANAGE_BLOCKCHAIN}
                        fallback={
                          <div className="p-3 text-yellow-800 rounded-md bg-yellow-50">
                            <p className="text-sm">You do not have permission to modify blockchain settings.</p>
                          </div>
                        }
                      >
                        <div>
                          <h3 className="mb-2 text-lg font-medium text-navy">Blockchain Settings</h3>
                          <div className="space-y-4">
                            <div className="flex flex-col space-y-2">
                              <label htmlFor="blockchainNodeUrl" className="text-sm font-medium">
                                Blockchain Node URL
                              </label>
                              <input
                                type="text"
                                id="blockchainNodeUrl"
                                value={settings.blockchainNodeUrl}
                                onChange={handleInputChange}
                                className="p-2 border rounded-md border-steel-blue"
                              />
                            </div>
                            <div className="flex flex-col space-y-2">
                              <label htmlFor="smartContractAddress" className="text-sm font-medium">
                                Smart Contract Address
                              </label>
                              <input
                                type="text"
                                id="smartContractAddress"
                                value={settings.smartContractAddress}
                                onChange={handleInputChange}
                                className="p-2 border rounded-md border-steel-blue"
                              />
                            </div>
                          </div>
                        </div>
                      </ProtectedComponent>

                      <div className="flex justify-end space-x-2">
                        <Button variant="outline" onClick={() => setActiveTab("dashboard")}>
                          Cancel
                        </Button>
                        <Button className="bg-steel-blue hover:bg-steel-blue/90" onClick={handleSaveSettings}>
                          <Save className="w-4 h-4 mr-2" />
                          Save Changes
                        </Button>
                      </div>

                      {settingsChanged && (
                        <div className="p-3 mt-4 text-green-800 bg-green-100 rounded-md">
                          Settings saved successfully!
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </ProtectedComponent>
            )}
          </div>
        </main>
      </div>
      <Toaster />
    </div>
  )
}
