const {
    GAME_CONFIG,
    PLAYER_DISTRIBUTION,
    ROLES,
    FACTIONS,
    DECREE_TYPES,
    POWERS,
    GAME_PHASES,
    MESSAGE_TYPES
} = require('../shared/constants');

class Game {
    constructor(roomId) {
        this.roomId = roomId;
        this.players = new Map(); // playerId -> player object
        this.phase = GAME_PHASES.LOBBY;

        // État du jeu
        this.currentKingId = null;
        this.currentChancellorId = null;
        this.previousKingId = null;
        this.previousChancellorId = null;

        // Deck de décrets
        this.deck = [];
        this.discardPile = [];

        // Progression
        this.plotsCount = 0;
        this.editsCount = 0;
        this.deadlockCount = 0;

        // Vote
        this.votes = new Map(); // playerId -> vote
        this.nominatedChancellorId = null;

        // Pouvoir exécutif
        this.availablePowers = new Set();
        this.usurpaterRevealed = false;

        // Joueurs éliminés
        this.eliminatedPlayers = new Set();

        // Session législative
        this.currentDecrees = []; // Cartes en main du roi/chancelier
        this.vetoPending = false; // True si le chancelier a proposé un véto

        // Système de pause/reconnexion
        this.isPaused = false;
        this.disconnectedPlayers = new Map(); // username -> { playerId, playerData }
        this.pausedPhase = null; // Phase sauvegardée avant pause

        // Ordre des joueurs (défini aléatoirement au démarrage)
        this.playerOrder = []; // Array d'IDs dans l'ordre de jeu

        // Paramètres de la partie
        this.settings = {
            conspiratorsKnowUsurper: false, // Par défaut, les conspirateurs ne voient pas l'usurpateur
            usurperKnowsAllies: false, // Par défaut, l'usurpateur ne voit pas ses alliés
            limitedConspiratorsKnowledge: false, // 9-10 joueurs: chaque conspirateur ne connaît qu'un seul allié (chaîne circulaire)
            previousKingCannotBeChancellor: false // Le roi précédent ne peut pas être élu chancelier
        };

        // Créateur de la partie
        this.hostId = null;

        // Joueurs bannis (par username)
        this.bannedPlayers = new Set();
    }

    // === PARAMÈTRES DE LA PARTIE ===

    updateSettings(settings) {
        if (this.phase !== GAME_PHASES.LOBBY) {
            throw new Error('Impossible de modifier les paramètres en cours de partie');
        }
        if (settings.conspiratorsKnowUsurper !== undefined) {
            this.settings.conspiratorsKnowUsurper = settings.conspiratorsKnowUsurper;
        }
        if (settings.usurperKnowsAllies !== undefined) {
            this.settings.usurperKnowsAllies = settings.usurperKnowsAllies;
        }
        if (settings.limitedConspiratorsKnowledge !== undefined) {
            // Cette option n'est disponible que pour 9-10 joueurs
            this.settings.limitedConspiratorsKnowledge = settings.limitedConspiratorsKnowledge;
        }
        if (settings.previousKingCannotBeChancellor !== undefined) {
            this.settings.previousKingCannotBeChancellor = settings.previousKingCannotBeChancellor;
        }
    }

    // === GESTION DES JOUEURS ===

    addPlayer(playerId, playerName) {
        if (this.players.size >= GAME_CONFIG.MAX_PLAYERS) {
            throw new Error('La partie est complète');
        }

        if (this.phase !== GAME_PHASES.LOBBY) {
            throw new Error('La partie a déjà commencé');
        }

        const isFirstPlayer = this.players.size === 0;
        this.players.set(playerId, {
            id: playerId,
            name: playerName,
            role: null,
            faction: null,
            isAlive: true,
            isHost: isFirstPlayer
        });

        // Définir le créateur de la partie
        if (isFirstPlayer) {
            this.hostId = playerId;
        }
    }

