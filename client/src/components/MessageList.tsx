import { useEffect, useRef } from 'react';

interface Message {
  role: 'user' | 'ai';
  content: string;
  data?: any;
}

interface MessageListProps {
  messages: Message[];
}

export function MessageList({ messages }: MessageListProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  return (
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
              {msg.data ? msg.data : (
                <div style={{ 
                  whiteSpace: 'pre-line',
                  lineHeight: '1.5'
                }}>
                  {msg.content}
                </div>
              )}
            </div>
          )}
        </div>
      ))}
      <div ref={messagesEndRef} />
    </div>
  );
}