"use client"

import { useState } from "react"
import { Check, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"

// Mock data for leave applications
const leaveApplications = [
  {
    id: "1",
    name: "John Doe",
    department: "Engineering",
    type: "Annual Leave",
    startDate: "2024-03-15",
    endDate: "2024-03-20",
    days: 6,
    reason: "Family vacation",
    status: "Pending",
  },
  {
    id: "2",
    name: "Jane Smith",
    department: "Marketing",
    type: "Sick Leave",
    startDate: "2024-03-10",
    endDate: "2024-03-12",
    days: 3,
    reason: "Medical appointment",
    status: "Approved",
  },
  {
    id: "3",
    name: "Robert Johnson",
    department: "HR",
    type: "Annual Leave",
    startDate: "2024-04-05",
    endDate: "2024-04-10",
    days: 6,
    reason: "Personal time",
    status: "Pending",
  },
  {
    id: "4",
    name: "Emily Davis",
    department: "Finance",
    type: "Sick Leave",
    startDate: "2024-03-08",
    endDate: "2024-03-09",
    days: 2,
    reason: "Not feeling well",
    status: "Rejected",
  },
]

export function LeaveApplications() {
  const [applications, setApplications] = useState(leaveApplications)
  const [activeTab, setActiveTab] = useState("all")

  const filteredApplications = applications.filter((app) => {
    if (activeTab === "all") return true
    return app.status.toLowerCase() === activeTab
  })

  const handleApprove = (id: string) => {
    setApplications((prev) => prev.map((app) => (app.id === id ? { ...app, status: "Approved" } : app)))
  }

  const handleReject = (id: string) => {
    setApplications((prev) => prev.map((app) => (app.id === id ? { ...app, status: "Rejected" } : app)))
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Leave Applications</CardTitle>
        <CardDescription>Manage employee leave requests</CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-4">
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="pending">Pending</TabsTrigger>
            <TabsTrigger value="approved">Approved</TabsTrigger>
            <TabsTrigger value="rejected">Rejected</TabsTrigger>
          </TabsList>
          <TabsContent value={activeTab}>
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Employee</TableHead>
                    <TableHead>Department</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Duration</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredApplications.map((application) => (
                    <TableRow key={application.id}>
                      <TableCell className="font-medium">{application.name}</TableCell>
                      <TableCell>{application.department}</TableCell>
                      <TableCell>{application.type}</TableCell>
                      <TableCell>
                        {application.startDate} to {application.endDate}
                        <div className="text-xs text-muted-foreground">{application.days} days</div>
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            application.status === "Approved"
                              ? "default"
                              : application.status === "Rejected"
                                ? "destructive"
                                : "outline"
                          }
                        >
                          {application.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        {application.status === "Pending" && (
                          <div className="flex justify-end gap-2">
                            <Button
                              variant="outline"
                              size="icon"
                              className="h-8 w-8"
                              onClick={() => handleApprove(application.id)}
                            >
                              <Check className="h-4 w-4 text-green-600" />
                              <span className="sr-only">Approve</span>
                            </Button>
                            <Button
                              variant="outline"
                              size="icon"
                              className="h-8 w-8"
                              onClick={() => handleReject(application.id)}
                            >
                              <X className="h-4 w-4 text-red-600" />
                              <span className="sr-only">Reject</span>
                            </Button>
                          </div>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}

