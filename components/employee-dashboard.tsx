"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Bell, Calendar, CheckCircle, Clock, FileText, Home, LogOut, Menu, User } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { ReportIssueForm } from "@/components/report-issue-form"
import { BulletinBoard } from "@/components/bulletin-board"
import { TimeTracking } from "@/components/time-tracking"
import { LeaveForm } from "@/components/leave-form"
import { AttendanceHistory } from "@/components/attendance-history"

export default function EmployeeDashboard() {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState("dashboard")

  const handleSignOut = () => {
    localStorage.removeItem("userRole")
    router.push("/")
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
                onClick={() => setActiveTab("profile")}
              >
                <User className="h-5 w-5" />
                My Profile
              </Button>
              <Button
                variant="ghost"
                className="justify-start gap-2 text-white hover:bg-navy/80"
                onClick={() => setActiveTab("attendance")}
              >
                <FileText className="h-5 w-5" />
                My Attendance
              </Button>
              <Button
                variant="ghost"
                className="justify-start gap-2 text-white hover:bg-navy/80"
                onClick={() => setActiveTab("leave")}
              >
                <Calendar className="h-5 w-5" />
                Apply for Leave
              </Button>
            </nav>
          </SheetContent>
        </Sheet>
        <div className="flex items-center gap-2">
          <Clock className="h-6 w-6" />
          <span className="text-lg font-semibold">Attendance System</span>
        </div>
        <div className="ml-auto flex items-center gap-4">
          <ReportIssueForm />
          <Button
            variant="outline"
            size="icon"
            className="relative bg-steel-blue/20 text-white border-white hover:bg-steel-blue/80"
          >
            <Bell className="h-5 w-5" />
            {/* {unreadCount > 0 && (
              <Badge variant="destructive" className="absolute -right-2 -top-2 h-5 w-5 rounded-full p-0 text-xs">
                {unreadCount}
              </Badge>
            )} */}
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
            <AvatarFallback className="bg-navy text-white">EM</AvatarFallback>
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
              variant={activeTab === "profile" ? "secondary" : "ghost"}
              className={`justify-start gap-2 ${activeTab === "profile" ? "bg-steel-blue text-white" : "text-white hover:bg-navy/80"}`}
              onClick={() => setActiveTab("profile")}
            >
              <User className="h-5 w-5" />
              My Profile
            </Button>
            <Button
              variant={activeTab === "attendance" ? "secondary" : "ghost"}
              className={`justify-start gap-2 ${activeTab === "attendance" ? "bg-steel-blue text-white" : "text-white hover:bg-navy/80"}`}
              onClick={() => setActiveTab("attendance")}
            >
              <FileText className="h-5 w-5" />
              My Attendance
            </Button>
            <Button
              variant={activeTab === "leave" ? "secondary" : "ghost"}
              className={`justify-start gap-2 ${activeTab === "leave" ? "bg-steel-blue text-white" : "text-white hover:bg-navy/80"}`}
              onClick={() => setActiveTab("leave")}
            >
              <Calendar className="h-5 w-5" />
              Apply for Leave
            </Button>
          </nav>
        </aside>
        <main className="flex-1 p-4 md:p-6">
          <div className="grid gap-4">
            {activeTab === "dashboard" && (
              <div className="grid gap-4">
                <div className="flex items-center justify-between">
                  <h1 className="text-2xl font-bold text-navy">Employee Dashboard</h1>
                  <Badge variant="outline" className="border-navy text-navy">
                    Employee
                  </Badge>
                </div>
                {/* Time Tracking Component */}
                <TimeTracking employeeRole="employee" />
                <div className="grid gap-4 md:grid-cols-2">
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
                <Card className="border-steel-blue">
                  <CardHeader>
                    <CardTitle className="text-navy">Recent Activity</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex items-center">
                        <div className="mr-4 rounded-full bg-steel-blue/10 p-2">
                          <CheckCircle className="h-4 w-4 text-steel-blue" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-navy">Checked in</p>
                          <p className="text-xs text-muted-foreground">Yesterday, 9:03 AM</p>
                        </div>
                      </div>
                      <div className="flex items-center">
                        <div className="mr-4 rounded-full bg-steel-blue/10 p-2">
                          <LogOut className="h-4 w-4 text-steel-blue" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-navy">Checked out</p>
                          <p className="text-xs text-muted-foreground">Yesterday, 5:12 PM</p>
                        </div>
                      </div>
                      <div className="flex items-center">
                        <div className="mr-4 rounded-full bg-steel-blue/10 p-2">
                          <Bell className="h-4 w-4 text-steel-blue" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-navy">Leave request approved</p>
                          <p className="text-xs text-muted-foreground">March 15, 2024</p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}

            {activeTab === "profile" && (
              <Card className="border-steel-blue">
                <CardHeader>
                  <CardTitle className="text-navy">My Profile</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-col items-center space-y-4">
                    <Avatar className="h-24 w-24">
                      <AvatarImage src="/placeholder.svg" alt="User" />
                      <AvatarFallback className="bg-navy text-white">EM</AvatarFallback>
                    </Avatar>
                    <div className="text-center">
                      <h2 className="text-xl font-bold text-navy">John Doe</h2>
                      <p className="text-muted-foreground">Software Developer</p>
                    </div>
                    <div className="w-full max-w-md space-y-2">
                      <div className="flex justify-between border-b border-steel-blue/30 py-2">
                        <span className="font-medium text-navy">Employee ID:</span>
                        <span>EMP001</span>
                      </div>
                      <div className="flex justify-between border-b border-steel-blue/30 py-2">
                        <span className="font-medium text-navy">Email:</span>
                        <span>john.doe@example.com</span>
                      </div>
                      <div className="flex justify-between border-b border-steel-blue/30 py-2">
                        <span className="font-medium text-navy">Department:</span>
                        <span>Engineering</span>
                      </div>
                      <div className="flex justify-between border-b border-steel-blue/30 py-2">
                        <span className="font-medium text-navy">Join Date:</span>
                        <span>January 15, 2023</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {activeTab === "attendance" && (
              <div className="grid gap-4">
                <TimeTracking employeeRole="employee" />
                <AttendanceHistory />
              </div>
            )}

            {activeTab === "leave" && <LeaveForm />}
          </div>
        </main>
      </div>
      <BulletinBoard />
    </div>
  )
}

