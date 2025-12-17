// client/src/App.tsx
import { useAccount, useDisconnect } from 'wagmi';
import { useWeb3Modal } from '@web3modal/wagmi/react';
import { ChatBox } from './components/ChatBox'; // ✅ 引入新组件

export function App() {
  const { address, chain, isConnected } = useAccount();
  const { disconnect } = useDisconnect();
  const { open } = useWeb3Modal();

  return (
    <div style={{ padding: '20px', maxWidth: '600px', margin: '0 auto', fontFamily: 'sans-serif' }}>
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h1>💬 CrossChat</h1>
        {isConnected ? (
          <div>
            <span style={{ background: '#f0f0f0', padding: '4px 8px', borderRadius: '6px', fontSize: '14px' }}>
              {address?.slice(0, 6)}...{address?.slice(-4)} ({chain?.name})
            </span>
            <button
              onClick={() => disconnect()}
              style={{
                marginLeft: '10px',
                padding: '4px 10px',
                fontSize: '12px',
                background: '#ff4d4d',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer'
              }}
            >
              Disconnect
            </button>
          </div>
        ) : (
          <button
            onClick={() => open()}
            style={{
              padding: '6px 12px',
              background: '#7548FF',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer',
              fontSize: '14px'
            }}
          >
            Connect Wallet
          </button>
        )}
      </header>

      {/* ✅ 加入聊天组件 */}
      <ChatBox />
    </div>
  );
}