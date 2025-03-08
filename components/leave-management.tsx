"use client"

import { useState } from "react"
import { Check, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

// Mock data for leave applications
const initialApplications = [
  {
    id: "1",
    employeeName: "John Doe",
    employeeId: "EMP001",
    department: "Engineering",
    type: "Annual Leave",
    startDate: "2024-03-20",
    endDate: "2024-03-25",
    days: 6,
    reason: "Family vacation",
    status: "Pending",
    appliedOn: "2024-03-10",
  },
  {
    id: "2",
    employeeName: "Jane Smith",
    employeeId: "EMP002",
    department: "Marketing",
    type: "Sick Leave",
    startDate: "2024-03-15",
    endDate: "2024-03-16",
    days: 2,
    reason: "Medical appointment",
    status: "Approved",
    appliedOn: "2024-03-08",
    approvedBy: "HR Manager",
    approvalDate: "2024-03-09",
  },
]

interface LeaveManagementProps {
  userRole: "hr" | "department_head"
  department?: string // Required for department heads
}

export function LeaveManagement({ userRole, department }: LeaveManagementProps) {
  const [applications, setApplications] = useState(initialApplications)
  const [selectedApp, setSelectedApp] = useState<(typeof initialApplications)[0] | null>(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [comment, setComment] = useState("")
  const [filter, setFilter] = useState("all")

  // Filter applications based on role and department
  const filteredApplications = applications.filter((app) => {
    if (userRole === "department_head" && app.department !== department) {
      return false
    }
    if (filter === "all") return true
    return app.status.toLowerCase() === filter.toLowerCase()
  })

  const handleAction = (action: "approve" | "reject") => {
    if (!selectedApp) return

    setApplications((prev) =>
      prev.map((app) =>
        app.id === selectedApp.id
          ? {
              ...app,
              status: action === "approve" ? "Approved" : "Rejected",
              approvedBy: userRole === "hr" ? "HR Manager" : "Department Head",
              approvalDate: new Date().toISOString().split("T")[0],
              comment,
            }
          : app,
      ),
    )

    setIsDialogOpen(false)
    setSelectedApp(null)
    setComment("")
  }

  const getStatusBadge = (status: string) => {
    switch (status.toLowerCase()) {
      case "approved":
        return <Badge className="bg-green-100 text-green-800">Approved</Badge>
      case "rejected":
        return <Badge className="bg-red-100 text-red-800">Rejected</Badge>
      default:
        return <Badge className="bg-yellow-100 text-yellow-800">Pending</Badge>
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Leave Applications</CardTitle>
        <CardDescription>
          {userRole === "hr"
            ? "Manage all employee leave applications"
            : `Manage leave applications for ${department} department`}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="mb-4">
          <Select value={filter} onValueChange={setFilter}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Applications</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="approved">Approved</SelectItem>
              <SelectItem value="rejected">Rejected</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Employee</TableHead>
                <TableHead>Leave Type</TableHead>
                <TableHead>Duration</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredApplications.map((app) => (
                <TableRow key={app.id}>
                  <TableCell>
                    {app.employeeName}
                    <div className="text-xs text-muted-foreground">{app.employeeId}</div>
                  </TableCell>
                  <TableCell>{app.type}</TableCell>
                  <TableCell>
                    {app.startDate} to {app.endDate}
                    <div className="text-xs text-muted-foreground">{app.days} days</div>
                  </TableCell>
                  <TableCell>{getStatusBadge(app.status)}</TableCell>
                  <TableCell className="text-right">
                    {app.status === "Pending" && (
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          className="h-8 border-green-500 text-green-600 hover:bg-green-50"
                          onClick={() => {
                            setSelectedApp(app)
                            setIsDialogOpen(true)
                          }}
                        >
                          <Check className="mr-1 h-4 w-4" />
                          Approve
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="h-8 border-red-500 text-red-600 hover:bg-red-50"
                          onClick={() => {
                            setSelectedApp(app)
                            setIsDialogOpen(true)
                          }}
                        >
                          <X className="mr-1 h-4 w-4" />
                          Reject
                        </Button>
                      </div>
                    )}
                  </TableCell>
                </TableRow>
              ))}
              {filteredApplications.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5} className="h-24 text-center">
                    No leave applications found
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>

        {selectedApp && (
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Review Leave Application</DialogTitle>
                <DialogDescription>
                  {selectedApp.employeeName}&apos;s {selectedApp.type} request
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <span className="font-medium">Duration:</span>
                  <span className="col-span-3">
                    {selectedApp.startDate} to {selectedApp.endDate} ({selectedApp.days} days)
                  </span>
                </div>
                <div className="grid grid-cols-4 items-start gap-4">
                  <span className="font-medium">Reason:</span>
                  <span className="col-span-3">{selectedApp.reason}</span>
                </div>
                <div className="grid gap-2">
                  <label className="text-sm font-medium">Comments (optional):</label>
                  <Textarea
                    placeholder="Add your comments here..."
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                  />
                </div>
              </div>
              <DialogFooter>
                <div className="flex w-full justify-between">
                  <Button
                    variant="outline"
                    onClick={() => handleAction("reject")}
                    className="border-red-500 text-red-600 hover:bg-red-50"
                  >
                    <X className="mr-2 h-4 w-4" />
                    Reject
                  </Button>
                  <Button onClick={() => handleAction("approve")} className="bg-green-600 hover:bg-green-700">
                    <Check className="mr-2 h-4 w-4" />
                    Approve
                  </Button>
                </div>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        )}
      </CardContent>
    </Card>
  )
}

