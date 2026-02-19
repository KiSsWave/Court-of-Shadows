import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useGame } from '@/context/GameContext';
import { FACTIONS, ROLES } from '@/constants/game';
import { useSoundManager } from '@/hooks/useSoundManager';

export default function GameOverScreen() {
  const { t } = useTranslation();
  const { state, dispatch } = useGame();
  const navigate = useNavigate();
  const sounds = useSoundManager();
  const data = state.gameOverData;

  useEffect(() => {
    if (!data) return;

    const playerWon =
      (data.winner === FACTIONS.LOYALISTS && state.playerFaction === FACTIONS.LOYALISTS) ||
      (data.winner === FACTIONS.CONSPIRATORS && state.playerFaction === FACTIONS.CONSPIRATORS);

    if (playerWon) {
      sounds.playVictory();
    } else {
      sounds.playDefeat();
    }
  }, [data]);

  if (!data) {
    // No game over data → redirect to home
    navigate('/home');
    return null;
  }

  const isLoyalistWin = data.winner === FACTIONS.LOYALISTS;

  function handlePlayAgain() {
    dispatch({ type: 'LOGOUT' });
    navigate('/home');
  }

  return (
    <div id="game-over-screen" className="screen active">
      <div className="game-over-container">
        {/* Winner banner */}
        <div className={`winner-banner ${isLoyalistWin ? 'loyalists-win' : 'conspirators-win'}`}>
          <h1 id="winner-title" className="winner-title">
            {isLoyalistWin
              ? `⚜️ ${t('gameOver.loyalistsWin')}`
              : `🗡️ ${t('gameOver.conspiratorsWin')}`}
          </h1>
          <p id="winner-reason" className="winner-reason">{data.reason}</p>
        </div>

        {/* All final roles */}
        {data.allRoles && data.allRoles.length > 0 && (
          <div className="final-roles-section">
            <h2>{t('gameOver.finalRoles')}</h2>
            <div id="final-roles-container" className="final-roles-grid">
              {data.allRoles.map((entry, idx) => {
                const isUsurper = entry.role === ROLES.USURPER;
                const isConspirator = entry.role === ROLES.CONSPIRATOR;
                const roleClass = isUsurper
                  ? 'role-usurper'
                  : isConspirator
                  ? 'role-conspirator'
                  : 'role-loyalist';
                const roleEmoji = isUsurper ? '👑' : isConspirator ? '🗡️' : '⚜️';

                return (
                  <div
                    key={idx}
                    className={`final-role-card ${roleClass}${!entry.isAlive ? ' eliminated' : ''}`}
                  >
                    <div className="final-role-emoji">{roleEmoji}</div>
                    <div className="final-role-name">{entry.name}</div>
                    <div className="final-role-role">{t(`roles.${entry.role}`)}</div>
                    {!entry.isAlive && (
                      <div className="final-role-dead">💀 {t('gameOver.eliminated')}</div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="game-over-actions">
          <button className="btn btn-primary" onClick={handlePlayAgain}>
            🏠 {t('gameOver.backToLobby')}
          </button>
          <button className="btn btn-secondary" onClick={() => navigate('/rules')}>
            📖 {t('nav.rules')}
          </button>
        </div>
      </div>
    </div>
  );
}