    removePlayer(playerId) {
        this.players.delete(playerId);

        // Si l'hôte part, transférer à un autre joueur
        if (this.players.size > 0 && !Array.from(this.players.values()).some(p => p.isHost)) {
            const newHost = Array.from(this.players.values())[0];
            newHost.isHost = true;
            this.hostId = newHost.id;
        }
    }

    kickPlayer(hostId, targetPlayerId) {
        if (this.phase !== GAME_PHASES.LOBBY) {
            throw new Error('Impossible de kick un joueur en cours de partie');
        }

        const host = this.players.get(hostId);
        if (!host || !host.isHost) {
            throw new Error('Seul le créateur peut kick un joueur');
        }

        if (hostId === targetPlayerId) {
            throw new Error('Vous ne pouvez pas vous kick vous-même');
        }

        const targetPlayer = this.players.get(targetPlayerId);
        if (!targetPlayer) {
            throw new Error('Joueur introuvable');
        }

        const playerName = targetPlayer.name;
        this.players.delete(targetPlayerId);

        return { kickedPlayerName: playerName };
    }

    banPlayer(hostId, targetPlayerId) {
        if (this.phase !== GAME_PHASES.LOBBY) {
            throw new Error('Impossible de bannir un joueur en cours de partie');
        }

        const host = this.players.get(hostId);
        if (!host || !host.isHost) {
            throw new Error('Seul le créateur peut bannir un joueur');
        }

        if (hostId === targetPlayerId) {
            throw new Error('Vous ne pouvez pas vous bannir vous-même');
        }

        const targetPlayer = this.players.get(targetPlayerId);
        if (!targetPlayer) {
            throw new Error('Joueur introuvable');
        }

        const playerName = targetPlayer.name;

        // Ajouter à la liste des bannis
        this.bannedPlayers.add(playerName);

        // Retirer le joueur de la partie
        this.players.delete(targetPlayerId);

        return { bannedPlayerName: playerName };
    }

    isPlayerBanned(username) {
        return this.bannedPlayers.has(username);
    }

    // === DÉMARRAGE DU JEU ===

    canStart() {
        const playerCount = this.players.size;
        return playerCount >= GAME_CONFIG.MIN_PLAYERS &&
            playerCount <= GAME_CONFIG.MAX_PLAYERS;
    }

    startGame() {
        if (!this.canStart()) {
            throw new Error(`Il faut entre ${GAME_CONFIG.MIN_PLAYERS} et ${GAME_CONFIG.MAX_PLAYERS} joueurs`);
        }

        // Définir l'ordre aléatoire des joueurs
        this.playerOrder = Array.from(this.players.keys());
        this.shuffleArray(this.playerOrder);

        this.assignRoles();
        this.initializeDeck();
        this.selectRandomKing();
        this.phase = GAME_PHASES.ROLE_REVEAL;

        // Après 2 secondes, passer à la nomination
        setTimeout(() => {
            if (!this.isPaused) {
                this.phase = GAME_PHASES.NOMINATION;
            }
        }, 2000);
    }

    assignRoles() {
        const playerCount = this.players.size;
        const distribution = PLAYER_DISTRIBUTION[playerCount];

        const roles = [
            ROLES.USURPER,
            ...Array(distribution.conspirators).fill(ROLES.CONSPIRATOR),
            ...Array(distribution.loyalists).fill(ROLES.LOYALIST)
        ];

        // Mélanger les rôles
        this.shuffleArray(roles);

        const playerArray = Array.from(this.players.values());
        playerArray.forEach((player, index) => {
            player.role = roles[index];
            player.faction = (player.role === ROLES.LOYALIST) ? FACTIONS.LOYALISTS : FACTIONS.CONSPIRATORS;
        });
    }

    initializeDeck() {
        this.deck = [
            ...Array(GAME_CONFIG.TOTAL_PLOTS).fill(DECREE_TYPES.PLOT),
            ...Array(GAME_CONFIG.TOTAL_EDITS).fill(DECREE_TYPES.EDIT)
        ];
        this.shuffleArray(this.deck);
    }

