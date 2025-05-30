"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const client_1 = require("@prisma/client");
const web3_1 = __importDefault(require("web3"));
const dotenv_1 = __importDefault(require("dotenv"));
const cors_1 = __importDefault(require("cors"));
dotenv_1.default.config();
const prisma = new client_1.PrismaClient();
const app = (0, express_1.default)();
// Initialize Alchemy Web3
const web3 = new web3_1.default(new web3_1.default.providers.HttpProvider(process.env.ALCHEMY_URL || "https://eth-mainnet.g.alchemy.com/v2/9ufy5vj4timu5tE1_NXs7UIbzESl7IWa"));
// Initialize contract
const CONTRACT_ADDRESS = process.env.CONTRACT_ADDRESS;
const CONTRACT_ABI = require('./contracts/AttendanceSystem.json').abi;
const contract = new web3.eth.Contract(CONTRACT_ABI, CONTRACT_ADDRESS);
app.use(express_1.default.json());
app.use((0, cors_1.default)());
app.post("/register", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { email, password, role, ethereumAddress } = req.body;
    try {
        const user = yield prisma.user.create({
            data: { email, password, role, ethereumAddress },
        });
        res.json(user);
    }
    catch (error) {
        res.status(400).json({ error: "User already exists" });
    }
}));
app.post("/login", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { email, password } = req.body;
    const user = yield prisma.user.findUnique({ where: { email } });
    if (user && user.password === password) {
        res.json(user);
    }
    else {
        res.status(401).json({ error: "Invalid credentials" });
    }
}));
app.post("/attendance", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { userId, date, status } = req.body;
    const attendance = yield prisma.attendance.create({
        data: { userId, date: new Date(date), status },
    });
    res.json(attendance);
}));
app.get("/attendance/:userId", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { userId } = req.params;
    const attendance = yield prisma.attendance.findMany({ where: { userId: Number(userId) } });
    res.json(attendance);
}));
app.post("/payroll", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { userId, amount, date } = req.body;
    const payroll = yield prisma.payroll.create({
        data: { userId, amount, date: new Date(date) },
    });
    res.json(payroll);
}));
app.get("/payroll/:userId", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { userId } = req.params;
    const payroll = yield prisma.payroll.findMany({ where: { userId: Number(userId) } });
    res.json(payroll);
}));
app.post("/leave-request", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { userId, startDate, endDate, leaveType, reason } = req.body;
    try {
        // Create leave request in database
        const leave = yield prisma.leaveRequest.create({
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
        const accounts = yield web3.eth.getAccounts();
        const tx = yield contract.methods.requestLeave(Math.floor(new Date(startDate).getTime() / 1000), Math.floor(new Date(endDate).getTime() / 1000), leaveType, reason).send({
            from: accounts[0],
            gas: 500000
        });
        res.json({
            leave,
            transaction: tx.transactionHash
        });
    }
    catch (error) {
        console.error('Leave request error:', error);
        res.status(400).json({ error: "Failed to create leave request" });
    }
}));
app.get("/leave-requests/:userId", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { userId } = req.params;
    try {
        const leaves = yield prisma.leaveRequest.findMany({
            where: { userId: Number(userId) }
        });
        res.json(leaves);
    }
    catch (error) {
        console.error('Error fetching leave requests:', error);
        res.status(400).json({ error: "Failed to fetch leave requests" });
    }
}));
app.post("/attendance/track", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { userId, status, location } = req.body;
    try {
        // Create attendance record in database
        const attendance = yield prisma.attendance.create({
            data: {
                userId,
                date: new Date(),
                status,
                location
            },
        });
        // Record on blockchain using Alchemy Web3
        const accounts = yield web3.eth.getAccounts();
        const tx = yield contract.methods.markAttendance(status, location)
            .send({
            from: accounts[0],
            gas: 500000 // Adjust gas as needed
        });
        res.json({
            attendance,
            transaction: tx.transactionHash
        });
    }
    catch (error) {
        console.error('Attendance tracking error:', error);
        res.status(400).json({ error: "Failed to record attendance" });
    }
}));
// Add endpoint to verify attendance on blockchain
app.get("/attendance/verify/:userId/:date", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { userId, date } = req.params;
    try {
        // Get attendance from database
        const attendance = yield prisma.attendance.findFirst({
            where: {
                userId: Number(userId),
                date: new Date(date)
            }
        });
        if (!attendance) {
            return res.status(404).json({ error: "Attendance record not found" });
        }
        // Verify on blockchain
        const blockchainRecord = yield contract.methods.getAttendanceRecord(attendance.userId, Math.floor(new Date(date).getTime() / 1000)).call();
        res.json({
            databaseRecord: attendance,
            blockchainRecord,
            verified: attendance.status === blockchainRecord.status
        });
    }
    catch (error) {
        console.error('Attendance verification error:', error);
        res.status(400).json({ error: "Failed to verify attendance" });
    }
}));
const tryPort = (port) => {
    return new Promise((resolve, reject) => {
        const server = app.listen(port)
            .once('listening', () => {
            resolve(port);
        })
            .once('error', (err) => {
            if (err.code === 'EADDRINUSE') {
                tryPort(port + 1).then(resolve, reject);
            }
            else {
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
