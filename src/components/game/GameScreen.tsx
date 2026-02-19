import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGame } from '@/context/GameContext';
import { useSoundManager } from '@/hooks/useSoundManager';
import { GAME_PHASES, DECREE_TYPES } from '@/constants/game';
import RoleRevealScreen from '@/components/role-reveal/RoleRevealScreen';
import GameHeader from './GameHeader';
import ProgressionBoards from './ProgressionBoards';
import GamePlayersList from './GamePlayersList';
import ActionContainer from './ActionContainer';
import GameChat from './GameChat';

export default function GameScreen() {
  const { state, dispatch } = useGame();
  const navigate = useNavigate();
  const sounds = useSoundManager();
  const [waitingAfterAction, setWaitingAfterAction] = useState(false);
  const gs = state.gameState;

  // Navigate back to lobby when game stops
  useEffect(() => {
    if (!state.roomId && state.isAuthenticated) {
      navigate('/home');
    }
  }, [state.roomId, state.isAuthenticated, navigate]);

  // Navigate to game-over when game ends
  useEffect(() => {
    if (state.gameOverData) {
      navigate('/game-over');
    }
  }, [state.gameOverData, navigate]);

  // Play sounds on board changes
  useEffect(() => {
    if (!gs) return;
    // These effects are triggered by state changes coming from the server;
    // sound hooks react to the transition, not the absolute value.
  }, [gs?.plotsCount, gs?.editsCount]);

  // Play sounds on decree played
  useEffect(() => {
    if (!state.lastPlayedDecree) return;
    if (state.lastPlayedDecree === DECREE_TYPES.PLOT) {
      sounds.playPlotPassed();
    } else {
      sounds.playEditPassed();
    }
  }, [state.lastPlayedDecree]);

  // Play vote sounds
  useEffect(() => {
    if (!state.lastVoteResult) return;
    if (state.lastVoteResult === 'accepted') {
      sounds.playVoteAccepted();
    } else {
      sounds.playVoteRejected();
    }
  }, [state.lastVoteResult]);

  function handleActionSent() {
    setWaitingAfterAction(true);
    // Reset after brief delay; server will update phase
    setTimeout(() => setWaitingAfterAction(false), 500);
  }

  // Show role reveal overlay until dismissed (4s timer inside RoleRevealScreen)
  if (state.roleRevealActive) {
    return <RoleRevealScreen />;
  }

  const playerCount = state.allPlayers.length;

  return (
    <div id="game-screen" className="screen active">
      <div className="game-layout">
        {/* Top bar: phase, government, scores */}
        <GameHeader state={state} />

        <div className="game-content">
          {/* Left: player list */}
          <aside className="game-sidebar game-sidebar-left">
            <GamePlayersList
              players={state.allPlayers}
              playerOrder={gs?.playerOrder}
              currentKingId={gs?.currentKingId}
              currentChancellorId={gs?.currentChancellorId}
              nominatedChancellorId={gs?.nominatedChancellorId}
              knownPlayers={state.knownPlayers}
              currentPlayerId={state.playerId}
              lastVotes={gs?.lastVotes}
            />
          </aside>

          {/* Center: action area + boards */}
          <main className="game-main">
            <ProgressionBoards
              plotsCount={gs?.plotsCount ?? 0}
              editsCount={gs?.editsCount ?? 0}
              playerCount={playerCount}
            />

            {!waitingAfterAction && (
              <ActionContainer onActionSent={handleActionSent} />
            )}
          </main>

          {/* Right: chat */}
          <aside className="game-sidebar game-sidebar-right">
            <GameChat />
          </aside>
        </div>
      </div>
    </div>
  );
}
