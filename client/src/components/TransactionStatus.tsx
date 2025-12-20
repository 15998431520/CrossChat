import React from 'react';

interface TransactionStatusProps {
  currentTx: { hash: string; chainId: number } | null;
  isTxLoading: boolean;
  receipt: any;
  messages: Array<{ role: 'user' | 'ai'; content: string; data?: any }>;
  onAddMessage: (message: { role: 'ai'; content: string; data?: any }) => void;
  onClearCurrentTx: () => void;
}

const txHashStyle = {
  background: '#fff',
  color: '#000',
  padding: '4px 8px',
  borderRadius: '4px',
  fontSize: '12px',
  cursor: 'pointer',
  border: '1px solid #ddd',
  maxWidth: '300px',
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  whiteSpace: 'nowrap',
  display: 'inline-block',
  fontFamily: 'monospace'
};

const copyToClipboard = (text: string) => {
  navigator.clipboard.writeText(text);
  const toast = document.createElement('div');
  toast.textContent = '✅ 已复制到剪切板';
  toast.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    background: #4CAF50;
    color: white;
    padding: 10px 16px;
    border-radius: 6px;
    font-size: 14px;
    z-index: 1000;
    animation: slideIn 0.3s ease;
  `;
  document.body.appendChild(toast);
  setTimeout(() => document.body.removeChild(toast), 2000);
};

export function TransactionStatus({ 
  currentTx, 
  isTxLoading, 
  receipt, 
  onAddMessage, 
  onClearCurrentTx 
}: TransactionStatusProps) {
  React.useEffect(() => {
    if (currentTx && !isTxLoading && receipt) {
      const statusMsg = receipt.status === 'success' ? (
        <div style={{ padding: '12px', background: '#d4edda', borderRadius: '12px', borderLeft: '4px solid #28a745' }}>
          <div style={{ display: 'flex', alignItems: 'center', marginBottom: '8px' }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="#28a745">
              <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z"/>
            </svg>
            <span style={{ marginLeft: '6px', fontWeight: 'bold' }}>✅ 跨链交易成功</span>
          </div>
          <div style={{ marginBottom: '8px', color: '#155724', display: 'flex', alignItems: 'center' }}>
            <strong>交易哈希:</strong>{' '}
            <code 
              style={txHashStyle}
              onClick={() => copyToClipboard(currentTx.hash)}
              title="点击复制完整哈希"
            >
              {currentTx.hash}
            </code>
          </div>
          <div style={{ marginBottom: '8px', color: '#155724' }}>
            <strong>Gas Used:</strong> {receipt.gasUsed.toString()}
          </div>
          <div style={{ color: '#666' }}>
            资金已开始跨链转移，请等待目标链确认
          </div>
        </div>
      ) : (
        <div style={{ padding: '12px', background: '#f8d7da', borderRadius: '12px', borderLeft: '4px solid #dc3545' }}>
          <div style={{ display: 'flex', alignItems: 'center', marginBottom: '8px' }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="#dc3545">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/>
            </svg>
            <span style={{ marginLeft: '6px', fontWeight: 'bold' }}>❌ 跨链交易失败</span>
          </div>
          <div style={{ color: '#721c24', display: 'flex', alignItems: 'center' }}>
            <strong>交易哈希:</strong>{' '}
            <code 
              style={txHashStyle}
              onClick={() => copyToClipboard(currentTx.hash)}
              title="点击复制完整哈希"
            >
              {currentTx.hash}
            </code>
          </div>
        </div>
      );

      onAddMessage({ role: 'ai', content: '', data: statusMsg });
      onClearCurrentTx();
    }
  }, [currentTx, isTxLoading, receipt]);

  return null;
}

export function createUnsupportedNetworkMessage(parsedData: any) {
  return (
    <div style={{ padding: '12px', background: '#f8d7da', borderRadius: '12px', borderLeft: '4px solid #dc3545' }}>
      <div style={{ display: 'flex', alignItems: 'center', marginBottom: '8px' }}>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="#dc3545">
          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/>
        </svg>
        <span style={{ marginLeft: '6px', fontWeight: 'bold' }}>⚠️ 网络不支持</span>
      </div>
      <div style={{ marginBottom: '8px', fontSize: '14px', color: '#333' }}>
        <strong>解析指令：</strong>
        <pre style={{ margin: '4px 0', fontSize: '12px', background: '#fff', padding: '4px', borderRadius: '4px' }}>
          {JSON.stringify(parsedData, null, 2)}
        </pre>
      </div>
      <div style={{ fontSize: '12px', color: '#721c24' }}>
        🚫 <strong>检测到不支持的网络</strong><br/>
        💡 <strong>当前支持的源网络：</strong><br/>
        • ZetaChain Athens-3 ⭐ (使用 ZETA 作为 gas)<br/>
        • BSC Testnet<br/>
        • Polygon Mumbai<br/>
        • Ethereum 主网<br/>
        • BSC 主网<br/>
        <br/>
        🎯 <strong>支持的目标网络：</strong><br/>
        • BSC Testnet, Polygon Mumbai<br/>
        • Ethereum, Polygon, BSC 主网<br/>
        <br/>
        ⚠️ <strong>注意：</strong> Goerli 已被弃用，Sepolia 暂不支持<br/>
        <br/>
        📝 <strong>黑客松推荐指令：</strong><br/>
        • "转 0.001 ETH 从 ZetaChain 到 BSC Testnet" 💚<br/>
        • "转 0.001 ETH 从 ZetaChain 到 Polygon Mumbai"<br/>
        • "转 0.001 ETH 从 BSC Testnet 到 ZetaChain"
      </div>
    </div>
  );
}

export function createSameChainWarningMessage(parsedData: any) {
  return (
    <div style={{ padding: '12px', background: '#fff3cd', borderRadius: '12px', borderLeft: '4px solid #ffc107' }}>
      <div style={{ display: 'flex', alignItems: 'center', marginBottom: '8px' }}>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="#ffc107">
          <path d="M1 21h22L12 2 1 21zm12-3h-2v-2h2v2zm0-4h-2v-4h2v4z"/>
        </svg>
        <span style={{ marginLeft: '6px', fontWeight: 'bold' }}>⚠️ 检测到同链转账（演示模式）</span>
      </div>
      <div style={{ marginBottom: '8px', fontSize: '14px', color: '#333' }}>
        <strong>解析指令：</strong>
        <pre style={{ margin: '4px 0', fontSize: '12px', background: '#fff', padding: '4px', borderRadius: '4px' }}>
          {JSON.stringify(parsedData, null, 2)}
        </pre>
      </div>
      <div style={{ fontSize: '12px', color: '#856404' }}>
        💡 <strong>建议：</strong>尝试真正的跨链转账，例如：<br/>
        • "转 0.01 ETH 从 BSC Testnet 到 Polygon Mumbai" <br/>
        • "转 0.01 ETH 从 Ethereum 到 Polygon" <br/>
        <br/>
        当前将执行同链转账作为 ZetaChain 跨链功能的演示
      </div>
    </div>
  );
}

export function createCrossChainMessage(parsedData: any) {
  return (
    <div style={{ padding: '12px', background: '#d4edda', borderRadius: '12px', borderLeft: '4px solid #28a745' }}>
      <div style={{ display: 'flex', alignItems: 'center', marginBottom: '8px' }}>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="#28a745">
          <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z"/>
        </svg>
        <span style={{ marginLeft: '6px', fontWeight: 'bold' }}>🌉 真实跨链转账</span>
      </div>
      <div style={{ marginBottom: '8px', fontSize: '14px', color: '#333' }}>
        <strong>解析指令：</strong>
        <pre style={{ margin: '4px 0', fontSize: '12px', background: '#fff', padding: '4px', borderRadius: '4px' }}>
          {JSON.stringify(parsedData, null, 2)}
        </pre>
      </div>
      <div style={{ fontSize: '12px', color: '#155724' }}>
        ✅ 将通过 ZetaChain 执行真正的跨链转账
      </div>
    </div>
  );
}