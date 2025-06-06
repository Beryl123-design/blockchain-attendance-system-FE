"use client"

import { useState, useEffect } from "react"
import { ArrowUpDown, MoreHorizontal, Pencil, Trash, AlertCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { toast } from "@/components/ui/use-toast"
import { Toaster } from "@/components/ui/toaster"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import type { User } from "./add-user-form"

// Initial mock data for users
const initialUsers = [
  {
    id: "1",
    name: "John Doe",
    email: "john.doe@example.com",
    department: "Engineering",
    jobTitle: "Software Developer",
    role: "employee",
    status: "Active",
    dateAdded: "2024-01-15",
  },
  {
    id: "2",
    name: "Jane Smith",
    email: "jane.smith@example.com",
    department: "Marketing",
    jobTitle: "Marketing Specialist",
    role: "employee",
    status: "Active",
    dateAdded: "2024-01-20",
  },
  {
    id: "3",
    name: "Robert Johnson",
    email: "robert.johnson@example.com",
    department: "HR",
    jobTitle: "HR Manager",
    role: "admin",
    status: "Active",
    dateAdded: "2024-02-01",
  },
  {
    id: "4",
    name: "Emily Davis",
    email: "emily.davis@example.com",
    department: "Finance",
    jobTitle: "Accountant",
    role: "employee",
    status: "Inactive",
    dateAdded: "2024-02-10",
  },
  {
    id: "5",
    name: "Michael Wilson",
    email: "michael.wilson@example.com",
    department: "Engineering",
    jobTitle: "QA Engineer",
    role: "employee",
    status: "Active",
    dateAdded: "2024-02-15",
  },
] as User[]

// ECG-specific departments
const ecgDepartments = [
  { value: "engineering", label: "Engineering" },
  { value: "customer_service", label: "Customer Service" },
  { value: "finance", label: "Finance" },
  { value: "hr", label: "Human Resources" },
  { value: "operations", label: "Operations" },
  { value: "technical", label: "Technical Services" },
  { value: "metering", label: "Metering" },
  { value: "distribution", label: "Distribution" },
  { value: "commercial", label: "Commercial" },
  { value: "it", label: "Information Technology" },
  { value: "legal", label: "Legal" },
  { value: "procurement", label: "Procurement" },
]

// ECG-specific roles
const ecgRoles = [
  { value: "employee", label: "Employee" },
  { value: "supervisor", label: "Supervisor" },
  { value: "manager", label: "Manager" },
  { value: "director", label: "Director" },
  { value: "hr", label: "HR Personnel" },
  { value: "admin", label: "System Administrator" },
]

export function UsersList() {
  const [searchTerm, setSearchTerm] = useState("")
  const [users, setUsers] = useState<User[]>(initialUsers)
  const [userToDelete, setUserToDelete] = useState<User | null>(null)
  const [userToEdit, setUserToEdit] = useState<User | null>(null)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [sortConfig, setSortConfig] = useState<{
    key: keyof User | null
    direction: "ascending" | "descending"
  }>({
    key: null,
    direction: "ascending",
  })

  // Load users from localStorage on component mount
  useEffect(() => {
    // fetch("http://localhost:3001")
    const storedUsers = localStorage.getItem("users")
    if (storedUsers) {
      // Combine initial users with stored users, avoiding duplicates by email
      const parsedUsers = JSON.parse(storedUsers) as User[]
      const combinedUsers = [...initialUsers]

      parsedUsers.forEach((newUser) => {
        if (!combinedUsers.some((existingUser) => existingUser.email === newUser.email)) {
          combinedUsers.push(newUser)
        }
      })

      setUsers(combinedUsers)
    } else {
      // If no stored users, initialize localStorage with initial users
      localStorage.setItem("users", JSON.stringify(initialUsers))
    }
  }, [])

  // Handle sorting
  const requestSort = (key: keyof User) => {
    let direction: "ascending" | "descending" = "ascending"
    if (sortConfig.key === key && sortConfig.direction === "ascending") {
      direction = "descending"
    }
    setSortConfig({ key, direction })
  }

  // Sort users based on current sort configuration
  const sortedUsers = [...users].sort((a, b) => {
    if (!sortConfig.key) return 0

    const aValue = a[sortConfig.key]
    const bValue = b[sortConfig.key]

    if (aValue !== undefined && bValue !== undefined && aValue < bValue) {
      return sortConfig.direction === "ascending" ? -1 : 1
    }
    if (aValue !== undefined && bValue !== undefined && aValue > bValue) {
      return sortConfig.direction === "ascending" ? 1 : -1
    }
    return 0
  })

  // Filter users based on search term
  const filteredUsers = sortedUsers.filter(
    (user) =>
      user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.department.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.jobTitle.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  // Handle user deletion
  const handleDeleteUser = () => {
    if (!userToDelete) return

    // Add confirmation dialog
    if (!window.confirm(`Are you sure you want to delete ${userToDelete.name}? This action cannot be undone.`)) {
      setUserToDelete(null)
      setIsDeleteDialogOpen(false)
      return
    }

    const updatedUsers = users.filter((user) => user.id !== userToDelete.id)
    setUsers(updatedUsers)
    localStorage.setItem("users", JSON.stringify(updatedUsers))

    // Record activity
    const activities = JSON.parse(localStorage.getItem("recentActivities") || "[]")
    activities.unshift({
      id: Date.now().toString(),
      type: "User Management",
      description: `User ${userToDelete.name} has been deleted from the system.`,
      timestamp: new Date().toISOString(),
    })
    localStorage.setItem("recentActivities", JSON.stringify(activities))

    toast({
      title: "User Deleted",
      description: `${userToDelete.name} has been removed from the system.`,
    })

    setUserToDelete(null)
    setIsDeleteDialogOpen(false)
  }

  // Handle edit form changes
  const handleEditChange = (field: keyof User, value: string) => {
    if (!userToEdit) return
    setUserToEdit({
      ...userToEdit,
      [field]: value,
    })
  }

  // Handle user edit submission
  const handleEditSubmit = () => {
    if (!userToEdit) return

    const updatedUsers = users.map((user) => (user.id === userToEdit.id ? userToEdit : user))
    setUsers(updatedUsers)
    localStorage.setItem("users", JSON.stringify(updatedUsers))

    // Record activity
    const activities = JSON.parse(localStorage.getItem("recentActivities") || "[]")
    activities.unshift({
      id: Date.now().toString(),
      type: "User Management",
      description: `User ${userToEdit.name}'s information has been updated.`,
      timestamp: new Date().toISOString(),
    })
    localStorage.setItem("recentActivities", JSON.stringify(activities))

    toast({
      title: "User Updated",
      description: `${userToEdit.name}'s information has been updated successfully.`,
    })

    setUserToEdit(null)
    setIsEditDialogOpen(false)
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Users</CardTitle>
        <div className="w-full max-w-sm">
          <Input placeholder="Search users..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
        </div>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>
                <div className="flex items-center">
                  Name
                  <Button variant="ghost" size="sm" className="h-8 p-0 ml-1" onClick={() => requestSort("name")}>
                    <ArrowUpDown className="w-4 h-4" />
                  </Button>
                </div>
              </TableHead>
              <TableHead>Email</TableHead>
              <TableHead>
                <div className="flex items-center">
                  Department
                  <Button variant="ghost" size="sm" className="h-8 p-0 ml-1" onClick={() => requestSort("department")}>
                    <ArrowUpDown className="w-4 h-4" />
                  </Button>
                </div>
              </TableHead>
              <TableHead>Job Title</TableHead>
              <TableHead>
                <div className="flex items-center">
                  Status
                  <Button variant="ghost" size="sm" className="h-8 p-0 ml-1" onClick={() => requestSort("status")}>
                    <ArrowUpDown className="w-4 h-4" />
                  </Button>
                </div>
              </TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredUsers.length > 0 ? (
              filteredUsers.map((user) => (
                <TableRow key={user.id}>
                  <TableCell className="font-medium">{user.name}</TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>{user.department}</TableCell>
                  <TableCell>{user.jobTitle}</TableCell>
                  <TableCell>
                    <Badge variant={user.status === "Active" ? "default" : "secondary"}>{user.status}</Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreHorizontal className="w-4 h-4" />
                          <span className="sr-only">Open menu</span>
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem
                          onClick={() => {
                            setUserToEdit(user)
                            setIsEditDialogOpen(true)
                          }}
                        >
                          <Pencil className="w-4 h-4 mr-2" />
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          className="text-destructive"
                          onClick={() => {
                            setUserToDelete(user)
                            setIsDeleteDialogOpen(true)
                          }}
                        >
                          <Trash className="w-4 h-4 mr-2" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={6} className="h-24 text-center">
                  <div className="flex flex-col items-center justify-center text-muted-foreground">
                    <AlertCircle className="w-8 h-8 mb-2" />
                    <p>No users found</p>
                    <p className="text-sm">Try adjusting your search terms</p>
                  </div>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </CardContent>

      {/* Delete User Confirmation Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure you want to delete this user?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete {userToDelete?.name}'s account and remove their
              data from the system.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteUser} className="bg-destructive text-destructive-foreground">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Edit User Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Edit User</DialogTitle>
            <DialogDescription>Make changes to the user's information. Click save when you're done.</DialogDescription>
          </DialogHeader>
          {userToEdit && (
            <div className="grid gap-4 py-4">
              <div className="grid items-center grid-cols-4 gap-4">
                <Label htmlFor="name" className="text-right">
                  Name
                </Label>
                <Input
                  id="name"
                  value={userToEdit.name}
                  onChange={(e) => handleEditChange("name", e.target.value)}
                  className="col-span-3"
                />
              </div>
              <div className="grid items-center grid-cols-4 gap-4">
                <Label htmlFor="email" className="text-right">
                  Email
                </Label>
                <Input
                  id="email"
                  value={userToEdit.email}
                  onChange={(e) => handleEditChange("email", e.target.value)}
                  className="col-span-3"
                />
              </div>
              <div className="grid items-center grid-cols-4 gap-4">
                <Label htmlFor="department" className="text-right">
                  Department
                </Label>
                <Select value={userToEdit.department} onValueChange={(value) => handleEditChange("department", value)}>
                  <SelectTrigger className="col-span-3">
                    <SelectValue placeholder="Select department" />
                  </SelectTrigger>
                  <SelectContent>
                    {ecgDepartments.map((dept) => (
                      <SelectItem key={dept.value} value={dept.value}>
                        {dept.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid items-center grid-cols-4 gap-4">
                <Label htmlFor="jobTitle" className="text-right">
                  Job Title
                </Label>
                <Input
                  id="jobTitle"
                  value={userToEdit.jobTitle}
                  onChange={(e) => handleEditChange("jobTitle", e.target.value)}
                  className="col-span-3"
                />
              </div>
              <div className="grid items-center grid-cols-4 gap-4">
                <Label htmlFor="role" className="text-right">
                  Role
                </Label>
                <Select value={userToEdit.role} onValueChange={(value) => handleEditChange("role", value)}>
                  <SelectTrigger className="col-span-3">
                    <SelectValue placeholder="Select role" />
                  </SelectTrigger>
                  <SelectContent>
                    {ecgRoles.map((role) => (
                      <SelectItem key={role.value} value={role.value}>
                        {role.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid items-center grid-cols-4 gap-4">
                <Label htmlFor="status" className="text-right">
                  Status
                </Label>
                <Select
                  value={userToEdit.status}
                  onValueChange={(value) => handleEditChange("status", value as "Active" | "Inactive")}
                >
                  <SelectTrigger className="col-span-3">
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Active">Active</SelectItem>
                    <SelectItem value="Inactive">Inactive</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button type="submit" onClick={handleEditSubmit}>
              Save changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Toaster />
    </Card>
  )
}