    selectRandomKing() {
        const alivePlayers = this.getAlivePlayers();
        const randomPlayer = alivePlayers[Math.floor(Math.random() * alivePlayers.length)];
        this.currentKingId = randomPlayer.id;
    }

    // === NOMINATION ===

    nominateChancellor(kingId, chancellorId) {
        if (this.phase !== GAME_PHASES.NOMINATION) {
            throw new Error('Ce n\'est pas le moment de nominer un chancelier');
        }

        if (kingId !== this.currentKingId) {
            throw new Error('Vous n\'êtes pas le roi');
        }

        const chancellor = this.players.get(chancellorId);
        if (!chancellor || !chancellor.isAlive) {
            throw new Error('Joueur invalide');
        }

        // Vérifier l'inéligibilité (seul le chancelier précédent est inéligible)
        if (chancellorId === this.previousChancellorId) {
            throw new Error('Ce joueur est temporairement inéligible');
        }

        // Vérifier si le roi précédent est inéligible (si l'option est activée)
        if (this.settings.previousKingCannotBeChancellor && chancellorId === this.previousKingId) {
            throw new Error('Le roi précédent ne peut pas être élu chancelier');
        }

        this.nominatedChancellorId = chancellorId;
        this.votes.clear();
        this.phase = GAME_PHASES.COUNCIL_VOTE;
    }

    // === VOTE ===

    castVote(playerId, vote) {
        if (this.phase !== GAME_PHASES.COUNCIL_VOTE) {
            throw new Error('Ce n\'est pas le moment de voter');
        }

        const player = this.players.get(playerId);
        if (!player || !player.isAlive) {
            throw new Error('Vous ne pouvez pas voter');
        }

        this.votes.set(playerId, vote);

        // Retourner true si tous les votes sont reçus (le serveur gère resolveVote)
        return this.votes.size === this.getAlivePlayers().length;
    }

    resolveVote() {
        const yesVotes = Array.from(this.votes.values()).filter(v => v === 'yes').length;
        const noVotes = Array.from(this.votes.values()).filter(v => v === 'no').length;

        const voteResult = {
            yes: yesVotes,
            no: noVotes,
            passed: yesVotes > noVotes
        };

        if (voteResult.passed) {
            // Vote réussi
            this.currentChancellorId = this.nominatedChancellorId;
            this.deadlockCount = 0;

            // Vérifier si c'est l'usurpateur après 3 complots
            if (this.plotsCount >= GAME_CONFIG.USURPER_REVEAL_THRESHOLD) {
                const chancellor = this.players.get(this.currentChancellorId);
                if (chancellor.role === ROLES.USURPER) {
                    this.endGame(FACTIONS.CONSPIRATORS, 'L\'Usurpateur est devenu Chancelier !');
                    return { voteResult, gameOver: true };
                }
            }

            this.phase = GAME_PHASES.LEGISLATIVE;
            return { voteResult, gameOver: false };
        } else {
            // Vote échoué
            this.deadlockCount++;

            if (this.deadlockCount >= GAME_CONFIG.MAX_CONSECUTIVE_DEADLOCKS) {
                // Adopter automatiquement la première carte
                const decree = this.deck.shift();
                this.passDecree(decree);
                this.deadlockCount = 0;

                // Ne pas faire de rotation ici - elle sera faite dans endTurn() après le débat
                // (ou après le pouvoir exécutif s'il y en a un)
                return { voteResult, autoPass: decree, gameOver: false, hasPower: this.phase === GAME_PHASES.EXECUTIVE_POWER };
            } else {
                // Rotation du roi
                this.rotateKing();
                this.phase = GAME_PHASES.NOMINATION;
                return { voteResult, gameOver: false };
            }
        }
    }

    // === SESSION LÉGISLATIVE ===

    kingDrawDecrees() {
        if (this.phase !== GAME_PHASES.LEGISLATIVE) {
            throw new Error('Ce n\'est pas la phase législative');
        }

        // Vérifier si le deck a assez de cartes
        if (this.deck.length < 3) {
            this.reshuffleDeck();
        }

        this.currentDecrees = [
            this.deck.shift(),
            this.deck.shift(),
            this.deck.shift()
        ];

        return this.currentDecrees;
    }

