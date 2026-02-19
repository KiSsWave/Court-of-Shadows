import { useTranslation } from 'react-i18next';
import { DECREE_TYPES } from '@/constants/game';

interface Props {
  cards: string[];
  onClose: () => void;
}

export default function PeekResultView({ cards, onClose }: Props) {
  const { t } = useTranslation();

  return (
    <div className="action-content peek-result">
      <h2 className="action-title">👁️ {t('actions.peekResult')}</h2>
      <p style={{ textAlign: 'center', fontSize: '1.1rem', marginBottom: '20px' }}>
        {t('actions.peekResultDesc')}
      </p>

      <div className="decree-cards">
        {cards.map((card, i) => {
          const isPlot = card === DECREE_TYPES.PLOT;
          return (
            <div key={i} className={`decree-card ${card}`} style={{ pointerEvents: 'none' }}>
              <div className="decree-card-inner">
                <div className="card-icon">{isPlot ? '🗡️' : '⚜️'}</div>
                <div className="card-label">{isPlot ? t('decrees.plot') : t('decrees.edit')}</div>
              </div>
            </div>
          );
        })}
      </div>

      <p style={{ textAlign: 'center', fontSize: '0.9rem', color: '#888', marginTop: '20px' }}>
        {t('actions.peekSecret')}
      </p>

      <div style={{ textAlign: 'center', marginTop: '30px' }}>
        <button id="close-peek-result" className="btn btn-primary" onClick={onClose}>
          {t('common.understood')}
        </button>
      </div>
    </div>
  );
}
