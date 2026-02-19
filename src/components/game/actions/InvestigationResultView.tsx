import { useTranslation } from 'react-i18next';
import { FACTIONS } from '@/constants/game';

interface Props {
  targetName: string;
  faction: string;
  onClose: () => void;
}

export default function InvestigationResultView({ targetName, faction, onClose }: Props) {
  const { t } = useTranslation();
  const isConspirator = faction === FACTIONS.CONSPIRATORS;

  return (
    <div className="action-content investigation-result">
      <h2 className="action-title">🔍 {t('actions.investigationResult')}</h2>

      <div style={{ textAlign: 'center', padding: '30px' }}>
        <div style={{ fontSize: '4rem', marginBottom: '20px' }}>
          {isConspirator ? '🗡️' : '⚜️'}
        </div>
        <p style={{ fontSize: '1.3rem', marginBottom: '10px' }}>
          <strong>{targetName}</strong>
        </p>
        <p
          style={{
            fontSize: '1.5rem',
            fontWeight: 'bold',
            color: isConspirator ? '#c44' : '#4a7bbf',
          }}
        >
          {isConspirator ? t('factions.conspirators').toUpperCase() : t('factions.loyalists').toUpperCase()}
        </p>
        <p style={{ fontSize: '0.9rem', color: '#888', marginTop: '20px' }}>
          {t('actions.investigationSecret')}
        </p>

        <button
          id="close-investigation-result"
          className="btn btn-primary"
          style={{ marginTop: '30px' }}
          onClick={onClose}
        >
          {t('common.understood')}
        </button>
      </div>
    </div>
  );
}
