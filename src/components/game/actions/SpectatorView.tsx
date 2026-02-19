import { useTranslation } from 'react-i18next';

export default function SpectatorView() {
  const { t } = useTranslation();

  return (
    <div className="action-content spectator-view" style={{ textAlign: 'center', padding: '60px 20px' }}>
      <div style={{ fontSize: '5rem', marginBottom: '20px' }}>👁️</div>
      <h3>{t('actions.spectator')}</h3>
      <p style={{ color: '#888', marginTop: '10px' }}>{t('actions.spectatorDesc')}</p>
    </div>
  );
}
