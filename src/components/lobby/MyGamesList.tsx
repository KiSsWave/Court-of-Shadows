import { useTranslation } from 'react-i18next';
import { getTimeSince } from '@/utils/timeSince';
import type { PlayerGame } from '@/types/game';

interface MyGamesListProps {
  games: PlayerGame[];
  onReconnect: (roomId: string) => void;
  onRefresh: () => void;
}

const PHASE_LABELS: Record<string, string> = {
  nomination: '🛡️ Nomination',
  council_vote: '🗳️ Vote',
  legislative: '📜 Législative',
  executive_power: '⚡ Pouvoir',
  debate: '💬 Débat',
  paused: '⏸️ Pause',
};

export default function MyGamesList({ games, onReconnect, onRefresh }: MyGamesListProps) {
  const { t } = useTranslation();

  return (
    <div className="form-card">
      <div className="section-header">
        <h2>🎮 <span>{t('lobby.myGames')}</span></h2>
        <button id="refresh-my-games" className="btn-icon" onClick={onRefresh} title="Actualiser">
          🔄
        </button>
      </div>

      <div id="my-games-list">
        {games.length === 0 ? (
          <p style={{ textAlign: 'center', color: '#888' }}>{t('lobby.noMyGames')}</p>
        ) : (
          games.map(game => (
            <div key={game.roomId} className={`game-item ${game.isPaused ? 'paused' : ''}`}>
              <div className="game-info">
                <div className="game-host">👑 {game.hostName}</div>
                <div className="game-details">
                  <div className="game-detail-item">
                    <span>👥</span>
                    <span>{game.playerCount} {t('lobby.players')}</span>
                  </div>
                  <div className="game-detail-item">
                    <span>📍</span>
                    <span>{PHASE_LABELS[game.phase] ?? game.phase}</span>
                  </div>
                  <div className="game-detail-item">
                    <span>🕐</span>
                    <span>{getTimeSince(game.lastActivity, t)}</span>
                  </div>
                  {game.isPaused && (
                    <span className="game-badge paused">⏸️ EN PAUSE</span>
                  )}
                  {!game.isAlive && (
                    <span className="game-badge dead">💀 ÉLIMINÉ</span>
                  )}
                </div>
              </div>
              <div className="game-actions">
                <button
                  className="btn btn-warning btn-small"
                  onClick={() => onReconnect(game.roomId)}
                >
                  {t('lobby.reconnect')}
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
