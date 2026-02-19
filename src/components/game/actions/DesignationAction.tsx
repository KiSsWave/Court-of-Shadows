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

export default function DesignationAction({ eligiblePlayers, onSent }: Props) {
  const { t } = useTranslation();
  const { send } = useWS();
  const { state } = useGame();
  const [selectedId, setSelectedId] = useState<string | null>(null);

  function handleDesignate() {
    if (!selectedId) return;
    send(MESSAGE_TYPES.USE_POWER, {
      playerId: state.playerId,
      roomId: state.roomId,
      power: 'special_designation',
      targetId: selectedId,
    });
    onSent();
  }

  return (
    <div className="action-content designation-action">
      <h2 className="action-title">👑 {t('actions.designateTitle')}</h2>
      <p>{t('actions.designateDesc')}</p>

      <div className="player-selector">
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
        className="btn btn-primary"
        disabled={!selectedId}
        onClick={handleDesignate}
      >
        {t('actions.designate')}
      </button>
    </div>
  );
}
