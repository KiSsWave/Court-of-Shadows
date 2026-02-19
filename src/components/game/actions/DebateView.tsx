import { useTranslation } from 'react-i18next';
import { useWS } from '@/context/WebSocketContext';
import { useGame } from '@/context/GameContext';
import { MESSAGE_TYPES } from '@/constants/game';

interface Props {
  isKing: boolean;
}

export default function DebateView({ isKing }: Props) {
  const { t } = useTranslation();
  const { send } = useWS();
  const { state } = useGame();

  function handleEndTurn() {
    send(MESSAGE_TYPES.END_TURN, {
      playerId: state.playerId,
      roomId: state.roomId,
    });
  }

  return (
    <div className="action-content debate-view">
      <h2 className="action-title">💬 {t('phases.debate')}</h2>
      <p style={{ textAlign: 'center', fontSize: '1.2rem' }}>
        {t('actions.discussAndEndTurn')}
      </p>

      {isKing ? (
        <div style={{ textAlign: 'center', marginTop: '30px' }}>
          <button id="next-turn-btn" className="btn btn-primary" onClick={handleEndTurn}>
            {t('actions.endTurn')}
          </button>
        </div>
      ) : (
        <p style={{ textAlign: 'center', fontStyle: 'italic', marginTop: '20px', color: '#888' }}>
          {t('actions.debateInProgress')}
        </p>
      )}
    </div>
  );
}
