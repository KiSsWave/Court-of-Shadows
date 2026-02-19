import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useWS } from '@/context/WebSocketContext';
import { useGame } from '@/context/GameContext';
import { MESSAGE_TYPES } from '@/constants/game';
import { useSoundManager } from '@/hooks/useSoundManager';
import type { Player } from '@/types/game';

interface Props {
  eligiblePlayers: Player[];
  onSent: () => void;
}

export default function ExecutionAction({ eligiblePlayers, onSent }: Props) {
  const { t } = useTranslation();
  const { send } = useWS();
  const { state } = useGame();
  const sounds = useSoundManager();
  const [selectedId, setSelectedId] = useState<string | null>(null);

  function handleExecute() {
    if (!selectedId) return;
    sounds.playExecution();
    send(MESSAGE_TYPES.USE_POWER, {
      playerId: state.playerId,
      roomId: state.roomId,
      power: 'execution',
      targetId: selectedId,
    });
    onSent();
  }

  return (
    <div className="action-content execution-action">
      <h2 className="action-title">💀 {t('actions.executeTitle')}</h2>
      <p style={{ color: '#c44', textAlign: 'center' }}>{t('actions.executeDesc')}</p>

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
        className="btn btn-danger"
        disabled={!selectedId}
        onClick={handleExecute}
      >
        💀 {t('actions.execute')}
      </button>
    </div>
  );
}
