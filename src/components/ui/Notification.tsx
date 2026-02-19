import { useEffect } from 'react';
import { useGame } from '@/context/GameContext';

export default function NotificationStack() {
  const { state, dispatch } = useGame();

  return (
    <div
      style={{
        position: 'fixed',
        top: 30,
        right: 30,
        zIndex: 10000,
        display: 'flex',
        flexDirection: 'column',
        gap: 10,
        maxWidth: 380,
      }}
    >
      {state.notifications.map(n => (
        <NotificationItem
          key={n.id}
          id={n.id}
          message={n.message}
          onRemove={() => dispatch({ type: 'REMOVE_NOTIFICATION', id: n.id })}
        />
      ))}
    </div>
  );
}

function NotificationItem({
  id,
  message,
  onRemove,
}: {
  id: string;
  message: string;
  onRemove: () => void;
}) {
  useEffect(() => {
    const timer = setTimeout(onRemove, 3500);
    return () => clearTimeout(timer);
  }, [id, onRemove]);

  return (
    <div
      style={{
        background: 'linear-gradient(135deg, var(--gold, #d4af37) 0%, var(--bronze, #cd7f32) 100%)',
        color: 'var(--midnight-black, #0a0a0f)',
        padding: '16px 22px',
        borderRadius: 12,
        boxShadow: '0 8px 30px rgba(0,0,0,0.5)',
        fontWeight: 700,
        fontSize: '1rem',
        animation: 'slideIn 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
        cursor: 'pointer',
        wordBreak: 'break-word',
      }}
      onClick={onRemove}
    >
      {message}
    </div>
  );
}
