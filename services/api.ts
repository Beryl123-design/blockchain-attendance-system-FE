import { BlockchainAttendanceRecord } from '../blockchain-attendance-backend/src/types/blockchain';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

export interface User {
  id: number;
  email: string;
  role: string;
  ethereumAddress: string;
}

export interface AttendanceRecord {
  id: number;
  userId: number;
  date: string;
  checkInTime: string;
  checkOutTime?: string;
  status: string;
  location?: string;
  totalWorkTime?: number;
  totalBreakTime?: number;
  overtime?: number;
  blockchainHash?: string;
  verified: boolean;
}

export interface LeaveRequest {
  approvedBy: undefined;
  approvalDate: undefined;
  id: number;
  userId: number;
  startDate: string;
  endDate: string;
  leaveType: string;
  reason: string;
  status: string;
}

export interface PayrollRecord {
  id: number;
  userId: number;
  amount: number;
  date: string;
  status: string;
  processed: boolean;
  txHash?: string;
}

export interface AttendanceVerification {
  databaseRecord: AttendanceRecord;
  blockchainRecord: BlockchainAttendanceRecord;
  verified: boolean;
}

export const api = {
  // Auth endpoints
  register: async (data: { 
    email: string; 
    password: string; 
    role: string; 
    ethereumAddress: string 
  }): Promise<User> => {
    const response = await fetch(`${API_BASE_URL}/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error('Registration failed');
    return response.json();
  },

  login: async (data: { 
    email: string; 
    password: string 
  }): Promise<User> => {
    const response = await fetch(`${API_BASE_URL}/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error('Login failed');
    return response.json();
  },

  // Attendance endpoints
  markAttendance: async (data: {
    userId: number;
    checkInTime?: string;
    status: string;
    location?: string;
  }): Promise<{ attendance: AttendanceRecord; transaction: string }> => {
    const response = await fetch(`${API_BASE_URL}/attendance`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error('Failed to mark attendance');
    return response.json();
  },

  trackAttendance: async (data: {
    userId: number;
    status: string;
    location?: string;
  }): Promise<{ attendance: AttendanceRecord; transaction: string }> => {
    const response = await fetch(`${API_BASE_URL}/attendance/track`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error('Failed to track attendance');
    return response.json();
  },

  getAttendance: async (userId: number): Promise<AttendanceRecord[]> => {
    const response = await fetch(`${API_BASE_URL}/attendance/${userId}`);
    if (!response.ok) throw new Error('Failed to fetch attendance records');
    return response.json();
  },

  verifyAttendance: async (userId: number, date: string): Promise<AttendanceVerification> => {
    const response = await fetch(`${API_BASE_URL}/attendance/verify/${userId}/${date}`);
    if (!response.ok) throw new Error('Failed to verify attendance');
    return response.json();
  },

  // Leave request endpoints
  createLeaveRequest: async (data: {
    userId: number;
    startDate: string;
    endDate: string;
    leaveType: string;
    reason: string;
  }): Promise<{ leave: LeaveRequest; transaction: string }> => {
    const response = await fetch(`${API_BASE_URL}/leave-request`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error('Failed to create leave request');
    return response.json();
  },

  getLeaveRequests: async (userId: number): Promise<LeaveRequest[]> => {
    const response = await fetch(`${API_BASE_URL}/leave-requests/${userId}`);
    if (!response.ok) throw new Error('Failed to fetch leave requests');
    return response.json();
  },

  // Payroll endpoints
  createPayroll: async (data: {
    userId: number;
    amount: number;
    date: string;
    status?: string;
  }): Promise<PayrollRecord> => {
    const response = await fetch(`${API_BASE_URL}/payroll`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error('Failed to create payroll record');
    return response.json();
  },

  getPayroll: async (userId: number): Promise<PayrollRecord[]> => {
    const response = await fetch(`${API_BASE_URL}/payroll/${userId}`);
    if (!response.ok) throw new Error('Failed to fetch payroll records');
    return response.json();
  },
};

export default api;