import { useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useGame } from '@/context/GameContext';
import { useWS } from '@/context/WebSocketContext';
import { MESSAGE_TYPES } from '@/constants/game';
import WaitingPlayerList from './WaitingPlayerList';
import GameSettings from './GameSettings';
import ActivityLog from './ActivityLog';

export default function WaitingRoomScreen() {
  const { t } = useTranslation();
  const { state, dispatch } = useGame();
  const { send } = useWS();
  const navigate = useNavigate();
  const { code } = useParams<{ code: string }>();

  // Aller en jeu quand la partie démarre (role_reveal)
  useEffect(() => {
    if (state.roleRevealActive && state.roomId) {
      navigate(`/game/${state.roomId}`);
    }
  }, [state.roleRevealActive, state.roomId, navigate]);

  // Si game_stopped → retour lobby
  useEffect(() => {
    if (!state.roomId && state.isAuthenticated) {
      navigate('/home');
    }
  }, [state.roomId, state.isAuthenticated, navigate]);

  function handleStartGame() {
    send(MESSAGE_TYPES.START_GAME, {
      playerId: state.playerId,
      roomId: state.roomId,
    });
  }

  function handleLeaveGame() {
    send('leave_game', { playerId: state.playerId, roomId: state.roomId });
    sessionStorage.removeItem('courtOfShadows_roomId');
    dispatch({ type: 'WS_MESSAGE', message: { type: 'join_game', success: false } });
    navigate('/home');
  }

  function handleCopyCode() {
    if (state.roomId) {
      navigator.clipboard.writeText(state.roomId);
      dispatch({ type: 'ADD_NOTIFICATION', message: `📋 ${t('waiting.codeCopied')}` });
    }
  }

  function handleKick(targetId: string) {
    send(MESSAGE_TYPES.KICK_PLAYER, {
      playerId: state.playerId,
      roomId: state.roomId,
      targetPlayerId: targetId,
    });
  }

  function handleBan(targetId: string) {
    send(MESSAGE_TYPES.BAN_PLAYER, {
      playerId: state.playerId,
      roomId: state.roomId,
      targetPlayerId: targetId,
    });
  }

  function handleSettingChange(settings: Partial<Record<string, boolean>>) {
    send(MESSAGE_TYPES.UPDATE_SETTINGS, {
      playerId: state.playerId,
      roomId: state.roomId,
      settings,
    });
  }

  const roomId = state.roomId ?? code ?? '';

  return (
    <div id="waiting-room" className="screen active">
      <div className="waiting-layout">
        <div className="waiting-header">
          <h2>{t('waiting.title')}</h2>
          <div className="room-code-display">
            <span id="display-room-code">{roomId}</span>
            <button id="copy-code-btn" className="btn-icon" onClick={handleCopyCode}>
              📋
            </button>
          </div>
        </div>

        <div className="waiting-content">
          <WaitingPlayerList
            players={state.allPlayers}
            currentPlayerId={state.playerId}
            isHost={state.isHost}
            onKick={handleKick}
            onBan={handleBan}
          />

          <div className="waiting-sidebar">
            {state.gameState?.settings && (
              <GameSettings
                settings={state.gameState.settings}
                isHost={state.isHost}
                playerCount={state.allPlayers.length}
                onChange={handleSettingChange}
              />
            )}

            <ActivityLog messages={state.chatMessages.filter(m => m.isSystem)} />
          </div>
        </div>

        <div className="waiting-actions">
          {state.isHost && (
            <button
              id="start-game-btn"
              className="btn btn-primary"
              onClick={handleStartGame}
              disabled={state.allPlayers.length < 5}
            >
              {t('waiting.startGame')}
            </button>
          )}
          <button id="leave-game-btn" className="btn btn-secondary" onClick={handleLeaveGame}>
            {t('waiting.leaveGame')}
          </button>
        </div>
      </div>
    </div>
  );
}
