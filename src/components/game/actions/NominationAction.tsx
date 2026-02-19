import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useWS } from '@/context/WebSocketContext';
import { useGame } from '@/context/GameContext';
import { MESSAGE_TYPES } from '@/constants/game';
import type { Player } from '@/types/game';

interface Props {
  eligiblePlayers: Player[];
  onSent: () => void;
}

export default function NominationAction({ eligiblePlayers, onSent }: Props) {
  const { t } = useTranslation();
  const { send } = useWS();
  const { state } = useGame();
  const [selectedId, setSelectedId] = useState<string | null>(null);

  function handleNominate() {
    if (!selectedId) return;
    send(MESSAGE_TYPES.NOMINATE_CHANCELLOR, {
      playerId: state.playerId,
      roomId: state.roomId,
      chancellorId: selectedId,
    });
    onSent();
  }

  return (
    <div className="action-content nomination-action">
      <h2 className="action-title">{t('actions.nominateChancellor')}</h2>
      <p>{t('actions.selectChancellor')}</p>

      <div className="player-selector" id="chancellor-selector">
        {eligiblePlayers.map(player => (
          <button
            key={player.id}
            className={`player-select-btn${selectedId === player.id ? ' selected' : ''}`}
            onClick={() => setSelectedId(player.id)}
          >
            🎭 {player.name}
          </button>
        ))}
      </div>

      <button
        id="confirm-nomination"
        className="btn btn-primary"
        disabled={!selectedId}
        onClick={handleNominate}
      >
        {t('actions.nominate')}
      </button>
    </div>
  );
}
