require('dotenv').config();
const { initDatabase } = require('./db');
const express = require('express');
const http = require('http');
const WebSocket = require('ws');
const path = require('path');
const Game = require('./Game');
const GameManager = require('./GameManager');
const auth = require('./auth');
const { MESSAGE_TYPES, GAME_PHASES, POWERS, ROLES } = require('../shared/constants');

const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

// Initialiser la base de données au démarrage
initDatabase().catch(err => {
    console.error('Impossible d\'initialiser la base de données:', err);
    // process.exit(1);
});

// Servir les fichiers statiques
app.use(express.static(path.join(__dirname, '../public')));

// Gestionnaire de parties
const gameManager = new GameManager();
const playerConnections = new Map(); // playerId -> { ws, roomId, playerName, username }

// Générer un ID unique
function generateId() {
    return Math.random().toString(36).substring(2, 9);
}

// Envoyer un message à un joueur spécifique
function sendToPlayer(playerId, message) {
    const connection = playerConnections.get(playerId);
    if (connection && connection.ws.readyState === WebSocket.OPEN) {
        connection.ws.send(JSON.stringify(message));
    }
}

// Envoyer un message à tous les joueurs d'une partie
function broadcastToGame(roomId, message, excludePlayerId = null) {
    for (const [playerId, connection] of playerConnections.entries()) {
        if (connection.roomId === roomId && playerId !== excludePlayerId) {
            if (connection.ws.readyState === WebSocket.OPEN) {
                connection.ws.send(JSON.stringify(message));
            }
        }
    }
}

// Envoyer l'état du jeu à tous les joueurs
function sendGameStateToAll(roomId) {
    const game = gameManager.getGame(roomId);
    if (!game) return;

    gameManager.updateGameMetadata(roomId);

    for (const [playerId, connection] of playerConnections.entries()) {
        if (connection.roomId === roomId) {
            const playerState = game.getPlayerState(playerId);
            sendToPlayer(playerId, {
                type: MESSAGE_TYPES.GAME_STATE,
                data: playerState
            });
        }
    }
}

// Envoyer la liste des joueurs
function sendPlayerList(roomId) {
    const game = gameManager.getGame(roomId);
    if (!game) return;

    gameManager.updateGameMetadata(roomId);

    // Utiliser l'ordre aléatoire si défini, sinon l'ordre de connexion
    let orderedPlayers;
    if (game.playerOrder && game.playerOrder.length > 0) {
        orderedPlayers = game.playerOrder
            .map(id => game.players.get(id))
            .filter(p => p);
    } else {
        orderedPlayers = Array.from(game.players.values());
    }

    const playerList = orderedPlayers.map(p => ({
        id: p.id,
        name: p.name,
        isHost: p.isHost,
        isAlive: p.isAlive
    }));

    broadcastToGame(roomId, {
        type: MESSAGE_TYPES.PLAYER_LIST,
        data: playerList
    });
}

