import type { AppState, RoleAssignment } from '@/types/game';
import type { ServerMessage } from '@/types/websocket';

// ---- Actions ----

export type AppAction =
  | { type: 'WS_CONNECTED' }
  | { type: 'WS_DISCONNECTED' }
  | { type: 'WS_RECONNECTING'; attempt: number }
  | { type: 'WS_RECONNECT_FAILED' }
  | { type: 'RECORD_LATENCY'; latency: number }
  | { type: 'WS_MESSAGE'; message: ServerMessage }
  | { type: 'SET_AUTH'; user: { username: string; token: string } }
  | { type: 'LOGOUT' }
  | { type: 'ROLE_REVEAL_DONE' }
  | { type: 'ADD_NOTIFICATION'; message: string }
  | { type: 'REMOVE_NOTIFICATION'; id: string }
  | { type: 'CLEAR_VOTE_DETAILS' }
  | { type: 'CLEAR_PEEK_RESULT' }
  | { type: 'CLEAR_INVESTIGATION_RESULT' }
  | { type: 'CLEAR_SHARE_CARDS' };

// ---- État initial ----

export const initialState: AppState = {
  user: null,
  isAuthenticated: false,
  playerId: null,
  roomId: null,
  isHost: false,
  playerRole: null,
  playerFaction: null,
  knownPlayers: [],
  gameState: null,
  allPlayers: [],
  publicGames: [],
  myGames: [],
  chatMessages: [],
  currentVoteDetails: null,
  votedPlayerIds: [],
  // Legislative session
  isSelectingDecrees: false,
  kingDecrees: null,
  chancellorDecrees: null,
  canVeto: false,
  vetoRejected: false,
  // Executive power
  isUsingPower: false,
  currentPower: null,
  investigatedPlayerIds: [],
  // Power results
  isShowingPowerResult: false,
  peekCards: null,
  investigationResult: null,
  // Veto
  isWaitingForVetoResponse: false,
  pendingVetoResponse: false,
  // Card sharing
  shareCardsRole: null,
  lastReceivedCards: null,
  // Vote
  hasVoted: false,
  // Sound triggers
  lastPlayedDecree: null,
  lastVoteResult: null,
  // Role display
  roleAssignment: null,
  // Game over
  gameOverData: null,
  wsConnected: false,
  wsReconnecting: false,
  wsReconnectAttempt: 0,
  latencies: [],
  notifications: [],
  roleRevealActive: false,
};

// ---- Utilitaire notification ----

let notifCounter = 0;
function makeId(): string {
  return `notif-${Date.now()}-${++notifCounter}`;
}

// ---- Reducer principal ----

export function gameReducer(state: AppState, action: AppAction): AppState {
  switch (action.type) {

    // ---- Connexion WS ----

    case 'WS_CONNECTED':
      return { ...state, wsConnected: true, wsReconnecting: false, wsReconnectAttempt: 0 };

    case 'WS_DISCONNECTED':
      return { ...state, wsConnected: false };

    case 'WS_RECONNECTING':
      return { ...state, wsConnected: false, wsReconnecting: true, wsReconnectAttempt: action.attempt };

    case 'WS_RECONNECT_FAILED':
      return { ...state, wsReconnecting: false };

    case 'RECORD_LATENCY': {
      const updated = [...state.latencies, action.latency];
      if (updated.length > 10) updated.shift();
      return { ...state, latencies: updated };
    }

    // ---- Auth ----

    case 'SET_AUTH':
      return {
        ...state,
        user: action.user,
        isAuthenticated: true,
      };

    case 'LOGOUT':
      return {
        ...initialState,
        wsConnected: state.wsConnected,
      };

    // ---- Role reveal ----

    case 'ROLE_REVEAL_DONE':
      return { ...state, roleRevealActive: false };

    // ---- Notifications ----

    case 'ADD_NOTIFICATION': {
      const id = makeId();
      return {
        ...state,
        notifications: [...state.notifications, { id, message: action.message }],
      };
    }

    case 'REMOVE_NOTIFICATION':
      return {
        ...state,
        notifications: state.notifications.filter(n => n.id !== action.id),
      };

    case 'CLEAR_VOTE_DETAILS':
      return { ...state, currentVoteDetails: null };

    case 'CLEAR_PEEK_RESULT':
      return { ...state, peekCards: null, isShowingPowerResult: false };

    case 'CLEAR_INVESTIGATION_RESULT':
      return { ...state, investigationResult: null, isShowingPowerResult: false };

    case 'CLEAR_SHARE_CARDS':
      return { ...state, shareCardsRole: null, lastReceivedCards: null };

    // ---- Messages WebSocket ----

    case 'WS_MESSAGE':
      return handleServerMessage(state, action.message);

    default:
      return state;
  }
}