    kingDiscardDecree(kingId, discardedIndex) {
        if (kingId !== this.currentKingId) {
            throw new Error('Vous n\'êtes pas le roi');
        }

        if (this.currentDecrees.length !== 3) {
            throw new Error('État invalide');
        }

        const discarded = this.currentDecrees.splice(discardedIndex, 1)[0];
        this.discardPile.push(discarded);

        // Les 2 cartes restantes vont au chancelier
        return this.currentDecrees;
    }

    chancellorDiscardDecree(chancellorId, discardedIndex) {
        if (chancellorId !== this.currentChancellorId) {
            throw new Error('Vous n\'êtes pas le chancelier');
        }

        if (this.currentDecrees.length !== 2) {
            throw new Error('État invalide');
        }

        const discarded = this.currentDecrees.splice(discardedIndex, 1)[0];
        this.discardPile.push(discarded);

        // La carte restante est adoptée
        const passedDecree = this.currentDecrees[0];
        this.passDecree(passedDecree);

        return passedDecree;
    }

    // Vérifie si le véto est disponible (5 complots adoptés)
    isVetoUnlocked() {
        return this.plotsCount >= 5;
    }

    // Le chancelier propose un véto
    proposeVeto(chancellorId) {
        if (chancellorId !== this.currentChancellorId) {
            throw new Error('Vous n\'êtes pas le chancelier');
        }

        if (!this.isVetoUnlocked()) {
            throw new Error('Le véto n\'est pas encore disponible');
        }

        if (this.currentDecrees.length !== 2) {
            throw new Error('État invalide');
        }

        this.vetoPending = true;
        return true;
    }

    // Le roi répond au véto
    respondToVeto(kingId, accepted) {
        if (kingId !== this.currentKingId) {
            throw new Error('Vous n\'êtes pas le roi');
        }

        if (!this.vetoPending) {
            throw new Error('Aucun véto en attente');
        }

        this.vetoPending = false;

        if (accepted) {
            // Véto accepté : défausser les 2 cartes et terminer le tour
            this.discardPile.push(...this.currentDecrees);
            this.currentDecrees = [];

            // Augmenter le compteur d'impasse (comme un vote rejeté)
            this.deadlockCount++;

            // Vérifier l'impasse
            if (this.deadlockCount >= GAME_CONFIG.MAX_CONSECUTIVE_DEADLOCKS) {
                // Adopter automatiquement la première carte de la pioche
                if (this.deck.length < 1) {
                    this.reshuffleDeck();
                }
                const decree = this.deck.shift();
                this.passDecree(decree);
                this.deadlockCount = 0;
                return { accepted: true, deadlock: true, autoPassedDecree: decree };
            }

            // Passer au tour suivant
            this.endTurn();
            return { accepted: true, deadlock: false };
        } else {
            // Véto refusé : le chancelier doit choisir une carte
            return { accepted: false };
        }
    }

    passDecree(decree) {
        if (decree === DECREE_TYPES.PLOT) {
            this.plotsCount++;
            this.updateAvailablePowers();

            // Vérifier victoire conspirateurs
            if (this.plotsCount >= GAME_CONFIG.CONSPIRATOR_PLOTS_TO_WIN) {
                this.endGame(FACTIONS.CONSPIRATORS, '6 Complots adoptés !');
                return;
            }

            // Activer pouvoir si applicable
            if (this.availablePowers.size > 0) {
                this.phase = GAME_PHASES.EXECUTIVE_POWER;
            } else {
                this.startDebate();
            }
        } else {
            this.editsCount++;

            // Vérifier victoire loyalistes
            if (this.editsCount >= GAME_CONFIG.LOYALIST_EDITS_TO_WIN) {
                this.endGame(FACTIONS.LOYALISTS, '5 Édits royaux adoptés !');
                return;
            }

            this.startDebate();
        }
    }

