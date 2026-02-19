import { useTranslation } from 'react-i18next';
import { useGame } from '@/context/GameContext';
import { GAME_PHASES } from '@/constants/game';

import WaitingView from './actions/WaitingView';
import SpectatorView from './actions/SpectatorView';
import NominationAction from './actions/NominationAction';
import VoteAction from './actions/VoteAction';
import KingDecreesAction from './actions/KingDecreesAction';
import ChancellorDecreesAction from './actions/ChancellorDecreesAction';
import VetoResponseAction from './actions/VetoResponseAction';
import InvestigationAction from './actions/InvestigationAction';
import PeekAction from './actions/PeekAction';
import DesignationAction from './actions/DesignationAction';
import ExecutionAction from './actions/ExecutionAction';
import DebateView from './actions/DebateView';
import PeekResultView from './actions/PeekResultView';
import InvestigationResultView from './actions/InvestigationResultView';
import PausedView from './actions/PausedView';

interface Props {
  onActionSent: () => void;
}

export default function ActionContainer({ onActionSent }: Props) {
  const { t } = useTranslation();
  const { state, dispatch } = useGame();
  const gs = state.gameState;
  const playerId = state.playerId;

  // Dead player → spectator
  const myPlayer = state.allPlayers.find(p => p.id === playerId);
  if (!myPlayer?.isAlive) {
    return (
      <div id="action-container" className="action-container">
        <SpectatorView />
      </div>
    );
  }

  if (!gs) {
    return (
      <div id="action-container" className="action-container">
        <WaitingView message={t('actions.waitingStart')} />
      </div>
    );
  }

  const isKing = gs.currentKingId === playerId;
  const isChancellor = gs.currentChancellorId === playerId;
  const chancellorName =
    state.allPlayers.find(p => p.id === gs.nominatedChancellorId)?.name ??
    state.allPlayers.find(p => p.id === gs.currentChancellorId)?.name ??
    '?';

  // --- Show investigation result (persists until dismissed) ---
  if (state.investigationResult) {
    return (
      <div id="action-container" className="action-container">
        <InvestigationResultView
          targetName={state.investigationResult.targetName}
          faction={state.investigationResult.faction}
          onClose={() => dispatch({ type: 'CLEAR_INVESTIGATION_RESULT' })}
        />
      </div>
    );
  }

  // --- Show peek result (persists until dismissed) ---
  if (state.peekCards) {
    return (
      <div id="action-container" className="action-container">
        <PeekResultView
          cards={state.peekCards}
          onClose={() => dispatch({ type: 'CLEAR_PEEK_RESULT' })}
        />
      </div>
    );
  }

  // --- Veto response (king must respond) ---
  if (state.pendingVetoResponse && isKing) {
    const chName = state.allPlayers.find(p => p.id === gs.currentChancellorId)?.name ?? '?';
    return (
      <div id="action-container" className="action-container">
        <VetoResponseAction chancellorName={chName} onSent={onActionSent} />
      </div>
    );
  }

  // --- Selecting decrees (king) ---
  if (state.isSelectingDecrees && isKing && state.kingDecrees) {
    return (
      <div id="action-container" className="action-container">
        <KingDecreesAction decrees={state.kingDecrees} onSent={onActionSent} />
      </div>
    );
  }

  // --- Selecting decrees (chancellor) ---
  if (state.isSelectingDecrees && isChancellor && state.chancellorDecrees) {
    return (
      <div id="action-container" className="action-container">
        <ChancellorDecreesAction
          decrees={state.chancellorDecrees}
          canVeto={state.canVeto ?? false}
          vetoRejected={state.vetoRejected ?? false}
          onSent={onActionSent}
        />
      </div>
    );
  }

  // --- Executive power (king is using power) ---
  if (gs.phase === GAME_PHASES.EXECUTIVE_POWER && isKing && state.isUsingPower) {
    const activePlayers = state.allPlayers.filter(p => p.isAlive && p.id !== playerId);
    const alreadyInvestigated = state.investigatedPlayerIds ?? [];
    const eligibleForInvestigation = activePlayers.filter(p => !alreadyInvestigated.includes(p.id));

    switch (state.currentPower) {
      case 'investigation':
        return (
          <div id="action-container" className="action-container">
            <InvestigationAction eligiblePlayers={eligibleForInvestigation} onSent={onActionSent} />
          </div>
        );
      case 'peek':
        return (
          <div id="action-container" className="action-container">
            <PeekAction onSent={onActionSent} />
          </div>
        );
      case 'special_designation':
        return (
          <div id="action-container" className="action-container">
            <DesignationAction eligiblePlayers={activePlayers} onSent={onActionSent} />
          </div>
        );
      case 'execution':
        return (
          <div id="action-container" className="action-container">
            <ExecutionAction eligiblePlayers={activePlayers} onSent={onActionSent} />
          </div>
        );
    }
  }

  // --- Phase-based views ---
  switch (gs.phase) {
    case GAME_PHASES.NOMINATION:
      if (isKing) {
        // Eligible = alive, not self, not previous king/chancellor depending on settings
        const eligible = state.allPlayers.filter(
          p => p.isAlive && p.id !== playerId && p.id !== gs.previousChancellorId
        );
        return (
          <div id="action-container" className="action-container">
            <NominationAction eligiblePlayers={eligible} onSent={onActionSent} />
          </div>
        );
      }
      return (
        <div id="action-container" className="action-container">
          <WaitingView message={t('actions.waitingNomination')} />
        </div>
      );

    case GAME_PHASES.COUNCIL_VOTE:
      if (!state.hasVoted) {
        return (
          <div id="action-container" className="action-container">
            <VoteAction chancellorName={chancellorName} onSent={onActionSent} />
          </div>
        );
      }
      return (
        <div id="action-container" className="action-container">
          <WaitingView message={t('actions.waitingVote')} />
        </div>
      );

    case GAME_PHASES.LEGISLATIVE:
      return (
        <div id="action-container" className="action-container">
          <WaitingView message={t('actions.legislativeInProgress')} />
        </div>
      );

    case GAME_PHASES.EXECUTIVE_POWER:
      if (isKing) {
        return (
          <div id="action-container" className="action-container">
            <WaitingView message={t('actions.preparePower')} />
          </div>
        );
      }
      return (
        <div id="action-container" className="action-container">
          <WaitingView message={t('actions.kingUsingPower')} />
        </div>
      );

    case GAME_PHASES.DEBATE:
      return (
        <div id="action-container" className="action-container">
          <DebateView isKing={isKing} />
        </div>
      );

    case GAME_PHASES.PAUSED:
      return (
        <div id="action-container" className="action-container">
          <PausedView isHost={state.isHost} reason={gs.pauseReason} />
        </div>
      );

    default:
      return (
        <div id="action-container" className="action-container">
          <WaitingView message={t('actions.waitingStart')} />
        </div>
      );
  }
}
