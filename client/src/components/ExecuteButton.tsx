interface ExecuteButtonProps {
  pendingAction: any;
  isExecuting: boolean;
  onExecute: () => void;
}

export function ExecuteButton({ pendingAction, isExecuting, onExecute }: ExecuteButtonProps) {
  if (!pendingAction) {
    return null;
  }

  return (
    <div style={{ textAlign: 'center', marginTop: '10px' }}>
      <button
        onClick={onExecute}
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
  );
}