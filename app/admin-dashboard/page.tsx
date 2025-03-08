"use client"

import { useState } from "react"
import {
  Bell,
  Calendar,
  CheckSquare,
  ClipboardList,
  FileText,
  Home,
  MessageSquare,
  Settings,
  Users,
} from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { UsersList } from "@/components/users-list"
import { AttendanceGraph } from "@/components/attendance-graph"

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState("dashboard")

  return (
    <div className="flex min-h-screen flex-col">
      <div className="flex flex-1">
        {/* Sidebar */}
        <aside className="hidden w-64 flex-col bg-gray-800 text-white md:flex">
          <div className="flex h-14 items-center border-b border-gray-700 px-4">
            <h2 className="text-lg font-semibold">Admin Dashboard</h2>
          </div>
          <nav className="flex-1 overflow-auto py-4">
            <div className="px-4 py-2">
              <h3 className="mb-2 text-xs font-semibold uppercase tracking-wider text-gray-400">Main</h3>
              <Button
                variant={activeTab === "dashboard" ? "secondary" : "ghost"}
                className="w-full justify-start"
                onClick={() => setActiveTab("dashboard")}
              >
                <Home className="mr-2 h-4 w-4" />
                Dashboard
              </Button>
              <Button
                variant={activeTab === "users" ? "secondary" : "ghost"}
                className="w-full justify-start"
                onClick={() => setActiveTab("users")}
              >
                <Users className="mr-2 h-4 w-4" />
                Users
              </Button>
              <Button
                variant={activeTab === "attendance" ? "secondary" : "ghost"}
                className="w-full justify-start"
                onClick={() => setActiveTab("attendance")}
              >
                <Calendar className="mr-2 h-4 w-4" />
                Attendance
              </Button>
            </div>
            <div className="px-4 py-2">
              <h3 className="mb-2 text-xs font-semibold uppercase tracking-wider text-gray-400">Management</h3>
              <Button
                variant={activeTab === "leave" ? "secondary" : "ghost"}
                className="w-full justify-start"
                onClick={() => setActiveTab("leave")}
              >
                <FileText className="mr-2 h-4 w-4" />
                Leave Management
              </Button>
              <Button
                variant={activeTab === "issues" ? "secondary" : "ghost"}
                className="w-full justify-start"
                onClick={() => setActiveTab("issues")}
              >
                <MessageSquare className="mr-2 h-4 w-4" />
                Issues
              </Button>
              <Button
                variant={activeTab === "bulletins" ? "secondary" : "ghost"}
                className="w-full justify-start"
                onClick={() => setActiveTab("bulletins")}
              >
                <ClipboardList className="mr-2 h-4 w-4" />
                Bulletins
              </Button>
            </div>
          </nav>
        </aside>

        {/* Main Content */}
        <main className="flex-1 overflow-auto">
          <div className="flex h-14 items-center border-b px-4">
            <h1 className="text-lg font-semibold">
              {activeTab === "dashboard" && "Dashboard"}
              {activeTab === "users" && "Users Management"}
              {activeTab === "attendance" && "Attendance Reports"}
              {activeTab === "leave" && "Leave Management"}
              {activeTab === "issues" && "Issues List"}
              {activeTab === "bulletins" && "Manage Bulletins"}
            </h1>
            <div className="ml-auto flex items-center gap-4">
              <Button variant="outline" size="icon">
                <Bell className="h-4 w-4" />
                <span className="sr-only">Notifications</span>
              </Button>
              <Button variant="outline" size="icon">
                <Settings className="h-4 w-4" />
                <span className="sr-only">Settings</span>
              </Button>
            </div>
          </div>

          <div className="p-4">
            {/* Dashboard */}
            {activeTab === "dashboard" && (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Total Employees</CardTitle>
                    <Users className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">142</div>
                    <p className="text-xs text-muted-foreground">+6 from last month</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Present Today</CardTitle>
                    <CheckSquare className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">132</div>
                    <p className="text-xs text-muted-foreground">93% attendance rate</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">On Leave</CardTitle>
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">7</div>
                    <p className="text-xs text-muted-foreground">5% of workforce</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Open Issues</CardTitle>
                    <MessageSquare className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">12</div>
                    <p className="text-xs text-muted-foreground">4 high priority</p>
                  </CardContent>
                </Card>

                <Card className="col-span-full">
                  <CardHeader>
                    <CardTitle>Weekly Attendance</CardTitle>
                    <CardDescription>Attendance trends for the past week</CardDescription>
                  </CardHeader>
                  <CardContent className="h-80">
                    <AttendanceGraph />
                  </CardContent>
                </Card>
              </div>
            )}

            {/* Users Management */}
            {activeTab === "users" && <UsersList />}

            {/* Other tabs - simplified placeholders */}
            {activeTab === "attendance" && (
              <Card>
                <CardHeader>
                  <CardTitle>Attendance Reports</CardTitle>
                  <CardDescription>View and manage employee attendance records</CardDescription>
                </CardHeader>
                <CardContent>
                  <p>Attendance reports will be displayed here.</p>
                </CardContent>
              </Card>
            )}

            {activeTab === "leave" && (
              <Card>
                <CardHeader>
                  <CardTitle>Leave Management</CardTitle>
                  <CardDescription>Manage employee leave requests</CardDescription>
                </CardHeader>
                <CardContent>
                  <p>Leave management interface will be displayed here.</p>
                </CardContent>
              </Card>
            )}

            {activeTab === "issues" && (
              <Card>
                <CardHeader>
                  <CardTitle>Issues List</CardTitle>
                  <CardDescription>Track and resolve reported issues</CardDescription>
                </CardHeader>
                <CardContent>
                  <p>Issues list will be displayed here.</p>
                </CardContent>
              </Card>
            )}

            {activeTab === "bulletins" && (
              <Card>
                <CardHeader>
                  <CardTitle>Manage Bulletins</CardTitle>
                  <CardDescription>Create and manage security bulletins</CardDescription>
                </CardHeader>
                <CardContent>
                  <p>Bulletin management interface will be displayed here.</p>
                </CardContent>
              </Card>
            )}
          </div>
        </main>
      </div>
    </div>
  )
}

