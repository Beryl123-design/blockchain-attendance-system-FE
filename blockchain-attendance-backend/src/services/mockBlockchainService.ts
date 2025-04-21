import { BlockchainAttendanceRecord, IBlockchainService } from '../types/blockchain';

// In-memory storage for mock blockchain data
const attendanceRecords = new Map<string, BlockchainAttendanceRecord>();

export class MockBlockchainService implements IBlockchainService {
  // Remove static keywords from all methods
  async markAttendance(userId: number, status: string, location?: string): Promise<string> {
    const timestamp = Math.floor(Date.now() / 1000);
    const record: BlockchainAttendanceRecord = {
      status,
      timestamp,
      location,
      verified: true
    };
    
    const txHash = `0x${Math.random().toString(16).substr(2, 40)}`;
    attendanceRecords.set(`${userId}-${timestamp}`, record);
    
    return txHash;
  }

  async getAttendanceRecord(userId: number, timestamp: number): Promise<BlockchainAttendanceRecord | null> {
    const record = attendanceRecords.get(`${userId}-${timestamp}`);
    return record || null;
  }

  async verifyTransaction(txHash: string): Promise<boolean> {
    return true;
  }

  async getAccounts(): Promise<string[]> {
    return ['0x742d35Cc6634C0532925a3b844Bc454e4438f44e'];
  }

  async requestLeave(
    startTime: number,
    endTime: number,
    leaveType: string,
    reason: string
  ): Promise<{ transactionHash: string }> {
    const txHash = `0x${Math.random().toString(16).substr(2, 40)}`;
    return { transactionHash: txHash };
  }
}
