import { useTranslation } from 'react-i18next';
import type { GameSettings as GameSettingsType } from '@/types/game';

interface Props {
  settings: GameSettingsType;
  isHost: boolean;
  playerCount: number;
  onChange: (settings: Partial<Record<string, boolean>>) => void;
}

export default function GameSettings({ settings, isHost, playerCount, onChange }: Props) {
  const { t } = useTranslation();

  // The "limited knowledge" option only makes sense for 9-10 players
  const showLimitedKnowledge = playerCount >= 9;

  return (
    <div id="game-settings" className="game-settings">
      <h3>{t('waiting.settings')}</h3>

      <label className="setting-item">
        <input
          type="checkbox"
          id="setting-conspirators-know-usurper"
          checked={settings.conspiratorsKnowUsurper ?? false}
          disabled={!isHost}
          onChange={e => onChange({ conspiratorsKnowUsurper: e.target.checked })}
        />
        <span>{t('settings.conspiratorsKnowUsurper')}</span>
      </label>

      <label className="setting-item">
        <input
          type="checkbox"
          id="setting-usurper-knows-allies"
          checked={settings.usurperKnowsAllies ?? false}
          disabled={!isHost}
          onChange={e => onChange({ usurperKnowsAllies: e.target.checked })}
        />
        <span>{t('settings.usurperKnowsAllies')}</span>
      </label>

      <label className="setting-item">
        <input
          type="checkbox"
          id="setting-previous-king-cannot-be-chancellor"
          checked={settings.previousKingCannotBeChancellor ?? false}
          disabled={!isHost}
          onChange={e => onChange({ previousKingCannotBeChancellor: e.target.checked })}
        />
        <span>{t('settings.previousKingCannotBeChancellor')}</span>
      </label>

      {showLimitedKnowledge && (
        <label
          className="setting-item"
          id="setting-limited-knowledge-container"
        >
          <input
            type="checkbox"
            id="setting-limited-conspirators-knowledge"
            checked={settings.limitedConspiratorsKnowledge ?? false}
            disabled={!isHost}
            onChange={e => onChange({ limitedConspiratorsKnowledge: e.target.checked })}
          />
          <span>{t('settings.limitedConspiratorsKnowledge')}</span>
        </label>
      )}
    </div>
  );
}
