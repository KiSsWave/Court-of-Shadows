import { useTranslation } from 'react-i18next';
import { useWS } from '@/context/WebSocketContext';
import { useGame } from '@/context/GameContext';
import { MESSAGE_TYPES } from '@/constants/game';

interface Props {
  chancellorName: string;
  onSent: () => void;
}

export default function VetoResponseAction({ chancellorName, onSent }: Props) {
  const { t } = useTranslation();
  const { send } = useWS();
  const { state } = useGame();

  function respond(accept: boolean) {
    send(MESSAGE_TYPES.VETO_RESPONSE, {
      playerId: state.playerId,
      roomId: state.roomId,
      accept,
    });
    onSent();
  }

  return (
    <div className="action-content veto-response-action">
      <h2 className="action-title">🚫 {t('actions.vetoRequest')}</h2>
      <p style={{ textAlign: 'center', fontSize: '1.2rem', margin: '20px 0' }}>
        <strong>{chancellorName}</strong> {t('actions.requestedVeto')}
      </p>
      <p style={{ textAlign: 'center', color: '#888' }}>{t('actions.vetoExplain')}</p>

      <div className="veto-buttons" style={{ display: 'flex', gap: '20px', justifyContent: 'center', marginTop: '30px' }}>
        <button className="btn btn-primary" onClick={() => respond(true)}>
          ✓ {t('actions.acceptVeto')}
        </button>
        <button className="btn btn-secondary" onClick={() => respond(false)}>
          ✗ {t('actions.rejectVeto')}
        </button>
      </div>
    </div>
  );
}
