import { useGame } from '@/context/GameContext';

export default function ConnectionBanner() {
  const { state } = useGame();

  if (!state.wsReconnecting && state.wsConnected) return null;
  if (!state.wsReconnecting && !state.wsConnected && state.wsReconnectAttempt === 0) return null;

  const label = state.wsReconnecting
    ? `Reconnexion... (${state.wsReconnectAttempt}/20)`
    : 'Connexion perdue...';

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        background: 'rgba(239, 68, 68, 0.95)',
        color: 'white',
        padding: '12px 20px',
        textAlign: 'center',
        zIndex: 10000,
        fontWeight: 500,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 10,
        boxShadow: '0 2px 10px rgba(0,0,0,0.3)',
      }}
    >
      <span
        style={{
          width: 16,
          height: 16,
          border: '2px solid rgba(255,255,255,0.3)',
          borderTopColor: 'white',
          borderRadius: '50%',
          animation: 'spin 1s linear infinite',
          display: 'inline-block',
        }}
      />
      <span>{label}</span>
    </div>
  );
}
