import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3000/api';

export interface ParsedTransferAction {
  action: 'transfer';
  token: string;
  amount: string;
  fromChain: string;
  toChain: string;
  // 为了兼容现有的代码结构，同时提供from/to字段
  from?: string;
  to?: string;
  hasUnsupportedNetwork?: boolean;
}

export class ApiService {
  static async parseMessage(message: string): Promise<ParsedTransferAction | null> {
    try {
      const response = await axios.post(`${API_BASE_URL}/parse`, {
        message
      });

      const data = response.data;
      
      // 确保返回的数据有正确的字段结构
      if (data && data.action === 'transfer') {
        return {
          action: data.action,
          amount: data.amount,
          token: data.token,
          fromChain: data.fromChain,
          toChain: data.toChain,
          from: data.fromChain, // 兼容字段
          to: data.toChain,     // 兼容字段
          hasUnsupportedNetwork: data.hasUnsupportedNetwork
        };
      }
      
      return data;
    } catch (error: any) {
      console.error('AI解析失败:', error.response?.data || error.message);
      throw new Error(error.response?.data?.error || 'AI解析失败，请稍后再试');
    }
  }

  static async executeTransfer(parsedData: ParsedTransferAction): Promise<any> {
    try {
      const response = await axios.post(`${API_BASE_URL}/execute`, parsedData);
      return response.data;
    } catch (error: any) {
      console.error('执行转账失败:', error.response?.data || error.message);
      throw new Error(error.response?.data?.error || '执行转账失败');
    }
  }
}