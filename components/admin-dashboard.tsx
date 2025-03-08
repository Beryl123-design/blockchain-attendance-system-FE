"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import {
  BarChart,
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

export default function AdminDashboard() {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState("dashboard")
  const [showAlert, setShowAlert] = useState(false)
  const userRole = localStorage.getItem("userRole") // Example, replace with your actual auth logic
  const userDepartment = "Example Department" // Example, replace with your actual auth logic

  const handleSignOut = () => {
    localStorage.removeItem("userRole")
    router.push("/")
  }

  const handleAlertClick = () => {
    setShowAlert(true)
    setTimeout(() => setShowAlert(false), 5000)
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
                onClick={() => setActiveTab("users")}
              >
                <Users className="h-5 w-5" />
                Users
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
                Leave Applications
              </Button>
              <Button
                variant="ghost"
                className="justify-start gap-2 text-white hover:bg-navy/80"
                onClick={() => setActiveTab("issues")}
              >
                <AlertCircle className="h-5 w-5" />
                Issues
              </Button>
              <Button
                variant="ghost"
                className="justify-start gap-2 text-white hover:bg-navy/80"
                onClick={() => setActiveTab("bulletins")}
              >
                <Shield className="h-5 w-5" />
                Manage Bulletins
              </Button>
              <Button
                variant="ghost"
                className="justify-start gap-2 text-white hover:bg-navy/80"
                onClick={handleAlertClick}
              >
                <Bell className="h-5 w-5" />
                Alerts
              </Button>
            </nav>
          </SheetContent>
        </Sheet>
        <div className="flex items-center gap-2">
          <BarChart className="h-6 w-6" />
          <span className="text-lg font-semibold">Attendance System</span>
        </div>
        <div className="ml-auto flex items-center gap-4">
          <Button
            variant="outline"
            size="icon"
            onClick={handleAlertClick}
            className="bg-steel-blue/20 text-white border-white hover:bg-steel-blue/80"
          >
            <Bell className="h-5 w-5" />
            <span className="sr-only">Alerts</span>
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleSignOut}
            className="bg-steel-blue/20 text-white border-white hover:bg-steel-blue/80"
          >
            <LogOut className="mr-2 h-4 w-4" />
            Sign Out
          </Button>
          <Avatar>
            <AvatarImage src="/placeholder.svg" alt="User" />
            <AvatarFallback className="bg-navy text-white">AD</AvatarFallback>
          </Avatar>
        </div>
      </header>
      <div className="flex flex-1">
        <aside className="hidden w-64 border-r bg-navy text-white md:block">
          <nav className="grid gap-2 p-4 text-sm font-medium">
            <Button
              variant={activeTab === "dashboard" ? "secondary" : "ghost"}
              className={`justify-start gap-2 ${activeTab === "dashboard" ? "bg-steel-blue text-white" : "text-white hover:bg-navy/80"}`}
              onClick={() => setActiveTab("dashboard")}
            >
              <Home className="h-5 w-5" />
              Dashboard
            </Button>
            <Button
              variant={activeTab === "users" ? "secondary" : "ghost"}
              className={`justify-start gap-2 ${activeTab === "users" ? "bg-steel-blue text-white" : "text-white hover:bg-navy/80"}`}
              onClick={() => setActiveTab("users")}
            >
              <Users className="h-5 w-5" />
              Users
            </Button>
            <Button
              variant={activeTab === "add-user" ? "secondary" : "ghost"}
              className={`justify-start gap-2 ${activeTab === "add-user" ? "bg-steel-blue text-white" : "text-white hover:bg-navy/80"}`}
              onClick={() => setActiveTab("add-user")}
            >
              <PlusCircle className="h-5 w-5" />
              Add User
            </Button>
            <Button
              variant={activeTab === "attendance" ? "secondary" : "ghost"}
              className={`justify-start gap-2 ${activeTab === "attendance" ? "bg-steel-blue text-white" : "text-white hover:bg-navy/80"}`}
              onClick={() => setActiveTab("attendance")}
            >
              <FileText className="h-5 w-5" />
              Attendance Report
            </Button>
            <Button
              variant={activeTab === "leave" ? "secondary" : "ghost"}
              className={`justify-start gap-2 ${activeTab === "leave" ? "bg-steel-blue text-white" : "text-white hover:bg-navy/80"}`}
              onClick={() => setActiveTab("leave")}
            >
              <Calendar className="h-5 w-5" />
              Leave Applications
            </Button>
            <Button
              variant={activeTab === "issues" ? "secondary" : "ghost"}
              className={`justify-start gap-2 ${activeTab === "issues" ? "bg-steel-blue text-white" : "text-white hover:bg-navy/80"}`}
              onClick={() => setActiveTab("issues")}
            >
              <AlertCircle className="h-5 w-5" />
              Issues
            </Button>
            <Button
              variant={activeTab === "bulletins" ? "secondary" : "ghost"}
              className={`justify-start gap-2 ${activeTab === "bulletins" ? "bg-steel-blue text-white" : "text-white hover:bg-navy/80"}`}
              onClick={() => setActiveTab("bulletins")}
            >
              <Shield className="h-5 w-5" />
              Manage Bulletins
            </Button>
            <Button
              variant="ghost"
              className="justify-start gap-2 text-white hover:bg-navy/80"
              onClick={handleAlertClick}
            >
              <Bell className="h-5 w-5" />
              Alerts
            </Button>
          </nav>
        </aside>
        <main className="flex-1 p-4 md:p-6">
          {showAlert && (
            <Alert className="mb-4 bg-steel-blue text-white">
              <Bell className="h-4 w-4" />
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
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                  <Card className="border-steel-blue">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium text-navy">Total Employees</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold text-navy">24</div>
                    </CardContent>
                  </Card>
                  <Card className="border-steel-blue">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium text-navy">Present Today</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold text-navy">21</div>
                    </CardContent>
                  </Card>
                  <Card className="border-steel-blue">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium text-navy">On Leave</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold text-navy">2</div>
                    </CardContent>
                  </Card>
                  <Card className="border-steel-blue">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium text-navy">Absent</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold text-navy">1</div>
                    </CardContent>
                  </Card>
                </div>
                <Card className="col-span-4 border-steel-blue">
                  <CardHeader>
                    <CardTitle className="text-navy">Attendance Overview</CardTitle>
                    <CardDescription>Monthly attendance statistics</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <AttendanceChart />
                  </CardContent>
                </Card>
              </div>
            )}

            {activeTab === "users" && <UsersList />}
            {activeTab === "add-user" && <AddUserForm />}
            {activeTab === "attendance" && <AttendanceReport />}
            {activeTab === "leave" && <LeaveManagement userRole={userRole} department={userDepartment} />}
            {activeTab === "issues" && <IssuesList />}
            {activeTab === "bulletins" && <ManageBulletins />}
          </div>
        </main>
      </div>
    </div>
  )
}

