// Shapes des messages WebSocket serveur → client

import type { GameState, Player, PublicGame, PlayerGame, RoleAssignment, GameOverData, VoteDetail } from './game';

export interface ServerMessageBase {
  type: string;
}

export interface LoginResultMessage extends ServerMessageBase {
  type: 'login_result';
  success: boolean;
  user?: { username: string; token: string };
  error?: string;
}

export interface RegisterResultMessage extends ServerMessageBase {
  type: 'register_result';
  success: boolean;
  user?: { username: string; token: string };
  error?: string;
}

export interface JoinGameMessage extends ServerMessageBase {
  type: 'join_game';
  success: boolean;
  data?: {
    playerId: string;
    roomId: string;
    isHost: boolean;
    reconnected?: boolean;
  };
  error?: string;
}

export interface PublicGamesListMessage extends ServerMessageBase {
  type: 'public_games_list';
  data: PublicGame[];
}

export interface PlayerGamesListMessage extends ServerMessageBase {
  type: 'player_games_list';
  data: PlayerGame[];
}

export interface PlayerListMessage extends ServerMessageBase {
  type: 'player_list';
  data: Player[];
}

export interface PlayerJoinedMessage extends ServerMessageBase {
  type: 'player_joined';
  data: { playerName: string };
}

export interface PlayerLeftMessage extends ServerMessageBase {
  type: 'player_left';
  data: { playerName: string };
}

export interface GameStateMessage extends ServerMessageBase {
  type: 'game_state';
  data: GameState;
}

export interface RoleAssignmentMessage extends ServerMessageBase {
  type: 'role_assignment';
  data: RoleAssignment;
}

export interface PhaseChangeMessage extends ServerMessageBase {
  type: 'phase_change';
  phase: string;
}

export interface NominationResultMessage extends ServerMessageBase {
  type: 'nomination_result';
  data: { chancellorId: string };
}

export interface VoteResultMessage extends ServerMessageBase {
  type: 'vote_result';
  data: {
    voteResult: { passed: boolean; yes: number; no: number };
    voteDetails?: VoteDetail[];
  };
}

export interface VoteStatusMessage extends ServerMessageBase {
  type: 'vote_status';
  data: { votedPlayerIds: string[] };
}

export interface DecreePassedMessage extends ServerMessageBase {
  type: 'decree_passed';
  data: {
    decree: string;
    isDeadlock?: boolean;
    kingName?: string;
    chancellorName?: string;
  };
}

export interface PowerActivatedMessage extends ServerMessageBase {
  type: 'power_activated';
  data: { availablePowers: string[] };
}

export interface GameOverMessage extends ServerMessageBase {
  type: 'game_over';
  data: GameOverData;
}

export interface ChatBroadcastMessage extends ServerMessageBase {
  type: 'chat_broadcast';
  data: { playerName: string; message: string; timestamp: number };
}

export interface ErrorMessage extends ServerMessageBase {
  type: 'error';
  message: string;
}

export interface KingDecreesMessage extends ServerMessageBase {
  type: 'king_decrees';
  data: { decrees: string[] };
}

export interface ChancellorDecreesMessage extends ServerMessageBase {
  type: 'chancellor_decrees';
  data: { decrees: string[]; vetoRejected?: boolean };
}

export interface PowerResultMessage extends ServerMessageBase {
  type: 'power_result';
  data: { power: string; result: Record<string, unknown> };
}

export interface ExecutionResultMessage extends ServerMessageBase {
  type: 'execution_result';
  data: { executedName: string; wasUsurper: boolean };
}

export interface GamePausedMessage extends ServerMessageBase {
  type: 'game_paused';
  data: Record<string, unknown>;
}

export interface GameResumedMessage extends ServerMessageBase {
  type: 'game_resumed';
  data: { message?: string; playerName?: string };
}

export interface VetoProposedMessage extends ServerMessageBase {
  type: 'veto_proposed';
  data: { chancellorName: string };
}

export interface VetoResultMessage extends ServerMessageBase {
  type: 'veto_result';
  data: { accepted: boolean; deadlock?: boolean; autoPassedDecree?: string };
}

export interface VetoPendingMessage extends ServerMessageBase {
  type: 'veto_pending';
  data: { chancellorName: string };
}

export interface PlayerKickedMessage extends ServerMessageBase {
  type: 'player_kicked';
  data: { reason?: string; kickedPlayerName?: string };
}

export interface PlayerBannedMessage extends ServerMessageBase {
  type: 'player_banned';
  data: { reason?: string; bannedPlayerName?: string };
}

export interface GameStoppedMessage extends ServerMessageBase {
  type: 'game_stopped';
  data: { message: string };
}

export interface PongMessage extends ServerMessageBase {
  type: 'pong';
}

export type ServerMessage =
  | LoginResultMessage
  | RegisterResultMessage
  | JoinGameMessage
  | PublicGamesListMessage
  | PlayerGamesListMessage
  | PlayerListMessage
  | PlayerJoinedMessage
  | PlayerLeftMessage
  | GameStateMessage
  | RoleAssignmentMessage
  | PhaseChangeMessage
  | NominationResultMessage
  | VoteResultMessage
  | VoteStatusMessage
  | DecreePassedMessage
  | PowerActivatedMessage
  | GameOverMessage
  | ChatBroadcastMessage
  | ErrorMessage
  | KingDecreesMessage
  | ChancellorDecreesMessage
  | PowerResultMessage
  | ExecutionResultMessage
  | GamePausedMessage
  | GameResumedMessage
  | VetoProposedMessage
  | VetoResultMessage
  | VetoPendingMessage
  | PlayerKickedMessage
  | PlayerBannedMessage
  | GameStoppedMessage
  | PongMessage;
