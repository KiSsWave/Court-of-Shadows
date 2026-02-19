import { useTranslation } from 'react-i18next';
import type { Player } from '@/types/game';

interface Props {
  players: Player[];
  currentPlayerId: string | null;
  isHost: boolean;
  onKick: (targetId: string) => void;
  onBan: (targetId: string) => void;
}

export default function WaitingPlayerList({ players, currentPlayerId, isHost, onKick, onBan }: Props) {
  const { t } = useTranslation();

  return (
    <div className="waiting-players">
      <h3>
        {t('waiting.players')}
        {' '}
        <span id="player-count">{players.length}</span>/10
      </h3>
      <div id="players-container" className="players-container">
        {players.map(player => {
          const isSelf = player.id === currentPlayerId;
          const showActions = isHost && !isSelf;

          return (
            <div
              key={player.id}
              className={[
                'player-card',
                player.isHost ? 'host' : '',
                isSelf ? 'self' : '',
              ]
                .filter(Boolean)
                .join(' ')}
            >
              <div className="player-card-icon">{player.isHost ? '👑' : '🎭'}</div>
              <div className="player-card-name">{player.name}</div>
              {showActions && (
                <div className="player-card-actions">
                  <button
                    className="btn-kick"
                    title={t('waiting.kick')}
                    onClick={() => onKick(player.id)}
                  >
                    👢 {t('waiting.kick')}
                  </button>
                  <button
                    className="btn-ban"
                    title={t('waiting.ban')}
                    onClick={() => onBan(player.id)}
                  >
                    🚫 {t('waiting.ban')}
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
