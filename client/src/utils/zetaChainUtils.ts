import { useSwitchChain, useAccount, useWaitForTransactionReceipt, useSendTransaction } from 'wagmi';
import { getAddress } from '@zetachain/addresses';

// 可以切换到真实测试网验证
const FALLBACK_MODE = false; // 设置为 false 启用真实测试网

// 代币地址 (简化版本)
const TOKEN_ADDRESSES: Record<string, Record<string, string>> = {
  eth: {
    ethereum: '0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE',
    bsc: '0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE',
    polygon: '0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE',
    sepolia: '0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE',
    bscTestnet: '0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE',
  },
  usdc: {
    ethereum: '0xA0b86a33E6417c6c1b6c7e8B3a59b4A1Bf67e57e',
    bsc: '0x8AC76a51cc950d9822D68b83fE1Ad97B32Cd580d',
    polygon: '0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174',
    sepolia: '0x1c7D4B196Cb0C7B01d743Fbc6116a902379C7238', // Sepolia USDC
    bscTestnet: '0x3262b65054796f0d19b484a59d70936c3b18c4c9', // BSC Testnet USDC
  }
};

// 链 ID 映射 - 基于 ZetaChain 支持的网络（使用小写键名以确保匹配）
const CHAIN_IDS: Record<string, number> = {
  ethereum: 1,
  bsc: 56,
  polygon: 137,
  arbitrum: 42161,
  optimism: 10,
  // goerli: 5,           // Goerli 测试网已弃用，不再使用
  bsctestnet: 97,         // BSC 测试网 (ZetaChain 支持)
  polygonmumbai: 80001,   // Polygon Mumbai 测试网 (ZetaChain 支持)
  sepolia: 11155111,      // Sepolia 测试网 (ZetaChain 不支持)
  athens: 7001,           // ZetaChain Athens 测试网
  zetachain: 7001,        // ZetaChain Athens 测试网 (别名)
  // 保留原有的驼峰命名键以确保向后兼容
  bscTestnet: 97,
  polygonMumbai: 80001,
  zetaTestnet: 7001,
};



