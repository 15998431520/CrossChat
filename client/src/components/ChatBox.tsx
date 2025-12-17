// client/src/components/ChatBox.tsx
import { useState } from 'react';
import { useAccount } from 'wagmi';
import axios from 'axios';

export function ChatBox() {
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<{ role: 'user' | 'ai'; content: string; data?: any }[]>([
    {
      role: 'ai',
      content: '你好！我是 CrossChat，可以帮你执行跨链操作。例如：“转 0.01 ETH 从 Ethereum 到 BSC”',
    },
  ]);
  const [pendingAction, setPendingAction] = useState<any>(null);
  const { isConnected } = useAccount();

  const handleSend = async () => {
    if (!input.trim() || !isConnected) return;

    const userMessage = input;
    setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
    setInput('');
    setPendingAction(null);

    try {
      const res = await axios.post('/api/parse', { message: userMessage });
      const parsedData = res.data;

      // 构建解析消息
      const parseMsg = (
        <div style={{ padding: '12px', background: '#f5f5f5', borderRadius: '12px', borderLeft: '4px solid #4CAF50' }}>
          <div style={{ display: 'flex', alignItems: 'center', marginBottom: '8px' }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="green">
              <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z"/>
            </svg>
            <span style={{ marginLeft: '6px', fontWeight: 'bold' }}>已解析指令：</span>
          </div>
          <pre style={{ margin: 0, fontSize: '14px', color: '#333' }}>
            {JSON.stringify(parsedData, null, 2)}
          </pre>
        </div>
      );

      setMessages(prev => [...prev, { role: 'ai', content: '', data: parseMsg }]);
      if (parsedData.action === 'transfer') {
        setPendingAction(parsedData);
      }
    } catch (error) {
      setMessages(prev => [
        ...prev,
        { role: 'ai', content: '❌ 解析失败，请检查指令格式' },
      ]);
    }
  };

  const handleExecute = async () => {
    if (!pendingAction) return;

    try {
      const res = await axios.post('/api/execute', pendingAction);
      const { message, txHash } = res.data;

      const executeMsg = (
        <div style={{ padding: '12px', background: '#f5f5f5', borderRadius: '12px', borderLeft: '4px solid #4CAF50' }}>
          <div style={{ display: 'flex', alignItems: 'center', marginBottom: '8px' }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="green">
              <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z"/>
            </svg>
            <span style={{ marginLeft: '6px', fontWeight: 'bold' }}>跨链交易已提交</span>
          </div>
          <div style={{ marginBottom: '8px', color: '#333' }}>
            <strong>交易哈希:</strong> <code>{txHash}</code>
          </div>
          <div style={{ color: '#666' }}>
            你可以在 <a href="https://explorer.zetachain.com/" target="_blank" rel="noreferrer">Block Explorer</a> 查看进度
          </div>
        </div>
      );

      setMessages(prev => [...prev, { role: 'ai', content: '', data: executeMsg }]);
      setPendingAction(null);
    } catch (err) {
      setMessages(prev => [
        ...prev,
        { role: 'ai', content: '❌ 交易提交失败，请重试' },
      ]);
      setPendingAction(null);
    }
  };

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
      </div>

      {/* 执行按钮 */}
      {pendingAction && (
        <div style={{ textAlign: 'center', marginTop: '10px' }}>
          <button
            onClick={handleExecute}
            style={{
              padding: '10px 20px',
              background: '#4CAF50',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer',
              fontWeight: 'bold',
              fontSize: '14px',
            }}
          >
            ✅ 执行跨链交易
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