import { useTranslation } from 'react-i18next';
import { getTimeSince } from '@/utils/timeSince';
import type { PublicGame } from '@/types/game';

interface PublicGamesListProps {
  games: PublicGame[];
  onJoin: (roomId: string) => void;
  onRefresh: () => void;
}

export default function PublicGamesList({ games, onJoin, onRefresh }: PublicGamesListProps) {
  const { t } = useTranslation();

  return (
    <div className="form-card">
      <div className="section-header">
        <h2>🌐 <span>{t('lobby.publicGames')}</span></h2>
        <button id="refresh-public-games" className="btn-icon" onClick={onRefresh} title="Actualiser">
          🔄
        </button>
      </div>

      <div id="public-games-list">
        {games.length === 0 ? (
          <p style={{ textAlign: 'center', color: '#888' }}>{t('lobby.noPublicGames')}</p>
        ) : (
          games.map(game => (
            <div key={game.roomId} className="game-item">
              <div className="game-info">
                <div className="game-host">👑 {game.hostName}</div>
                <div className="game-details">
                  <div className="game-detail-item">
                    <span>👥</span>
                    <span>{game.playerCount}/{game.maxPlayers}</span>
                  </div>
                  <div className="game-detail-item">
                    <span>🕐</span>
                    <span>{getTimeSince(game.createdAt, t)}</span>
                  </div>
                  <div className="game-detail-item">
                    <span className="game-badge">PUBLIC</span>
                  </div>
                </div>
              </div>
              <div className="game-actions">
                <button
                  className="btn btn-primary btn-small"
                  onClick={() => onJoin(game.roomId)}
                >
                  {t('lobby.join')}
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
