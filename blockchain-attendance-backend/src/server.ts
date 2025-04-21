import express, { Request, Response, Router } from "express";
import { PrismaClient } from "@prisma/client";
import Web3 from "web3";
import dotenv from "dotenv";
import cors from 'cors';

// Type definitions
interface AttendanceRecord {
  id: number;
  date: Date;
  checkIn: Date;
  checkOut?: Date;
  status: string;
  totalWorkTime?: number;
  totalBreakTime?: number;
  overtime?: number;
  location?: string;
  blockchainHash?: string;
  userId: number;
  verified: boolean;
}

interface BlockchainAttendanceRecord {
  status: string;
  timestamp: number;
  location?: string;
}

interface LeaveRequestBody {
  userId: number;
  startDate: string;
  endDate: string;
  leaveType: string;
  reason: string;
}

interface AttendanceTrackBody {
  userId: number;
  status: string;
  location?: string;
}

dotenv.config();

const prisma = new PrismaClient();
const app = express();

// Initialize Alchemy Web3
const web3 = new Web3(new Web3.providers.HttpProvider(process.env.ALCHEMY_URL || "https://eth-mainnet.g.alchemy.com/v2/9ufy5vj4timu5tE1_NXs7UIbzESl7IWa"));

// Initialize contract
const CONTRACT_ADDRESS = process.env.CONTRACT_ADDRESS;
const CONTRACT_ABI = require('./contracts/AttendanceSystem.json').abi;
const contract = new web3.eth.Contract(CONTRACT_ABI, CONTRACT_ADDRESS);

app.use(express.json());
app.use(cors());

// Initialize Express Router instead of direct app routes
const router = Router();

router.post("/register", async (req, res) => {
  const { email, password, role, ethereumAddress } = req.body;
  try {
    const user = await prisma.user.create({
      data: { email, password, role, ethereumAddress },
    });
    res.json(user);
  } catch (error) {
    res.status(400).json({ error: "User already exists" });
  }
});

router.post("/login", async (req, res) => {
  const { email, password } = req.body;
  const user = await prisma.user.findUnique({ where: { email } });
  if (user && user.password === password) {
    res.json(user);
  } else {
    res.status(401).json({ error: "Invalid credentials" });
  }
});

router.post("/attendance", async (req, res) => {
  const { userId, date, status } = req.body;
  const attendance = await prisma.attendance.create({
    data: { userId, date: new Date(date), status },
  });
  res.json(attendance);
});

router.get("/attendance/:userId", async (req, res) => {
  const { userId } = req.params;
  const attendance = await prisma.attendance.findMany({ where: { userId: Number(userId) } });
  res.json(attendance);
});

router.post("/payroll", async (req, res) => {
  const { userId, amount, date } = req.body;
  const payroll = await prisma.payroll.create({
    data: { 
      user: { connect: { id: userId } }, 
      amount, 
      date: new Date(date), 
      status: "pending" // Add a default status or appropriate value
    },
  });
  res.json(payroll);
});

router.get("/payroll/:userId", async (req, res) => {
  const { userId } = req.params;
  const payroll = await prisma.payroll.findMany({ where: { userId: Number(userId) } });
  res.json(payroll);
});

router.post("/leave-request", async (req: Request<{}, {}, LeaveRequestBody>, res: Response) => {
  const { userId, startDate, endDate, leaveType, reason } = req.body;
  try {
    // Create leave request in database
    const leave = await prisma.leaveRequest.create({
      data: {
        userId,
        startDate: new Date(startDate),
        endDate: new Date(endDate),
        leaveType,
        reason,
        status: "pending"
      },
    });

    // Record on blockchain using Alchemy Web3
    const accounts = await web3.eth.getAccounts();
    const tx = await contract.methods.requestLeave(
      Math.floor(new Date(startDate).getTime() / 1000),
      Math.floor(new Date(endDate).getTime() / 1000),
      leaveType,
      reason
    ).send({ 
      from: accounts[0],
      gas: '500000' // Gas value as string
    });

    res.json({
      leave,
      transaction: tx.transactionHash
    });
  } catch (error) {
    console.error('Leave request error:', error);
    res.status(400).json({ error: "Failed to create leave request" });
  }
});

router.get("/leave-requests/:userId", async (req, res) => {
  const { userId } = req.params;
  try {
    const leaves = await prisma.leaveRequest.findMany({
      where: { userId: Number(userId) }
    });
    res.json(leaves);
  } catch (error) {
    console.error('Error fetching leave requests:', error);
    res.status(400).json({ error: "Failed to fetch leave requests" });
  }
});

router.post("/attendance/track", async (req: Request<{}, {}, AttendanceTrackBody>, res: Response) => {
  const { userId, status, location } = req.body;
  try {
    // Create attendance record in database
    const attendance = await prisma.attendance.create({
      data: {
        userId,
        date: new Date(),
        status,
        location
      },
    });

    // Record on blockchain using Alchemy Web3
    const accounts = await web3.eth.getAccounts();
    const tx = await contract.methods.markAttendance(status, location)
      .send({ 
        from: accounts[0],
        gas: '500000' // Gas value as string
      });

    res.json({
      attendance,
      transaction: tx.transactionHash
    });
  } catch (error) {
    console.error('Attendance tracking error:', error);
    res.status(400).json({ error: "Failed to record attendance" });
  }
});

// // Update the attendance verification route
// router.get("/attendance/verify/:userId/:date", async (
//   req: Request<{ userId: string; date: string }>,
//   res: Response
// ) => {
//   const { userId, date } = req.params;
//   try {
//     const attendance = await prisma.attendance.findFirst({
//       where: {
//         userId: Number(userId),
//         date: new Date(date)
//       }
//     });

//     if (!attendance) {
//       return res.status(404).json({ error: "Attendance record not found" });
//     }

//     const blockchainRecord = await contract.methods.getAttendanceRecord(
//       attendance.userId,
//       Math.floor(new Date(date).getTime() / 1000)
//     ).call() as BlockchainAttendanceRecord;

//     // Update verification status in database
//     const updatedAttendance = await prisma.attendance.update({
//       where: { id: attendance.id },
//       data: { 
//         verified: attendance.status === blockchainRecord.status,
//         blockchainHash: blockchainRecord.status // Store the blockchain status
//       }
//     });

//     res.json({
//       attendance: updatedAttendance,
//       blockchainRecord,
//       verified: updatedAttendance.verified
//     });
//   } catch (error) {
//     console.error('Attendance verification error:', error);
//     res.status(400).json({ error: "Failed to verify attendance" });
//   }
// });

// Use router middleware
app.use("/api", router);

const tryPort = (port: number): Promise<number> => {
  return new Promise((resolve, reject) => {
    const server = app.listen(port)
      .once('listening', () => {
        resolve(port);
      })
      .once('error', (err: any) => {
        if (err.code === 'EADDRINUSE') {
          tryPort(port + 1).then(resolve, reject);
        } else {
          reject(err);
        }
      });
  });
};

tryPort(Number(process.env.PORT) || 3000)
  .then(port => {
    console.log(`Server is running on port ${port}`);
  })
  .catch(err => {
    console.error('Failed to start server:', err);
  });