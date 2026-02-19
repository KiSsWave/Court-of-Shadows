import { useTranslation } from 'react-i18next';
import { GAME_PHASES } from '@/constants/game';
import type { AppState } from '@/types/game';

interface Props {
  state: AppState;
}

const PHASE_ICONS: Record<string, string> = {
  [GAME_PHASES.NOMINATION]: '🏛️',
  [GAME_PHASES.COUNCIL_VOTE]: '🗳️',
  [GAME_PHASES.LEGISLATIVE]: '📜',
  [GAME_PHASES.EXECUTIVE_POWER]: '⚡',
  [GAME_PHASES.DEBATE]: '💬',
  [GAME_PHASES.PAUSED]: '⏸️',
};

export default function GameHeader({ state }: Props) {
  const { t } = useTranslation();
  const gs = state.gameState;

  const currentKing = state.allPlayers.find(p => p.id === gs?.currentKingId);
  const currentChancellor = state.allPlayers.find(p => p.id === gs?.currentChancellorId);
  const phase = gs?.phase ?? '';
  const phaseIcon = PHASE_ICONS[phase] ?? '🎭';

  return (
    <div className="game-header">
      <div className="game-info-bar">
        {/* Current phase */}
        <div className="game-phase-display">
          <span id="current-phase">
            {phase ? `${phaseIcon} ${t(`phases.${phase}`, { defaultValue: phase })}` : ''}
          </span>
        </div>

        {/* Current government */}
        <div className="government-display">
          {currentKing && (
            <span className="gov-king" title={t('game.currentKing')}>
              👑 {currentKing.name}
            </span>
          )}
          {currentChancellor && (
            <span className="gov-chancellor" title={t('game.currentChancellor')}>
              📜 {currentChancellor.name}
            </span>
          )}
        </div>

        {/* Score boards (plots / edits) */}
        <div className="score-display">
          <span className="score-plots" title={t('game.conspiracyPlots')}>
            🗡️ {gs?.plotsCount ?? 0}/6
          </span>
          <span className="score-edits" title={t('game.royalEdits')}>
            ⚜️ {gs?.editsCount ?? 0}/5
          </span>
        </div>

        {/* Player role badge */}
        <div className="player-role-display">
          <span className="role-name-badge">
            {state.roleAssignment ? t(`roles.${state.roleAssignment.role}`) : ''}
          </span>
        </div>
      </div>
    </div>
  );
}
