const Game = require('./Game');
const { GAME_PHASES } = require('../shared/constants');

class GameManager {
    constructor() {
        this.games = new Map(); // roomId -> Game
        this.gameMetadata = new Map(); // roomId -> metadata
        this.playerToGame = new Map(); // username -> roomId (pour retrouver les parties en cours)

        // Nettoyage automatique désactivé
        // setInterval(() => this.cleanupInactiveGames(), 5 * 60 * 1000);
    }

    /**
     * Créer une nouvelle partie
     */
     createGame(roomId, hostName, hostId, isPublic = true, password = null) {
        const game = new Game(roomId);
        this.games.set(roomId, game);

        this.gameMetadata.set(roomId, {
            roomId,
            hostName,
            hostId,
            isPublic,
            password: password || null,
            createdAt: Date.now(),
            lastActivity: Date.now(),
            playerCount: 0,
            maxPlayers: 10,
            phase: GAME_PHASES.LOBBY,
            started: false
        });

        console.log(`✅ Partie créée: ${roomId} (${isPublic ? 'Publique' : 'Privée'}) par ${hostName}`);
        return game;
    }

    /**
     * Récupérer une partie
     */
    getGame(roomId) {
        return this.games.get(roomId);
    }

    /**
     * Vérifier si une partie existe
     */
    gameExists(roomId) {
        return this.games.has(roomId);
    }

    /**
     * Vérifier le mot de passe d'une partie privée
     */
    checkPassword(roomId, password) {
        const metadata = this.gameMetadata.get(roomId);
        if (!metadata) return false;
        if (metadata.isPublic) return true;
        return metadata.password === password;
    }

    /**
     * Mettre à jour l'activité d'une partie
     */
    updateActivity(roomId) {
        const metadata = this.gameMetadata.get(roomId);
        if (metadata) {
            metadata.lastActivity = Date.now();
        }
    }

    /**
     * Mettre à jour les métadonnées d'une partie
     */
    updateGameMetadata(roomId) {
        const game = this.games.get(roomId);
        const metadata = this.gameMetadata.get(roomId);

        if (game && metadata) {
            metadata.playerCount = game.players.size;
            metadata.phase = game.phase;
            metadata.started = game.phase !== GAME_PHASES.LOBBY;
            metadata.lastActivity = Date.now();
        }
    }

    /**
     * Enregistrer qu'un joueur est dans une partie
     */
    registerPlayerInGame(username, roomId) {
        this.playerToGame.set(username, roomId);
    }

    /**
     * Retirer un joueur d'une partie
     */
    unregisterPlayerFromGame(username) {
        this.playerToGame.delete(username);
    }

    /**
     * Trouver la partie d'un joueur
     */
    findPlayerGame(username) {
        const roomId = this.playerToGame.get(username);
        if (roomId && this.games.has(roomId)) {
            return { roomId, game: this.games.get(roomId) };
        }
        return null;
    }

    /**
     * Supprimer une partie
     */
    deleteGame(roomId) {
        const game = this.games.get(roomId);

        // Retirer tous les joueurs de la map playerToGame
        if (game) {
            for (const player of game.players.values()) {
                this.playerToGame.delete(player.name);
            }
        }

        this.games.delete(roomId);
        this.gameMetadata.delete(roomId);
        console.log(`🗑️ Partie supprimée: ${roomId}`);
    }

    /**
     * Nettoyer les parties inactives (>30min sans activité)
     */
    cleanupInactiveGames() {
        const now = Date.now();
        const INACTIVITY_TIMEOUT = 30 * 60 * 1000; // 30 minutes

        for (const [roomId, metadata] of this.gameMetadata.entries()) {
            const inactiveTime = now - metadata.lastActivity;

            if (inactiveTime > INACTIVITY_TIMEOUT) {
                console.log(`⏰ Suppression de la partie inactive: ${roomId} (${Math.floor(inactiveTime / 60000)} min d'inactivité)`);
                this.deleteGame(roomId);
            }
        }
    }

    /**
     * Obtenir la liste des parties publiques rejoignables
     */
    getPublicGames() {
        const publicGames = [];

        for (const [roomId, metadata] of this.gameMetadata.entries()) {
            if (metadata.isPublic && metadata.phase === GAME_PHASES.LOBBY) {
                publicGames.push({
                    roomId: metadata.roomId,
                    hostName: metadata.hostName,
                    playerCount: metadata.playerCount,
                    maxPlayers: metadata.maxPlayers,
                    createdAt: metadata.createdAt
                });
            }
        }

        // Trier par date de création (plus récentes en premier)
        publicGames.sort((a, b) => b.createdAt - a.createdAt);

        return publicGames;
    }

    /**
     * Obtenir les parties en cours d'un joueur
     */
    getPlayerActiveGames(username) {
        const activeGames = [];

        for (const [roomId, game] of this.games.entries()) {
            // Chercher si le joueur est dans cette partie
            for (const player of game.players.values()) {
                if (player.name === username && game.phase !== GAME_PHASES.LOBBY && game.phase !== GAME_PHASES.GAME_OVER) {
                    const metadata = this.gameMetadata.get(roomId);
                    activeGames.push({
                        roomId,
                        hostName: metadata?.hostName || 'Inconnu',
                        playerCount: game.players.size,
                        phase: game.phase,
                        isPaused: game.isPaused,
                        isAlive: player.isAlive,
                        lastActivity: metadata?.lastActivity || Date.now()
                    });
                    break;
                }
            }
        }

        // Trier par activité récente
        activeGames.sort((a, b) => b.lastActivity - a.lastActivity);

        return activeGames;
    }

    /**
     * Obtenir les statistiques globales
     */
    getStats() {
        let totalGames = this.games.size;
        let activeGames = 0;
        let lobbyGames = 0;
        let totalPlayers = 0;

        for (const metadata of this.gameMetadata.values()) {
            if (metadata.phase === GAME_PHASES.LOBBY) {
                lobbyGames++;
            } else if (metadata.phase !== GAME_PHASES.GAME_OVER) {
                activeGames++;
            }
            totalPlayers += metadata.playerCount;
        }

        return {
            totalGames,
            activeGames,
            lobbyGames,
            totalPlayers
        };
    }
}

module.exports = GameManager;