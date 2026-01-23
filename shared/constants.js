// shared/constants.js

const MESSAGE_TYPES = {
    // Authentification
    REGISTER: 'register',
    LOGIN: 'login',

    // Gestion des parties
    JOIN_GAME: 'join_game',
    GET_PUBLIC_GAMES: 'get_public_games',
    PUBLIC_GAMES_LIST: 'public_games_list',
    GET_PLAYER_GAMES: 'get_player_games',
    PLAYER_GAMES_LIST: 'player_games_list',
    RECONNECT: 'reconnect',
    START_GAME: 'start_game',
    UPDATE_SETTINGS: 'update_settings',

    // États du jeu
    PLAYER_LIST: 'player_list',
    GAME_STATE: 'game_state',
    PHASE_CHANGE: 'phase_change',
    ROLE_ASSIGNMENT: 'role_assignment',

    // Actions de jeu
    NOMINATE_CHANCELLOR: 'nominate_chancellor',
    NOMINATION_RESULT: 'nomination_result',
    VOTE: 'vote',
    VOTE_STATUS: 'vote_status',
    VOTE_RESULT: 'vote_result',
    DISCARD_DECREE: 'discard_decree',
    DECREE_PASSED: 'decree_passed',

    // Pouvoirs
    USE_POWER: 'use_power',
    POWER_ACTIVATED: 'power_activated',

    // Véto
    PROPOSE_VETO: 'propose_veto',
    VETO_PROPOSED: 'veto_proposed',
    VETO_RESPONSE: 'veto_response',
    VETO_RESULT: 'veto_result',

    // Fin de partie
    GAME_OVER: 'game_over',
    END_TURN: 'end_turn',

    // Pause/Reprise
    GAME_PAUSED: 'game_paused',
    GAME_RESUMED: 'game_resumed',
    FORCE_PAUSE: 'force_pause',
    FORCE_RESUME: 'force_resume',

    // Kick
    KICK_PLAYER: 'kick_player',
    PLAYER_KICKED: 'player_kicked',

    // Chat
    CHAT_MESSAGE: 'chat_message',
    CHAT_BROADCAST: 'chat_broadcast',

    // Erreurs
    ERROR: 'error'
};

const GAME_PHASES = {
    LOBBY: 'lobby',
    ROLE_REVEAL: 'role_reveal',
    NOMINATION: 'nomination',
    COUNCIL_VOTE: 'council_vote',
    LEGISLATIVE: 'legislative',
    EXECUTIVE_POWER: 'executive_power',
    DEBATE: 'debate',
    PAUSED: 'paused',
    GAME_OVER: 'game_over'
};

const ROLES = {
    USURPER: 'usurper',
    CONSPIRATOR: 'conspirator',
    LOYALIST: 'loyalist'
};

const FACTIONS = {
    CONSPIRATORS: 'conspirators',
    LOYALISTS: 'loyalists'
};

const DECREE_TYPES = {
    PLOT: 'plot',
    EDIT: 'edit'
};

const POWERS = {
    INVESTIGATION: 'investigation',
    PEEK: 'peek',
    SPECIAL_DESIGNATION: 'special_designation',
    EXECUTION: 'execution',
    VETO: 'veto'
};

const VOTE_OPTIONS = {
    YES: 'yes',
    NO: 'no'
};

const GAME_CONFIG = {
    MIN_PLAYERS: 5,
    MAX_PLAYERS: 10,
    TOTAL_PLOTS: 11,
    TOTAL_EDITS: 6,
    CONSPIRATOR_PLOTS_TO_WIN: 6,
    LOYALIST_EDITS_TO_WIN: 5,
    USURPER_REVEAL_THRESHOLD: 3,
    MAX_CONSECUTIVE_DEADLOCKS: 3
};

const PLAYER_DISTRIBUTION = {
    5: { conspirators: 1, loyalists: 3 },
    6: { conspirators: 1, loyalists: 4 },
    7: { conspirators: 2, loyalists: 4 },
    8: { conspirators: 2, loyalists: 5 },
    9: { conspirators: 3, loyalists: 5 },
    10: { conspirators: 3, loyalists: 6 }
};

module.exports = {
    MESSAGE_TYPES,
    GAME_PHASES,
    ROLES,
    FACTIONS,
    DECREE_TYPES,
    POWERS,
    VOTE_OPTIONS,
    GAME_CONFIG,
    PLAYER_DISTRIBUTION
};