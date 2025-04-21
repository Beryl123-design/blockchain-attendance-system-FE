import Web3 from "web3";
import { recordAttendance as mockRecordAttendance, getAttendance as mockGetAttendance } from "./mockBlockchainService";

const isDevelopment = process.env.NODE_ENV === "development";

let web3: Web3 | undefined, contract: any;

if (!isDevelopment) {
  web3 = new Web3(Web3.givenProvider || "http://localhost:8545");
  const contractAddress = "YOUR_CONTRACT_ADDRESS";
  const contractABI: any[] = [
    // Your contract ABI here
  ];
  contract = new web3.eth.Contract(contractABI, contractAddress);
}

export const recordAttendance = async (employeeId: string, date: string, status: string) => {
  if (isDevelopment) {
    return mockRecordAttendance(employeeId, date, status);
  }
  if (!web3) {
    throw new Error("Web3 is not initialized");
  }
  const accounts = await web3.eth.getAccounts();
  return contract.methods.recordAttendance(employeeId, date, status).send({ from: accounts[0] });
};

export const getAttendance = async (employeeId: string) => {
  if (isDevelopment) {
    return mockGetAttendance(employeeId);
  }
  return contract.methods.getAttendance(employeeId).call();
};
