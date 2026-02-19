import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useGame } from '@/context/GameContext';
import { useWS } from '@/context/WebSocketContext';
import { MESSAGE_TYPES } from '@/constants/game';
import CreateGameForm from './CreateGameForm';
import JoinGameForm from './JoinGameForm';
import PublicGamesList from './PublicGamesList';
import MyGamesList from './MyGamesList';

export default function LobbyScreen() {
  const { t } = useTranslation();
  const { state, dispatch } = useGame();
  const { send } = useWS();
  const navigate = useNavigate();

  // Redirect si on rejoint une room
  useEffect(() => {
    if (state.roomId) {
      navigate(`/room/${state.roomId}`);
    }
  }, [state.roomId, navigate]);

  // Charger les parties au montage et toutes les 10s
  useEffect(() => {
    function refresh() {
      send(MESSAGE_TYPES.GET_PUBLIC_GAMES);
      if (state.user?.username) {
        send(MESSAGE_TYPES.GET_PLAYER_GAMES, { username: state.user.username });
      }
    }
    refresh();
    const interval = setInterval(refresh, 10000);
    return () => clearInterval(interval);
  }, [send, state.user?.username]);

  function handleLogout() {
    localStorage.removeItem('courtOfShadows_user');
    sessionStorage.removeItem('tempPassword');
    sessionStorage.removeItem('courtOfShadows_roomId');
    dispatch({ type: 'LOGOUT' });
    navigate('/login', { replace: true });
  }

  function handleCreateGame(isPublic: boolean, password: string | null) {
    send(MESSAGE_TYPES.JOIN_GAME, {
      playerName: state.user?.username,
      username: state.user?.username,
      isPublic,
      password,
    });
  }

  function handleJoinGame(roomCode: string, password: string | null) {
    send(MESSAGE_TYPES.JOIN_GAME, {
      playerName: state.user?.username,
      username: state.user?.username,
      roomId: roomCode,
      password,
    });
  }

  function handleJoinPublicGame(roomId: string) {
    send(MESSAGE_TYPES.JOIN_GAME, {
      playerName: state.user?.username,
      username: state.user?.username,
      roomId,
      isPublic: true,
    });
  }

  function handleReconnect(roomId: string) {
    send(MESSAGE_TYPES.RECONNECT, {
      playerName: state.user?.username,
      roomId,
    });
  }

  return (
    <div id="lobby-screen" className="screen active">
      <div className="lobby-layout">
        <div className="lobby-content">
          <div className="lobby-header">
            <h1 className="title">{t('lobby.title')}</h1>
            <div className="user-info">
              <span>{t('lobby.welcome')}</span>
              <strong id="logged-username">{state.user?.username}</strong>
              <button className="btn-icon" onClick={handleLogout} title={t('auth.logout')}>
                {t('auth.logout')}
              </button>
            </div>
          </div>

          <div className="lobby-grid">
            <div className="lobby-column lobby-actions">
              <CreateGameForm onSubmit={handleCreateGame} />
              <JoinGameForm onSubmit={handleJoinGame} />
            </div>

            <div className="lobby-column lobby-games">
              <PublicGamesList
                games={state.publicGames}
                onJoin={handleJoinPublicGame}
                onRefresh={() => send(MESSAGE_TYPES.GET_PUBLIC_GAMES)}
              />
              <MyGamesList
                games={state.myGames}
                onReconnect={handleReconnect}
                onRefresh={() => {
                  if (state.user?.username)
                    send(MESSAGE_TYPES.GET_PLAYER_GAMES, { username: state.user.username });
                }}
              />
            </div>
          </div>

          <div className="lobby-footer">
            <button
              id="show-rules-btn"
              className="btn btn-secondary"
              onClick={() => navigate('/rules')}
            >
              📖 {t('lobby.rules')}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
