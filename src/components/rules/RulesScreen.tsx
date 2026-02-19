import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

export default function RulesScreen() {
  const { t } = useTranslation();
  const navigate = useNavigate();

  return (
    <div id="rules-screen" className="screen active">
      <div className="rules-container">
        <div className="rules-header">
          <button className="btn btn-secondary btn-back" onClick={() => navigate(-1)}>
            ← {t('common.back')}
          </button>
          <h1>📖 {t('nav.rules')}</h1>
        </div>

        <div className="rules-content">

          <section className="rules-section">
            <h2>🎭 {t('rules.objective')}</h2>
            <p>{t('rules.objectiveText')}</p>
          </section>

          <section className="rules-section">
            <h2>🃏 {t('rules.roles')}</h2>

            <div className="role-rule-card role-loyalist">
              <h3>⚜️ {t('roles.loyalist')}</h3>
              <p>{t('rules.loyalistDesc')}</p>
            </div>

            <div className="role-rule-card role-conspirator">
              <h3>🗡️ {t('roles.conspirator')}</h3>
              <p>{t('rules.conspiratorDesc')}</p>
            </div>

            <div className="role-rule-card role-usurper">
              <h3>👑 {t('roles.usurper')}</h3>
              <p>{t('rules.usurperDesc')}</p>
            </div>
          </section>

          <section className="rules-section">
            <h2>🏛️ {t('rules.howToWin')}</h2>
            <div className="win-condition loyalists">
              <h3>⚜️ {t('rules.loyalistsWin')}</h3>
              <ul>
                <li>{t('rules.loyalistsWin1')}</li>
                <li>{t('rules.loyalistsWin2')}</li>
              </ul>
            </div>
            <div className="win-condition conspirators">
              <h3>🗡️ {t('rules.conspiratorsWin')}</h3>
              <ul>
                <li>{t('rules.conspiratorsWin1')}</li>
                <li>{t('rules.conspiratorsWin2')}</li>
              </ul>
            </div>
          </section>

          <section className="rules-section">
            <h2>🔄 {t('rules.turnStructure')}</h2>
            <ol className="turn-steps">
              <li>
                <strong>1. {t('rules.nominationPhase')}</strong>
                <p>{t('rules.nominationDesc')}</p>
              </li>
              <li>
                <strong>2. {t('rules.votePhase')}</strong>
                <p>{t('rules.voteDesc')}</p>
              </li>
              <li>
                <strong>3. {t('rules.legislativePhase')}</strong>
                <p>{t('rules.legislativeDesc')}</p>
              </li>
              <li>
                <strong>4. {t('rules.executivePower')}</strong>
                <p>{t('rules.executivePowerDesc')}</p>
              </li>
              <li>
                <strong>5. {t('rules.debatePhase')}</strong>
                <p>{t('rules.debateDesc')}</p>
              </li>
            </ol>
          </section>

          <section className="rules-section">
            <h2>⚡ {t('rules.powers')}</h2>
            <div className="power-list">
              <div className="power-item">
                <span className="power-icon">🔍</span>
                <div>
                  <strong>{t('rules.investigatePower')}</strong>
                  <p>{t('rules.investigateDesc')}</p>
                </div>
              </div>
              <div className="power-item">
                <span className="power-icon">👁️</span>
                <div>
                  <strong>{t('rules.peekPower')}</strong>
                  <p>{t('rules.peekDesc')}</p>
                </div>
              </div>
              <div className="power-item">
                <span className="power-icon">👑</span>
                <div>
                  <strong>{t('rules.designationPower')}</strong>
                  <p>{t('rules.designationDesc')}</p>
                </div>
              </div>
              <div className="power-item">
                <span className="power-icon">💀</span>
                <div>
                  <strong>{t('rules.executionPower')}</strong>
                  <p>{t('rules.executionDesc')}</p>
                </div>
              </div>
              <div className="power-item">
                <span className="power-icon">🚫</span>
                <div>
                  <strong>{t('rules.vetoPower')}</strong>
                  <p>{t('rules.vetoDesc')}</p>
                </div>
              </div>
            </div>
          </section>

          <section className="rules-section">
            <h2>📋 {t('rules.playerCount')}</h2>
            <table className="player-count-table">
              <thead>
                <tr>
                  <th>{t('rules.players')}</th>
                  <th>⚜️ {t('roles.loyalist')}</th>
                  <th>🗡️ {t('roles.conspirator')}</th>
                  <th>👑 {t('roles.usurper')}</th>
                </tr>
              </thead>
              <tbody>
                <tr><td>5</td><td>3</td><td>1</td><td>1</td></tr>
                <tr><td>6</td><td>4</td><td>1</td><td>1</td></tr>
                <tr><td>7</td><td>4</td><td>2</td><td>1</td></tr>
                <tr><td>8</td><td>5</td><td>2</td><td>1</td></tr>
                <tr><td>9</td><td>5</td><td>3</td><td>1</td></tr>
                <tr><td>10</td><td>6</td><td>3</td><td>1</td></tr>
              </tbody>
            </table>
          </section>

        </div>
      </div>
    </div>
  );
}
