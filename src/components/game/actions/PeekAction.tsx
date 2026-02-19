import { useTranslation } from 'react-i18next';
import { useWS } from '@/context/WebSocketContext';
import { useGame } from '@/context/GameContext';
import { MESSAGE_TYPES } from '@/constants/game';

interface Props {
  onSent: () => void;
}

export default function PeekAction({ onSent }: Props) {
  const { t } = useTranslation();
  const { send } = useWS();
  const { state } = useGame();

  function handlePeek() {
    send(MESSAGE_TYPES.USE_POWER, {
      playerId: state.playerId,
      roomId: state.roomId,
      power: 'peek',
    });
    onSent();
  }

  return (
    <div className="action-content peek-action">
      <h2 className="action-title">👁️ {t('actions.peekTitle')}</h2>
      <p style={{ textAlign: 'center', fontSize: '1.1rem', margin: '20px 0' }}>
        {t('actions.peekDesc')}
      </p>
      <div style={{ textAlign: 'center' }}>
        <button className="btn btn-primary" onClick={handlePeek}>
          {t('actions.peek')}
        </button>
      </div>
    </div>
  );
}
