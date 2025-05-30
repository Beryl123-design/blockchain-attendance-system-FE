"use client"

import { useEffect } from "react"

export function DataInitializer() {
  useEffect(() => {
    // Initialize default users if they don't exist
    const existingUsers = JSON.parse(localStorage.getItem("users") || "[]")

    if (existingUsers.length === 0) {
      const defaultUsers = [
        {
          id: "1",
          name: "John Doe",
          email: "johndoe@example.com",
          department: "Engineering",
          jobTitle: "Software Engineer",
          role: "employee",
          dateAdded: new Date().toISOString(),
          status: "Active",
        },
        {
          id: "2",
          name: "Jane Smith",
          email: "janesmith@example.com",
          department: "Marketing",
          jobTitle: "Marketing Manager",
          role: "employee",
          dateAdded: new Date().toISOString(),
          status: "Active",
        },
        {
          id: "3",
          name: "Robert Johnson",
          email: "robertjohnson@example.com",
          department: "HR",
          jobTitle: "HR Specialist",
          role: "employee",
          dateAdded: new Date().toISOString(),
          status: "Active",
        },
        {
          id: "4",
          name: "Emily Davis",
          email: "emilydavis@example.com",
          department: "Finance",
          jobTitle: "Financial Analyst",
          role: "employee",
          dateAdded: new Date().toISOString(),
          status: "Active",
        },
        {
          id: "5",
          name: "Michael Wilson",
          email: "michaelwilson@example.com",
          department: "Engineering",
          jobTitle: "Engineering Manager",
          role: "supervisor",
          dateAdded: new Date().toISOString(),
          status: "Active",
        },
        {
          id: "6",
          name: "Sarah Brown",
          email: "sarahbrown@example.com",
          department: "Marketing",
          jobTitle: "Content Strategist",
          role: "employee",
          dateAdded: new Date().toISOString(),
          status: "Active",
        },
        {
          id: "7",
          name: "David Lee",
          email: "davidlee@example.com",
          department: "HR",
          jobTitle: "HR Director",
          role: "hr",
          dateAdded: new Date().toISOString(),
          status: "Active",
        },
        {
          id: "8",
          name: "Beryl Danso",
          email: "beryldanso@gmail.com",
          department: "Administration",
          jobTitle: "System Administrator",
          role: "admin",
          dateAdded: new Date().toISOString(),
          status: "Active",
        },
      ]

      localStorage.setItem("users", JSON.stringify(defaultUsers))

      // Log initialization activity
      const activities = JSON.parse(localStorage.getItem("recentActivities") || "[]")
      activities.unshift({
        id: Date.now().toString(),
        type: "System",
        description: "System initialized with default users",
        timestamp: new Date().toISOString(),
        userEmail: "system@example.com",
        userName: "System",
      })
      localStorage.setItem("recentActivities", JSON.stringify(activities))
    }

    // Initialize team attendance for today if it doesn't exist
    const today = new Date().toISOString().split("T")[0]
    const teamAttendance = JSON.parse(localStorage.getItem("teamAttendance") || "{}")

    if (!teamAttendance[today]) {
      teamAttendance[today] = {
        date: today,
        attendees: [],
        absentees: [],
      }
      localStorage.setItem("teamAttendance", JSON.stringify(teamAttendance))
    }
  }, [])

  return null // This component doesn't render anything
}