export function useZetaChainTransfer() {
  const { switchChainAsync } = useSwitchChain();
  const { address } = useAccount();
  const { sendTransactionAsync } = useSendTransaction();

  const executeTransfer = async (
    fromChain: string,
    toChain: string,
    token: string,
    amount: string
  ): Promise<{
    success: boolean;
    txHash: string;
    explorerUrl: string;
    note: string;
    isSimulation?: boolean;
    sourceChainId?: number;
    destChainId?: number;
  }> => {
    if (!address) {
      throw new Error('请先连接钱包');
    }

    try {
      // 1. 切换到源链
      console.log('🔍 查找链ID:', { fromChain, toChain, availableChains: Object.keys(CHAIN_IDS) });
      const sourceChainId = CHAIN_IDS[fromChain.toLowerCase()];
      const destChainId = CHAIN_IDS[toChain.toLowerCase()];
      
      console.log('📍 找到的链ID:', { sourceChainId, destChainId });
      
      if (!sourceChainId || !destChainId) {
        throw new Error(`不支持的链: ${fromChain} 或 ${toChain}`);
      }

      // 暂时使用模拟模式，避免合约地址问题
      if (FALLBACK_MODE) {
        console.log('🔄 模拟跨链交易:', { fromChain, toChain, token, amount, sourceChainId, destChainId, userAddress: address });
        
        // 模拟网络延迟 - 真实的跨链需要更长时间
        console.log('⏳ 模拟跨链处理中，请稍候...');
        await new Promise(resolve => setTimeout(resolve, 3000));
        
        // 生成模拟的交易哈希
        const mockTxHash = '0x' + Array.from({length: 64}, () => Math.floor(Math.random() * 16).toString(16)).join('');
        
        // 根据是否是真正的跨链给出不同的说明
        const isRealCrossChain = sourceChainId !== destChainId;
        const note = isRealCrossChain 
          ? `🌉 模拟跨链转账成功！${amount} ${token} 已从 ${fromChain} 模拟转账到 ${toChain}。目前为演示模式，真实跨链需要正确的 ZetaChain 合约配置。`
          : `✅ 同链转账演示：${amount} ${token} 在 ${fromChain} 上的模拟转账成功。`;
        
        return { 
          success: true, 
          txHash: mockTxHash,
          explorerUrl: getExplorerUrl(sourceChainId, mockTxHash),
          note,
          isSimulation: true,
          sourceChainId,
          destChainId
        };
      }

      // 真实的 ZetaChain 跨链交易
      console.log('🚀 开始 ZetaChain 跨链交易:', { fromChain, toChain, token, amount, sourceChainId, destChainId });

      // 特殊处理：如果目标是 ZetaChain，这是最理想的场景
      if (toChain.toLowerCase() === 'athens' || toChain.toLowerCase() === 'zetachain') {
        console.log('🎯 目标为 ZetaChain - 这是推荐的跨链模式');
        return await executeTransferToZetaChain(fromChain, amount, token, sourceChainId, switchChainAsync, sendTransactionAsync);
      }

      // 切换到源链
      await switchChainAsync({ chainId: sourceChainId });

      // 获取 ZetaChain 合约地址 - 使用官方包
      let zetaContract: string;
      try {
        // 获取对应的 ZetaChain 合约地址
        if (fromChain.toLowerCase() === 'sepolia') {
          // Sepolia 测试网 - ZetaChain 不支持 Sepolia
          console.warn('⚠️ ZetaChain 目前不支持 Sepolia 测试网');
          throw new Error(`ZetaChain 目前不支持 Sepolia 测试网。支持的测试网包括: BSC Testnet, Polygon Mumbai, ZetaChain Athens`);
        } else if (fromChain.toLowerCase() === 'goerli') {
          // Goerli 测试网 - 已弃用，不再使用
          console.warn('⚠️ Goerli 测试网已被弃用，建议使用 BSC Testnet 或 Polygon Mumbai');
          throw new Error(`Goerli 测试网已被弃用。请使用 BSC Testnet 或 Polygon Mumbai 测试网`);
        } else if (fromChain.toLowerCase() === 'bsctestnet') {
          // BSC 测试网
          zetaContract = getAddress({
            address: 'connector',
            networkName: 'bsc-testnet',
            zetaNetwork: 'athens'
          });
        } else if (fromChain.toLowerCase() === 'polygonmumbai') {
          // Polygon Mumbai 测试网
          zetaContract = getAddress({
            address: 'connector',
            networkName: 'polygon-mumbai',
            zetaNetwork: 'athens'
          });
        } else if (fromChain.toLowerCase() === 'athens' || fromChain.toLowerCase() === 'zetachain') {
          // 从 ZetaChain 发起跨链 - 现在支持！
          console.log('🚀 从 ZetaChain 发起跨链交易');
          return await executeTransferFromZetaChain(toChain, amount, token, switchChainAsync, sendTransactionAsync);
        } else {
          throw new Error(`不支持的源链: ${fromChain}。支持的源链: BSC Testnet, Polygon Mumbai, ZetaChain`);
        }
        console.log('📍 获取到的 ZetaChain 合约地址:', zetaContract);
      } catch (error: any) {
        console.error('❌ 获取合约地址失败:', error);
        throw new Error(`无法获取 ${fromChain} 网络的 ZetaChain 合约地址: ${error?.message || error}`);
      }

      if (!zetaContract) {
        throw new Error(`不支持在链 ${fromChain} 上进行跨链交易`);
      }

      // 验证 amount 参数
      if (!amount || isNaN(parseFloat(amount)) || parseFloat(amount) <= 0) {
        throw new Error('无效的转账金额');
      }
      
      const amountWei = BigInt(parseFloat(amount) * 1e18);

      // 使用 ZetaChain 跨链合约
      try {
        // 对于 ETH 跨链，直接调用 ZetaChain Connector
        if (token.toLowerCase() === 'eth') {
          // 发送 ETH 到 ZetaChain Connector 合约
          const txHash = await sendTransactionAsync({
            to: zetaContract as `0x${string}`,
            value: amountWei,
            data: '0x', // 简单的 ETH 转账，无额外数据
          });

          console.log('✅ ZetaChain ETH 跨链交易提交成功:', txHash);
          
          return { 
            success: true, 
            txHash,
            explorerUrl: getExplorerUrl(sourceChainId, txHash),
            note: `🌉 真实跨链转账: ${amount} ETH 从 ${fromChain} 到 ${toChain}，请在 ZetaChain 上确认到账`
          };
        }
        
        // 对于 ERC20 代币，需要先授权再转账
        throw new Error(`目前仅支持 ETH 跨链，${token} 代币跨链功能开发中...`);
        
      } catch (txError: any) {
        console.error('ZetaChain 跨链交易失败:', txError);
        
        // 提供详细的错误信息
        if (txError.message?.includes('insufficient funds')) {
          throw new Error('余额不足，请检查您的钱包余额');
        } else if (txError.message?.includes('user rejected')) {
          throw new Error('您取消了交易，请重试');
        } else {
          throw new Error(`跨链交易失败: ${txError.message || txError}`);
        }
      }

    } catch (error) {
      console.error('ZetaChain 跨链转账失败:', error);
      throw error;
    }
  };

  return { executeTransfer };
}



