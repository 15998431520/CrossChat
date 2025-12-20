export interface ParsedTransferAction {
  action: 'transfer';
  amount: string;
  token: string;
  from: string;
  to: string;
  hasUnsupportedNetwork?: boolean;
}

export class MessageParser {
  private static networkMapping: Record<string, string> = {
    // 单词网络名称
    'sepolia': 'sepolia',
    'bsc': 'bsc',
    'polygon': 'polygon',
    'ethereum': 'ethereum',
    'eth': 'ethereum',
    // 多词网络名称（处理大小写和空格）
    'bsc testnet': 'bsctestnet',
    'bsctestnet': 'bsctestnet',
    'polygon mumbai': 'polygonmumbai',
    'polygonmumbai': 'polygonmumbai',
    'zetachain': 'zetachain',
    'zetachain athens': 'athens',
    'zetachain athens-3': 'athens',
    'athens': 'athens',
    'athens-3': 'athens',
    'zeta': 'zetachain',
    'zeta testnet': 'athens',
    'klaytn baobab': 'klaytnbaobab',
    'klaytnbaobab': 'klaytnbaobab',
  };

  private static unsupportedNetworks = ['sepolia', 'goerli'];

  static parseTransferMessage(message: string): ParsedTransferAction | null {
    console.log('🔍 解析消息:', message);
    
    try {
      // 改进的正则表达式，支持包含空格的网络名称（如 "BSC Testnet"）
      const regex = /转\s+([\d.]+)\s+([A-Z]+)\s+从\s+(.+?)\s+到\s+(.+)$/i;
      const match = message.match(regex);
      
      console.log('📝 Regex 匹配结果:', match);
      
      if (!match || match.length < 5) {
        console.log('❌ 匹配失败或格式不正确');
        return null;
      }
      
      const fromNetwork = this.networkMapping[match[3].toLowerCase()];
      const toNetwork = this.networkMapping[match[4].toLowerCase()];

      if (!fromNetwork || !toNetwork) {
        console.log('❌ 不支持的网络名称:', { from: match[3], to: match[4] });
        return null;
      }

      // 检查是否使用了不支持的网络
      const hasUnsupportedNetwork = this.unsupportedNetworks.includes(fromNetwork) || 
                                    this.unsupportedNetworks.includes(toNetwork);
      
      if (hasUnsupportedNetwork) {
        console.warn('⚠️ 检测到不支持的网络:', { fromNetwork, toNetwork });
        const result: ParsedTransferAction = {
          action: 'transfer',
          amount: match[1],
          token: match[2],
          from: fromNetwork,
          to: toNetwork,
          hasUnsupportedNetwork: true
        };
        return result;
      }

      const result: ParsedTransferAction = {
        action: 'transfer',
        amount: match[1],
        token: match[2],
        from: fromNetwork,
        to: toNetwork
      };
      
      console.log('✅ 解析成功:', result);
      return result;
    } catch (error) {
      console.error('🚨 解析过程中出错:', error);
      return null;
    }
  }

  static getChainId(chainName: string): number {
    const chainIds: Record<string, number> = {
      ethereum: 1,
      bsc: 56,
      polygon: 137,
      arbitrum: 42161,
      optimism: 10,
      sepolia: 11155111,
      bscTestnet: 97,
    };
    return chainIds[chainName.toLowerCase()] || 1;
  }
}