    // === POUVOIRS EXÉCUTIFS ===

    updateAvailablePowers() {
        this.availablePowers.clear();
        const playerCount = this.players.size;

        // Pouvoirs selon le nombre de joueurs et de complots
        // 5-6 joueurs : 1-2: Rien, 3: Peek, 4-5: Exécution
        // 7-8 joueurs : 1: Rien, 2: Investigation, 3: Succession, 4-5: Exécution
        // 9-10 joueurs : 1-2: Investigation, 3: Succession, 4-5: Exécution

        if (playerCount <= 6) {
            // Plateau 5-6 joueurs
            if (this.plotsCount === 3) {
                this.availablePowers.add(POWERS.PEEK);
            } else if (this.plotsCount === 4 || this.plotsCount === 5) {
                this.availablePowers.add(POWERS.EXECUTION);
            }
        } else if (playerCount <= 8) {
            // Plateau 7-8 joueurs
            if (this.plotsCount === 2) {
                this.availablePowers.add(POWERS.INVESTIGATION);
            } else if (this.plotsCount === 3) {
                this.availablePowers.add(POWERS.SPECIAL_DESIGNATION);
            } else if (this.plotsCount === 4 || this.plotsCount === 5) {
                this.availablePowers.add(POWERS.EXECUTION);
            }
        } else {
            // Plateau 9-10 joueurs
            if (this.plotsCount === 1 || this.plotsCount === 2) {
                this.availablePowers.add(POWERS.INVESTIGATION);
            } else if (this.plotsCount === 3) {
                this.availablePowers.add(POWERS.SPECIAL_DESIGNATION);
            } else if (this.plotsCount === 4 || this.plotsCount === 5) {
                this.availablePowers.add(POWERS.EXECUTION);
            }
        }

        // Le véto est disponible à partir de 5 complots (pour tous les nombres de joueurs)
        if (this.plotsCount >= 5) {
            this.availablePowers.add(POWERS.VETO);
        }
    }

    usePower(kingId, power, targetId) {
        if (kingId !== this.currentKingId) {
            throw new Error('Vous n\'êtes pas le roi');
        }

        if (!this.availablePowers.has(power)) {
            throw new Error('Ce pouvoir n\'est pas disponible');
        }

        let result = null;

        switch (power) {
            case POWERS.INVESTIGATION:
                result = this.investigatePlayer(targetId);
                break;
            case POWERS.PEEK:
                result = this.peekDeck();
                break;
            case POWERS.SPECIAL_DESIGNATION:
                result = this.designateNextKing(targetId);
                break;
            case POWERS.EXECUTION:
                result = this.executePlayer(targetId);
                break;
        }

        this.availablePowers.delete(power);

        if (power !== POWERS.EXECUTION || !result.gameOver) {
            this.startDebate();
        }

        return result;
    }

    // Voir les 3 prochaines cartes de la pioche
    peekDeck() {
        // S'assurer qu'il y a assez de cartes
        if (this.deck.length < 3) {
            this.reshuffleDeck();
        }

        const topCards = this.deck.slice(0, 3);
        return {
            cards: topCards
        };
    }

    investigatePlayer(targetId) {
        const target = this.players.get(targetId);
        if (!target || !target.isAlive) {
            throw new Error('Joueur invalide');
        }

        return {
            targetId,
            targetName: target.name,
            faction: target.faction
        };
    }

    designateNextKing(targetId) {
        const target = this.players.get(targetId);
        if (!target || !target.isAlive) {
            throw new Error('Joueur invalide');
        }

        this.currentKingId = targetId;
        return { designatedKingId: targetId };
    }

    executePlayer(targetId) {
        const target = this.players.get(targetId);
        if (!target || !target.isAlive) {
            throw new Error('Joueur invalide');
        }

        target.isAlive = false;
        this.eliminatedPlayers.add(targetId);

        // Vérifier si c'est l'usurpateur
        if (target.role === ROLES.USURPER) {
            this.endGame(FACTIONS.LOYALISTS, 'L\'Usurpateur a été éliminé !');
            return { executedId: targetId, wasUsurper: true, gameOver: true };
        }

        return { executedId: targetId, wasUsurper: false, gameOver: false };
    }

