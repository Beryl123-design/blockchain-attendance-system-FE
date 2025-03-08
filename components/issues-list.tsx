"use client"

import { useState } from "react"
import { AlertCircle, CheckCircle, Clock } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
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

// Mock data for attendance issues
const initialIssues = [
  {
    id: "1",
    employeeName: "John Doe",
    employeeId: "EMP001",
    department: "Engineering",
    issueType: "Check-in Error",
    description: "Unable to check in due to system error. Attempted multiple times.",
    dateReported: "2024-03-05",
    status: "Pending",
    notes: "",
  },
  {
    id: "2",
    employeeName: "Jane Smith",
    employeeId: "EMP002",
    department: "Marketing",
    issueType: "Blockchain Verification Failed",
    description: "Attendance record not being verified on the blockchain.",
    dateReported: "2024-03-03",
    status: "In Progress",
    notes: "IT team investigating blockchain node connection.",
  },
  {
    id: "3",
    employeeName: "Robert Johnson",
    employeeId: "EMP003",
    department: "HR",
    issueType: "Missing Attendance Record",
    description: "Attendance for February 28th is missing despite being present.",
    dateReported: "2024-03-01",
    status: "Solved",
    notes: "Record manually added and verified on blockchain.",
  },
  {
    id: "4",
    employeeName: "Emily Davis",
    employeeId: "EMP004",
    department: "Finance",
    issueType: "Location Verification Error",
    description: "System not recognizing office location for check-in.",
    dateReported: "2024-03-06",
    status: "Pending",
    notes: "",
  },
]

export function IssuesList() {
  const [issues, setIssues] = useState(initialIssues)
  const [selectedIssue, setSelectedIssue] = useState<(typeof initialIssues)[0] | null>(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [statusFilter, setStatusFilter] = useState("all")
  const [notes, setNotes] = useState("")

  const filteredIssues = issues.filter((issue) => {
    if (statusFilter === "all") return true
    return issue.status.toLowerCase() === statusFilter.toLowerCase()
  })

  const handleViewIssue = (issue: (typeof initialIssues)[0]) => {
    setSelectedIssue(issue)
    setNotes(issue.notes)
    setIsDialogOpen(true)
  }

  const handleStatusChange = (status: string) => {
    if (!selectedIssue) return

    setIssues((prev) => prev.map((issue) => (issue.id === selectedIssue.id ? { ...issue, status, notes } : issue)))

    setIsDialogOpen(false)
  }

  const getStatusBadge = (status: string) => {
    switch (status.toLowerCase()) {
      case "solved":
        return (
          <Badge className="bg-green-100 text-green-800 hover:bg-green-100">
            <CheckCircle className="mr-1 h-3 w-3" />
            Solved
          </Badge>
        )
      case "in progress":
        return (
          <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100">
            <Clock className="mr-1 h-3 w-3" />
            In Progress
          </Badge>
        )
      case "pending":
      default:
        return (
          <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100">
            <AlertCircle className="mr-1 h-3 w-3" />
            Pending
          </Badge>
        )
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Attendance Issues</CardTitle>
        <CardDescription>Manage and resolve employee attendance system issues</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="mb-4 flex items-center justify-between">
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Issues</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="in progress">In Progress</SelectItem>
              <SelectItem value="solved">Solved</SelectItem>
            </SelectContent>
          </Select>
          <div className="flex gap-2">
            <Badge className="bg-yellow-100 text-yellow-800">
              <AlertCircle className="mr-1 h-3 w-3" />
              Pending: {issues.filter((i) => i.status === "Pending").length}
            </Badge>
            <Badge className="bg-blue-100 text-blue-800">
              <Clock className="mr-1 h-3 w-3" />
              In Progress: {issues.filter((i) => i.status === "In Progress").length}
            </Badge>
            <Badge className="bg-green-100 text-green-800">
              <CheckCircle className="mr-1 h-3 w-3" />
              Solved: {issues.filter((i) => i.status === "Solved").length}
            </Badge>
          </div>
        </div>
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Employee</TableHead>
                <TableHead>Department</TableHead>
                <TableHead>Issue Type</TableHead>
                <TableHead>Date Reported</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredIssues.map((issue) => (
                <TableRow key={issue.id}>
                  <TableCell className="font-medium">
                    {issue.employeeName}
                    <div className="text-xs text-muted-foreground">{issue.employeeId}</div>
                  </TableCell>
                  <TableCell>{issue.department}</TableCell>
                  <TableCell>{issue.issueType}</TableCell>
                  <TableCell>{issue.dateReported}</TableCell>
                  <TableCell>{getStatusBadge(issue.status)}</TableCell>
                  <TableCell className="text-right">
                    <Button variant="outline" size="sm" onClick={() => handleViewIssue(issue)}>
                      View Details
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
              {filteredIssues.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6} className="h-24 text-center">
                    No issues found.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>

        {selectedIssue && (
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogContent className="sm:max-w-[525px]">
              <DialogHeader>
                <DialogTitle>Issue Details</DialogTitle>
                <DialogDescription>Reported on {selectedIssue.dateReported}</DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <span className="text-sm font-medium">Employee:</span>
                  <span className="col-span-3">
                    {selectedIssue.employeeName} ({selectedIssue.employeeId})
                  </span>
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <span className="text-sm font-medium">Department:</span>
                  <span className="col-span-3">{selectedIssue.department}</span>
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <span className="text-sm font-medium">Issue Type:</span>
                  <span className="col-span-3">{selectedIssue.issueType}</span>
                </div>
                <div className="grid grid-cols-4 items-start gap-4">
                  <span className="text-sm font-medium">Description:</span>
                  <span className="col-span-3">{selectedIssue.description}</span>
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <span className="text-sm font-medium">Current Status:</span>
                  <span className="col-span-3">{getStatusBadge(selectedIssue.status)}</span>
                </div>
                <div className="grid grid-cols-4 items-start gap-4">
                  <span className="text-sm font-medium">Notes:</span>
                  <Textarea
                    className="col-span-3"
                    placeholder="Add notes about this issue"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                  />
                </div>
              </div>
              <DialogFooter>
                <div className="flex w-full justify-between">
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      onClick={() => handleStatusChange("Pending")}
                      className="border-yellow-500 text-yellow-700 hover:bg-yellow-50"
                    >
                      <AlertCircle className="mr-2 h-4 w-4" />
                      Mark as Pending
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => handleStatusChange("In Progress")}
                      className="border-blue-500 text-blue-700 hover:bg-blue-50"
                    >
                      <Clock className="mr-2 h-4 w-4" />
                      Mark as In Progress
                    </Button>
                  </div>
                  <Button onClick={() => handleStatusChange("Solved")} className="bg-green-600 hover:bg-green-700">
                    <CheckCircle className="mr-2 h-4 w-4" />
                    Mark as Solved
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