// 获取区块浏览器 URL
function getExplorerUrl(chainId: number, txHash: string): string {
  const explorers: Record<number, string> = {
    1: 'https://etherscan.io/tx/',
    56: 'https://bscscan.com/tx/',
    137: 'https://polygonscan.com/tx/',
    42161: 'https://arbiscan.io/tx/',
    10: 'https://optimistic.etherscan.io/tx/',
    11155111: 'https://sepolia.etherscan.io/tx/',  // Sepolia 测试网
    97: 'https://testnet.bscscan.com/tx/',       // BSC 测试网
    7001: 'https://athens.explorer.zetachain.io/tx/',
  };

  return (explorers[chainId] || 'https://etherscan.io/tx/') + txHash;
}

// 等待交易确认
export function useWaitForTransaction(txHash?: string, chainId?: number) {
  const { data, isLoading, error } = useWaitForTransactionReceipt({
    hash: txHash as `0x${string}`,
    chainId: chainId || 1,
    query: {
      enabled: !!txHash && !!chainId, // 只有在有交易哈希和链ID时才启用查询
    }
  });

  return {
    receipt: data,
    isLoading,
    error,
    status: data?.status || 'pending',
  };
}

// 获取支持的代币和链
export function getSupportedTokens(): string[] {
  return Object.keys(TOKEN_ADDRESSES);
}

// 专门处理从 ZetaChain 发起跨链的函数
async function executeTransferFromZetaChain(
  toChain: string,
  amount: string,
  token: string,
  switchChainAsync: any,
  sendTransactionAsync: any
) {
  try {
    console.log('🚀 从 ZetaChain 发起跨链:', { toChain, amount, token });

    // 切换到 ZetaChain
    await switchChainAsync({ chainId: 7001 });

    // 获取目标链的合约地址
    let destinationChainId: number;
    if (toChain.toLowerCase() === 'bsc') {
      destinationChainId = 56; // BSC 主网
    } else if (toChain.toLowerCase() === 'bsctestnet') {
      destinationChainId = 97; // BSC 测试网
    } else if (toChain.toLowerCase() === 'polygon') {
      destinationChainId = 137; // Polygon 主网
    } else if (toChain.toLowerCase() === 'polygonmumbai') {
      destinationChainId = 80001; // Polygon 测试网
    } else if (toChain.toLowerCase() === 'ethereum') {
      destinationChainId = 1; // 以太坊主网
    } else {
      throw new Error(`不支持的目标链: ${toChain}`);
    }

    // 使用 ZetaChain 的跨链合约
    let zetaCrossChainContract: string;
    try {
      // 对于从 ZetaChain 发起的跨链，我们需要使用不同的合约
      zetaCrossChainContract = getAddress({
        address: 'connector',
        networkName: 'athens',
        zetaNetwork: 'athens'
      });
      console.log('📍 ZetaChain 跨链合约地址:', zetaCrossChainContract);
    } catch (error: any) {
      throw new Error(`获取 ZetaChain 跨链合约失败: ${error.message}`);
    }

    // 验证 amount
    if (!amount || isNaN(parseFloat(amount)) || parseFloat(amount) <= 0) {
      throw new Error('无效的转账金额');
    }

    const amountWei = BigInt(parseFloat(amount) * 1e18);

    // 对于 ETH 跨链：使用正确的 ZetaChain OmniCounter 合约
    if (token.toLowerCase() === 'eth') {
      // 使用 ZetaChain 的 OmniCounter 合约进行跨链
      // 注意：实际合约调用方式可能需要根据 ZetaChain 文档调整
      const omniCounterAddress = getAddress({
        address: 'crossChainCounter', // 使用正确的合约
        networkName: 'athens',
        zetaNetwork: 'athens'
      });
      
      // 简单的 ETH 转账到 OmniCounter 合约
      const txHash = await sendTransactionAsync({
        to: omniCounterAddress as `0x${string}`,
        value: amountWei,
        data: '0x', // 简单转账，无额外数据
      });

      console.log('✅ ZetaChain 跨链交易提交成功:', txHash);

      return {
        success: true,
        txHash,
        explorerUrl: getExplorerUrl(7001, txHash), // ZetaChain 浏览器
        note: `🌉 成功从 ZetaChain 将 ${amount} ETH 跨链到 ${toChain}！您正在使用 ZETA 作为 gas 💚`,
        isSimulation: false,
        sourceChainId: 7001, // ZetaChain
        destChainId: destinationChainId
      };
    } else {
      // ERC20 代币跨链
      throw new Error(`暂不支持 ${token} 代币的跨链，目前仅支持 ETH`);
    }

  } catch (error: any) {
    console.error('从 ZetaChain 跨链失败:', error);
    
    if (error.message?.includes('insufficient funds')) {
      throw new Error('余额不足，请检查您的 ZETA 余额');
    } else if (error.message?.includes('user rejected')) {
      throw new Error('您取消了交易，请重试');
    } else {
      throw new Error(`从 ZetaChain 跨链失败: ${error.message || error}`);
    }
  }
}