// Gérer les connexions WebSocket
wss.on('connection', (ws) => {
    let playerId = null;
    let roomId = null;

    console.log('Nouvelle connexion WebSocket');

    ws.on('message', (message) => {
        try {
            const data = JSON.parse(message);

            switch (data.type) {
                case 'register':
                    handleRegister(ws, data);
                    break;

                case 'login':
                    handleLogin(ws, data);
                    break;

                case MESSAGE_TYPES.JOIN_GAME:
                    handleJoinGame(ws, data);
                    break;

                case MESSAGE_TYPES.GET_PUBLIC_GAMES:
                    handleGetPublicGames(ws);
                    break;

                case MESSAGE_TYPES.GET_PLAYER_GAMES:
                    handleGetPlayerGames(ws, data);
                    break;

                case MESSAGE_TYPES.RECONNECT:
                    handleReconnect(ws, data);
                    break;

                case MESSAGE_TYPES.START_GAME:
                    handleStartGame(data);
                    break;

                case MESSAGE_TYPES.UPDATE_SETTINGS:
                    handleUpdateSettings(data);
                    break;

                case MESSAGE_TYPES.NOMINATE_CHANCELLOR:
                    handleNominateChancellor(data);
                    break;

                case MESSAGE_TYPES.VOTE:
                    handleVote(data);
                    break;

                case MESSAGE_TYPES.DISCARD_DECREE:
                    handleDiscardDecree(data);
                    break;

                case MESSAGE_TYPES.USE_POWER:
                    handleUsePower(data);
                    break;

                case MESSAGE_TYPES.CHAT_MESSAGE:
                    handleChatMessage(data);
                    break;

                case MESSAGE_TYPES.END_TURN:
                    handleEndTurn(data);
                    break;

                case MESSAGE_TYPES.PROPOSE_VETO:
                    handleProposeVeto(data);
                    break;

                case MESSAGE_TYPES.VETO_RESPONSE:
                    handleVetoResponse(data);
                    break;

                case MESSAGE_TYPES.FORCE_PAUSE:
                    handleForcePause(data);
                    break;

                case MESSAGE_TYPES.FORCE_RESUME:
                    handleForceResume(data);
                    break;

                case MESSAGE_TYPES.KICK_PLAYER:
                    handleKickPlayer(data);
                    break;

                case MESSAGE_TYPES.STOP_GAME:
                    handleStopGame(data);
                    break;

                case 'ping':
                    // Répondre au ping du client pour maintenir la connexion
                    ws.isAlive = true;
                    ws.send(JSON.stringify({ type: 'pong' }));
                    break;

                default:
                    console.log('Type de message inconnu:', data.type);
            }
        } catch (error) {
            console.error('Erreur lors du traitement du message:', error);
            ws.send(JSON.stringify({
                type: MESSAGE_TYPES.ERROR,
                message: error.message
            }));
        }
    });

    ws.on('close', () => {
        if (playerId && roomId) {
            handlePlayerDisconnect(playerId, roomId);
        }
    });

    // === HANDLERS ===

    async function handleRegister(ws, data) {
        const { username, password } = data;
        const result = await auth.register(username, password);

        ws.send(JSON.stringify({
            type: 'register_result',
            ...result
        }));

        if (result.success) {
            console.log(`Nouvel utilisateur inscrit: ${username}`);
        }
    }

    async function handleLogin(ws, data) {
        const { username, password } = data;
        const result = await auth.login(username, password);

        ws.send(JSON.stringify({
            type: 'login_result',
            ...result
        }));

        if (result.success) {
            console.log(`Utilisateur connecté: ${username}`);
        }
    }

    function handleJoinGame(ws, data) {
        const { roomId: requestedRoomId, playerName, username, isPublic, password } = data;

        // Créer ou rejoindre une partie
        roomId = requestedRoomId || generateId();
        playerId = generateId();

        if (!gameManager.gameExists(roomId)) {
            // Créer une nouvelle partie
            gameManager.createGame(roomId, playerName, playerId, isPublic !== false, password);
            console.log(`Nouvelle partie créée: ${roomId} (${isPublic ? 'Publique' : 'Privée'})`);
        } else {
            // Vérifier le mot de passe si partie privée
            if (!gameManager.checkPassword(roomId, password)) {
                ws.send(JSON.stringify({
                    type: MESSAGE_TYPES.ERROR,
                    message: 'Mot de passe incorrect'
                }));
                return;
            }
        }

        const game = gameManager.getGame(roomId);

        // Vérifier si le joueur est déjà connecté à cette partie avec le même compte
        if (username) {
            for (const [existingPlayerId, connection] of playerConnections.entries()) {
                if (connection.username === username && connection.roomId === roomId) {
                    ws.send(JSON.stringify({
                        type: MESSAGE_TYPES.ERROR,
                        message: 'Vous êtes déjà connecté à cette partie dans un autre onglet'
                    }));
                    return;
                }
            }
        }

        try {
            game.addPlayer(playerId, playerName);
            playerConnections.set(playerId, { ws, roomId, playerName, username });

            // Enregistrer le joueur dans cette partie
            if (username) {
                gameManager.registerPlayerInGame(username, roomId);
            }

            // Mettre à jour l'activité
            gameManager.updateActivity(roomId);
            gameManager.updateGameMetadata(roomId);

            // Envoyer la confirmation au joueur
            ws.send(JSON.stringify({
                type: MESSAGE_TYPES.JOIN_GAME,
                success: true,
                data: {
                    playerId,
                    roomId,
                    isHost: game.players.get(playerId).isHost
                }
            }));

            // Mettre à jour tous les joueurs
            sendPlayerList(roomId);
            sendGameStateToAll(roomId);

            console.log(`${playerName} a rejoint la partie ${roomId}`);
        } catch (error) {
            ws.send(JSON.stringify({
                type: MESSAGE_TYPES.ERROR,
                message: error.message
            }));
        }
    }

    function handleGetPublicGames(ws) {
        const publicGames = gameManager.getPublicGames();
        ws.send(JSON.stringify({
            type: MESSAGE_TYPES.PUBLIC_GAMES_LIST,
            data: publicGames
        }));
    }

    function handleGetPlayerGames(ws, data) {
        const { username } = data;
        if (!username) {
            ws.send(JSON.stringify({
                type: MESSAGE_TYPES.ERROR,
                message: 'Nom d\'utilisateur requis'
            }));
            return;
        }

        const activeGames = gameManager.getPlayerActiveGames(username);
        ws.send(JSON.stringify({
            type: MESSAGE_TYPES.PLAYER_GAMES_LIST,
            data: activeGames
        }));
    }

    function handleStartGame(data) {
        const { playerId: requestingPlayerId, roomId } = data;
        const game = gameManager.getGame(roomId);

        if (!game) {
            throw new Error('Partie introuvable');
        }

        gameManager.updateActivity(roomId);

        const player = game.players.get(requestingPlayerId);
        if (!player || !player.isHost) {
            throw new Error('Seul l\'hôte peut démarrer la partie');
        }

        game.startGame();

        // Préparer les listes d'alliés si nécessaire
        const usurper = Array.from(game.players.values()).find(p => p.role === ROLES.USURPER);
        const conspirators = Array.from(game.players.values()).filter(p => p.role === ROLES.CONSPIRATOR);

        // Envoyer les rôles à chaque joueur
        const playerCount = game.players.size;

        for (const [pid, p] of game.players.entries()) {
            let allies = [];

            // Conspirateurs: voir leurs alliés
            if (p.role === ROLES.CONSPIRATOR) {
                // Mode chaîne circulaire (9-10 joueurs avec option activée)
                if (game.settings.limitedConspiratorsKnowledge && playerCount >= 9 && conspirators.length >= 3) {
                    const myIndex = conspirators.findIndex(c => c.id === p.id);
                    const nextIndex = (myIndex + 1) % conspirators.length;
                    const knownAlly = conspirators[nextIndex];
                    if (knownAlly) {
                        allies.push({ id: knownAlly.id, name: knownAlly.name, role: ROLES.CONSPIRATOR });
                    }
                } else {
                    // Mode normal: voir tous les autres conspirateurs
                    allies = conspirators
                        .filter(c => c.id !== p.id)
                        .map(c => ({ id: c.id, name: c.name, role: ROLES.CONSPIRATOR }));
                }

                // Ajouter l'usurpateur si l'option est activée
                if (game.settings.conspiratorsKnowUsurper && usurper) {
                    allies.push({ id: usurper.id, name: usurper.name, role: ROLES.USURPER });
                }
            }

            // Usurpateur: voir ses alliés si l'option est activée
            if (p.role === ROLES.USURPER && game.settings.usurperKnowsAllies) {
                allies = conspirators.map(c => ({ id: c.id, name: c.name, role: ROLES.CONSPIRATOR }));
            }

            sendToPlayer(pid, {
                type: MESSAGE_TYPES.ROLE_ASSIGNMENT,
                data: {
                    role: p.role,
                    faction: p.faction,
                    allies: allies.length > 0 ? allies : null
                }
            });
        }

        broadcastToGame(roomId, {
            type: MESSAGE_TYPES.PHASE_CHANGE,
            phase: game.phase
        });

        setTimeout(() => {
            sendGameStateToAll(roomId);
        }, 2000);

        gameManager.updateGameMetadata(roomId);

        console.log(`Partie ${roomId} démarrée`);
    }

    function handleUpdateSettings(data) {
        const { playerId: requestingPlayerId, roomId, settings } = data;
        const game = gameManager.getGame(roomId);

        if (!game) {
            throw new Error('Partie introuvable');
        }

        gameManager.updateActivity(roomId);

        const player = game.players.get(requestingPlayerId);
        if (!player || !player.isHost) {
            throw new Error('Seul l\'hôte peut modifier les paramètres');
        }

        game.updateSettings(settings);
        sendGameStateToAll(roomId);

        console.log(`Paramètres de la partie ${roomId} mis à jour:`, settings);
    }

    function handleKickPlayer(data) {
        const { playerId: hostId, roomId, targetPlayerId } = data;
        const game = gameManager.getGame(roomId);

        if (!game) {
            throw new Error('Partie introuvable');
        }

        const result = game.kickPlayer(hostId, targetPlayerId);

        // Notifier le joueur kické
        sendToPlayer(targetPlayerId, {
            type: MESSAGE_TYPES.PLAYER_KICKED,
            data: {
                reason: 'Vous avez été exclu de la partie par le créateur'
            }
        });

        // Déconnecter le joueur kické
        const kickedConnection = playerConnections.get(targetPlayerId);
        if (kickedConnection) {
            playerConnections.delete(targetPlayerId);
        }

        // Notifier les autres joueurs
        broadcastToGame(roomId, {
            type: MESSAGE_TYPES.PLAYER_KICKED,
            data: {
                kickedPlayerName: result.kickedPlayerName
            }
        });

        // Mettre à jour la liste des joueurs
        sendPlayerList(roomId);

        console.log(`Joueur ${result.kickedPlayerName} exclu de la partie ${roomId}`);
    }

    function handleNominateChancellor(data) {
        const { playerId, roomId, chancellorId } = data;
        const game = gameManager.getGame(roomId);

        if (!game) throw new Error('Partie introuvable');

        gameManager.updateActivity(roomId);

        game.nominateChancellor(playerId, chancellorId);

        broadcastToGame(roomId, {
            type: MESSAGE_TYPES.NOMINATION_RESULT,
            data: {
                kingId: playerId,
                chancellorId,
                chancellorName: game.players.get(chancellorId).name
            }
        });

        sendGameStateToAll(roomId);
    }

    function handleVote(data) {
        const { playerId, roomId, vote } = data;
        const game = gameManager.getGame(roomId);

        if (!game) throw new Error('Partie introuvable');

        gameManager.updateActivity(roomId);

        const allVotesReceived = game.castVote(playerId, vote);

        const votedPlayerIds = Array.from(game.votes.keys());
        broadcastToGame(roomId, {
            type: MESSAGE_TYPES.VOTE_STATUS,
            data: {
                votedPlayerIds,
                totalPlayers: game.getAlivePlayers().length
            }
        });

        if (allVotesReceived) {
            const voteDetails = game.getVoteDetails();
            const result = game.resolveVote();

            broadcastToGame(roomId, {
                type: MESSAGE_TYPES.VOTE_RESULT,
                data: {
                    ...result,
                    voteDetails
                }
            });

            if (result.gameOver) {
                const allRoles = Array.from(game.players.values()).map(p => ({
                    id: p.id,
                    name: p.name,
                    role: p.role,
                    faction: p.faction,
                    isAlive: p.isAlive
                }));

                broadcastToGame(roomId, {
                    type: MESSAGE_TYPES.GAME_OVER,
                    data: {
                        winner: game.winningFaction,
                        reason: game.gameOverReason,
                        allRoles
                    }
                });
            }

            if (game.phase === GAME_PHASES.LEGISLATIVE) {
                const decrees = game.kingDrawDecrees();
                sendToPlayer(game.currentKingId, {
                    type: 'king_decrees',
                    data: { decrees }
                });
            }

            if (result.hasPower && game.phase === GAME_PHASES.EXECUTIVE_POWER) {
                sendToPlayer(game.currentKingId, {
                    type: MESSAGE_TYPES.POWER_ACTIVATED,
                    data: {
                        availablePowers: Array.from(game.availablePowers)
                    }
                });
            }

            sendGameStateToAll(roomId);
        }
    }

    function handleDiscardDecree(data) {
        const { playerId, roomId, discardedIndex, isKing } = data;
        const game = gameManager.getGame(roomId);

        if (!game) throw new Error('Partie introuvable');

        gameManager.updateActivity(roomId);

        if (isKing) {
            const remaining = game.kingDiscardDecree(playerId, discardedIndex);
            sendToPlayer(game.currentChancellorId, {
                type: 'chancellor_decrees',
                data: { decrees: remaining }
            });
        } else {
            const passedDecree = game.chancellorDiscardDecree(playerId, discardedIndex);

            broadcastToGame(roomId, {
                type: MESSAGE_TYPES.DECREE_PASSED,
                data: {
                    decree: passedDecree,
                    plotsCount: game.plotsCount,
                    editsCount: game.editsCount
                }
            });

            if (game.phase === GAME_PHASES.GAME_OVER) {
                const allRoles = Array.from(game.players.values()).map(p => ({
                    id: p.id,
                    name: p.name,
                    role: p.role,
                    faction: p.faction,
                    isAlive: p.isAlive
                }));

                broadcastToGame(roomId, {
                    type: MESSAGE_TYPES.GAME_OVER,
                    data: {
                        winner: game.winningFaction,
                        reason: game.gameOverReason,
                        allRoles
                    }
                });
            }

            if (game.phase === GAME_PHASES.EXECUTIVE_POWER) {
                sendToPlayer(game.currentKingId, {
                    type: MESSAGE_TYPES.POWER_ACTIVATED,
                    data: {
                        availablePowers: Array.from(game.availablePowers)
                    }
                });
            }
        }

        sendGameStateToAll(roomId);
    }

    function handleUsePower(data) {
        const { playerId, roomId, power, targetId } = data;
        const game = gameManager.getGame(roomId);

        if (!game) throw new Error('Partie introuvable');

        gameManager.updateActivity(roomId);

        const result = game.usePower(playerId, power, targetId);

        sendToPlayer(playerId, {
            type: 'power_result',
            data: { power, result }
        });

        if (power === POWERS.EXECUTION) {
            const executedPlayer = game.players.get(targetId);
            broadcastToGame(roomId, {
                type: 'execution_result',
                data: {
                    executedId: targetId,
                    executedName: executedPlayer ? executedPlayer.name : 'Inconnu',
                    wasUsurper: result.wasUsurper
                }
            });

            sendPlayerList(roomId);

            if (result.gameOver) {
                const allRoles = Array.from(game.players.values()).map(p => ({
                    id: p.id,
                    name: p.name,
                    role: p.role,
                    faction: p.faction,
                    isAlive: p.isAlive
                }));

                broadcastToGame(roomId, {
                    type: MESSAGE_TYPES.GAME_OVER,
                    data: {
                        winner: game.winningFaction,
                        reason: game.gameOverReason,
                        allRoles
                    }
                });
            }
        } else {
            broadcastToGame(roomId, {
                type: 'power_used',
                data: {
                    power,
                    kingId: playerId,
                    targetId
                }
            }, playerId);
        }

        sendGameStateToAll(roomId);
    }

    function handleChatMessage(data) {
        const { playerId, roomId, message } = data;
        const connection = playerConnections.get(playerId);

        if (!connection) return;

        gameManager.updateActivity(roomId);

        broadcastToGame(roomId, {
            type: MESSAGE_TYPES.CHAT_BROADCAST,
            data: {
                playerId,
                playerName: connection.playerName,
                message,
                timestamp: Date.now()
            }
        });
    }

    function handleEndTurn(data) {
        const { playerId, roomId } = data;
        const game = gameManager.getGame(roomId);

        if (!game) throw new Error('Partie introuvable');

        gameManager.updateActivity(roomId);

        if (playerId !== game.currentKingId) {
            throw new Error('Seul le Roi peut passer au tour suivant');
        }

        if (game.phase !== GAME_PHASES.DEBATE) {
            throw new Error('Ce n\'est pas le moment de passer au tour suivant');
        }

        game.endTurn();

        broadcastToGame(roomId, {
            type: MESSAGE_TYPES.PHASE_CHANGE,
            phase: game.phase
        });

        sendGameStateToAll(roomId);
    }

    function handleForcePause(data) {
        const { playerId, roomId } = data;
        const game = gameManager.getGame(roomId);

        if (!game) throw new Error('Partie introuvable');
        if (game.hostId !== playerId) throw new Error('Seul le créateur peut mettre en pause');

        gameManager.updateActivity(roomId);

        const paused = game.forcePause();
        if (paused) {
            broadcastToGame(roomId, {
                type: MESSAGE_TYPES.GAME_PAUSED,
                data: {
                    message: 'Le créateur a mis la partie en pause.'
                }
            });
            sendGameStateToAll(roomId);
        }
    }

    function handleForceResume(data) {
        const { playerId, roomId } = data;
        const game = gameManager.getGame(roomId);

        if (!game) throw new Error('Partie introuvable');
        if (game.hostId !== playerId) throw new Error('Seul le créateur peut reprendre la partie');

        gameManager.updateActivity(roomId);

        const result = game.forceResume();
        if (result.success) {
            let message;
            if (result.removedPlayers.length > 0) {
                message = `Le créateur a forcé la reprise. Joueurs éliminés : ${result.removedPlayers.join(', ')}`;
            } else {
                message = 'La partie reprend !';
            }
            broadcastToGame(roomId, {
                type: MESSAGE_TYPES.GAME_RESUMED,
                data: {
                    playerName: 'Le créateur',
                    message
                }
            });
            sendPlayerList(roomId);
            sendGameStateToAll(roomId);
        }
    }

    function handleStopGame(data) {
        const { playerId, roomId } = data;
        const game = gameManager.getGame(roomId);

        if (!game) throw new Error('Partie introuvable');

        const result = game.stopGame(playerId);

        if (result.success) {
            // Notifier tous les joueurs
            broadcastToGame(roomId, {
                type: MESSAGE_TYPES.GAME_STOPPED,
                data: {
                    message: 'Le créateur a arrêté la partie.'
                }
            });

            // Renvoyer la liste des joueurs et l'état (lobby)
            sendPlayerList(roomId);

            console.log(`Partie ${roomId} arrêtée par le créateur`);
        }
    }

    function handleProposeVeto(data) {
        const { playerId, roomId } = data;
        const game = gameManager.getGame(roomId);

        if (!game) throw new Error('Partie introuvable');

        gameManager.updateActivity(roomId);

        game.proposeVeto(playerId);

        sendToPlayer(game.currentKingId, {
            type: MESSAGE_TYPES.VETO_PROPOSED,
            data: {
                chancellorId: playerId,
                chancellorName: game.players.get(playerId).name
            }
        });

        broadcastToGame(roomId, {
            type: 'veto_pending',
            data: {
                chancellorName: game.players.get(playerId).name
            }
        }, game.currentKingId);

        sendGameStateToAll(roomId);
    }

    function handleVetoResponse(data) {
        const { playerId, roomId, accepted } = data;
        const game = gameManager.getGame(roomId);

        if (!game) throw new Error('Partie introuvable');

        gameManager.updateActivity(roomId);

        const result = game.respondToVeto(playerId, accepted);

        broadcastToGame(roomId, {
            type: MESSAGE_TYPES.VETO_RESULT,
            data: {
                accepted: result.accepted,
                deadlock: result.deadlock || false,
                autoPassedDecree: result.autoPassedDecree || null
            }
        });

        if (!result.accepted) {
            sendToPlayer(game.currentChancellorId, {
                type: 'chancellor_decrees',
                data: { decrees: game.currentDecrees, vetoRejected: true }
            });
        }

        if (result.deadlock && result.autoPassedDecree) {
            broadcastToGame(roomId, {
                type: MESSAGE_TYPES.DECREE_PASSED,
                data: {
                    decree: result.autoPassedDecree,
                    plotsCount: game.plotsCount,
                    editsCount: game.editsCount,
                    isDeadlock: true
                }
            });

            if (game.phase === GAME_PHASES.GAME_OVER) {
                const allRoles = Array.from(game.players.values()).map(p => ({
                    id: p.id,
                    name: p.name,
                    role: p.role,
                    faction: p.faction,
                    isAlive: p.isAlive
                }));

                broadcastToGame(roomId, {
                    type: MESSAGE_TYPES.GAME_OVER,
                    data: {
                        winner: game.winningFaction,
                        reason: game.gameOverReason,
                        allRoles
                    }
                });
            }
        }

        sendGameStateToAll(roomId);
    }

    function handleReconnect(ws, data) {
        const { playerName } = data;

        // Chercher dans le GameManager
        const playerGame = gameManager.findPlayerGame(playerName);

        if (!playerGame) {
            ws.send(JSON.stringify({
                type: MESSAGE_TYPES.ERROR,
                message: 'Aucune partie en pause trouvée pour ce joueur'
            }));
            return;
        }

        const { roomId: foundRoomId, game: foundGame } = playerGame;

        // Générer un nouvel ID
        playerId = generateId();
        roomId = foundRoomId;

        const reconnectResult = foundGame.reconnectPlayer(playerName, playerId, ws);

        if (reconnectResult) {
            const connection = playerConnections.get(reconnectResult.oldPlayerId);
            const username = connection ? connection.username : null;

            playerConnections.set(playerId, { ws, roomId: foundRoomId, playerName, username });

            ws.send(JSON.stringify({
                type: MESSAGE_TYPES.JOIN_GAME,
                success: true,
                data: {
                    playerId,
                    roomId: foundRoomId,
                    isHost: reconnectResult.playerData.isHost,
                    reconnected: true
                }
            }));

            ws.send(JSON.stringify({
                type: MESSAGE_TYPES.ROLE_ASSIGNMENT,
                data: {
                    role: reconnectResult.playerData.role,
                    faction: reconnectResult.playerData.faction
                }
            }));

            if (!foundGame.isPaused) {
                broadcastToGame(foundRoomId, {
                    type: MESSAGE_TYPES.GAME_RESUMED,
                    data: { playerName }
                });
            }

            sendPlayerList(foundRoomId);
            sendGameStateToAll(foundRoomId);

            gameManager.updateActivity(foundRoomId);

            console.log(`${playerName} a reconnecté à la partie ${foundRoomId}`);
        }
    }

    function handlePlayerDisconnect(playerId, roomId) {
        const game = gameManager.getGame(roomId);
        const connection = playerConnections.get(playerId);
        const playerName = connection ? connection.playerName : null;

        if (game) {
            if (game.phase !== GAME_PHASES.LOBBY && game.phase !== GAME_PHASES.GAME_OVER) {
                const paused = game.pauseGame(playerName, playerId);

                if (paused) {
                    broadcastToGame(roomId, {
                        type: MESSAGE_TYPES.GAME_PAUSED,
                        data: {
                            disconnectedPlayer: playerName,
                            message: `${playerName} s'est déconnecté. La partie est en pause.`
                        }
                    });

                    sendGameStateToAll(roomId);
                    gameManager.updateActivity(roomId);
                    console.log(`Partie ${roomId} en pause (${playerName} déconnecté)`);
                }
            } else {
                game.removePlayer(playerId);

                if (game.players.size === 0) {
                    gameManager.deleteGame(roomId);
                    console.log(`Partie ${roomId} supprimée (plus de joueurs)`);
                } else {
                    sendPlayerList(roomId);
                    sendGameStateToAll(roomId);
                }
            }
        }

        playerConnections.delete(playerId);
        console.log(`Joueur ${playerId} déconnecté de ${roomId}`);
    }
});

// Démarrer le serveur
const PORT = process.env.PORT || 3000;
server.listen(PORT, '0.0.0.0', () => {
    console.log(`🎭 Serveur Court of Shadows démarré sur le port ${PORT}`);
    console.log(`   → http://localhost:${PORT}`);
});