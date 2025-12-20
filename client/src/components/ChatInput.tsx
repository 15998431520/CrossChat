interface ChatInputProps {
  input: string;
  onInputChange: (value: string) => void;
  onSend: () => void;
  isConnected: boolean;
}

export function ChatInput({ input, onInputChange, onSend, isConnected }: ChatInputProps) {
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      onSend();
    }
  };

  return (
    <div style={{ display: 'flex', marginTop: '10px' }}>
      <input
        value={input}
        onChange={e => onInputChange(e.target.value)}
        onKeyDown={handleKeyDown}
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
        onClick={onSend}
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
  );
}