    // === FIN DE TOUR ===

    startDebate() {
        this.phase = GAME_PHASES.DEBATE;
    }

    endTurn() {
        this.previousKingId = this.currentKingId;
        this.previousChancellorId = this.currentChancellorId;
        this.currentChancellorId = null;
        this.nominatedChancellorId = null;
        this.currentDecrees = [];

        this.rotateKing();
        this.phase = GAME_PHASES.NOMINATION;
    }

    rotateKing() {
        // Utiliser l'ordre défini au départ, en ignorant les morts
        const aliveInOrder = this.playerOrder.filter(id => {
            const player = this.players.get(id);
            return player && player.isAlive;
        });

        const currentIndex = aliveInOrder.findIndex(id => id === this.currentKingId);
        const nextIndex = (currentIndex + 1) % aliveInOrder.length;
        this.currentKingId = aliveInOrder[nextIndex];
    }

    // === SYSTÈME DE PAUSE/RECONNEXION ===

    pauseGame(disconnectedUsername, disconnectedPlayerId) {
        if (this.phase === GAME_PHASES.LOBBY || this.phase === GAME_PHASES.GAME_OVER) {
            return false; // Pas besoin de pause en lobby ou fin de partie
        }

        // Sauvegarder les infos du joueur déconnecté
        const playerData = this.players.get(disconnectedPlayerId);
        if (playerData) {
            this.disconnectedPlayers.set(disconnectedUsername, {
                odPlayerId: disconnectedPlayerId,
                playerData: { ...playerData }
            });
        }

        // Si la partie n'est pas déjà en pause, la mettre en pause
        if (this.phase !== GAME_PHASES.PAUSED) {
            this.isPaused = true;
            this.pausedPhase = this.phase;
            this.phase = GAME_PHASES.PAUSED;
        }

        return true;
    }

    canReconnect(username) {
        return this.disconnectedPlayers.has(username);
    }

    reconnectPlayer(username, newPlayerId, newWs) {
        const disconnectedInfo = this.disconnectedPlayers.get(username);
        if (!disconnectedInfo) {
            return null;
        }

        const oldPlayerId = disconnectedInfo.odPlayerId;
        const playerData = disconnectedInfo.playerData;

        // Mettre à jour l'ID du joueur dans players
        this.players.delete(oldPlayerId);
        playerData.id = newPlayerId;
        this.players.set(newPlayerId, playerData);

        // Mettre à jour playerOrder
        const orderIndex = this.playerOrder.indexOf(oldPlayerId);
        if (orderIndex !== -1) {
            this.playerOrder[orderIndex] = newPlayerId;
        }

        // Mettre à jour les références si nécessaire
        if (this.currentKingId === oldPlayerId) this.currentKingId = newPlayerId;
        if (this.currentChancellorId === oldPlayerId) this.currentChancellorId = newPlayerId;
        if (this.previousKingId === oldPlayerId) this.previousKingId = newPlayerId;
        if (this.previousChancellorId === oldPlayerId) this.previousChancellorId = newPlayerId;
        if (this.nominatedChancellorId === oldPlayerId) this.nominatedChancellorId = newPlayerId;
        if (this.hostId === oldPlayerId) this.hostId = newPlayerId;

        // Mettre à jour les votes si présents
        if (this.votes.has(oldPlayerId)) {
            const vote = this.votes.get(oldPlayerId);
            this.votes.delete(oldPlayerId);
            this.votes.set(newPlayerId, vote);
        }

        // Supprimer des déconnectés
        this.disconnectedPlayers.delete(username);

        // Reprendre la partie si plus personne n'est déconnecté
        if (this.disconnectedPlayers.size === 0) {
            this.resumeGame();
        }

        return {
            playerId: newPlayerId,
            playerData,
            oldPlayerId
        };
    }

