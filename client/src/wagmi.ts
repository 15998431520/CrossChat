// client/src/wagmi.ts
import { http, createConfig } from 'wagmi';
import { mainnet, bsc, polygon, arbitrum, optimism, sepolia } from 'wagmi/chains';
import { injected } from 'wagmi/connectors';

// ZetaChain Athens-3 Testnet 配置 (黑鑋松專用)
const zetaTestnet = {
  id: 7001,
  name: 'ZetaChain Athens-3 Testnet',
  nativeCurrency: { name: 'ZETA', symbol: 'ZETA', decimals: 18 },
  rpcUrls: { 
    default: { 
      http: ['https://zetachain-athens-evm.blockpi.network/v1/rpc/public'],
      webSocket: ['wss://zetachain-athens-evm.blockpi.network/v1/ws/public']
    } 
  },
  blockExplorers: { 
    default: { 
      name: 'ZetaChain Athens-3 Explorer', 
      url: 'https://zetachain-athens-3.blockscout.com' 
    } 
  },
  testnet: true,
};

// BSC 测试网配置
const bscTestnet = {
  id: 97,
  name: 'BNB Smart Chain Testnet',
  nativeCurrency: { name: 'BNB', symbol: 'tBNB', decimals: 18 },
  rpcUrls: { 
    default: { 
      http: [
        'https://data-seed-prebsc-1-s1.binance.org:8545',
        'https://data-seed-prebsc-2-s1.binance.org:8545',
        'https://rpc.ankr.com/bsc_testnet_chapel'
      ] 
    } 
  },
  blockExplorers: { default: { name: 'BscScan', url: 'https://testnet.bscscan.com' } },
  testnet: true,
};

// Polygon Mumbai 测试网配置（使用稳定的官方 RPC）
const polygonMumbai = {
  id: 80001,
  name: 'Polygon Mumbai',
  nativeCurrency: { name: 'MATIC', symbol: 'MATIC', decimals: 18 },
  rpcUrls: { 
    default: { 
      http: [
        'https://rpc-mumbai.maticvigil.com',
        'https://matic-mumbai.chainstacklabs.com',
        'https://rpc.ankr.com/polygon_mumbai'
      ] 
    } 
  },
  blockExplorers: { 
    default: { 
      name: 'PolygonScan', 
      url: 'https://mumbai.polygonscan.com' 
    } 
  },
  testnet: true,
};

export const config = createConfig({
  chains: [mainnet, bsc, polygon, arbitrum, optimism, sepolia, polygonMumbai, bscTestnet, zetaTestnet],
  connectors: [injected()], // 仅 MetaMask
  transports: {
    [mainnet.id]: http(),
    [bsc.id]: http(),
    [polygon.id]: http(),
    [arbitrum.id]: http(),
    [optimism.id]: http(),
    [sepolia.id]: http(),
    [polygonMumbai.id]: http(),
    [bscTestnet.id]: http(),
    [zetaTestnet.id]: http(),
  },
});