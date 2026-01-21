// Constantes du jeu Court of Shadows (version client - navigateur)

const GAME_CONFIG = {
    MIN_PLAYERS: 5,
    MAX_PLAYERS: 10,

    // Objectifs de victoire
    LOYALIST_EDITS_TO_WIN: 5,
    CONSPIRATOR_PLOTS_TO_WIN: 6,
    USURPER_REVEAL_THRESHOLD: 3,

    // Impasse
    MAX_CONSECUTIVE_DEADLOCKS: 3,

    // Nombre de cartes
    TOTAL_PLOTS: 11,
    TOTAL_EDITS: 6,
    TOTAL_DECREES: 17
};

const PLAYER_DISTRIBUTION = {
    5: { usurper: 1, loyalists: 3, conspirators: 1 },
    6: { usurper: 1, loyalists: 4, conspirators: 1 },
    7: { usurper: 1, loyalists: 4, conspirators: 2 },
    8: { usurper: 1, loyalists: 5, conspirators: 2 },
    9: { usurper: 1, loyalists: 5, conspirators: 3 },
    10: { usurper: 1, loyalists: 6, conspirators: 3 }
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
    INVESTIGATION: 'investigation',      // Voir la faction d'un joueur
    PEEK: 'peek',                         // Voir les 3 prochaines cartes de la pioche
    SPECIAL_DESIGNATION: 'designation',   // Choisir le prochain roi
    EXECUTION: 'execution',               // Éliminer un joueur
    VETO: 'veto'                          // Annuler les cartes (5ème complot)
};

const GAME_PHASES = {
    LOBBY: 'lobby',
    ROLE_REVEAL: 'role_reveal',
    NOMINATION: 'nomination',
    COUNCIL_VOTE: 'council_vote',
    LEGISLATIVE: 'legislative',
    EXECUTIVE_POWER: 'executive_power',
    DEBATE: 'debate',
    GAME_OVER: 'game_over',
    PAUSED: 'paused'
};

const MESSAGE_TYPES = {
    // Client -> Server
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
    VETO_RESPONSE: 'veto_response',
    FORCE_PAUSE: 'force_pause',
    FORCE_RESUME: 'force_resume',

    // Server -> Client
    GAME_STATE: 'game_state',
    PLAYER_LIST: 'player_list',
    ROLE_ASSIGNMENT: 'role_assignment',
    PHASE_CHANGE: 'phase_change',
    NOMINATION_RESULT: 'nomination_result',
    VOTE_RESULT: 'vote_result',
    VOTE_DETAILS: 'vote_details',
    DECREE_PASSED: 'decree_passed',
    POWER_ACTIVATED: 'power_activated',
    GAME_OVER: 'game_over',
    GAME_PAUSED: 'game_paused',
    GAME_RESUMED: 'game_resumed',
    VOTE_STATUS: 'vote_status',
    ERROR: 'error',
    CHAT_BROADCAST: 'chat_broadcast',
    VETO_PROPOSED: 'veto_proposed',
    VETO_RESULT: 'veto_result'
};

const VOTE_OPTIONS = {
    YES: 'yes',
    NO: 'no'
};