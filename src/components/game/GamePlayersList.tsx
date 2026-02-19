import { useTranslation } from 'react-i18next';
import type { Player, KnownPlayer } from '@/types/game';
import { FACTIONS } from '@/constants/game';

interface Props {
  players: Player[];
  playerOrder?: string[];
  currentKingId?: string | null;
  currentChancellorId?: string | null;
  nominatedChancellorId?: string | null;
  knownPlayers: KnownPlayer[];
  currentPlayerId: string | null;
  lastVotes?: Record<string, string> | null;
}

export default function GamePlayersList({
  players,
  playerOrder,
  currentKingId,
  currentChancellorId,
  nominatedChancellorId,
  knownPlayers,
  currentPlayerId,
  lastVotes,
}: Props) {
  const { t } = useTranslation();

  // Respect server player order if provided
  let orderedPlayers = players;
  if (playerOrder && playerOrder.length > 0) {
    orderedPlayers = playerOrder
      .map(id => players.find(p => p.id === id))
      .filter((p): p is Player => Boolean(p));
  }

  function getKnownFaction(playerId: string): string | null {
    const known = knownPlayers.find(k => k.id === playerId);
    return known?.faction ?? null;
  }

  return (
    <div id="game-players-list" className="game-players-list">
      {orderedPlayers.map(player => {
        const isSelf = player.id === currentPlayerId;
        const isKing = player.id === currentKingId;
        const isChancellor = player.id === currentChancellorId;
        const isNominated = player.id === nominatedChancellorId;
        const isDead = !player.isAlive;
        const knownFaction = getKnownFaction(player.id);
        const vote = lastVotes?.[player.id];

        const classes = [
          'game-player-item',
          isSelf ? 'self' : '',
          isKing ? 'current-king' : '',
          isChancellor ? 'current-chancellor' : '',
          isNominated ? 'nominated' : '',
          isDead ? 'eliminated' : '',
          knownFaction === FACTIONS.CONSPIRATORS ? 'known-conspirator' : '',
          knownFaction === FACTIONS.LOYALISTS ? 'known-loyalist' : '',
        ]
          .filter(Boolean)
          .join(' ');

        return (
          <div key={player.id} className={classes} data-player-id={player.id}>
            <div className="player-name">
              {isKing && <span className="badge badge-king">👑</span>}
              {isChancellor && <span className="badge badge-chancellor">📜</span>}
              {isNominated && <span className="badge badge-nominated">🎯</span>}
              {isDead && <span className="badge badge-dead">💀</span>}
              {player.name}
              {isSelf && <span className="badge badge-self"> ({t('game.you')})</span>}
            </div>

            {knownFaction && (
              <div className={`faction-indicator ${knownFaction === FACTIONS.CONSPIRATORS ? 'conspirator' : 'loyalist'}`}>
                {knownFaction === FACTIONS.CONSPIRATORS ? '🗡️' : '⚜️'}
              </div>
            )}

            {vote && (
              <div className={`vote-badge vote-${vote}`}>
                {vote === 'yes' ? '✓' : '✗'}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