// ---- Dispatch des messages serveur ----

function handleServerMessage(state: AppState, msg: ServerMessage): AppState {
  switch (msg.type) {

    case 'login_result':
    case 'register_result': {
      if (msg.success && msg.user) {
        return {
          ...state,
          user: msg.user,
          isAuthenticated: true,
        };
      }
      return state;
    }

    case 'join_game': {
      if (msg.success && msg.data) {
        const { playerId, roomId, isHost } = msg.data;
        return { ...state, playerId, roomId, isHost };
      }
      // Reconnexion échouée → reset room
      return { ...state, roomId: null, isHost: false };
    }

    case 'public_games_list':
      return { ...state, publicGames: msg.data };

    case 'player_games_list':
      return { ...state, myGames: msg.data };

    case 'player_list': {
      const players = msg.data;
      const currentPlayer = players.find(p => p.id === state.playerId);
      const isHost = currentPlayer ? currentPlayer.isHost : state.isHost;
      return { ...state, allPlayers: players, isHost };
    }

    case 'player_joined': {
      const msg2 = msg as { type: 'player_joined'; data: { playerName: string } };
      return addSystemChat(state, `👤 ${msg2.data.playerName} a rejoint la partie`, 'join');
    }

    case 'player_left': {
      const msg2 = msg as { type: 'player_left'; data: { playerName: string } };
      return addSystemChat(state, `👤 ${msg2.data.playerName} a quitté la partie`, 'leave');
    }

    case 'game_state': {
      const gs = msg.data;
      const knownPlayers = gs.knownPlayers ?? state.knownPlayers;

      // Ne pas écraser l'état des décrets/pouvoir en cours
      return {
        ...state,
        gameState: gs,
        knownPlayers,
      };
    }

    case 'role_assignment': {
      const data = msg.data as RoleAssignment;
      return {
        ...state,
        playerRole: data.role,
        playerFaction: data.faction,
        roleAssignment: data,
        knownPlayers: data.allies?.map(a => ({ id: a.id, role: a.role })) ?? [],
        roleRevealActive: true,
        // Reset pour nouvelle partie
        gameState: null,
        currentVoteDetails: null,
        votedPlayerIds: [],
        isSelectingDecrees: false,
        kingDecrees: null,
        chancellorDecrees: null,
        canVeto: false,
        vetoRejected: false,
        isUsingPower: false,
        currentPower: null,
        investigatedPlayerIds: [],
        isShowingPowerResult: false,
        peekCards: null,
        investigationResult: null,
        isWaitingForVetoResponse: false,
        pendingVetoResponse: false,
        shareCardsRole: null,
        lastReceivedCards: null,
        hasVoted: false,
        lastPlayedDecree: null,
        lastVoteResult: null,
        gameOverData: null,
        chatMessages: [],
      };
    }

    case 'vote_result': {
      const { voteResult, voteDetails } = msg.data;
      const passed = voteResult.passed;
      const notifMsg = passed
        ? `✅ Gouvernement élu (${voteResult.yes} OUI, ${voteResult.no} NON)`
        : `❌ Gouvernement rejeté (${voteResult.yes} OUI, ${voteResult.no} NON)`;
      let next = addNotification(state, notifMsg);
      next = {
        ...next,
        votedPlayerIds: [],
        hasVoted: false,
        lastVoteResult: passed ? 'accepted' : 'rejected',
      };
      if (voteDetails) {
        next = { ...next, currentVoteDetails: voteDetails };
      }
      return next;
    }

    case 'vote_status':
      return {
        ...state,
        votedPlayerIds: msg.data.votedPlayerIds,
        // Mark that this player has voted if their id appears in the list
        hasVoted: state.playerId ? msg.data.votedPlayerIds.includes(state.playerId) : state.hasVoted,
      };

    case 'nomination_result': {
      const chancellorName =
        state.allPlayers.find(p => p.id === msg.data.chancellorId)?.name ?? 'Inconnu';
      return addNotification(state, `🎯 ${chancellorName} nominé Chancelier !`);
    }

    case 'decree_passed': {
      const isPlot = msg.data.decree === 'plot';
      const notif = isPlot ? '📜 Un Complot a été adopté !' : '📜 Un Édit Royal a été adopté !';
      let next = addNotification(state, notif);
      const chatMsg = isPlot ? '🗡️ Complot adopté' : '⚜️ Édit Royal adopté';
      next = addSystemChat(next, chatMsg, isPlot ? 'conspirator' : 'loyalist');
      next = {
        ...next,
        lastPlayedDecree: msg.data.decree,
        // Reset legislative flags once decree is passed
        isSelectingDecrees: false,
        kingDecrees: null,
        chancellorDecrees: null,
      };
      return next;
    }

    case 'power_activated':
      return {
        ...state,
        isUsingPower: true,
        currentPower: (msg.data as { power?: string }).power ?? null,
      };

    case 'king_decrees':
      return {
        ...state,
        isSelectingDecrees: true,
        kingDecrees: msg.data.decrees,
        shareCardsRole: 'king',
        lastReceivedCards: { role: 'king', cards: msg.data.decrees as import('@/constants/game').DecreeType[] },
      };

    case 'chancellor_decrees':
      return {
        ...state,
        isSelectingDecrees: true,
        chancellorDecrees: msg.data.decrees,
        // keep vetoRejected if previously set
        shareCardsRole: 'chancellor',
        lastReceivedCards: { role: 'chancellor', cards: msg.data.decrees as import('@/constants/game').DecreeType[] },
      };

    case 'power_result': {
      const powerData = msg.data as { power?: string; result?: unknown };
      let next: AppState = { ...state, isUsingPower: false, isShowingPowerResult: true };

      if (powerData.power === 'peek') {
        next = { ...next, peekCards: (powerData.result as string[]) ?? null };
      } else if (powerData.power === 'investigation') {
        const res = powerData.result as { targetId: string; targetName: string; faction: string };
        next = {
          ...next,
          investigationResult: { targetName: res.targetName, faction: res.faction },
          investigatedPlayerIds: [...state.investigatedPlayerIds, res.targetId],
        };
      }
      return next;
    }

    case 'execution_result': {
      const { executedName, wasUsurper } = msg.data;
      const notif = wasUsurper
        ? `💀 ${executedName} était l'Usurpateur !`
        : `💀 ${executedName} a été exécuté.`;
      return addNotification(state, notif);
    }

    case 'game_over':
      return {
        ...state,
        gameOverData: msg.data,
        isSelectingDecrees: false,
        isUsingPower: false,
        isShowingPowerResult: false,
        isWaitingForVetoResponse: false,
      };

    case 'chat_broadcast':
      return {
        ...state,
        chatMessages: [
          ...state.chatMessages,
          {
            playerName: msg.data.playerName,
            content: msg.data.message,
            timestamp: msg.data.timestamp ?? Date.now(),
          },
        ],
      };

    case 'error':
      return addNotification(state, `❌ ${msg.message}`);

    case 'game_paused':
      return addNotification(state, '⏸️ La partie a été mise en pause');

    case 'game_resumed':
      return addNotification(
        state,
        `▶️ ${(msg.data as { message?: string }).message ?? 'La partie a repris'}`
      );

    case 'veto_proposed':
      return {
        ...state,
        isWaitingForVetoResponse: true,
        pendingVetoResponse: true,
        isSelectingDecrees: false,
        chancellorDecrees: null,
      };

    case 'veto_result': {
      const { accepted, deadlock, autoPassedDecree } = msg.data;
      let notif = accepted
        ? deadlock
          ? `🚫 Véto accepté ! IMPASSE : un ${autoPassedDecree === 'plot' ? 'Complot' : 'Édit'} adopté automatiquement.`
          : '🚫 Véto accepté ! Les 2 cartes ont été défaussées.'
        : '❌ Véto refusé ! Le Chancelier doit choisir une carte.';
      let next = addNotification(state, notif);
      next = {
        ...next,
        isWaitingForVetoResponse: false,
        pendingVetoResponse: false,
        // If veto rejected, chancellor needs to re-select → set vetoRejected flag
        vetoRejected: !accepted,
        // If rejected the chancellor decrees are already on the server;
        // the server will re-send chancellor_decrees message
      };
      return next;
    }

    case 'veto_pending':
      return addNotification(
        state,
        `🚫 ${(msg.data as { chancellorName: string }).chancellorName} propose un véto !`
      );

    case 'player_kicked': {
      const d = msg.data as { reason?: string; kickedPlayerName?: string };
      if (d.reason) {
        // C'est moi qui suis kické → reset room, notif
        return addNotification(
          { ...state, roomId: null, isHost: false, gameState: null },
          `👢 ${d.reason}`
        );
      }
      return addNotification(state, `👢 ${d.kickedPlayerName} a été exclu.`);
    }

    case 'player_banned': {
      const d = msg.data as { reason?: string; bannedPlayerName?: string };
      if (d.reason) {
        return addNotification(
          { ...state, roomId: null, isHost: false, gameState: null },
          `🚫 ${d.reason}`
        );
      }
      return addNotification(state, `🚫 ${d.bannedPlayerName} a été banni.`);
    }

    case 'game_stopped': {
      return addNotification(
        {
          ...state,
          playerRole: null,
          playerFaction: null,
          roleAssignment: null,
          knownPlayers: [],
          gameState: null,
          currentVoteDetails: null,
          votedPlayerIds: [],
          isSelectingDecrees: false,
          kingDecrees: null,
          chancellorDecrees: null,
          canVeto: false,
          vetoRejected: false,
          isUsingPower: false,
          currentPower: null,
          investigatedPlayerIds: [],
          isShowingPowerResult: false,
          peekCards: null,
          investigationResult: null,
          isWaitingForVetoResponse: false,
          pendingVetoResponse: false,
          shareCardsRole: null,
          lastReceivedCards: null,
          hasVoted: false,
          lastPlayedDecree: null,
          lastVoteResult: null,
        },
        `🛑 ${msg.data.message}`
      );
    }

    default:
      return state;
  }
}

// ---- Helpers ----

function addNotification(state: AppState, message: string): AppState {
  return {
    ...state,
    notifications: [...state.notifications, { id: makeId(), message }],
  };
}

function addSystemChat(
  state: AppState,
  message: string,
  systemType: 'conspirator' | 'loyalist' | 'join' | 'leave' | 'system' = 'system'
): AppState {
  return {
    ...state,
    chatMessages: [
      ...state.chatMessages,
      {
        playerName: '⚔️ Action',
        content: message,
        timestamp: Date.now(),
        isSystem: true,
        type: systemType,
        systemType: systemType === 'join' || systemType === 'leave' ? 'system' : systemType,
      },
    ],
  };
}
