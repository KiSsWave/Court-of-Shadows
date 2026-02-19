import { useTranslation } from 'react-i18next';
import { useWS } from '@/context/WebSocketContext';
import { useGame } from '@/context/GameContext';
import { MESSAGE_TYPES } from '@/constants/game';

interface Props {
  isHost: boolean;
  reason?: string;
}

export default function PausedView({ isHost, reason }: Props) {
  const { t } = useTranslation();
  const { send } = useWS();
  const { state } = useGame();

  function handleResume() {
    send(MESSAGE_TYPES.RESUME_GAME, {
      playerId: state.playerId,
      roomId: state.roomId,
    });
  }

  return (
    <div className="action-content paused-view" style={{ textAlign: 'center', padding: '60px 20px' }}>
      <div style={{ fontSize: '5rem', marginBottom: '20px' }}>⏸️</div>
      <h3>{t('phases.paused')}</h3>
      {reason && <p style={{ color: '#888', marginTop: '10px' }}>{reason}</p>}

      {isHost && (
        <button className="btn btn-primary" style={{ marginTop: '30px' }} onClick={handleResume}>
          ▶️ {t('actions.resumeGame')}
        </button>
      )}
    </div>
  );
}
