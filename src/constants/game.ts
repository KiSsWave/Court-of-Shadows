// Constantes du jeu Court of Shadows — port TypeScript de public/js/constants.js

export const GAME_CONFIG = {
  MIN_PLAYERS: 5,
  MAX_PLAYERS: 10,
  LOYALIST_EDITS_TO_WIN: 5,
  CONSPIRATOR_PLOTS_TO_WIN: 6,
  USURPER_REVEAL_THRESHOLD: 3,
  MAX_CONSECUTIVE_DEADLOCKS: 3,
  TOTAL_PLOTS: 11,
  TOTAL_EDITS: 6,
  TOTAL_DECREES: 17,
} as const;

export const PLAYER_DISTRIBUTION: Record<number, { usurper: number; loyalists: number; conspirators: number }> = {
  5: { usurper: 1, loyalists: 3, conspirators: 1 },
  6: { usurper: 1, loyalists: 4, conspirators: 1 },
  7: { usurper: 1, loyalists: 4, conspirators: 2 },
  8: { usurper: 1, loyalists: 5, conspirators: 2 },
  9: { usurper: 1, loyalists: 5, conspirators: 3 },
  10: { usurper: 1, loyalists: 6, conspirators: 3 },
};

export const ROLES = {
  USURPER: 'usurper',
  CONSPIRATOR: 'conspirator',
  LOYALIST: 'loyalist',
} as const;

export const FACTIONS = {
  CONSPIRATORS: 'conspirators',
  LOYALISTS: 'loyalists',
} as const;

export const DECREE_TYPES = {
  PLOT: 'plot',
  EDIT: 'edit',
} as const;

export const POWERS = {
  INVESTIGATION: 'investigation',
  PEEK: 'peek',
  SPECIAL_DESIGNATION: 'designation',
  EXECUTION: 'execution',
  VETO: 'veto',
} as const;

export const GAME_PHASES = {
  LOBBY: 'lobby',
  ROLE_REVEAL: 'role_reveal',
  NOMINATION: 'nomination',
  COUNCIL_VOTE: 'council_vote',
  LEGISLATIVE: 'legislative',
  EXECUTIVE_POWER: 'executive_power',
  DEBATE: 'debate',
  GAME_OVER: 'game_over',
  PAUSED: 'paused',
} as const;

export const MESSAGE_TYPES = {
  // Client → Server
  JOIN_GAME: 'join_game',
  GET_PUBLIC_GAMES: 'get_public_games',
  PUBLIC_GAMES_LIST: 'public_games_list',
  GET_PLAYER_GAMES: 'get_player_games',
  PLAYER_GAMES_LIST: 'player_games_list',
  RECONNECT: 'reconnect',
  START_GAME: 'start_game',
  UPDATE_SETTINGS: 'update_settings',
  NOMINATE_CHANCELLOR: 'nominate_chancellor',
  VOTE: 'vote',
  DISCARD_DECREE: 'discard_decree',
  USE_POWER: 'use_power',
  CHAT_MESSAGE: 'chat_message',
  END_TURN: 'end_turn',
  PROPOSE_VETO: 'propose_veto',
  REQUEST_VETO: 'propose_veto',   // alias utilisé côté chancelier
  PLAY_DECREE: 'play_decree',     // alias pour discard côté chancelier
  VETO_RESPONSE: 'veto_response',
  RESUME_GAME: 'force_resume',    // alias utilisé par PausedView
  FORCE_PAUSE: 'force_pause',
  FORCE_RESUME: 'force_resume',
  KICK_PLAYER: 'kick_player',
  BAN_PLAYER: 'ban_player',
  STOP_GAME: 'stop_game',

  // Server → Client
  GAME_STATE: 'game_state',
  PLAYER_LIST: 'player_list',
  ROLE_ASSIGNMENT: 'role_assignment',
  PHASE_CHANGE: 'phase_change',
  NOMINATION_RESULT: 'nomination_result',
  VOTE_RESULT: 'vote_result',
  VOTE_DETAILS: 'vote_details',
  VOTE_STATUS: 'vote_status',
  DECREE_PASSED: 'decree_passed',
  POWER_ACTIVATED: 'power_activated',
  GAME_OVER: 'game_over',
  GAME_PAUSED: 'game_paused',
  GAME_RESUMED: 'game_resumed',
  ERROR: 'error',
  CHAT_BROADCAST: 'chat_broadcast',
  VETO_PROPOSED: 'veto_proposed',
  VETO_RESULT: 'veto_result',
  PLAYER_KICKED: 'player_kicked',
  PLAYER_BANNED: 'player_banned',
  GAME_STOPPED: 'game_stopped',
} as const;

export const VOTE_OPTIONS = {
  YES: 'yes',
  NO: 'no',
} as const;

// Types dérivés
export type Role = typeof ROLES[keyof typeof ROLES];
export type Faction = typeof FACTIONS[keyof typeof FACTIONS];
export type DecreeType = typeof DECREE_TYPES[keyof typeof DECREE_TYPES];
export type Power = typeof POWERS[keyof typeof POWERS];
export type GamePhase = typeof GAME_PHASES[keyof typeof GAME_PHASES];
export type MessageType = typeof MESSAGE_TYPES[keyof typeof MESSAGE_TYPES];
export type VoteOption = typeof VOTE_OPTIONS[keyof typeof VOTE_OPTIONS];
