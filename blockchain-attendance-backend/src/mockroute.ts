import { Router, Request, Response } from 'express';
import { MockBlockchainService } from './services/mockBlockchainServices';


export const mockBlockchainService = new MockBlockchainService();

const router = Router();

// POST /attendance
router.post('/attendance', async (req, res) => {
  try {
    const { userId, status, location } = req.body;
    const txHash = await mockBlockchainService.markAttendance(userId, status, location);
    res.json({ message: 'Attendance recorded', transactionHash: txHash });
  } catch (error) {
    res.status(500).json({ error: 'Failed to mark attendance' });
  }
});

// GET /attendance/:userId/:timestamp
// router.get("/attendance/:userId/:timestamp", async (req, res) => {
//   try {
//     const { userId, timestamp } = req.params;
//     const record = await mockBlockchainService.getAttendanceRecord(parseInt(userId), parseInt(timestamp));
//     if (!record) {
//       return res.status(404).json({ error: 'Record not found' });
//     }
//     res.json(record);
//   } catch (error) {
//     res.status(500).json({ error: 'Error fetching attendance record' });
//   }
// });

// POST /leave
router.post('/leave', async (req, res) => {
  try {
    const { startDate, endDate, leaveType, reason } = req.body;
    const startTime = new Date(startDate).getTime() / 1000;
    const endTime = new Date(endDate).getTime() / 1000;

    const tx = await mockBlockchainService.requestLeave(startTime, endTime, leaveType, reason);
    res.json({ message: 'Leave requested', transactionHash: tx.transactionHash });
  } catch (error) {
    res.status(500).json({ error: 'Failed to request leave' });
  }
});

export default router;
