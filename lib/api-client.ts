/**
 * API client for connecting to the backend
 */

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api"

// Always use mock implementation in v0.dev
// This ensures we don't try to make real API calls that will fail
const USE_MOCK = true

// Mock data for preview mode - MAKE SURE THESE MATCH THE DISPLAYED DEMO CREDENTIALS
const MOCK_USERS = [
  {
    id: "1",
    email: "admin@example.com",
    password: "admin123",
    role: "admin",
    name: "Admin User",
    department: "Administration",
    jobTitle: "System Administrator",
  },
  {
    id: "2",
    email: "employee@example.com",
    password: "employee123",
    role: "employee",
    name: "Employee User",
    department: "Engineering",
    jobTitle: "Software Engineer",
  },
  {
    id: "3",
    email: "hr@example.com",
    password: "hr123",
    role: "hr",
    name: "HR User",
    department: "Human Resources",
    jobTitle: "HR Manager",
  },
]

// Authentication endpoints
export async function login(email: string, password: string) {
  try {
    // Always use mock implementation in v0.dev
    if (USE_MOCK) {
      // Simulate network delay
      await new Promise((resolve) => setTimeout(resolve, 800))

      // Debug logging
      console.log("Login attempt:", { email, password })
      console.log(
        "Available users:",
        MOCK_USERS.map((u) => ({ email: u.email, password: u.password })),
      )

      // Case insensitive email comparison
      const user = MOCK_USERS.find((u) => u.email.toLowerCase() === email.toLowerCase())

      if (!user) {
        console.log("User not found")
        throw new Error("Invalid email or password")
      }

      if (user.password !== password) {
        console.log("Password mismatch")
        throw new Error("Invalid email or password")
      }

      console.log("Login successful:", user)
      return {
        user: {
          id: user.id,
          email: user.email,
          role: user.role,
          name: user.name,
          department: user.department,
          jobTitle: user.jobTitle,
        },
      }
    }

    // First, get a CSRF token
    const csrfResponse = await fetch("/api/csrf")
    const { csrfToken } = await csrfResponse.json()

    const response = await fetch("/api/auth", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-CSRF-Token": csrfToken,
      },
      body: JSON.stringify({ email, password }),
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || "Authentication failed")
    }

    return await response.json()
  } catch (error) {
    console.error("Login error:", error)
    throw error
  }
}

export async function logout() {
  try {
    // Always use mock implementation in v0.dev
    if (USE_MOCK) {
      await new Promise((resolve) => setTimeout(resolve, 500))
      return { success: true }
    }

    const response = await fetch(`${API_BASE_URL}/auth/logout`, {
      method: "POST",
      credentials: "include",
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.message || "Logout failed")
    }

    return await response.json()
  } catch (error) {
    console.error("Logout error:", error)
    throw error
  }
}

// Registration endpoint
export async function registerUser(userData: {
  email: string
  password: string
  name: string
  role: string
  department?: string
  jobTitle?: string
}) {
  try {
    // Always use mock implementation in v0.dev
    if (USE_MOCK) {
      // Simulate network delay
      await new Promise((resolve) => setTimeout(resolve, 1000))

      // Check if email already exists
      if (MOCK_USERS.some((u) => u.email === userData.email)) {
        throw new Error("Email already registered")
      }

      // In a real app, we would add the user to the database
      // For preview, we'll just return success
      return {
        success: true,
        user: {
          id: Date.now().toString(),
          email: userData.email,
          name: userData.name,
          role: userData.role,
          department: userData.department,
          jobTitle: userData.jobTitle,
        },
      }
    }

    const response = await fetch(`${API_BASE_URL}/auth/register`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(userData),
      credentials: "include",
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.message || "Registration failed")
    }

    return await response.json()
  } catch (error) {
    console.error("Registration error:", error)
    throw error
  }
}

