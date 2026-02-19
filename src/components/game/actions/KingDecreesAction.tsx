import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useWS } from '@/context/WebSocketContext';
import { useGame } from '@/context/GameContext';
import { MESSAGE_TYPES, DECREE_TYPES } from '@/constants/game';
import { useSoundManager } from '@/hooks/useSoundManager';

interface Props {
  decrees: string[];
  onSent: () => void;
}

export default function KingDecreesAction({ decrees, onSent }: Props) {
  const { t } = useTranslation();
  const { send } = useWS();
  const { state, dispatch } = useGame();
  const sounds = useSoundManager();
  const [selectedDiscard, setSelectedDiscard] = useState<number | null>(null);

  function handleDiscard() {
    if (selectedDiscard === null) return;
    sounds.playCardDiscard();
    send(MESSAGE_TYPES.DISCARD_DECREE, {
      playerId: state.playerId,
      roomId: state.roomId,
      discardIndex: selectedDiscard,
    });
    // Clear the share-cards button related state
    dispatch({ type: 'CLEAR_SHARE_CARDS' });
    onSent();
  }

  return (
    <div className="action-content king-decrees-action">
      <h2 className="action-title">👑 {t('actions.legislativeKing')}</h2>
      <p style={{ textAlign: 'center', fontSize: '1.2rem', marginBottom: '30px' }}>
        {t('actions.kingDecreesDesc')}
      </p>

      <div className="decree-cards" id="king-decrees-container">
        {decrees.map((card, i) => {
          const isPlot = card === DECREE_TYPES.PLOT;
          const isSelected = selectedDiscard === i;
          return (
            <div
              key={i}
              className={`decree-card ${card}${isSelected ? ' selected-discard' : ''}`}
              onClick={() => setSelectedDiscard(isSelected ? null : i)}
              style={{ cursor: 'pointer' }}
            >
              <div className="decree-card-inner">
                <div className="card-icon">{isPlot ? '🗡️' : '⚜️'}</div>
                <div className="card-label">{isPlot ? t('decrees.plot') : t('decrees.edit')}</div>
                {isSelected && (
                  <div className="card-discard-label">{t('actions.discardThis')}</div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      <button
        id="confirm-king-discard"
        className="btn btn-primary"
        disabled={selectedDiscard === null}
        onClick={handleDiscard}
      >
        {t('actions.discardAndPassToChancellor')}
      </button>
    </div>
  );
}