    resumeGame() {
        if (this.pausedPhase) {
            this.phase = this.pausedPhase;
            this.pausedPhase = null;
        }
        this.isPaused = false;
    }

    // Pause forcée par le créateur
    forcePause() {
        if (this.phase === GAME_PHASES.LOBBY || this.phase === GAME_PHASES.GAME_OVER || this.phase === GAME_PHASES.PAUSED) {
            return false;
        }
        this.isPaused = true;
        this.pausedPhase = this.phase;
        this.phase = GAME_PHASES.PAUSED;
        return true;
    }

    // Reprise forcée par le créateur (retire les joueurs déconnectés)
    forceResume() {
        if (this.phase !== GAME_PHASES.PAUSED) {
            return { success: false };
        }

        // Retirer les joueurs déconnectés de la partie
        const removedPlayers = [];
        for (const [username, info] of this.disconnectedPlayers.entries()) {
            const playerId = info.odPlayerId;
            const player = this.players.get(playerId);
            if (player) {
                removedPlayers.push(player.name);
                // Marquer le joueur comme mort plutôt que le retirer complètement
                player.isAlive = false;
            }
        }
        this.disconnectedPlayers.clear();

        // Reprendre la partie
        this.resumeGame();

        return { success: true, removedPlayers };
    }

    // Arrêter la partie et retourner au lobby
    stopGame(hostId) {
        if (this.hostId !== hostId) {
            throw new Error('Seul le créateur peut arrêter la partie');
        }

        if (this.phase === GAME_PHASES.LOBBY) {
            throw new Error('La partie n\'a pas encore commencé');
        }

        // Réinitialiser tous les joueurs
        for (const player of this.players.values()) {
            player.role = null;
            player.faction = null;
            player.isAlive = true;
        }

        // Réinitialiser l'état du jeu
        this.phase = GAME_PHASES.LOBBY;
        this.deck = [];
        this.discardPile = [];
        this.plotsCount = 0;
        this.editsCount = 0;
        this.currentKingId = null;
        this.currentChancellorId = null;
        this.previousKingId = null;
        this.previousChancellorId = null;
        this.nominatedChancellorId = null;
        this.votes = new Map();
        this.currentDecrees = [];
        this.deadlockCount = 0;
        this.playerOrder = [];
        this.currentKingIndex = 0;
        this.isPaused = false;
        this.pausedPhase = null;
        this.disconnectedPlayers = new Map();
        this.vetoUnlocked = false;
        this.vetoPending = false;
        this.winningFaction = null;
        this.gameOverReason = null;

        return { success: true };
    }

    getVoteDetails() {
        // Retourne les détails des votes pour affichage
        const details = [];
        for (const [playerId, vote] of this.votes.entries()) {
            const player = this.players.get(playerId);
            if (player) {
                details.push({
                    playerId,
                    playerName: player.name,
                    vote
                });
            }
        }
        return details;
    }

    // === FIN DE PARTIE ===

    endGame(winningFaction, reason) {
        this.phase = GAME_PHASES.GAME_OVER;
        this.gameOverReason = reason;
        this.winningFaction = winningFaction;
    }

    // === UTILITAIRES ===

    reshuffleDeck() {
        this.deck = [...this.deck, ...this.discardPile];
        this.discardPile = [];
        this.shuffleArray(this.deck);
    }

    getAlivePlayers() {
        return Array.from(this.players.values()).filter(p => p.isAlive);
    }

    shuffleArray(array) {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
        return array;
    }

    // === EXPORT DE L'ÉTAT ===

