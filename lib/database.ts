// This file would normally connect to a real database
// For now, we'll use in-memory storage that persists during the session

// Type definitions
export interface User {
  id: string
  email: string
  name: string
  role: "admin" | "employee" | "hr" | "supervisor"
  department?: string
  password?: string // In a real app, you'd store hashed passwords
}

export interface AttendanceRecord {
  id: string
  userId: string
  date: string
  checkIn: string | null
  checkOut: string | null
  status: "present" | "absent" | "late" | "half-day"
}

export interface LeaveApplication {
  id: string
  userId: string
  startDate: string
  endDate: string
  reason: string
  status: "pending" | "approved" | "rejected"
  type: "sick" | "vacation" | "personal" | "other"
}

export interface Bulletin {
  id: string
  title: string
  content: string
  authorId: string
  createdAt: string
  priority: "low" | "medium" | "high"
}

// In-memory database
class InMemoryDatabase {
  private users: User[] = [
    { id: "1", email: "admin@example.com", password: "admin123", role: "admin", name: "Admin User" },
    {
      id: "2",
      email: "employee@example.com",
      password: "employee123",
      role: "employee",
      name: "Employee User",
      department: "Engineering",
    },
    { id: "3", email: "hr@example.com", password: "hr123", role: "hr", name: "HR User", department: "Human Resources" },
    {
      id: "4",
      email: "supervisor@example.com",
      password: "supervisor123",
      role: "supervisor",
      name: "Supervisor User",
      department: "Engineering",
    },
  ]

  private attendanceRecords: AttendanceRecord[] = []
  private leaveApplications: LeaveApplication[] = []
  private bulletins: Bulletin[] = []

  // User methods
  async getUsers(): Promise<User[]> {
    return this.users.map(({ password, ...user }) => user)
  }

  async getUserById(id: string): Promise<User | null> {
    const user = this.users.find((u) => u.id === id)
    if (!user) return null

    const { password, ...userWithoutPassword } = user
    return userWithoutPassword
  }

  async getUserByEmail(email: string): Promise<User | null> {
    return this.users.find((u) => u.email === email) || null
  }

  async createUser(user: Omit<User, "id">): Promise<User> {
    const newUser = {
      ...user,
      id: String(this.users.length + 1),
    }

    this.users.push(newUser)

    const { password, ...userWithoutPassword } = newUser
    return userWithoutPassword
  }

  // Attendance methods
  async getAttendanceRecords(filters: { userId?: string; date?: string } = {}): Promise<AttendanceRecord[]> {
    let records = [...this.attendanceRecords]

    if (filters.userId) {
      records = records.filter((record) => record.userId === filters.userId)
    }

    if (filters.date) {
      records = records.filter((record) => record.date === filters.date)
    }

    return records
  }

  async createAttendanceRecord(record: Omit<AttendanceRecord, "id">): Promise<AttendanceRecord> {
    const newRecord = {
      ...record,
      id: String(this.attendanceRecords.length + 1),
    }

    this.attendanceRecords.push(newRecord)
    return newRecord
  }

  async updateAttendanceRecord(id: string, updates: Partial<AttendanceRecord>): Promise<AttendanceRecord | null> {
    const recordIndex = this.attendanceRecords.findIndex((r) => r.id === id)

    if (recordIndex === -1) return null

    this.attendanceRecords[recordIndex] = {
      ...this.attendanceRecords[recordIndex],
      ...updates,
    }

    return this.attendanceRecords[recordIndex]
  }

  // Leave application methods
  async getLeaveApplications(filters: { userId?: string; status?: string } = {}): Promise<LeaveApplication[]> {
    let applications = [...this.leaveApplications]

    if (filters.userId) {
      applications = applications.filter((app) => app.userId === filters.userId)
    }

    if (filters.status) {
      applications = applications.filter((app) => app.status === filters.status)
    }

    return applications
  }

  async createLeaveApplication(application: Omit<LeaveApplication, "id">): Promise<LeaveApplication> {
    const newApplication = {
      ...application,
      id: String(this.leaveApplications.length + 1),
    }

    this.leaveApplications.push(newApplication)
    return newApplication
  }

  async updateLeaveApplication(id: string, updates: Partial<LeaveApplication>): Promise<LeaveApplication | null> {
    const applicationIndex = this.leaveApplications.findIndex((a) => a.id === id)

    if (applicationIndex === -1) return null

    this.leaveApplications[applicationIndex] = {
      ...this.leaveApplications[applicationIndex],
      ...updates,
    }

    return this.leaveApplications[applicationIndex]
  }

  // Bulletin methods
  async getBulletins(): Promise<Bulletin[]> {
    return [...this.bulletins]
  }

  async createBulletin(bulletin: Omit<Bulletin, "id">): Promise<Bulletin> {
    const newBulletin = {
      ...bulletin,
      id: String(this.bulletins.length + 1),
    }

    this.bulletins.push(newBulletin)
    return newBulletin
  }
}

// Export singleton instance
export const db = new InMemoryDatabase()
