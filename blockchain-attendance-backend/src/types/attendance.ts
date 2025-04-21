export interface AttendanceRequest {
  userId: number;
  checkInTime?: string;
  checkOutTime?: string;
  status: string;
  location?: string;
  totalWorkTime?: number;
  totalBreakTime?: number;
  overtime?: number;
  verified?: boolean;
  blockchainHash?: string | null;
}

export interface AttendanceRecord {
  id: number;
  date: Date;
  checkInTime: Date;
  checkOutTime?: Date | null;
  status: string;
  totalWorkTime?: number | null;
  totalBreakTime?: number | null;
  overtime?: number | null;
  location?: string | null;
  blockchainHash?: string | null;
  userId: number;
  verified: boolean;
}
