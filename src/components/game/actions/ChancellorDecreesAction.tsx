import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useWS } from '@/context/WebSocketContext';
import { useGame } from '@/context/GameContext';
import { MESSAGE_TYPES, DECREE_TYPES } from '@/constants/game';
import { useSoundManager } from '@/hooks/useSoundManager';

interface Props {
  decrees: string[];
  canVeto: boolean;
  vetoRejected?: boolean;
  onSent: () => void;
}

export default function ChancellorDecreesAction({ decrees, canVeto, vetoRejected, onSent }: Props) {
  const { t } = useTranslation();
  const { send } = useWS();
  const { state, dispatch } = useGame();
  const sounds = useSoundManager();
  const [selectedPlay, setSelectedPlay] = useState<number | null>(null);

  function handlePlay() {
    if (selectedPlay === null) return;
    sounds.playCardDiscard();
    send(MESSAGE_TYPES.PLAY_DECREE, {
      playerId: state.playerId,
      roomId: state.roomId,
      playIndex: selectedPlay,
    });
    dispatch({ type: 'CLEAR_SHARE_CARDS' });
    onSent();
  }

  function handleVeto() {
    send(MESSAGE_TYPES.REQUEST_VETO, {
      playerId: state.playerId,
      roomId: state.roomId,
    });
    onSent();
  }

  return (
    <div className="action-content chancellor-decrees-action">
      <h2 className="action-title">📜 {t('actions.legislativeChancellor')}</h2>

      {vetoRejected && (
        <div className="veto-rejected-notice">
          ⚠️ {t('actions.vetoRejected')}
        </div>
      )}

      <p style={{ textAlign: 'center', fontSize: '1.2rem', marginBottom: '30px' }}>
        {t('actions.chancellorDecreesDesc')}
      </p>

      <div className="decree-cards" id="chancellor-decrees-container">
        {decrees.map((card, i) => {
          const isPlot = card === DECREE_TYPES.PLOT;
          const isSelected = selectedPlay === i;
          return (
            <div
              key={i}
              className={`decree-card ${card}${isSelected ? ' selected-play' : ''}`}
              onClick={() => setSelectedPlay(isSelected ? null : i)}
              style={{ cursor: 'pointer' }}
            >
              <div className="decree-card-inner">
                <div className="card-icon">{isPlot ? '🗡️' : '⚜️'}</div>
                <div className="card-label">{isPlot ? t('decrees.plot') : t('decrees.edit')}</div>
                {isSelected && (
                  <div className="card-play-label">{t('actions.playThis')}</div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      <button
        id="confirm-chancellor-play"
        className="btn btn-primary"
        disabled={selectedPlay === null}
        onClick={handlePlay}
      >
        {t('actions.playDecree')}
      </button>

      {canVeto && (
        <button
          id="request-veto-btn"
          className="btn btn-secondary"
          style={{ marginTop: '10px' }}
          onClick={handleVeto}
        >
          🚫 {t('actions.requestVeto')}
        </button>
      )}
    </div>
  );
}
