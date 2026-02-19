import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useGame } from '@/context/GameContext';
import { ROLES, FACTIONS } from '@/constants/game';

const REVEAL_DURATION_MS = 4000;

export default function RoleRevealScreen() {
  const { t } = useTranslation();
  const { state, dispatch } = useGame();
  const [countdown, setCountdown] = useState(Math.ceil(REVEAL_DURATION_MS / 1000));

  // After 4 seconds dispatch ROLE_REVEAL_DONE → GameScreen takes over
  useEffect(() => {
    const timer = setTimeout(() => {
      dispatch({ type: 'ROLE_REVEAL_DONE' });
    }, REVEAL_DURATION_MS);

    const interval = setInterval(() => {
      setCountdown(prev => Math.max(0, prev - 1));
    }, 1000);

    return () => {
      clearTimeout(timer);
      clearInterval(interval);
    };
  }, [dispatch]);

  const role = state.roleAssignment;
  if (!role) return null;

  const isUsurper = role.role === ROLES.USURPER;
  const isConspirator = role.role === ROLES.CONSPIRATOR;
  const isLoyalist = role.role === ROLES.LOYALIST;

  const roleEmoji = isUsurper ? '👑' : isConspirator ? '🗡️' : '⚜️';
  const roleClass = isUsurper ? 'role-usurper' : isConspirator ? 'role-conspirator' : 'role-loyalist';

  return (
    <div id="role-reveal" className="screen active">
      <div className="role-reveal-container">
        <div className={`role-card ${roleClass}`}>
          <div className="role-card-glow" />

          <div className="role-card-header">
            <span className="role-emoji">{roleEmoji}</span>
            <h2 className="role-title">{t(`roles.${role.role}`)}</h2>
          </div>

          <div className="role-card-faction">
            <span className={`faction-badge ${role.faction === FACTIONS.CONSPIRATORS ? 'faction-conspirator' : 'faction-loyalist'}`}>
              {t(`factions.${role.faction}`)}
            </span>
          </div>

          {/* Allies info for conspirators */}
          {isConspirator && role.allies && role.allies.length > 0 && (
            <div className="role-allies">
              <p>{t('roleReveal.yourAllies')}</p>
              <ul>
                {role.allies.map(ally => (
                  <li key={ally.id} className="ally-item">
                    {ally.name}
                    {ally.role === ROLES.USURPER && <span className="usurper-badge"> 👑 {t(`roles.${ROLES.USURPER}`)}</span>}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Usurper knowing their conspirators */}
          {isUsurper && role.allies && role.allies.length > 0 && (
            <div className="role-allies">
              <p>{t('roleReveal.yourConspirators')}</p>
              <ul>
                {role.allies.map(ally => (
                  <li key={ally.id} className="ally-item">
                    {ally.name}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {isLoyalist && (
            <div className="role-description">
              <p>{t('roleReveal.loyalistDesc')}</p>
            </div>
          )}

          <div className="role-countdown">
            <p>{t('roleReveal.gameStartsIn', { seconds: countdown })}</p>
            <div className="countdown-bar">
              <div
                className="countdown-progress"
                style={{ width: `${(countdown / (REVEAL_DURATION_MS / 1000)) * 100}%` }}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
