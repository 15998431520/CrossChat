// client/src/main.tsx
import { createRoot } from 'react-dom/client';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { WagmiProvider } from 'wagmi';
import { createWeb3Modal } from '@web3modal/wagmi/react'; // ✅ v5 核心 API
import { config } from './wagmi'; // 把 wagmi config 拆出去
import { App } from './App';

// Setup queryClient
const queryClient = new QueryClient();

// 创建 Web3Modal 实例（关键！）
createWeb3Modal({
  wagmiConfig: config,
  projectId: 'YOUR_PROJECT_ID', // 去 https://cloud.walletconnect.com/ 免费注册
  enableAnalytics: false, // 可选
});

createRoot(document.getElementById('root')!).render(
  <WagmiProvider config={config}>
    <QueryClientProvider client={queryClient}>
      <App />
    </QueryClientProvider>
  </WagmiProvider>
);