// User endpoints
export async function getUsers() {
  try {
    // Always use mock implementation in v0.dev
    if (USE_MOCK) {
      await new Promise((resolve) => setTimeout(resolve, 800))
      return { users: MOCK_USERS.map((u) => ({ ...u, password: undefined })) }
    }

    const response = await fetch(`${API_BASE_URL}/users`, {
      credentials: "include",
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.message || "Failed to fetch users")
    }

    return await response.json()
  } catch (error) {
    console.error("Get users error:", error)
    throw error
  }
}

export async function createUser(userData: any) {
  try {
    // Always use mock implementation in v0.dev
    if (USE_MOCK) {
      await new Promise((resolve) => setTimeout(resolve, 800))
      return {
        success: true,
        user: {
          id: Date.now().toString(),
          ...userData,
        },
      }
    }

    const response = await fetch(`${API_BASE_URL}/users`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(userData),
      credentials: "include",
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.message || "Failed to create user")
    }

    return await response.json()
  } catch (error) {
    console.error("Create user error:", error)
    throw error
  }
}

// Attendance endpoints
export async function getAttendanceRecords(userId?: string, date?: string) {
  try {
    // Always use mock implementation in v0.dev
    if (USE_MOCK) {
      await new Promise((resolve) => setTimeout(resolve, 800))

      // Generate some mock attendance records
      const mockRecords = [
        {
          id: "1",
          userId: "1",
          date: new Date().toISOString().split("T")[0],
          checkIn: new Date(new Date().setHours(9, 0, 0)).toISOString(),
          checkOut: new Date(new Date().setHours(17, 30, 0)).toISOString(),
          status: "present",
        },
        {
          id: "2",
          userId: "2",
          date: new Date().toISOString().split("T")[0],
          checkIn: new Date(new Date().setHours(8, 45, 0)).toISOString(),
          checkOut: new Date(new Date().setHours(17, 15, 0)).toISOString(),
          status: "present",
        },
      ]

      // Filter by userId if provided
      let filteredRecords = mockRecords
      if (userId) {
        filteredRecords = mockRecords.filter((r) => r.userId === userId)
      }

      // Filter by date if provided
      if (date) {
        filteredRecords = filteredRecords.filter((r) => r.date === date)
      }

      return { records: filteredRecords }
    }

    let url = `${API_BASE_URL}/attendance`
    const params = new URLSearchParams()

    if (userId) params.append("userId", userId)
    if (date) params.append("date", date)

    if (params.toString()) {
      url += `?${params.toString()}`
    }

    const response = await fetch(url, {
      credentials: "include",
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.message || "Failed to fetch attendance records")
    }

    return await response.json()
  } catch (error) {
    console.error("Get attendance records error:", error)
    throw error
  }
}

export async function recordAttendance(attendanceData: any) {
  try {
    // Always use mock implementation in v0.dev
    if (USE_MOCK) {
      await new Promise((resolve) => setTimeout(resolve, 800))
      return {
        success: true,
        record: {
          id: Date.now().toString(),
          ...attendanceData,
          timestamp: new Date().toISOString(),
        },
      }
    }

    const response = await fetch(`${API_BASE_URL}/attendance`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(attendanceData),
      credentials: "include",
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.message || "Failed to record attendance")
    }

    return await response.json()
  } catch (error) {
    console.error("Record attendance error:", error)
    throw error
  }
}

// The rest of the API client functions would follow the same pattern
// with mock implementations

// Leave application endpoints
export async function getLeaveApplications(userId?: string, status?: string) {
  try {
    // Always use mock implementation in v0.dev
    if (USE_MOCK) {
      await new Promise((resolve) => setTimeout(resolve, 800))
      return { applications: [] }
    }

    let url = `${API_BASE_URL}/leave`
    const params = new URLSearchParams()

    if (userId) params.append("userId", userId)
    if (status) params.append("status", status)

    if (params.toString()) {
      url += `?${params.toString()}`
    }

    const response = await fetch(url, {
      credentials: "include",
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.message || "Failed to fetch leave applications")
    }

    return await response.json()
  } catch (error) {
    console.error("Get leave applications error:", error)
    throw error
  }
}

