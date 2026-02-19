import { useTranslation } from 'react-i18next';
import { useWS } from '@/context/WebSocketContext';
import { useGame } from '@/context/GameContext';
import { MESSAGE_TYPES } from '@/constants/game';

interface Props {
  role: 'king' | 'chancellor';
  onClose: () => void;
}

interface Combo {
  icons: string;
  label: string;
}

const KING_COMBOS: Combo[] = [
  { icons: '🗡️🗡️🗡️', label: 'combos.threePlots' },
  { icons: '🗡️🗡️⚜️', label: 'combos.twoPlots' },
  { icons: '🗡️⚜️⚜️', label: 'combos.oneplot' },
  { icons: '⚜️⚜️⚜️', label: 'combos.threeEdits' },
];

const CHANCELLOR_COMBOS: Combo[] = [
  { icons: '🗡️🗡️', label: 'combos.twoPlotsCh' },
  { icons: '🗡️⚜️', label: 'combos.oneplotCh' },
  { icons: '⚜️⚜️', label: 'combos.twoEditsCh' },
];

export default function ShareCardsPopup({ role, onClose }: Props) {
  const { t } = useTranslation();
  const { send } = useWS();
  const { state } = useGame();
  const combos = role === 'king' ? KING_COMBOS : CHANCELLOR_COMBOS;
  const roleLabel = role === 'king' ? t('roles.king') : t('roles.chancellor');

  function sendDeclaration(icons: string) {
    const message = `${t('shareCards.hadLabel')} : ${icons}`;
    send(MESSAGE_TYPES.CHAT_MESSAGE, {
      playerId: state.playerId,
      roomId: state.roomId,
      message,
    });
    onClose();
  }

  return (
    <div className="share-cards-popup-overlay" onClick={onClose}>
      <div className="share-cards-popup" onClick={e => e.stopPropagation()}>
        <div className="share-cards-popup-header">
          <h3>📢 {t('shareCards.title')}</h3>
          <span className="share-cards-popup-subtitle">
            {t('shareCards.subtitle', { role: roleLabel })}
          </span>
        </div>

        <div className="share-cards-popup-warning">
          ⚠️ {t('shareCards.warning')}
        </div>

        <div className="share-cards-popup-options">
          {combos.map(combo => (
            <button
              key={combo.icons}
              className="share-cards-option"
              onClick={() => sendDeclaration(combo.icons)}
            >
              <span className="share-option-icons">{combo.icons}</span>
              <span className="share-option-label">{t(combo.label)}</span>
            </button>
          ))}
        </div>

        <div className="share-cards-popup-footer">
          <button className="share-cards-cancel-btn" id="close-share-popup" onClick={onClose}>
            {t('common.cancel')}
          </button>
        </div>
      </div>
    </div>
  );
}
