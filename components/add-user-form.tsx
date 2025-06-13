"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { toast } from "@/components/ui/use-toast"
import { Toaster } from "@/components/ui/toaster"

// Define user type for better type safety
export interface User {
  id: string
  name: string
  email: string
  department: string
  role: string
  jobTitle: string
  status: "active" | "inactive"
  dateAdded: string
  password?: string
}

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

export function AddUserForm() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    department: "",
    role: "",
    jobTitle: "",
    password: "",
  })

  // const [userCount, setUserCount] = useState(0)

  // Load user count from localStorage on component mount
  useEffect(() => {
    // const existingUsers = JSON.parse(localStorage.getItem("users") || "[]")
    // setUserCount(existingUsers.length)
  }, [])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSelectChange = (name: string, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    // In a real app, we would send this data to the backend
    
    // Create new user object
    const newUser = {
      name: formData.name,
      email: formData.email,
      department: formData.department,
      role: formData.role,
      jobTitle: formData.jobTitle,
      // dateAdded: new Date().toISOString().split("T")[0],
      password: formData.password, // In a real app, this would be hashed
    }
    
    console.log("Form submitted:", formData)
    // // Get existing users from localStorage
    // const existingUsers = JSON.parse(localStorage.getItem("users") || "[]")

    // // Check if user with this email already exists
    // const userExists = existingUsers.some((user: User) => user.email === formData.email)

    const response = await fetch("http://localhost:3001/register", {
      method: "POST",
      body: JSON.stringify(formData),
      headers: {
    "Content-Type": "application/json"
  }
    })

    const res = await response.json()
    console.log(res)

    if (response.status != 200) {
      toast({
        title: "Error",
        description: `A user with email ${formData.email} already exists.`,
      })
      return
    }

    // // Add new user to the list
    // const updatedUsers = [...existingUsers, newUser]

    // // Save to localStorage
    // localStorage.setItem("users", JSON.stringify(updatedUsers))

    // // Update user count
    // setUserCount(updatedUsers.length)

    // Show success message
    toast({
      title: "User Added",
      description: `${formData.name} has been added successfully. They can now log in with their email and password.`,
    })

    // Reset form
    setFormData({
      name: "",
      email: "",
      department: "",
      role: "",
      jobTitle: "",
      password: "",
    })
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Add New User</CardTitle>
        {/* <CardDescription>Add a new employee to the system. Total users: {userCount}</CardDescription> */}
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="name">Full Name</Label>
              <Input
                id="name"
                name="name"
                placeholder="John Doe"
                value={formData.name}
                onChange={handleChange}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="john.doe@ecggh.com"
                value={formData.email}
                onChange={handleChange}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="department">Department</Label>
              <Select value={formData.department} onValueChange={(value) => handleSelectChange("department", value)}>
                <SelectTrigger id="department">
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
            <div className="space-y-2">
              <Label htmlFor="jobTitle">Job Title</Label>
              <Input
                id="jobTitle"
                name="jobTitle"
                placeholder="Electrical Engineer"
                value={formData.jobTitle}
                onChange={handleChange}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Temporary Password</Label>
              <Input
                id="password"
                name="password"
                type="password"
                value={formData.password}
                onChange={handleChange}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="user-type">User Role</Label>
              <Select value={formData.role} onValueChange={(value) => handleSelectChange("role", value)}>
                <SelectTrigger id="user-type">
                  <SelectValue placeholder="Select user role" />
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
          </div>
        </CardContent>
        <CardFooter>
          <Button type="submit">Add User</Button>
        </CardFooter>
      </form>
      <Toaster />
    </Card>
  )
}
