// client/src/components/ChatBox.tsx
import { useState, useEffect, useRef } from 'react';
import { useAccount } from 'wagmi';
import { useZetaChainTransfer, useWaitForTransaction } from '../utils/zetaChainUtils';
import { createTransactionMonitor } from '../utils/zetaChainHelper';

// 定义解析结果接口
interface ParsedTransferAction {
  action: 'transfer';
  amount: string;
  token: string;
  from: string;
  to: string;
  hasUnsupportedNetwork?: boolean;
}

export function ChatBox() {
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<{ role: 'user' | 'ai'; content: string; data?: any }[]>([
    {
      role: 'ai',
      content: '🏆 欢迎参加 ZetaChain 黑客松！\n\n我是 CrossChat 跨链转账助手，专为 ZetaChain Athens-3 测试网优化。\n\n🎯 💚 最佳使用示例（使用 ZETA 作为 gas）：\n• "转 0.001 ETH 从 ZetaChain 到 BSC Testnet" ⭐ 推荐\n• "转 0.001 ETH 从 ZetaChain 到 Polygon Mumbai"\n• "转 0.001 ETH 从 ZetaChain 到 BSC"\n\n💰 您的优势：\n• 只需要 ZETA 测试币作为 gas 💚\n• 无需其他网络的测试币\n• 展示 ZetaChain 的跨链能力\n\n⚙️ 网络配置：\n• RPC: ZetaChain Athens-3 (BlockPi)\n• 链ID: 7001\n• 浏览器: BlockScout\n\n🚀 让我们展示从 ZetaChain 发起的跨链能力！',
    },
  ]);
  const [pendingAction, setPendingAction] = useState<any>(null);
  const [isExecuting, setIsExecuting] = useState(false);
  const [currentTx, setCurrentTx] = useState<{ hash: string; chainId: number } | null>(null);
  
  // 添加聊天容器的 ref 用于自动滚动
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  // 自动滚动到最新消息
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // 当消息变化时自动滚动到底部
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const { isConnected } = useAccount();
  const { executeTransfer } = useZetaChainTransfer();
  const { receipt, isLoading: isTxLoading } = useWaitForTransaction(
    currentTx?.hash as `0x${string}`,
    currentTx?.chainId || 1
  );

  // 监听交易状态变化
  useEffect(() => {
    if (currentTx && !isTxLoading && receipt) {
      const statusMsg = receipt.status === 'success' ? (
        <div style={{ padding: '12px', background: '#d4edda', borderRadius: '12px', borderLeft: '4px solid #28a745' }}>
          <div style={{ display: 'flex', alignItems: 'center', marginBottom: '8px' }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="#28a745">
              <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z"/>
            </svg>
            <span style={{ marginLeft: '6px', fontWeight: 'bold' }}>✅ 跨链交易成功</span>
          </div>
          <div style={{ marginBottom: '8px', color: '#155724' }}>
            <strong>交易哈希:</strong>{' '}
            <code 
              style={{ 
                fontSize: '11px', 
                background: '#f0f0f0', 
                padding: '2px 6px', 
                borderRadius: '4px',
                cursor: 'pointer',
                fontFamily: 'monospace',
                maxWidth: '200px',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
                display: 'inline-block'
              }}
              onClick={() => {
                navigator.clipboard.writeText(currentTx.hash);
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
              }}
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
          <div style={{ color: '#721c24' }}>
            <strong>交易哈希:</strong>{' '}
            <code 
              style={{ 
                fontSize: '11px', 
                background: '#f8d7da', 
                padding: '2px 6px', 
                borderRadius: '4px',
                cursor: 'pointer',
                fontFamily: 'monospace',
                maxWidth: '200px',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
                display: 'inline-block'
              }}
              onClick={() => {
                navigator.clipboard.writeText(currentTx.hash);
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
              }}
              title="点击复制完整哈希"
            >
              {currentTx.hash}
            </code>
          </div>
        </div>
      );

      setMessages(prev => [...prev, { role: 'ai', content: '', data: statusMsg }]);
      setCurrentTx(null);
    }
  }, [currentTx, isTxLoading, receipt]);

  const handleSend = async () => {
    if (!input.trim() || !isConnected) return;

    const userMessage = input;
    setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
    setInput('');
    setPendingAction(null);

    try {
      // 简单的本地解析逻辑
      const parsedData = parseTransferMessage(userMessage);

      if (parsedData && parsedData.action === 'transfer') {
        // 检查是否使用了不支持的网络（如 Sepolia）
        if (parsedData.hasUnsupportedNetwork) {
          const parseMsg = (
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
          setMessages(prev => [...prev, { role: 'ai', content: '', data: parseMsg }]);
          return;
        }

        // 检查是否为同链转账（演示模式）
        const isSameChain = parsedData.from.toLowerCase() === parsedData.to.toLowerCase();
        
        let parseMsg;
        if (isSameChain) {
          // 同链转账 - 提示这是演示模式，建议真实跨链
          parseMsg = (
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
        } else {
          // 真正的跨链转账
          parseMsg = (
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

        setMessages(prev => [...prev, { role: 'ai', content: '', data: parseMsg }]);
        setPendingAction(parsedData);
      } else {
        setMessages(prev => [
          ...prev,
          { role: 'ai', content: '❌ 无法解析指令，请使用格式：转 [数量] [代币] 从 [源链] 到 [目标链]' },
        ]);
      }
    } catch (error) {
      setMessages(prev => [
        ...prev,
        { role: 'ai', content: '❌ 解析失败，请检查指令格式' },
      ]);
    }
  };

  // 简单的消息解析函数
  function parseTransferMessage(message: string): ParsedTransferAction | null {
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
      
      // 网络名称映射 - 将用户友好的名称转换为 ZetaChain 支持的名称
      const networkMapping: Record<string, string> = {
        // 单词网络名称
        'sepolia': 'sepolia',
        // 'goerli': 'goerli', // Goerli 已弃用，移除
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

      const fromNetwork = networkMapping[match[3].toLowerCase()];
      const toNetwork = networkMapping[match[4].toLowerCase()];

      if (!fromNetwork || !toNetwork) {
        console.log('❌ 不支持的网络名称:', { from: match[3], to: match[4] });
        return null;
      }

      // 检查是否使用了不支持的网络
      const unsupportedNetworks = ['sepolia', 'goerli']; // Goerli 已弃用，Sepolia 不被支持
      const hasUnsupportedNetwork = unsupportedNetworks.includes(fromNetwork) || unsupportedNetworks.includes(toNetwork);
      
      if (hasUnsupportedNetwork) {
        console.warn('⚠️ 检测到不支持的网络:', { fromNetwork, toNetwork });
        // 返回特殊标记，用于显示提示信息
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

  const handleExecute = async () => {
    if (!pendingAction || !isConnected) return;

    setIsExecuting(true);
    
    try {
      const { from, to, token, amount } = pendingAction;
      
      console.log('🔄 准备执行交易:', { from, to, token, amount });
      
      // 执行真实的跨链转账
      const result = await executeTransfer(from, to, token, amount);
      
      if (result.success) {
        // 检查是否为模拟模式
        if (result.isSimulation) {
          // 模拟模式直接显示成功结果
          const simulationMsg = (
            <div style={{ padding: '12px', background: '#e7f3ff', borderRadius: '12px', borderLeft: '4px solid #2196F3' }}>
              <div style={{ display: 'flex', alignItems: 'center', marginBottom: '8px' }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="#2196F3">
                  <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z"/>
                </svg>
                <span style={{ marginLeft: '6px', fontWeight: 'bold' }}>
                  {result.sourceChainId !== result.destChainId ? '🌉 模拟跨链成功' : '✅ 演示模式成功'}
                </span>
              </div>
              <div style={{ marginBottom: '8px', color: '#333', fontSize: '14px', display: 'flex', alignItems: 'center' }}>
                <strong>模拟交易哈希:</strong>{' '}
                <code 
                  style={{ 
                    fontSize: '11px', 
                    background: '#f0f0f0', 
                    padding: '2px 6px', 
                    borderRadius: '4px',
                    cursor: 'pointer',
                    maxWidth: '200px',
                    fontFamily: 'monospace',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                    display: 'inline-block',
                    marginLeft: '4px'
                  }}
                  onClick={() => {
                    navigator.clipboard.writeText(result.txHash);
                    // 可以添加一个简单的复制成功提示
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
                  }}
                  title="点击复制完整哈希"
                >
                  {result.txHash}
                </code>
              </div>
              <div style={{ marginBottom: '8px', color: '#1976D2', fontSize: '13px' }}>
                {result.note}
              </div>
              <div style={{ color: '#666', fontSize: '12px', background: '#f5f5f5', padding: '6px', borderRadius: '4px' }}>
                💡 要启用真实跨链，需要配置正确的 ZetaChain 合约地址。请参考 ZetaChain 官方文档获取最新的测试网合约地址。
              </div>
            </div>
          );

          setMessages(prev => [...prev, { role: 'ai', content: '', data: simulationMsg }]);
          setPendingAction(null);
        } else {
          // 真实交易模式 - 设置当前交易信息用于状态追踪
          setCurrentTx({ 
            hash: result.txHash, 
            chainId: result.sourceChainId || getChainId(pendingAction.from) 
          });

          // 如果是 ZetaChain 交易，启动状态监控
          if (result.sourceChainId === 7001) {
            console.log('🎯 启动 ZetaChain 交易监控');
            
            const monitor = createTransactionMonitor(
              result.txHash,
              (status) => {
                console.log('📊 交易状态更新:', status);
                
                if (status.status === 'pending') {
                  // 仍然待确认
                  const pendingMsg = (
                    <div style={{ padding: '12px', background: '#e7f3ff', borderRadius: '12px', borderLeft: '4px solid #2196F3' }}>
                      <div style={{ display: 'flex', alignItems: 'center', marginBottom: '8px' }}>
                        <div style={{ width: '16px', height: '16px', border: '2px solid #2196F3', borderTop: '2px solid transparent', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></div>
                        <span style={{ marginLeft: '6px', fontWeight: 'bold' }}>
                          📡 ZetaChain 交易确认中
                        </span>
                      </div>
                      <div style={{ marginBottom: '8px', fontSize: '14px', color: '#333' }}>
                        <strong>状态:</strong> {status.message}
                      </div>
                      <div style={{ fontSize: '12px', color: '#1976D2', background: '#f5f5f5', padding: '6px', borderRadius: '4px' }}>
                        🔄 检查次数: {status.checkCount} / 45
                      </div>
                      <div style={{ marginTop: '8px' }}>
                        <a 
                          href={status.explorerUrl} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          style={{ 
                            color: '#007bff', 
                            textDecoration: 'none', 
                            fontSize: '12px',
                            fontWeight: 'bold'
                          }}
                        >
                          🔍 在区块浏览器中查看
                        </a>
                      </div>
                    </div>
                  );

                  setMessages(prev => [...prev, { role: 'ai', content: '', data: pendingMsg }]);
                } else if (status.status === 'confirmed') {
                  // 交易确认成功
                  const bgColor = status.fallback ? '#fff3cd' : '#d4edda';
                  const borderColor = status.fallback ? '#ffc107' : '#28a745';
                  const title = status.fallback ? '⚠️ ZetaChain 交易已提交' : '🎉 ZetaChain 跨链成功！';
                  const titleColor = status.fallback ? '#856404' : '#155724';
                  
                  const successMsg = (
                    <div style={{ padding: '12px', background: bgColor, borderRadius: '12px', borderLeft: `4px solid ${borderColor}` }}>
                      <div style={{ display: 'flex', alignItems: 'center', marginBottom: '8px' }}>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill={borderColor}>
                          {status.fallback ? 
                            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/> :
                            <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z"/>
                          }
                        </svg>
                        <span style={{ marginLeft: '6px', fontWeight: 'bold', color: titleColor }}>
                          {title}
                        </span>
                      </div>
                      <div style={{ marginBottom: '8px', fontSize: '14px', color: '#333' }}>
                        <strong>交易哈希:</strong>{' '}
                        <code 
                          style={{ 
                            background: '#fff', 
                            padding: '2px 6px', 
                            borderRadius: '4px', 
                            fontSize: '12px',
                            cursor: 'pointer',
                            border: '1px solid #ddd'
                          }}
                          onClick={() => navigator.clipboard.writeText(status.txHash)}
                          title="点击复制交易哈希"
                        >
                          {status.txHash}
                        </code>
                      </div>
                      <div style={{ marginBottom: '8px', color: '#1976D2', fontSize: '13px' }}>
                        {status.message}
                      </div>
                      {status.fallback ? (
                        <div style={{ color: '#856404', fontSize: '12px', background: '#fff8e1', padding: '6px', borderRadius: '4px' }}>
                          ℹ️ 注意：由于网络限制，无法自动验证交易状态，请手动查看区块浏览器确认
                        </div>
                      ) : (
                        <div style={{ color: '#155724', fontSize: '12px', background: '#d1ecf1', padding: '6px', borderRadius: '4px' }}>
                          ✅ 确认数: {status.confirmations} | 
                          📦 区块: {status.blockNumber} | 
                          ⛽ Gas: {status.gasUsed}
                        </div>
                      )}
                      <div style={{ marginTop: '8px' }}>
                        <a 
                          href={status.explorerUrl} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          style={{ 
                            color: '#007bff', 
                            textDecoration: 'none', 
                            fontSize: '12px',
                            fontWeight: 'bold'
                          }}
                        >
                          🔍 在区块浏览器中查看
                        </a>
                      </div>
                    </div>
                  );

                  setMessages(prev => [...prev, { role: 'ai', content: '', data: successMsg }]);
                  setCurrentTx(null);
                  setPendingAction(null);
                } else if (status.status === 'error') {
                  // 交易失败
                  const errorMsg = (
                    <div style={{ padding: '12px', background: '#f8d7da', borderRadius: '12px', borderLeft: '4px solid #dc3545' }}>
                      <div style={{ display: 'flex', alignItems: 'center', marginBottom: '8px' }}>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="#dc3545">
                          <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
                        </svg>
                        <span style={{ marginLeft: '6px', fontWeight: 'bold' }}>
                          ❌ ZetaChain 跨链失败
                        </span>
                      </div>
                      <div style={{ marginBottom: '8px', fontSize: '14px', color: '#333' }}>
                        <strong>错误:</strong> {status.message}
                      </div>
                      <div style={{ fontSize: '12px', color: '#721c24' }}>
                        💡 请检查网络连接和 ZETA 余额，然后重试
                      </div>
                    </div>
                  );

                  setMessages(prev => [...prev, { role: 'ai', content: '', data: errorMsg }]);
                  setCurrentTx(null);
                  setPendingAction(null);
                } else if (status.status === 'timeout') {
                  // 超时
                  const timeoutMsg = (
                    <div style={{ padding: '12px', background: '#fff3cd', borderRadius: '12px', borderLeft: '4px solid #ffc107' }}>
                      <div style={{ display: 'flex', alignItems: 'center', marginBottom: '8px' }}>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="#ffc107">
                          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z"/>
                        </svg>
                        <span style={{ marginLeft: '6px', fontWeight: 'bold' }}>
                          ⏰ 交易确认超时
                        </span>
                      </div>
                      <div style={{ marginBottom: '8px', fontSize: '14px', color: '#333' }}>
                        {status.message}
                      </div>
                      <div style={{ fontSize: '12px', color: '#856404' }}>
                        📝 交易可能仍在处理中，请稍后手动检查: 
                        <a 
                          href={`https://zetachain-athens-3.blockscout.com/tx/${result.txHash}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          style={{ color: '#007bff', textDecoration: 'none' }}
                        >
                          查看交易
                        </a>
                      </div>
                    </div>
                  );

                  setMessages(prev => [...prev, { role: 'ai', content: '', data: timeoutMsg }]);
                  setCurrentTx(null);
                  setPendingAction(null);
                } else if (status.status === 'not_found') {
                  // 交易未找到
                  const notFoundMsg = (
                    <div style={{ padding: '12px', background: '#f8d7da', borderRadius: '12px', borderLeft: '4px solid #dc3545' }}>
                      <div style={{ display: 'flex', alignItems: 'center', marginBottom: '8px' }}>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="#dc3545">
                          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z"/>
                        </svg>
                        <span style={{ marginLeft: '6px', fontWeight: 'bold' }}>
                          ❓ 交易未找到
                        </span>
                      </div>
                      <div style={{ marginBottom: '8px', fontSize: '14px', color: '#333' }}>
                        <strong>提示:</strong> {status.message}
                      </div>
                      <div style={{ fontSize: '12px', color: '#721c24' }}>
                        💡 可能原因：交易哈希错误、网络延迟、或交易失败
                      </div>
                      <div style={{ marginTop: '8px' }}>
                        <a 
                          href={status.explorerUrl} 
                          target="_blank"
                          rel="noopener noreferrer"
                          style={{ 
                            color: '#007bff', 
                            textDecoration: 'none', 
                            fontSize: '12px',
                            fontWeight: 'bold'
                          }}
                        >
                          🔍 手动检查区块浏览器
                        </a>
                      </div>
                    </div>
                  );

                  setMessages(prev => [...prev, { role: 'ai', content: '', data: notFoundMsg }]);
                  setCurrentTx(null);
                  setPendingAction(null);
                } else if (status.status === 'network_error') {
                  // 网络错误
                  const networkErrorMsg = (
                    <div style={{ padding: '12px', background: '#fff3cd', borderRadius: '12px', borderLeft: '4px solid #ffc107' }}>
                      <div style={{ display: 'flex', alignItems: 'center', marginBottom: '8px' }}>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="#ffc107">
                          <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
                        </svg>
                        <span style={{ marginLeft: '6px', fontWeight: 'bold' }}>
                          🌐 网络连接不稳定
                        </span>
                      </div>
                      <div style={{ marginBottom: '8px', fontSize: '14px', color: '#333' }}>
                        <strong>状态:</strong> {status.message}
                      </div>
                      <div style={{ fontSize: '12px', color: '#856404' }}>
                        💡 交易可能仍然成功，但网络检查失败
                      </div>
                      <div style={{ marginTop: '8px' }}>
                        <a 
                          href={status.explorerUrl} 
                          target="_blank"
                          rel="noopener noreferrer"
                          style={{ 
                            color: '#007bff', 
                            textDecoration: 'none', 
                            fontSize: '12px',
                            fontWeight: 'bold'
                          }}
                        >
                          🔍 手动检查区块浏览器
                        </a>
                      </div>
                    </div>
                  );

                  setMessages(prev => [...prev, { role: 'ai', content: '', data: networkErrorMsg }]);
                  setCurrentTx(null);
                  setPendingAction(null);
                }
              }
            );
            
            // 清理定时器
            setTimeout(() => clearInterval(monitor), 5 * 60 * 1000); // 5分钟后清理
          }

          const executingMsg = (
            <div style={{ padding: '12px', background: '#fff3cd', borderRadius: '12px', borderLeft: '4px solid #ffc107' }}>
              <div style={{ display: 'flex', alignItems: 'center', marginBottom: '8px' }}>
                <div style={{ width: '16px', height: '16px', border: '2px solid #ffc107', borderTop: '2px solid transparent', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></div>
                <span style={{ marginLeft: '6px', fontWeight: 'bold' }}>
                  {result.sourceChainId === 7001 ? 'ZetaChain 跨链处理中...' : '跨链交易处理中...'}
                </span>
              </div>
              <div style={{ marginBottom: '8px', color: '#333' }}>
                <strong>交易哈希:</strong>{' '}
                <code 
                  style={{ 
                    fontSize: '11px', 
                    background: '#f0f0f0', 
                    padding: '2px 6px', 
                    borderRadius: '4px',
                    cursor: 'pointer',
                    fontFamily: 'monospace',
                    maxWidth: '200px',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                    display: 'inline-block'
                  }}
                  onClick={() => {
                    navigator.clipboard.writeText(result.txHash);
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
                  }}
                  title="点击复制完整哈希"
                >
                  {result.txHash}
                </code>
              </div>
              <div style={{ color: '#666', fontSize: '12px' }}>
                请等待交易确认，这可能需要几分钟时间
              </div>
            </div>
          );

          setMessages(prev => [...prev, { role: 'ai', content: '', data: executingMsg }]);
          setPendingAction(null);
        }
      }
    } catch (error: any) {
      console.error('跨链交易失败:', error);
      
      const errorMsg = (
        <div style={{ padding: '12px', background: '#f8d7da', borderRadius: '12px', borderLeft: '4px solid #dc3545' }}>
          <div style={{ display: 'flex', alignItems: 'center', marginBottom: '8px' }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="#dc3545">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/>
            </svg>
            <span style={{ marginLeft: '6px', fontWeight: 'bold' }}>跨链交易失败</span>
          </div>
          <div style={{ color: '#721c24', fontSize: '14px' }}>
            <strong>错误信息:</strong> {error?.message || '未知错误'}
          </div>
          <div style={{ color: '#721c24', fontSize: '12px', marginTop: '8px' }}>
            请检查: <br/>
            • 钱包是否连接到正确网络 <br/>
            • 是否有足够的代币余额 <br/>
            • MetaMask 是否允许交易
          </div>
        </div>
      );

      setMessages(prev => [...prev, { role: 'ai', content: '', data: errorMsg }]);
      setPendingAction(null);
    } finally {
      setIsExecuting(false);
    }
  };

  // 获取链 ID
  function getChainId(chainName: string): number {
    const chainIds: Record<string, number> = {
      ethereum: 1,
      bsc: 56,
      polygon: 137,
      arbitrum: 42161,
      optimism: 10,
      sepolia: 11155111,  // 添加 Sepolia 测试网
      bscTestnet: 97,     // 添加 BSC 测试网
    };
    return chainIds[chainName.toLowerCase()] || 1;
  }

  // 添加动画样式
  useEffect(() => {
    const style = document.createElement('style');
    style.textContent = `
      @keyframes slideIn {
        from {
          transform: translateX(100%);
          opacity: 0;
        }
        to {
          transform: translateX(0);
          opacity: 1;
        }
      }
    `;
    document.head.appendChild(style);
    return () => {
      document.head.removeChild(style);
    };
  }, []);

  return (
    <div style={{ margin: '20px auto', maxWidth: '600px', fontFamily: 'sans-serif' }}>
      {/* 消息列表 */}
      <div
        style={{
          height: '400px',
          overflowY: 'auto',
          border: '1px solid #ddd',
          padding: '10px',
          borderRadius: '8px',
          backgroundColor: '#fafafa',
        }}
      >
        {messages.map((msg, idx) => (
          <div
            key={idx}
            style={{
              marginBottom: '12px',
              textAlign: msg.role === 'user' ? 'right' : 'left',
            }}
          >
            {msg.role === 'user' ? (
              <div
                style={{
                  display: 'inline-block',
                  padding: '10px 14px',
                  borderRadius: '18px',
                  background: '#7548FF',
                  color: 'white',
                  maxWidth: '80%',
                  wordWrap: 'break-word',
                }}
              >
                {msg.content}
              </div>
            ) : (
              <div style={{ maxWidth: '80%' }}>
                {msg.data ? msg.data : msg.content}
              </div>
            )}
          </div>
        ))}
        {/* 滚动目标 */}
        <div ref={messagesEndRef} />
      </div>

      {/* 执行按钮 */}
      {pendingAction && (
        <div style={{ textAlign: 'center', marginTop: '10px' }}>
          <button
            onClick={handleExecute}
            disabled={isExecuting}
            style={{
              padding: '10px 20px',
              background: isExecuting ? '#ccc' : '#4CAF50',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              cursor: isExecuting ? 'not-allowed' : 'pointer',
              fontWeight: 'bold',
              fontSize: '14px',
            }}
          >
            {isExecuting ? '⏳ 执行中...' : '✅ 执行跨链交易'}
          </button>
        </div>
      )}

      {/* 输入框 */}
      <div style={{ display: 'flex', marginTop: '10px' }}>
        <input
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyPress={e => e.key === 'Enter' && handleSend()}
          placeholder={
            isConnected
              ? '输入跨链指令（如：转 0.01 ETH 从 Ethereum 到 BSC）'
              : '请先连接钱包'
          }
          disabled={!isConnected}
          style={{
            flex: 1,
            padding: '10px',
            border: '1px solid #ccc',
            borderRadius: '4px 0 0 4px',
            outline: 'none',
            backgroundColor: isConnected ? 'white' : '#f5f5f5',
          }}
        />
        <button
          onClick={handleSend}
          disabled={!input.trim() || !isConnected}
          style={{
            padding: '10px 16px',
            background: input.trim() && isConnected ? '#7548FF' : '#ccc',
            color: 'white',
            border: 'none',
            borderRadius: '0 4px 4px 0',
            cursor: input.trim() && isConnected ? 'pointer' : 'not-allowed',
          }}
        >
          发送
        </button>
      </div>
    </div>
  );
}