    getPublicState() {
        return {
            roomId: this.roomId,
            phase: this.phase,
            playerCount: this.players.size,
            currentKingId: this.currentKingId,
            currentChancellorId: this.currentChancellorId,
            nominatedChancellorId: this.nominatedChancellorId,
            plotsCount: this.plotsCount,
            editsCount: this.editsCount,
            deadlockCount: this.deadlockCount,
            eliminatedPlayers: Array.from(this.eliminatedPlayers),
            deckSize: this.deck.length,
            discardSize: this.discardPile.length,
            previousKingId: this.previousKingId,
            previousChancellorId: this.previousChancellorId,
            isPaused: this.isPaused,
            playerOrder: this.playerOrder,
            disconnectedPlayers: Array.from(this.disconnectedPlayers.keys()),
            settings: this.settings,
            vetoUnlocked: this.isVetoUnlocked(),
            vetoPending: this.vetoPending
        };
    }

    getPlayerState(playerId) {
        const player = this.players.get(playerId);
        if (!player) return null;

        const state = {
            ...this.getPublicState(),
            yourRole: player.role,
            yourFaction: player.faction,
            isAlive: player.isAlive,
            knownPlayers: [] // Liste des joueurs dont on connaît le rôle
        };

        // Règles de visibilité selon le nombre de joueurs
        const playerCount = this.players.size;

        if (this.phase !== GAME_PHASES.LOBBY) {
            // Le joueur se connaît lui-même
            state.knownPlayers.push({
                id: player.id,
                name: player.name,
                role: player.role,
                faction: player.faction
            });

            // L'USURPATEUR NE VOIT JAMAIS PERSONNE (quel que soit le nombre de joueurs)
            // Il ne connaît que lui-même

            // Les CONSPIRATEURS voient selon les règles
            if (player.role === ROLES.CONSPIRATOR) {
                const allConspirators = Array.from(this.players.values())
                    .filter(p => p.role === ROLES.CONSPIRATOR);

                // Mode chaîne circulaire (9-10 joueurs avec option activée)
                if (this.settings.limitedConspiratorsKnowledge && playerCount >= 9 && allConspirators.length >= 3) {
                    // Trouver l'index du joueur actuel dans la liste des conspirateurs
                    const myIndex = allConspirators.findIndex(p => p.id === player.id);
                    // Chaque conspirateur ne voit que le suivant dans la chaîne (circulaire)
                    const nextIndex = (myIndex + 1) % allConspirators.length;
                    const knownAlly = allConspirators[nextIndex];

                    if (knownAlly && knownAlly.id !== player.id) {
                        state.knownPlayers.push({
                            id: knownAlly.id,
                            name: knownAlly.name,
                            role: knownAlly.role,
                            faction: knownAlly.faction
                        });
                    }
                } else {
                    // Mode normal: les conspirateurs se voient tous entre eux
                    const otherConspirators = allConspirators
                        .filter(p => p.id !== player.id)
                        .map(p => ({
                            id: p.id,
                            name: p.name,
                            role: p.role,
                            faction: p.faction
                        }));
                    state.knownPlayers.push(...otherConspirators);
                }

                // Si le paramètre est activé : les conspirateurs voient l'usurpateur
                if (this.settings.conspiratorsKnowUsurper) {
                    const usurper = Array.from(this.players.values())
                        .find(p => p.role === ROLES.USURPER);
                    if (usurper) {
                        state.knownPlayers.push({
                            id: usurper.id,
                            name: usurper.name,
                            role: usurper.role,
                            faction: usurper.faction
                        });
                    }
                }

                // Pour la rétrocompatibilité avec state.conspirators
                state.conspirators = state.knownPlayers.filter(p =>
                    p.faction === FACTIONS.CONSPIRATORS
                );
            }

            // Si le joueur est l'Usurpateur et que le paramètre est activé : il voit ses alliés
            if (player.role === ROLES.USURPER && this.settings.usurperKnowsAllies) {
                const conspirators = Array.from(this.players.values())
                    .filter(p => p.role === ROLES.CONSPIRATOR);

                conspirators.forEach(c => {
                    // Éviter les doublons
                    if (!state.knownPlayers.find(kp => kp.id === c.id)) {
                        state.knownPlayers.push({
                            id: c.id,
                            name: c.name,
                            role: c.role,
                            faction: c.faction
                        });
                    }
                });
            }
        }

        return state;
    }
}

module.exports = Game;