import express from "express";
import { PrismaClient } from "@prisma/client";
import Web3 from "web3";
import dotenv from "dotenv";
import cors from 'cors';

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

app.post("/register", async (req, res) => {
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

app.post("/login", async (req, res) => {
  const { email, password } = req.body;
  const user = await prisma.user.findUnique({ where: { email } });
  if (user && user.password === password) {
    res.json(user);
  } else {
    res.status(401).json({ error: "Invalid credentials" });
  }
});

app.post("/attendance", async (req, res) => {
  const { userId, date, status } = req.body;
  const attendance = await prisma.attendance.create({
    data: { userId, date: new Date(date), status },
  });
  res.json(attendance);
});

app.get("/attendance/:userId", async (req, res) => {
  const { userId } = req.params;
  const attendance = await prisma.attendance.findMany({ where: { userId: Number(userId) } });
  res.json(attendance);
});

app.post("/payroll", async (req, res) => {
  const { userId, amount, date } = req.body;
  const payroll = await prisma.payroll.create({
    data: { userId, amount, date: new Date(date) },
  });
  res.json(payroll);
});

app.get("/payroll/:userId", async (req, res) => {
  const { userId } = req.params;
  const payroll = await prisma.payroll.findMany({ where: { userId: Number(userId) } });
  res.json(payroll);
});

app.post("/leave-request", async (req, res) => {
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
      gas: 500000
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

app.get("/leave-requests/:userId", async (req, res) => {
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

app.post("/attendance/track", async (req, res) => {
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
        gas: 500000 // Adjust gas as needed
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

// Add endpoint to verify attendance on blockchain
app.get("/attendance/verify/:userId/:date", async (req, res) => {
  const { userId, date } = req.params;
  try {
    // Get attendance from database
    const attendance = await prisma.attendance.findFirst({
      where: {
        userId: Number(userId),
        date: new Date(date)
      }
    });

    if (!attendance) {
      return res.status(404).json({ error: "Attendance record not found" });
    }

    // Verify on blockchain
    const blockchainRecord = await contract.methods.getAttendanceRecord(
      attendance.userId,
      Math.floor(new Date(date).getTime() / 1000)
    ).call();

    res.json({
      databaseRecord: attendance,
      blockchainRecord,
      verified: attendance.status === blockchainRecord.status
    });
  } catch (error) {
    console.error('Attendance verification error:', error);
    res.status(400).json({ error: "Failed to verify attendance" });
  }
});

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