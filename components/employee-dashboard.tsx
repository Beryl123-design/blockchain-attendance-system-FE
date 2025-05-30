"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import {
  AlertCircle,
  Bell,
  Calendar,
  CheckCircle,
  Clock,
  FileText,
  Home,
  LogOut,
  Menu,
  User,
  Settings,
  ChevronLeft,
  ChevronRight,
  BarChart2,
  Activity,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { TimeTracking } from "@/components/time-tracking"
import { LeaveForm } from "@/components/leave-form"
import { AttendanceHistory } from "@/components/attendance-history"
import { UserProfile } from "@/components/user-profile"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
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

interface UserSettings {
  notifications: {
    email: boolean
    inApp: boolean
  }
  display: {
    darkMode: boolean
    compactView: boolean
  }
}

export default function EmployeeDashboard() {
  const router = useRouter()
  const { userRole, can } = usePermissions()
  const [activeTab, setActiveTab] = useState("dashboard")
  const [activeDashboardTab, setActiveDashboardTab] = useState("overview")
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [settingsChanged, setSettingsChanged] = useState(false)
  const [userSettings, setUserSettings] = useState<UserSettings>({
    notifications: {
      email: true,
      inApp: true,
    },
    display: {
      darkMode: false,
      compactView: false,
    },
  })
  const [recentActivities, setRecentActivities] = useState<any[]>([])
  const [isCheckedIn, setIsCheckedIn] = useState(false)
  const [showCheckInReminder, setShowCheckInReminder] = useState(false)

  // Get user info from localStorage
  const userEmail = localStorage.getItem("userEmail") || ""
  const userName = localStorage.getItem("userName") || ""
  const userInitials =
    userName
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase() || userEmail.charAt(0).toUpperCase()

  // Function to refresh activities
  const refreshActivities = () => {
    const allActivities = JSON.parse(localStorage.getItem("recentActivities") || "[]")
    const userActivities = allActivities.filter((activity: any) => {
      // Check if the activity is related to the current user or is a system activity
      return (
        activity.userEmail === userEmail ||
        (activity.description && activity.description.includes(userName)) ||
        activity.type === "System"
      )
    })
    setRecentActivities(userActivities.slice(0, 5))
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

  // Load settings, activities, and check-in status on component mount
  useEffect(() => {
    // Load user settings if they exist
    const savedSettings = localStorage.getItem(`userSettings_${userEmail}`)
    if (savedSettings) {
      try {
        setUserSettings(JSON.parse(savedSettings))
      } catch (error) {
        console.error("Error parsing user settings:", error)
      }
    }

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
  }, [userEmail, userName])

  // Apply dark mode if enabled
  useEffect(() => {
    if (userSettings.display.darkMode) {
      document.documentElement.classList.add("dark")
    } else {
      document.documentElement.classList.remove("dark")
    }
  }, [userSettings.display.darkMode])

  const handleSignOut = () => {
    // Record sign out activity
    recordActivity("User logout", `${userName} signed out`)

    localStorage.removeItem("userRole")
    router.push("/")
  }

  const toggleSidebar = () => {
    setSidebarCollapsed(!sidebarCollapsed)
  }

  const handleSettingChange = (category: keyof UserSettings, setting: string, value: boolean) => {
    setUserSettings((prev) => ({
      ...prev,
      [category]: {
        ...prev[category],
        [setting]: value,
      },
    }))
  }

  const handleSaveSettings = () => {
    // Save settings to localStorage with user-specific key
    localStorage.setItem(`userSettings_${userEmail}`, JSON.stringify(userSettings))

    // Record activity
    recordActivity("Settings Update", `${userName} updated their settings`)

    setSettingsChanged(true)

    toast({
      title: "Settings Saved",
      description: "Your settings have been saved successfully.",
    })

    // Reset the success message after 3 seconds
    setTimeout(() => {
      setSettingsChanged(false)
    }, 3000)
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

  return (
    <div className={`flex min-h-screen flex-col bg-light-gray ${userSettings.display.compactView ? "text-sm" : ""}`}>
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
              <h2 className="text-xl font-semibold">Employee Dashboard</h2>
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
                  setActiveTab("attendance")
                  const element = document.querySelector("[data-radix-collection-item]");
                  if (element instanceof HTMLElement) {
                    element.click();
                  }
                }}
              >
                <FileText className="w-5 h-5" />
                My Attendance
              </Button>
              <Button
                variant="ghost"
                className="justify-start h-12 gap-2 text-white hover:bg-navy/80"
                onClick={() => {
                  setActiveTab("leave")
                  const element = document.querySelector("[data-radix-collection-item]");
                  if (element instanceof HTMLElement) {
                    element.click();
                  }
                }}
              >
                <Calendar className="w-5 h-5" />
                Apply for Leave
              </Button>
              <Button
                variant="ghost"
                className="justify-start h-12 gap-2 text-white hover:bg-navy/80"
                onClick={() => {
                  setActiveTab("issues")
                  const element = document.querySelector("[data-radix-collection-item]");
                  if (element instanceof HTMLElement) {
                    element.click();
                  }
                }}
              >
                <AlertCircle className="w-5 h-5" />
                Report Issue
              </Button>
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
              variant={activeTab === "profile" ? "secondary" : "ghost"}
              className={`justify-start gap-2 ${activeTab === "profile" ? "bg-steel-blue text-white" : "text-white hover:bg-navy/80"}`}
              onClick={() => setActiveTab("profile")}
            >
              <User className="w-5 h-5" />
              {!sidebarCollapsed && <span>My Profile</span>}
            </Button>
            <Button
              variant={activeTab === "attendance" ? "secondary" : "ghost"}
              className={`justify-start gap-2 ${activeTab === "attendance" ? "bg-steel-blue text-white" : "text-white hover:bg-navy/80"}`}
              onClick={() => setActiveTab("attendance")}
            >
              <FileText className="w-5 h-5" />
              {!sidebarCollapsed && <span>My Attendance</span>}
            </Button>
            <Button
              variant={activeTab === "leave" ? "secondary" : "ghost"}
              className={`justify-start gap-2 ${activeTab === "leave" ? "bg-steel-blue text-white" : "text-white hover:bg-navy/80"}`}
              onClick={() => setActiveTab("leave")}
            >
              <Calendar className="w-5 h-5" />
              {!sidebarCollapsed && <span>Apply for Leave</span>}
            </Button>
            <Button
              variant={activeTab === "issues" ? "secondary" : "ghost"}
              className={`justify-start gap-2 ${activeTab === "issues" ? "bg-steel-blue text-white" : "text-white hover:bg-navy/80"}`}
              onClick={() => setActiveTab("issues")}
            >
              <AlertCircle className="w-5 h-5" />
              {!sidebarCollapsed && <span>Report Issue</span>}
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
                  <h1 className="text-2xl font-bold text-navy">Employee Dashboard</h1>
                  <Badge variant="outline" className="border-navy text-navy">
                    Employee
                  </Badge>
                </div>

                {/* Dashboard Tabs - Consistent with admin dashboard */}
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
                    <TimeTracking employeeRole="employee" />

                    {/* Summary Cards - Aligned in a consistent grid */}
                    <div className="grid grid-cols-2 gap-4">
                      <Card className="border-steel-blue">
                        <CardHeader className="pb-2">
                          <CardTitle className="text-sm font-medium text-navy">This Month</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="text-2xl font-bold text-navy">21/23</div>
                          <p className="text-xs text-muted-foreground">Days Present</p>
                        </CardContent>
                      </Card>
                      <Card className="border-steel-blue">
                        <CardHeader className="pb-2">
                          <CardTitle className="text-sm font-medium text-navy">Leave Balance</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="text-2xl font-bold text-navy">14</div>
                          <p className="text-xs text-muted-foreground">Days Remaining</p>
                        </CardContent>
                      </Card>
                    </div>
                  </TabsContent>

                  {/* Attendance Tab Content */}
                  <TabsContent value="attendance" className="space-y-4">
                    <TimeTracking employeeRole="employee" />
                    <AttendanceHistory />
                  </TabsContent>

                  {/* Activity Tab Content */}
                  <TabsContent value="activity" className="space-y-4">
                    <Card className="border-steel-blue">
                      <CardHeader className="flex items-center justify-between">
                        <CardTitle className="text-navy">My Recent Activity</CardTitle>
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
                            recentActivities.map((activity, index) => (
                              <div key={index} className="flex items-center">
                                <div className="p-2 mr-4 rounded-full bg-steel-blue/10">
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
                            <>
                              <div className="flex items-center">
                                <div className="p-2 mr-4 rounded-full bg-steel-blue/10">
                                  <CheckCircle className="w-4 h-4 text-steel-blue" />
                                </div>
                                <div>
                                  <p className="text-sm font-medium text-navy">No recent activities</p>
                                  <p className="text-xs text-muted-foreground">Your activities will appear here</p>
                                </div>
                              </div>
                            </>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  </TabsContent>
                </Tabs>
              </div>
            )}

            {activeTab === "profile" && <UserProfile />}

            {activeTab === "attendance" && (
              <div className="grid gap-4">
                <div className="flex items-center justify-between">
                  <h1 className="text-2xl font-bold text-navy">My Attendance</h1>
                  <Badge variant="outline" className="border-navy text-navy">
                    Employee
                  </Badge>
                </div>
                <TimeTracking employeeRole="employee" />
                <AttendanceHistory />
              </div>
            )}

            {activeTab === "leave" && <LeaveForm />}

            {activeTab === "issues" && (
              <Card className="border-steel-blue">
                <CardHeader>
                  <CardTitle className="text-navy">Report an Issue</CardTitle>
                </CardHeader>
                <CardContent>
                  <form
                    className="space-y-4"
                    onSubmit={(e) => {
                      e.preventDefault()
                      const form = e.target as HTMLFormElement
                      const issueType = (form.elements.namedItem("issueType") as HTMLSelectElement).value
                      const description = (form.elements.namedItem("description") as HTMLTextAreaElement).value

                      if (issueType && description) {
                        // Record the issue submission
                        recordActivity("Issue Report", `${userName} reported an issue: ${issueType}`)

                        toast({
                          title: "Issue Reported",
                          description: "Your issue has been submitted successfully.",
                        })

                        form.reset()
                      } else {
                        toast({
                          title: "Error",
                          description: "Please fill in all required fields.",
                          variant: "destructive",
                        })
                      }
                    }}
                  >
                    <div className="space-y-2">
                      <label htmlFor="issueType" className="text-sm font-medium">
                        Issue Type
                      </label>
                      <select
                        id="issueType"
                        name="issueType"
                        className="w-full p-2 border rounded-md border-steel-blue"
                      >
                        <option value="">Select issue type</option>
                        <option value="check-in">Check-in Error</option>
                        <option value="blockchain">Blockchain Verification Failed</option>
                        <option value="location">Location Verification Error</option>
                        <option value="missing">Missing Attendance Record</option>
                        <option value="other">Other</option>
                      </select>
                    </div>
                    <div className="space-y-2">
                      <label htmlFor="description" className="text-sm font-medium">
                        Description
                      </label>
                      <textarea
                        id="description"
                        name="description"
                        placeholder="Please describe the issue in detail..."
                        className="min-h-[100px] w-full rounded-md border border-steel-blue p-2"
                      ></textarea>
                    </div>
                    <Button type="submit" className="bg-steel-blue hover:bg-steel-blue/90">
                      Submit Issue
                    </Button>
                  </form>
                </CardContent>
              </Card>
            )}

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
                        <div className="flex items-center justify-between">
                          <Label htmlFor="email-notif" className="flex items-center">
                            Email notifications
                          </Label>
                          <Switch
                            id="email-notif"
                            checked={userSettings.notifications.email}
                            onCheckedChange={(checked) => handleSettingChange("notifications", "email", checked)}
                          />
                        </div>
                        <div className="flex items-center justify-between">
                          <Label htmlFor="app-notif" className="flex items-center">
                            In-app notifications
                          </Label>
                          <Switch
                            id="app-notif"
                            checked={userSettings.notifications.inApp}
                            onCheckedChange={(checked) => handleSettingChange("notifications", "inApp", checked)}
                          />
                        </div>
                      </div>
                    </div>

                    <div>
                      <h3 className="mb-2 text-lg font-medium text-navy">Display Settings</h3>
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <Label htmlFor="dark-mode" className="flex items-center">
                            Dark mode
                          </Label>
                          <Switch
                            id="dark-mode"
                            checked={userSettings.display.darkMode}
                            onCheckedChange={(checked) => handleSettingChange("display", "darkMode", checked)}
                          />
                        </div>
                        <div className="flex items-center justify-between">
                          <Label htmlFor="compact-view" className="flex items-center">
                            Compact view
                          </Label>
                          <Switch
                            id="compact-view"
                            checked={userSettings.display.compactView}
                            onCheckedChange={(checked) => handleSettingChange("display", "compactView", checked)}
                          />
                        </div>
                      </div>
                    </div>

                    <div className="flex justify-end space-x-2">
                      <Button variant="outline" onClick={() => setActiveTab("dashboard")}>
                        Cancel
                      </Button>
                      <Button className="bg-steel-blue hover:bg-steel-blue/90" onClick={handleSaveSettings}>
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
            )}
          </div>
        </main>
      </div>
      <Toaster />
      <Toaster />
    </div>
  )
}
