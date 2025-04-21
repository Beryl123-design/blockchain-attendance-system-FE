import { Alchemy, Network, AlchemySettings, AssetTransfersCategory } from 'alchemy-sdk';
import { createAlchemyWeb3 } from "@alch/alchemy-web3";
import dotenv from 'dotenv';
import { BlockchainAttendanceRecord, IBlockchainService } from '../types/blockchain';

dotenv.config();

const settings: AlchemySettings = {
  apiKey: process.env.ALCHEMY_API_KEY || '9ufy5vj4timu5tE1_NXs7UIbzESl7IWa',
  network: Network.ETH_SEPOLIA,
};

const alchemy = new Alchemy(settings);

// Fix: Use ALCHEMY_URL instead of ALCHEMY_APP_URL and provide fallback
const alchemyUrl = process.env.ALCHEMY_URL || "https://eth-mainnet.g.alchemy.com/v2/9ufy5vj4timu5tE1_NXs7UIbzESl7IWa";
const web3 = createAlchemyWeb3(alchemyUrl);

export class AlchemyService implements IBlockchainService {
  private contract: any;

  constructor() {
    try {
      const CONTRACT_ABI = require('../contracts/AttendanceSystem.json').abi;
      const contractAddress = process.env.CONTRACT_ADDRESS;
      
      if (!contractAddress || !web3.utils.isAddress(contractAddress)) {
        throw new Error('Invalid contract address');
      }
      
      this.contract = new web3.eth.Contract(CONTRACT_ABI, contractAddress);
    } catch (error) {
      console.error('Failed to initialize contract:', error);
      throw error;
    }
  }

  private static validateContractAddress(address: string): string {
    try {
      if (!web3.utils.isAddress(address)) {
        throw new Error('Invalid contract address format');
      }
      return web3.utils.toChecksumAddress(address);
    } catch (error) {
      console.error('Contract address validation error:', error);
      throw error;
    }
  }

  async verifyTransaction(txHash: string): Promise<boolean> {
    try {
      const tx = await alchemy.core.getTransactionReceipt(txHash);
      return tx?.status === 1;
    } catch (error) {
      console.error('Alchemy verification error:', error);
      return false;
    }
  }

  static getWeb3() {
    return web3;
  }

  async getAccounts(): Promise<string[]> {
    return web3.eth.getAccounts();
  }

  static async getAddressActivity(address: string) {
    try {
      return await alchemy.core.getAssetTransfers({
        fromBlock: "0x0",
        toAddress: address,
        excludeZeroValue: true,
        category: [AssetTransfersCategory.EXTERNAL],
        withMetadata: true
      });
    } catch (error) {
      console.error('Error fetching address activity:', error);
      return { transfers: [] };
    }
  }

  static async initializeContract(address: string, abi: any) {
    const validAddress = this.validateContractAddress(address);
    return new web3.eth.Contract(abi, validAddress);
  }

  async markAttendance(userId: number, status: string, location?: string): Promise<string> {
    try {
      const accounts = await web3.eth.getAccounts();
      const tx = await this.contract.methods.markAttendance(status, location)
        .send({ from: accounts[0], gas: '500000' });
      return tx.transactionHash;
    } catch (error) {
      console.error('Alchemy markAttendance error:', error);
      throw error;
    }
  }

  async requestLeave(
    startTime: number,
    endTime: number,
    leaveType: string,
    reason: string
  ): Promise<{ transactionHash: string }> {
    try {
      const accounts = await web3.eth.getAccounts();
      const tx = await this.contract.methods.requestLeave(startTime, endTime, leaveType, reason)
        .send({ from: accounts[0], gas: '500000' });
      return { transactionHash: tx.transactionHash };
    } catch (error) {
      console.error('Alchemy requestLeave error:', error);
      throw error;
    }
  }

  async getAttendanceRecord(userId: number, timestamp: number): Promise<BlockchainAttendanceRecord | null> {
    try {
      const accounts = await web3.eth.getAccounts();
      const result = await this.contract.methods.getAttendanceRecord(userId, timestamp).call();
      
      return {
        status: result.status,
        timestamp: Number(result.timestamp),
        location: result.location,
        verified: result.verified
      };
    } catch (error) {
      console.error('Error fetching attendance record:', error);
      return null;
    }
  }
}
