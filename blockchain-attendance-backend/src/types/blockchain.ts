export interface BlockchainAttendanceRecord {
  status: string;
  timestamp: number;
  location?: string;
  verified: boolean;
}

export interface IBlockchainService {
  markAttendance(userId: number, status: string, location?: string): Promise<string>;
  getAttendanceRecord(userId: number, timestamp: number): Promise<BlockchainAttendanceRecord | null>;
  verifyTransaction(txHash: string): Promise<boolean>;
  getAccounts(): Promise<string[]>;
  requestLeave(startTime: number, endTime: number, leaveType: string, reason: string): Promise<{ transactionHash: string }>;
}