export async function createLeaveApplication(leaveData: any) {
  try {
    // Always use mock implementation in v0.dev
    if (USE_MOCK) {
      await new Promise((resolve) => setTimeout(resolve, 800))
      return {
        success: true,
        application: {
          id: Date.now().toString(),
          ...leaveData,
          status: "pending",
          createdAt: new Date().toISOString(),
        },
      }
    }

    const response = await fetch(`${API_BASE_URL}/leave`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(leaveData),
      credentials: "include",
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.message || "Failed to create leave application")
    }

    return await response.json()
  } catch (error) {
    console.error("Create leave application error:", error)
    throw error
  }
}

// Bulletins endpoints
export async function getBulletins() {
  try {
    // Always use mock implementation in v0.dev
    if (USE_MOCK) {
      await new Promise((resolve) => setTimeout(resolve, 800))

      const mockBulletins = [
        {
          id: "1",
          title: "Company Holiday",
          content: "The office will be closed on Monday for the national holiday.",
          authorId: "1",
          authorName: "Admin User",
          priority: "high",
          createdAt: new Date(new Date().setDate(new Date().getDate() - 2)).toISOString(),
        },
        {
          id: "2",
          title: "New Attendance System",
          content: "We've launched our new blockchain-based attendance system. Please report any issues to IT.",
          authorId: "1",
          authorName: "Admin User",
          priority: "medium",
          createdAt: new Date(new Date().setDate(new Date().getDate() - 5)).toISOString(),
        },
      ]

      return { bulletins: mockBulletins }
    }

    const response = await fetch(`${API_BASE_URL}/bulletins`, {
      credentials: "include",
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.message || "Failed to fetch bulletins")
    }

    return await response.json()
  } catch (error) {
    console.error("Get bulletins error:", error)
    throw error
  }
}

// Issues endpoints
export async function getIssues(reporterId?: string, status?: string) {
  try {
    // Always use mock implementation in v0.dev
    if (USE_MOCK) {
      await new Promise((resolve) => setTimeout(resolve, 800))
      return { issues: [] }
    }

    let url = `${API_BASE_URL}/issues`
    const params = new URLSearchParams()

    if (reporterId) params.append("reporterId", reporterId)
    if (status) params.append("status", status)

    if (params.toString()) {
      url += `?${params.toString()}`
    }

    const response = await fetch(url, {
      credentials: "include",
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.message || "Failed to fetch issues")
    }

    return await response.json()
  } catch (error) {
    console.error("Get issues error:", error)
    throw error
  }
}

export async function createIssue(issueData: any) {
  try {
    // Always use mock implementation in v0.dev
    if (USE_MOCK) {
      await new Promise((resolve) => setTimeout(resolve, 800))
      return {
        success: true,
        issue: {
          id: Date.now().toString(),
          ...issueData,
          status: "open",
          createdAt: new Date().toISOString(),
        },
      }
    }

    const response = await fetch(`${API_BASE_URL}/issues`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(issueData),
      credentials: "include",
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.message || "Failed to create issue")
    }

    return await response.json()
  } catch (error) {
    console.error("Create issue error:", error)
    throw error
  }
}

// Blockchain verification
export async function verifyAttendanceRecord(recordId: string) {
  try {
    // Always use mock implementation in v0.dev
    if (USE_MOCK) {
      await new Promise((resolve) => setTimeout(resolve, 1200))
      return {
        verified: true,
        blockchainInfo: {
          blockNumber: "12345678",
          timestamp: new Date().toISOString(),
          transactionHash:
            "0x" +
            Array(64)
              .fill(0)
              .map(() => Math.floor(Math.random() * 16).toString(16))
              .join(""),
        },
      }
    }

    const response = await fetch(`${API_BASE_URL}/blockchain/verify?recordId=${recordId}`, {
      credentials: "include",
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.message || "Failed to verify record")
    }

    return await response.json()
  } catch (error) {
    console.error("Verify record error:", error)
    throw error
  }
}
