import { useTranslation } from 'react-i18next';

interface Props {
  plotsCount: number;
  editsCount: number;
  playerCount: number;
}

/** Returns the power labels per slot based on player count (port of boards.js updateBoardPowers) */
function getPowers(playerCount: number): string[] {
  if (playerCount <= 6) {
    // 5-6 players: blank, blank, Peek, Execution, Execution, Victory
    return ['', '', '👁️', '💀', '💀', '🏆'];
  }
  if (playerCount <= 8) {
    // 7-8 players: blank, Investigation, Succession, Execution, Execution, Victory
    return ['', '🔍', '👑', '💀', '💀', '🏆'];
  }
  // 9-10 players: Investigation, Investigation, Succession, Execution, Execution, Victory
  return ['🔍', '🔍', '👑', '💀', '💀', '🏆'];
}

export default function ProgressionBoards({ plotsCount, editsCount, playerCount }: Props) {
  const { t } = useTranslation();
  const powers = getPowers(playerCount);

  return (
    <div className="progression-boards">
      {/* Conspirators board (plots) — 6 slots */}
      <div className="board conspirators-board">
        <h4>{t('game.conspiracyPlots')}</h4>
        <div className="board-slots">
          {powers.map((power, i) => (
            <div
              key={i}
              className={`board-slot conspirators-marker${i < plotsCount ? ' active' : ''}`}
            >
              <div className="slot-number">{i + 1}</div>
              {power && <div className="power-label">{power}</div>}
            </div>
          ))}
        </div>
      </div>

      {/* Loyalists board (edits) — 5 slots */}
      <div className="board loyalists-board">
        <h4>{t('game.royalEdits')}</h4>
        <div className="board-slots">
          {[1, 2, 3, 4, 5].map(i => (
            <div
              key={i}
              className={`board-slot loyalists-marker${i <= editsCount ? ' active' : ''}`}
            >
              <div className="slot-number">{i}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