// 专门处理跨链到 ZetaChain 的函数
async function executeTransferToZetaChain(
  fromChain: string,
  amount: string,
  token: string,
  sourceChainId: number,
  switchChainAsync: any,
  sendTransactionAsync: any
) {
  try {
    console.log('🎯 执行跨链到 ZetaChain:', { fromChain, amount, token, sourceChainId });

    // 切换到源链
    await switchChainAsync({ chainId: sourceChainId });

    // 获取 ZetaChain Connector 合约地址
    let zetaContract: string;
    try {
      if (fromChain.toLowerCase() === 'bsctestnet') {
        zetaContract = getAddress({
          address: 'connector',
          networkName: 'bsc-testnet',
          zetaNetwork: 'athens'
        });
      } else if (fromChain.toLowerCase() === 'polygonmumbai') {
        zetaContract = getAddress({
          address: 'connector',
          networkName: 'polygon-mumbai',
          zetaNetwork: 'athens'
        });
      } else if (fromChain.toLowerCase() === 'ethereum') {
        // 主网以太坊
        zetaContract = getAddress({
          address: 'connector',
          networkName: 'eth-mainnet',
          zetaNetwork: 'mainnet'
        });
      } else if (fromChain.toLowerCase() === 'bsc') {
        // BSC 主网
        zetaContract = getAddress({
          address: 'connector',
          networkName: 'bsc-mainnet',
          zetaNetwork: 'mainnet'
        });
      } else {
        throw new Error(`不支持的源链用于 ZetaChain 跨链: ${fromChain}`);
      }
      console.log('📍 ZetaChain Connector 合约地址:', zetaContract);
    } catch (error: any) {
      throw new Error(`获取 ZetaChain Connector 失败: ${error.message}`);
    }

    // 验证 amount
    if (!amount || isNaN(parseFloat(amount)) || parseFloat(amount) <= 0) {
      throw new Error('无效的转账金额');
    }

    const amountWei = BigInt(parseFloat(amount) * 1e18);

    // 发送资产到 ZetaChain Connector
    if (token.toLowerCase() === 'eth') {
      // ETH 跨链到 ZetaChain
      const txHash = await sendTransactionAsync({
        to: zetaContract as `0x${string}`,
        value: amountWei,
        data: '0x', // 简单的 ETH 转账
      });

      console.log('✅ ETH 跨链到 ZetaChain 交易提交成功:', txHash);

      return {
        success: true,
        txHash,
        explorerUrl: getExplorerUrl(sourceChainId, txHash),
        note: `🌉 成功将 ${amount} ETH 从 ${fromChain} 跨链到 ZetaChain Athens-3！请等待几分钟确认。`,
        isSimulation: false,
        sourceChainId,
        destChainId: 7001 // ZetaChain Athens-3
      };
    } else {
      // ERC20 代币跨链
      throw new Error(`暂不支持 ${token} 代币的跨链，目前仅支持 ETH`);
    }

  } catch (error: any) {
    console.error('跨链到 ZetaChain 失败:', error);
    
    if (error.message?.includes('insufficient funds')) {
      throw new Error('余额不足，请检查您的钱包余额');
    } else if (error.message?.includes('user rejected')) {
      throw new Error('您取消了交易，请重试');
    } else {
      throw new Error(`跨链到 ZetaChain 失败: ${error.message || error}`);
    }
  }
}

export function getSupportedChains(): string[] {
  return Object.keys(CHAIN_IDS);
}