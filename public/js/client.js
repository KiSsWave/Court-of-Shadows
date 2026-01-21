// Client Court of Shadows - VERSION CORRIGÉE

// === GESTIONNAIRE DE SONS ===
class SoundManager {
    constructor() {
        this.audioContext = null;
        this.enabled = true;
    }

    init() {
        try {
            this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
        } catch (e) {
            console.warn('Web Audio API non supportée');
            this.enabled = false;
        }
    }

    // Jouer un son de carte retournée
    playCardFlip() {
        if (!this.enabled || !this.audioContext) return;
        this.playTone(800, 0.08, 'square', 0.3);
        setTimeout(() => this.playTone(1200, 0.05, 'square', 0.2), 50);
    }

    // Jouer un son de carte défaussée
    playCardDiscard() {
        if (!this.enabled || !this.audioContext) return;
        this.playTone(400, 0.1, 'sawtooth', 0.2);
        setTimeout(() => this.playTone(300, 0.15, 'sawtooth', 0.15), 80);
    }

    // Jouer un son de décret Complot adopté (son grave/menaçant)
    playPlotPassed() {
        if (!this.enabled || !this.audioContext) return;
        this.playTone(150, 0.3, 'sawtooth', 0.4);
        setTimeout(() => this.playTone(120, 0.4, 'sawtooth', 0.3), 150);
        setTimeout(() => this.playTone(100, 0.5, 'sawtooth', 0.2), 350);
    }

    // Jouer un son d'Édit Royal adopté (son lumineux/victorieux)
    playEditPassed() {
        if (!this.enabled || !this.audioContext) return;
        this.playTone(523, 0.15, 'sine', 0.3); // Do
        setTimeout(() => this.playTone(659, 0.15, 'sine', 0.3), 100); // Mi
        setTimeout(() => this.playTone(784, 0.25, 'sine', 0.4), 200); // Sol
    }

    // Jouer un son de vote accepté
    playVoteAccepted() {
        if (!this.enabled || !this.audioContext) return;
        this.playTone(440, 0.1, 'sine', 0.3);
        setTimeout(() => this.playTone(554, 0.1, 'sine', 0.3), 80);
        setTimeout(() => this.playTone(659, 0.15, 'sine', 0.4), 160);
    }

    // Jouer un son de vote rejeté
    playVoteRejected() {
        if (!this.enabled || !this.audioContext) return;
        this.playTone(350, 0.15, 'sawtooth', 0.3);
        setTimeout(() => this.playTone(280, 0.2, 'sawtooth', 0.25), 120);
    }

    // Jouer un son d'exécution
    playExecution() {
        if (!this.enabled || !this.audioContext) return;
        this.playTone(200, 0.1, 'square', 0.5);
        setTimeout(() => this.playTone(100, 0.4, 'sawtooth', 0.4), 100);
    }

    // Jouer un son de victoire
    playVictory() {
        if (!this.enabled || !this.audioContext) return;
        const notes = [523, 587, 659, 698, 784, 880, 988, 1047];
        notes.forEach((freq, i) => {
            setTimeout(() => this.playTone(freq, 0.15, 'sine', 0.3), i * 100);
        });
    }

    // Jouer un son de défaite
    playDefeat() {
        if (!this.enabled || !this.audioContext) return;
        this.playTone(300, 0.3, 'sawtooth', 0.3);
        setTimeout(() => this.playTone(250, 0.3, 'sawtooth', 0.25), 200);
        setTimeout(() => this.playTone(200, 0.4, 'sawtooth', 0.2), 400);
        setTimeout(() => this.playTone(150, 0.5, 'sawtooth', 0.15), 600);
    }

    // Fonction utilitaire pour jouer un ton
    playTone(frequency, duration, type = 'sine', volume = 0.5) {
        if (!this.audioContext) return;

        // Réveiller l'AudioContext si suspendu
        if (this.audioContext.state === 'suspended') {
            this.audioContext.resume();
        }

        const oscillator = this.audioContext.createOscillator();
        const gainNode = this.audioContext.createGain();

        oscillator.connect(gainNode);
        gainNode.connect(this.audioContext.destination);

        oscillator.frequency.value = frequency;
        oscillator.type = type;

        gainNode.gain.setValueAtTime(volume, this.audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + duration);

        oscillator.start(this.audioContext.currentTime);
        oscillator.stop(this.audioContext.currentTime + duration);
    }

    toggle() {
        this.enabled = !this.enabled;
        return this.enabled;
    }
}

// Instance globale du gestionnaire de sons
const soundManager = new SoundManager();

class CourtOfShadowsClient {
    constructor() {
        this.ws = null;
        this.playerId = null;
        this.roomId = null;
        this.playerName = null;
        this.isHost = false;
        this.gameState = null;
        this.playerRole = null;
        this.playerFaction = null;
        this.allPlayers = []; // Liste complète des joueurs

        // Authentification
        this.user = null;
        this.isAuthenticated = false;

        // Flag pour indiquer qu'on est en train de choisir des cartes
        this.isSelectingDecrees = false;

        // Flag pour indiquer qu'on utilise un pouvoir
        this.isUsingPower = false;

        // Flag pour afficher le résultat d'un pouvoir (empêche l'écrasement par le débat)
        this.isShowingPowerResult = false;

        // Flag pour indiquer que le roi attend de répondre au véto
        this.isWaitingForVetoResponse = false;

        // Stockage temporaire des votes pour affichage
        this.currentVoteDetails = null;
        this.voteDisplayTimeout = null;

        // Statut des votes en cours (qui a voté)
        this.votedPlayerIds = [];

        // Joueurs dont on connaît le rôle (pour coloration)
        this.knownPlayers = [];

        // Cartes reçues (pour partage dans le chat)
        this.lastReceivedCards = null; // { role: 'king'|'chancellor', cards: [...] }

        this.selectedGameType = 'public';



        this.init();
    }

    init() {
        this.setupAuthListeners();
        this.setupEventListeners();
        this.checkStoredAuth();
        this.connect(); // Se connecter au serveur dès le début
        soundManager.init(); // Initialiser le gestionnaire de sons
    }

    // === AUTHENTIFICATION ===
    setupAuthListeners() {
        // Onglets d'authentification
        document.querySelectorAll('.auth-tab').forEach(tab => {
            tab.addEventListener('click', () => {
                const targetTab = tab.dataset.tab;
                this.switchAuthTab(targetTab);
            });
        });

        // Bouton de connexion
        document.getElementById('login-btn').addEventListener('click', () => {
            this.login();
        });

        // Bouton d'inscription
        document.getElementById('register-btn').addEventListener('click', () => {
            this.register();
        });

        // Bouton de déconnexion
        document.getElementById('logout-btn').addEventListener('click', () => {
            this.logout();
        });

        // Enter pour soumettre
        document.getElementById('login-password').addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.login();
        });

        document.getElementById('register-password-confirm').addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.register();
        });
    }

    switchAuthTab(tab) {
        document.querySelectorAll('.auth-tab').forEach(t => t.classList.remove('active'));
        document.querySelectorAll('.auth-form').forEach(f => f.classList.remove('active'));

        document.querySelector(`.auth-tab[data-tab="${tab}"]`).classList.add('active');
        document.getElementById(`${tab}-form`).classList.add('active');

        this.hideAuthError();
    }

    showAuthError(message) {
        const errorDiv = document.getElementById('auth-error');
        errorDiv.textContent = message;
        errorDiv.classList.add('visible');
    }

    hideAuthError() {
        document.getElementById('auth-error').classList.remove('visible');
    }

    checkStoredAuth() {
        const storedUser = localStorage.getItem('courtOfShadows_user');
        if (storedUser) {
            try {
                this.user = JSON.parse(storedUser);
                this.isAuthenticated = true;
                this.playerName = this.user.username;
                this.showLobby();
            } catch (e) {
                localStorage.removeItem('courtOfShadows_user');
            }
        }
    }

    login() {
        const username = document.getElementById('login-username').value.trim();
        const password = document.getElementById('login-password').value;

        if (!username || !password) {
            this.showAuthError('Veuillez remplir tous les champs');
            return;
        }

        this.send('login', { username, password });
    }

    register() {
        const username = document.getElementById('register-username').value.trim();
        const password = document.getElementById('register-password').value;
        const passwordConfirm = document.getElementById('register-password-confirm').value;

        if (!username || !password || !passwordConfirm) {
            this.showAuthError('Veuillez remplir tous les champs');
            return;
        }

        if (password !== passwordConfirm) {
            this.showAuthError('Les mots de passe ne correspondent pas');
            return;
        }

        this.send('register', { username, password });
    }

    handleLoginResult(data) {
        if (data.success) {
            this.user = data.user;
            this.isAuthenticated = true;
            this.playerName = data.user.username;
            localStorage.setItem('courtOfShadows_user', JSON.stringify(data.user));
            this.showLobby();
        } else {
            this.showAuthError(data.error);
        }
    }

    handleRegisterResult(data) {
        if (data.success) {
            this.user = data.user;
            this.isAuthenticated = true;
            this.playerName = data.user.username;
            localStorage.setItem('courtOfShadows_user', JSON.stringify(data.user));
            this.showLobby();
        } else {
            this.showAuthError(data.error);
        }
    }

    logout() {
        if (this.lobbyRefreshInterval) {
            clearInterval(this.lobbyRefreshInterval);
            this.lobbyRefreshInterval = null;
        }
        this.user = null;
        this.isAuthenticated = false;
        this.playerName = null;
        localStorage.removeItem('courtOfShadows_user');
        this.showScreen('auth-screen');
    }

    showLobby() {
        document.getElementById('logged-username').textContent = this.user.username;
        this.showScreen('lobby-screen');

        // Charger les parties publiques et mes parties
        this.refreshPublicGames();
        this.refreshMyGames();

        // Actualiser toutes les 10 secondes
        if (this.lobbyRefreshInterval) {
            clearInterval(this.lobbyRefreshInterval);
        }
        this.lobbyRefreshInterval = setInterval(() => {
            if (document.getElementById('lobby-screen').classList.contains('active')) {
                this.refreshPublicGames();
                this.refreshMyGames();
            }
        }, 10000);
    }

    refreshPublicGames() {
        this.send(MESSAGE_TYPES.GET_PUBLIC_GAMES);
    }

    refreshMyGames() {
        if (this.user && this.user.username) {
            this.send(MESSAGE_TYPES.GET_PLAYER_GAMES, {
                username: this.user.username
            });
        }
    }

    displayPublicGames(games) {
        const container = document.getElementById('public-games-list');

        if (!games || games.length === 0) {
            container.innerHTML = '<p style="text-align: center; color: #888;">Aucune partie publique disponible</p>';
            return;
        }

        container.innerHTML = '';

        games.forEach(game => {
            const gameItem = document.createElement('div');
            gameItem.className = 'game-item';

            const timeSince = this.getTimeSince(game.createdAt);

            gameItem.innerHTML = `
            <div class="game-info">
                <div class="game-host">👑 ${this.escapeHtml(game.hostName)}</div>
                <div class="game-details">
                    <div class="game-detail-item">
                        <span>👥</span>
                        <span>${game.playerCount}/${game.maxPlayers}</span>
                    </div>
                    <div class="game-detail-item">
                        <span>🕐</span>
                        <span>${timeSince}</span>
                    </div>
                    <div class="game-detail-item">
                        <span class="game-badge">PUBLIC</span>
                    </div>
                </div>
            </div>
            <div class="game-actions">
                <button class="btn btn-primary btn-small">Rejoindre</button>
            </div>
        `;

            gameItem.querySelector('.btn').addEventListener('click', (e) => {
                e.stopPropagation();
                this.joinPublicGame(game.roomId);
            });

            container.appendChild(gameItem);
        });
    }

    displayMyGames(games) {
        const container = document.getElementById('my-games-list');

        if (!games || games.length === 0) {
            container.innerHTML = '<p style="text-align: center; color: #888;">Aucune partie en cours</p>';
            return;
        }

        container.innerHTML = '';

        games.forEach(game => {
            const gameItem = document.createElement('div');
            gameItem.className = 'game-item';
            if (game.isPaused) {
                gameItem.classList.add('paused');
            }

            const phaseNames = {
                'nomination': '🛡️ Nomination',
                'council_vote': '🗳️ Vote',
                'legislative': '📜 Législative',
                'executive_power': '⚡ Pouvoir',
                'debate': '💬 Débat',
                'paused': '⏸️ Pause'
            };

            const phaseName = phaseNames[game.phase] || game.phase;
            const timeSince = this.getTimeSince(game.lastActivity);

            let statusBadges = '';
            if (game.isPaused) {
                statusBadges += '<span class="game-badge paused">⏸️ EN PAUSE</span>';
            }
            if (!game.isAlive) {
                statusBadges += '<span class="game-badge dead">💀 ÉLIMINÉ</span>';
            }

            gameItem.innerHTML = `
            <div class="game-info">
                <div class="game-host">👑 ${this.escapeHtml(game.hostName)}</div>
                <div class="game-details">
                    <div class="game-detail-item">
                        <span>👥</span>
                        <span>${game.playerCount} joueurs</span>
                    </div>
                    <div class="game-detail-item">
                        <span>📍</span>
                        <span>${phaseName}</span>
                    </div>
                    <div class="game-detail-item">
                        <span>🕐</span>
                        <span>${timeSince}</span>
                    </div>
                    ${statusBadges}
                </div>
            </div>
            <div class="game-actions">
                <button class="btn btn-warning btn-small">Reconnecter</button>
            </div>
        `;

            gameItem.querySelector('.btn').addEventListener('click', (e) => {
                e.stopPropagation();
                this.reconnectToSpecificGame(game.roomId);
            });

            container.appendChild(gameItem);
        });
    }

    joinPublicGame(roomId) {
        this.send(MESSAGE_TYPES.JOIN_GAME, {
            playerName: this.playerName,
            username: this.user.username,
            roomId,
            isPublic: true
        });
    }

    reconnectToSpecificGame(roomId) {
        this.send(MESSAGE_TYPES.RECONNECT, {
            playerName: this.playerName,
            roomId
        });
    }

    getTimeSince(timestamp) {
        const now = Date.now();
        const diff = now - timestamp;

        const seconds = Math.floor(diff / 1000);
        const minutes = Math.floor(seconds / 60);
        const hours = Math.floor(minutes / 60);
        const days = Math.floor(hours / 24);

        if (days > 0) return `Il y a ${days}j`;
        if (hours > 0) return `Il y a ${hours}h`;
        if (minutes > 0) return `Il y a ${minutes}min`;
        return 'À l\'instant';
    }

    // === CONNEXION WEBSOCKET ===
    connect() {
        const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
        const wsUrl = `${protocol}//${window.location.host}`;

        this.ws = new WebSocket(wsUrl);

        this.ws.onopen = () => {
            console.log('✅ Connecté au serveur');
        };

        this.ws.onmessage = (event) => {
            const message = JSON.parse(event.data);
            this.handleMessage(message);
        };

        this.ws.onerror = (error) => {
            console.error('❌ Erreur WebSocket:', error);
            this.showError('Erreur de connexion au serveur');
        };

        this.ws.onclose = () => {
            console.log('🔌 Connexion fermée');
            this.showError('Connexion perdue. Rechargez la page.');
        };
    }

    send(type, data = {}) {
        if (this.ws && this.ws.readyState === WebSocket.OPEN) {
            this.ws.send(JSON.stringify({ type, ...data }));
        }
    }

    // === GESTION DES MESSAGES ===
    handleMessage(message) {
        console.log('Message reçu:', message);

        switch (message.type) {
            case 'login_result':
                this.handleLoginResult(message);
                break;
            case 'register_result':
                this.handleRegisterResult(message);
                break;
            case MESSAGE_TYPES.JOIN_GAME:
                this.handleJoinGame(message);
                break;
            case MESSAGE_TYPES.PUBLIC_GAMES_LIST:
                this.displayPublicGames(message.data);
                break;
            case MESSAGE_TYPES.PLAYER_GAMES_LIST:
                this.displayMyGames(message.data);
                break;
            case MESSAGE_TYPES.PLAYER_LIST:
                this.updatePlayerList(message.data);
                break;
            case MESSAGE_TYPES.GAME_STATE:
                this.updateGameState(message.data);
                break;
            case MESSAGE_TYPES.ROLE_ASSIGNMENT:
                this.handleRoleAssignment(message.data);
                break;
            case MESSAGE_TYPES.PHASE_CHANGE:
                this.handlePhaseChange(message.phase);
                break;
            case MESSAGE_TYPES.NOMINATION_RESULT:
                this.handleNominationResult(message.data);
                break;
            case MESSAGE_TYPES.VOTE_RESULT:
                this.handleVoteResult(message.data);
                break;
            case MESSAGE_TYPES.VOTE_STATUS:
                this.handleVoteStatus(message.data);
                break;
            case MESSAGE_TYPES.DECREE_PASSED:
                this.handleDecreePassed(message.data);
                break;
            case MESSAGE_TYPES.POWER_ACTIVATED:
                this.handlePowerActivated(message.data);
                break;
            case MESSAGE_TYPES.GAME_OVER:
                this.handleGameOver(message.data);
                break;
            case MESSAGE_TYPES.CHAT_BROADCAST:
                this.handleChatMessage(message.data);
                break;
            case MESSAGE_TYPES.ERROR:
                this.showError(message.message);
                break;
            case 'king_decrees':
                this.showKingDecrees(message.data.decrees);
                break;
            case 'chancellor_decrees':
                this.showChancellorDecrees(message.data.decrees, message.data.vetoRejected || false);
                break;
            case 'power_result':
                this.showPowerResult(message.data);
                break;
            case 'execution_result':
                this.handleExecutionResult(message.data);
                break;
            case MESSAGE_TYPES.GAME_PAUSED:
                this.handleGamePaused(message.data);
                break;
            case MESSAGE_TYPES.GAME_RESUMED:
                this.handleGameResumed(message.data);
                break;
            case MESSAGE_TYPES.VETO_PROPOSED:
                this.handleVetoProposed(message.data);
                break;
            case MESSAGE_TYPES.VETO_RESULT:
                this.handleVetoResult(message.data);
                break;
            case 'veto_pending':
                this.handleVetoPending(message.data);
                break;
        }
    }

    // === ÉCRANS ===
    showScreen(screenId) {
        document.querySelectorAll('.screen').forEach(screen => {
            screen.classList.remove('active');
        });
        document.getElementById(screenId).classList.add('active');
    }

    // === LOBBY ===
    setupEventListeners() {
        // Lobby - CES BOUTONS N'EXISTENT PAS AU CHARGEMENT INITIAL
        const createGameBtn = document.getElementById('create-game-btn');
        const joinGameBtn = document.getElementById('join-game-btn');
        const reconnectBtn = document.getElementById('reconnect-btn');
        const roomCodeInput = document.getElementById('room-code');

        // Vérifier que les éléments existent avant d'ajouter les listeners
        if (createGameBtn) {
            createGameBtn.addEventListener('click', () => {
                this.createGame();
            });
        }

        if (joinGameBtn) {
            joinGameBtn.addEventListener('click', () => {
                this.joinGame();
            });
        }

        if (reconnectBtn) {
            reconnectBtn.addEventListener('click', () => {
                this.reconnectToGame();
            });
        }

        if (roomCodeInput) {
            roomCodeInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') this.joinGame();
            });
        }

        // Salle d'attente
        const startGameBtn = document.getElementById('start-game-btn');
        const leaveGameBtn = document.getElementById('leave-game-btn');
        const copyCodeBtn = document.getElementById('copy-code-btn');

        if (startGameBtn) {
            startGameBtn.addEventListener('click', () => {
                this.startGame();
            });
        }

        if (leaveGameBtn) {
            leaveGameBtn.addEventListener('click', () => {
                this.leaveGame();
            });
        }

        if (copyCodeBtn) {
            copyCodeBtn.addEventListener('click', () => {
                this.copyRoomCode();
            });
        }

        // Paramètres de la partie
        const settingConspirators = document.getElementById('setting-conspirators-know-usurper');
        const settingUsurper = document.getElementById('setting-usurper-knows-allies');

        if (settingConspirators) {
            settingConspirators.addEventListener('change', (e) => {
                this.updateSettings({ conspiratorsKnowUsurper: e.target.checked });
            });
        }

        if (settingUsurper) {
            settingUsurper.addEventListener('change', (e) => {
                this.updateSettings({ usurperKnowsAllies: e.target.checked });
            });
        }

        // Chat
        const sendChatBtn = document.getElementById('send-chat-btn');
        const chatInput = document.getElementById('chat-input');

        if (sendChatBtn) {
            sendChatBtn.addEventListener('click', () => {
                this.sendChatMessage();
            });
        }

        if (chatInput) {
            chatInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') this.sendChatMessage();
            });
        }

        // Game over
        const newGameBtn = document.getElementById('new-game-btn');
        const returnLobbyBtn = document.getElementById('return-lobby-btn');

        if (newGameBtn) {
            newGameBtn.addEventListener('click', () => {
                window.location.reload();
            });
        }

        if (returnLobbyBtn) {
            returnLobbyBtn.addEventListener('click', () => {
                window.location.reload();
            });
        }

        // Boutons de type de partie
        document.querySelectorAll('.game-type-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                document.querySelectorAll('.game-type-btn').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                this.selectedGameType = btn.dataset.type;

                // Afficher/masquer le champ mot de passe
                const passwordField = document.getElementById('private-password-field');
                if (passwordField) {
                    if (this.selectedGameType === 'private') {
                        passwordField.style.display = 'block';
                    } else {
                        passwordField.style.display = 'none';
                    }
                }
            });
        });

        // Boutons de rafraîchissement
        const refreshPublic = document.getElementById('refresh-public-games');
        const refreshMy = document.getElementById('refresh-my-games');

        if (refreshPublic) {
            refreshPublic.addEventListener('click', () => {
                this.refreshPublicGames();
            });
        }

        if (refreshMy) {
            refreshMy.addEventListener('click', () => {
                this.refreshMyGames();
            });
        }
    }



    createGame() {
        if (!this.isAuthenticated) {
            this.showError('Veuillez vous connecter');
            return;
        }

        const isPublic = this.selectedGameType === 'public';
        const password = isPublic ? null : document.getElementById('game-password').value.trim();

        if (!isPublic && !password) {
            this.showError('Veuillez entrer un mot de passe pour la partie privée');
            return;
        }

        this.send(MESSAGE_TYPES.JOIN_GAME, {
            playerName: this.playerName,
            username: this.user.username,
            isPublic,
            password
        });
    }

    joinGame() {
        if (!this.isAuthenticated) {
            this.showError('Veuillez vous connecter');
            return;
        }

        const roomCode = document.getElementById('room-code').value.trim();
        const password = document.getElementById('join-password').value.trim();

        if (!roomCode) {
            this.showError('Veuillez entrer le code de la partie');
            return;
        }

        this.send(MESSAGE_TYPES.JOIN_GAME, {
            playerName: this.playerName,
            username: this.user.username,
            roomId: roomCode,
            password: password || null
        });
    }

    reconnectToGame() {
        if (!this.isAuthenticated) {
            this.showError('Veuillez vous connecter');
            return;
        }

        this.send(MESSAGE_TYPES.RECONNECT, {
            playerName: this.playerName
        });
    }

    handleJoinGame(message) {
        if (message.success) {
            this.playerId = message.data.playerId;
            this.roomId = message.data.roomId;
            this.isHost = message.data.isHost;

            // Si reconnexion, aller directement à l'écran de jeu
            if (message.data.reconnected) {
                this.showScreen('game-screen');
                this.updatePlayerNameDisplay();
                this.showNotification('Reconnecté à la partie !');
            } else {
                this.showWaitingRoom();
            }
        }
    }

    showWaitingRoom() {
        this.showScreen('waiting-room');
        document.getElementById('display-room-code').textContent = this.roomId;

        if (this.isHost) {
            document.getElementById('start-game-btn').style.display = 'block';
            document.getElementById('game-settings').style.display = 'block';
        } else {
            document.getElementById('game-settings').style.display = 'none';
        }
    }

    updateSettings(settings) {
        this.send(MESSAGE_TYPES.UPDATE_SETTINGS, {
            playerId: this.playerId,
            roomId: this.roomId,
            settings
        });
    }

    copyRoomCode() {
        navigator.clipboard.writeText(this.roomId);
        const btn = document.getElementById('copy-code-btn');
        btn.textContent = '✅';
        setTimeout(() => {
            btn.textContent = '📋';
        }, 2000);
    }

    updatePlayerList(players) {
        this.allPlayers = players; // SAUVEGARDER LA LISTE
        
        const container = document.getElementById('players-container');
        const count = document.getElementById('player-count');

        count.textContent = players.length;
        container.innerHTML = '';

        players.forEach(player => {
            const div = document.createElement('div');
            div.className = 'player-item' + (player.isHost ? ' host' : '');
            div.innerHTML = `
                <span class="player-icon">${player.isHost ? '👑' : '🎭'}</span>
                <span>${player.name}</span>
            `;
            container.appendChild(div);
        });
    }

    startGame() {
        this.send(MESSAGE_TYPES.START_GAME, {
            playerId: this.playerId,
            roomId: this.roomId
        });
    }

    leaveGame() {
        window.location.reload();
    }

    // === RÉVÉLATION DES RÔLES ===
    handleRoleAssignment(data) {
        this.playerRole = data.role;
        this.playerFaction = data.faction;

        this.showScreen('role-reveal');

        const roleCard = document.querySelector('.role-card');
        const roleIcon = document.getElementById('role-icon');
        const roleTitle = document.getElementById('role-title');
        const roleDesc = document.getElementById('role-description');

        // Définir le contenu selon le rôle
        if (data.role === ROLES.USURPER) {
            roleCard.className = 'role-card conspirator';
            roleIcon.textContent = '👑💀';
            roleTitle.textContent = 'L\'USURPATEUR';
            roleDesc.textContent = 'Vous êtes le chef secret des conspirateurs. Devenez Chancelier après 3 Complots pour gagner !';
        } else if (data.role === ROLES.CONSPIRATOR) {
            roleCard.className = 'role-card conspirator';
            roleIcon.textContent = '🗡️';
            roleTitle.textContent = 'CONSPIRATEUR';
            roleDesc.textContent = 'Votez des Complots et protégez l\'Usurpateur. 6 Complots = Victoire !';
        } else {
            roleCard.className = 'role-card loyalist';
            roleIcon.textContent = '⚜️';
            roleTitle.textContent = 'LOYALISTE';
            roleDesc.textContent = 'Votez des Édits Royaux et trouvez l\'Usurpateur. 5 Édits = Victoire !';
        }

        // Afficher les alliés si présents et les ajouter aux joueurs connus
        if (data.allies && data.allies.length > 0) {
            // Ajouter les alliés à la liste des joueurs connus pour la surbrillance
            data.allies.forEach(ally => {
                if (ally.id && ally.role) {
                    this.knownPlayers.push({ id: ally.id, role: ally.role });
                }
            });

            const alliesInfo = document.createElement('div');
            alliesInfo.className = 'allies-info';
            alliesInfo.style.cssText = 'margin-top: 20px; padding: 15px; background: rgba(0,0,0,0.3); border-radius: 10px; border: 1px solid rgba(212, 175, 55, 0.5);';

            const alliesTitle = data.role === ROLES.USURPER ? 'Vos alliés conspirateurs :' : 'L\'Usurpateur est :';
            const alliesNames = data.allies.map(a => `<strong style="color: #ff6b6b;">${a.name}</strong>`).join(', ');

            alliesInfo.innerHTML = `
                <p style="color: var(--gold); margin-bottom: 10px; font-weight: bold;">${alliesTitle}</p>
                <p style="font-size: 1.2rem;">${alliesNames}</p>
            `;
            roleDesc.parentNode.appendChild(alliesInfo);
        }

        setTimeout(() => {
            this.showScreen('game-screen');
            this.updatePlayerNameDisplay();
            this.updateRoleDisplay();
        }, 4000);
    }

    updatePlayerNameDisplay() {
        const nameElement = document.getElementById('game-player-name');
        if (nameElement && this.playerName) {
            nameElement.textContent = this.playerName;
        }

        // Afficher le bouton pause pour le créateur
        const pauseBtn = document.getElementById('host-pause-btn');
        if (pauseBtn) {
            if (this.isHost) {
                pauseBtn.style.display = 'inline-block';
                pauseBtn.onclick = () => {
                    if (confirm('Mettre la partie en pause ?')) {
                        this.send(MESSAGE_TYPES.FORCE_PAUSE, {
                            playerId: this.playerId,
                            roomId: this.roomId
                        });
                    }
                };
            } else {
                pauseBtn.style.display = 'none';
            }
        }
    }

    updateRoleDisplay() {
        const roleDisplay = document.getElementById('player-role-display');
        const roleValue = document.getElementById('your-role-value');

        if (!roleDisplay || !roleValue || !this.playerRole) return;

        // Retirer les classes existantes
        roleDisplay.classList.remove('loyalist', 'conspirator', 'usurper');

        const roleNames = {
            [ROLES.USURPER]: 'Usurpateur',
            [ROLES.CONSPIRATOR]: 'Conspirateur',
            [ROLES.LOYALIST]: 'Loyaliste'
        };

        roleValue.textContent = roleNames[this.playerRole] || this.playerRole;
        roleDisplay.classList.add(this.playerRole);
    }

    // === JEU PRINCIPAL ===
    updateGameState(state) {
        this.gameState = state;

        // Stocker les joueurs connus (pour la coloration)
        if (state.knownPlayers) {
            this.knownPlayers = state.knownPlayers;
        }

        // Mettre à jour les scores
        document.getElementById('plots-count').textContent = state.plotsCount;
        document.getElementById('edits-count').textContent = state.editsCount;
        document.getElementById('deadlock-count').textContent = state.deadlockCount;

        // Mettre à jour pioche et défausse
        document.getElementById('deck-count').textContent = state.deckSize;
        document.getElementById('discard-count').textContent = state.discardSize;

        // Mettre à jour les plateaux visuels
        if (window.updateProgressionBoards) {
            window.updateProgressionBoards(state.plotsCount, state.editsCount);
        }

        // Mettre à jour les pouvoirs selon le nombre de joueurs
        if (window.updateBoardPowers) {
            window.updateBoardPowers(state.playerCount);
        }

        // Mettre à jour la phase
        this.updatePhase(state.phase);

        // Mettre à jour la liste des joueurs dans le jeu
        this.updateGamePlayersList(state);

        // Mettre à jour l'ordre des joueurs
        if (window.updatePlayerOrder && this.allPlayers.length > 0) {
            window.updatePlayerOrder(
                this.allPlayers,
                state.currentKingId,
                state.currentChancellorId
            );
        }

        // Gérer l'action selon la phase
        this.updateActionArea(state);
    }

    updatePhase(phase) {
        const phaseElement = document.getElementById('current-phase');

        const phaseNames = {
            [GAME_PHASES.NOMINATION]: '🏛️ Nomination du Chancelier',
            [GAME_PHASES.COUNCIL_VOTE]: '🗳️ Vote du Conseil',
            [GAME_PHASES.LEGISLATIVE]: '📜 Session Législative',
            [GAME_PHASES.EXECUTIVE_POWER]: '⚡ Pouvoir Exécutif',
            [GAME_PHASES.DEBATE]: '💬 Débat de la Cour',
            [GAME_PHASES.PAUSED]: '⏸️ Partie en Pause'
        };

        phaseElement.textContent = phaseNames[phase] || phase;
    }

    updateGamePlayersList(state) {
        const container = document.getElementById('game-players-list');
        if (!container) return;

        container.innerHTML = '';

        // Utiliser l'ordre du serveur si disponible, sinon l'ordre de connexion
        let orderedPlayers = this.allPlayers;
        if (state.playerOrder && state.playerOrder.length > 0) {
            orderedPlayers = state.playerOrder
                .map(id => this.allPlayers.find(p => p.id === id))
                .filter(p => p); // Filtrer les undefined
        }

        orderedPlayers.forEach((player, index) => {
            const div = document.createElement('div');
            div.className = 'game-player-item';
            div.dataset.playerId = player.id;

            // Numéro d'ordre de présidence (1er, 2ème, etc.)
            const orderNumber = index + 1;

            if (player.id === state.currentKingId) {
                div.classList.add('current-king');
            }
            if (player.id === state.currentChancellorId) {
                div.classList.add('current-chancellor');
            }
            if (!player.isAlive) {
                div.classList.add('eliminated');
            }

            // Appliquer la classe de rôle si on connaît ce joueur
            const knownPlayer = this.knownPlayers.find(kp => kp.id === player.id);
            if (knownPlayer) {
                if (knownPlayer.role === ROLES.LOYALIST) {
                    div.classList.add('role-loyalist');
                } else if (knownPlayer.role === ROLES.CONSPIRATOR) {
                    div.classList.add('role-conspirator');
                } else if (knownPlayer.role === ROLES.USURPER) {
                    div.classList.add('role-usurper');
                }
            }

            let badges = '';
            if (player.id === state.currentKingId) badges += '<span class="player-badge">👑 Roi</span>';
            if (player.id === state.currentChancellorId) badges += '<span class="player-badge">🎯 Chancelier</span>';

            // Afficher le vote si disponible (résultat final)
            let voteDisplay = '';
            if (this.currentVoteDetails) {
                const playerVote = this.currentVoteDetails.find(v => v.playerId === player.id);
                if (playerVote) {
                    const voteClass = playerVote.vote === 'yes' ? 'vote-yes' : 'vote-no';
                    const voteText = playerVote.vote === 'yes' ? '✓ OUI' : '✗ NON';
                    voteDisplay = `<span class="player-vote ${voteClass}">${voteText}</span>`;
                }
            }
            // Sinon, pendant la phase de vote, montrer qui a voté / qui réfléchit
            else if (state.phase === GAME_PHASES.COUNCIL_VOTE && player.isAlive) {
                const hasVoted = this.votedPlayerIds.includes(player.id);
                if (hasVoted) {
                    voteDisplay = `<span class="vote-status voted">✓ A voté</span>`;
                } else {
                    voteDisplay = `<span class="vote-status thinking"><span class="loading-spinner"></span> Réfléchit...</span>`;
                }
            }

            // Afficher l'indication du rôle connu
            let roleIndicator = '';
            if (knownPlayer && knownPlayer.id !== this.playerId) {
                const roleNames = {
                    [ROLES.USURPER]: '👑💀 Usurpateur',
                    [ROLES.CONSPIRATOR]: '🗡️ Conspirateur',
                    [ROLES.LOYALIST]: '⚜️ Loyaliste'
                };
                roleIndicator = `<span class="known-role">${roleNames[knownPlayer.role] || ''}</span>`;
            }

            div.innerHTML = `
                <div class="player-order-number">${orderNumber}</div>
                <div class="player-name">${player.name}</div>
                ${roleIndicator}
                ${voteDisplay}
                ${badges}
            `;

            container.appendChild(div);
        });
    }

    updateActionArea(state) {
        const container = document.getElementById('action-container');

        // Si le joueur est mort, afficher le mode spectateur
        if (!state.isAlive) {
            this.showSpectatorUI(state);
            return;
        }

        switch (state.phase) {
            case GAME_PHASES.NOMINATION:
                if (state.currentKingId === this.playerId) {
                    this.showNominationUI(state);
                } else {
                    this.showWaitingUI(`En attente de la nomination du Roi...`);
                }
                break;

            case GAME_PHASES.COUNCIL_VOTE:
                this.showVoteUI();
                break;

            case GAME_PHASES.LEGISLATIVE:
                // Ne pas écraser l'affichage si on est en train de choisir des cartes ou d'attendre la réponse au véto
                if (!this.isSelectingDecrees && !this.isWaitingForVetoResponse) {
                    this.showWaitingUI('Session législative en cours...');
                }
                break;

            case GAME_PHASES.EXECUTIVE_POWER:
                if (state.currentKingId === this.playerId) {
                    // L'UI sera affichée par handlePowerActivated
                    if (!this.isUsingPower) {
                        this.showWaitingUI('Préparez-vous à utiliser votre pouvoir...');
                    }
                } else {
                    this.showWaitingUI('Le Roi utilise son pouvoir...');
                }
                break;

            case GAME_PHASES.DEBATE:
                // Ne pas écraser l'affichage si on montre un résultat de pouvoir
                if (!this.isShowingPowerResult) {
                    this.showDebateUI();
                }
                break;

            case GAME_PHASES.PAUSED:
                this.showPausedUI(state);
                break;

            default:
                container.innerHTML = '';
        }
    }

    showSpectatorUI(state) {
        const container = document.getElementById('action-container');

        const phaseNames = {
            [GAME_PHASES.NOMINATION]: 'Nomination du Chancelier',
            [GAME_PHASES.COUNCIL_VOTE]: 'Vote du Conseil',
            [GAME_PHASES.LEGISLATIVE]: 'Session Législative',
            [GAME_PHASES.EXECUTIVE_POWER]: 'Pouvoir Exécutif',
            [GAME_PHASES.DEBATE]: 'Débat de la Cour'
        };

        container.innerHTML = `
            <div class="action-content" style="text-align: center; padding: 40px 20px;">
                <div style="font-size: 4rem; margin-bottom: 20px;">💀</div>
                <h2 style="color: #c44; margin-bottom: 15px;">Vous êtes Éliminé</h2>
                <p style="font-size: 1.1rem; color: #888; margin-bottom: 20px;">
                    Vous observez la partie en tant que spectateur.
                </p>
                <div style="background: rgba(0,0,0,0.3); padding: 15px; border-radius: 10px;">
                    <p style="color: var(--gold); font-size: 1rem;">
                        Phase actuelle : <strong>${phaseNames[state.phase] || state.phase}</strong>
                    </p>
                </div>
            </div>
        `;
    }

    showPausedUI(state) {
        const container = document.getElementById('action-container');
        const disconnectedNames = state.disconnectedPlayers ? state.disconnectedPlayers.join(', ') : 'Un joueur';

        let hostButtons = '';
        if (this.isHost) {
            hostButtons = `
                <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid rgba(255,255,255,0.2);">
                    <p style="font-size: 0.9rem; color: #888; margin-bottom: 15px;">
                        En tant que créateur, vous pouvez forcer la reprise (les joueurs déconnectés seront éliminés).
                    </p>
                    <button id="force-resume-btn" class="btn btn-danger">
                        Forcer la reprise
                    </button>
                </div>
            `;
        }

        container.innerHTML = `
            <div class="action-content" style="text-align: center; padding: 60px 20px;">
                <div style="font-size: 5rem; margin-bottom: 30px;">⏸️</div>
                <h2 style="color: var(--gold); margin-bottom: 20px;">Partie en Pause</h2>
                <p style="font-size: 1.2rem; color: #ccc;">
                    En attente de reconnexion de : <strong>${disconnectedNames}</strong>
                </p>
                <p style="font-size: 1rem; color: #888; margin-top: 20px;">
                    La partie reprendra automatiquement quand le joueur se reconnectera.
                </p>
                ${hostButtons}
            </div>
        `;

        if (this.isHost) {
            document.getElementById('force-resume-btn').onclick = () => {
                if (confirm('Êtes-vous sûr ? Les joueurs déconnectés seront éliminés de la partie.')) {
                    this.send(MESSAGE_TYPES.FORCE_RESUME, {
                        playerId: this.playerId,
                        roomId: this.roomId
                    });
                }
            };
        }
    }

    handleGamePaused(data) {
        this.showNotification(`⏸️ ${data.message}`);
    }

    handleGameResumed(data) {
        this.showNotification(`▶️ ${data.playerName} s'est reconnecté ! La partie reprend.`);
    }

    // === VÉTO ===
    handleVetoProposed(data) {
        // Afficher l'UI pour le roi pour accepter/refuser le véto
        this.isWaitingForVetoResponse = true;
        const container = document.getElementById('action-container');

        container.innerHTML = `
            <h2 class="action-title">🚫 Véto Proposé</h2>
            <div class="action-content">
                <p style="text-align: center; font-size: 1.3rem; margin-bottom: 30px;">
                    Le Chancelier <strong style="color: var(--gold);">${data.chancellorName}</strong>
                    propose d'utiliser le <strong style="color: #c44;">VÉTO</strong>.
                </p>
                <p style="text-align: center; font-size: 1rem; color: #aaa; margin-bottom: 30px;">
                    Si vous acceptez, les 2 cartes seront défaussées et aucune loi ne sera adoptée.<br>
                    Si vous refusez, le Chancelier devra choisir une carte.
                </p>
                <div class="vote-buttons" style="margin: 30px 0;">
                    <button class="vote-btn yes" id="accept-veto">
                        <div style="font-size: 2rem; margin-bottom: 10px;">✓</div>
                        <div>ACCEPTER</div>
                    </button>
                    <button class="vote-btn no" id="reject-veto">
                        <div style="font-size: 2rem; margin-bottom: 10px;">✗</div>
                        <div>REFUSER</div>
                    </button>
                </div>
            </div>
        `;

        document.getElementById('accept-veto').onclick = () => {
            this.isWaitingForVetoResponse = false;
            this.send(MESSAGE_TYPES.VETO_RESPONSE, {
                playerId: this.playerId,
                roomId: this.roomId,
                accepted: true
            });
            this.showWaitingUI('Véto accepté...');
        };

        document.getElementById('reject-veto').onclick = () => {
            this.isWaitingForVetoResponse = false;
            this.send(MESSAGE_TYPES.VETO_RESPONSE, {
                playerId: this.playerId,
                roomId: this.roomId,
                accepted: false
            });
            this.showWaitingUI('Véto refusé. Le Chancelier doit choisir une carte.');
        };
    }

    handleVetoPending(data) {
        // Pour les autres joueurs (pas le roi)
        this.showNotification(`🚫 ${data.chancellorName} propose un véto ! En attente de la décision du Roi...`);
    }

    handleVetoResult(data) {
        if (data.accepted) {
            soundManager.playVoteRejected();
            if (data.deadlock) {
                const decreeType = data.autoPassedDecree === DECREE_TYPES.PLOT ? 'Complot 🗡️' : 'Édit Royal ⚜️';
                this.showNotification(`🚫 Véto accepté ! IMPASSE : Un ${decreeType} est automatiquement adopté !`);
            } else {
                this.showNotification(`🚫 Véto accepté ! Les 2 cartes ont été défaussées.`);
            }
        } else {
            this.showNotification(`❌ Véto refusé ! Le Chancelier doit choisir une carte.`);
        }
    }

    showNominationUI(state) {
        const container = document.getElementById('action-container');

        container.innerHTML = `
            <h2 class="action-title">Nommez un Chancelier</h2>
            <div class="action-content">
                <p>Vous êtes le Roi 👑. Choisissez un joueur pour devenir Chancelier.</p>
                <div class="player-selector" id="chancellor-selector"></div>
                <button id="confirm-nomination" class="btn btn-primary" disabled>Confirmer la Nomination</button>
            </div>
        `;

        // Peupler avec les VRAIS joueurs
        this.populatePlayerSelector('chancellor-selector', state, (playerId) => {
            document.getElementById('confirm-nomination').disabled = false;
            document.getElementById('confirm-nomination').onclick = () => {
                this.nominateChancellor(playerId);
            };
        });
    }

    populatePlayerSelector(containerId, state, onSelect) {
        const container = document.getElementById(containerId);
        container.innerHTML = '';

        let selectedPlayerId = null;

        // Filtrer les joueurs éligibles
        const eligiblePlayers = this.allPlayers.filter(player => {
            // Pas soi-même
            if (player.id === this.playerId) return false;
            // Pas les joueurs morts
            if (!player.isAlive) return false;
            // Pas le chancelier précédent (seul inéligible)
            if (player.id === state.previousChancellorId) return false;
            return true;
        });

        if (eligiblePlayers.length === 0) {
            container.innerHTML = '<p style="text-align:center;">Aucun joueur éligible</p>';
            return;
        }

        eligiblePlayers.forEach(player => {
            const div = document.createElement('div');
            div.className = 'selectable-player';
            div.innerHTML = `
                <div class="player-icon">🎭</div>
                <div class="player-name-selector">${player.name}</div>
            `;

            div.onclick = () => {
                container.querySelectorAll('.selectable-player').forEach(p => {
                    p.classList.remove('selected');
                });
                div.classList.add('selected');
                selectedPlayerId = player.id;
                onSelect(selectedPlayerId);
            };

            container.appendChild(div);
        });
    }

    nominateChancellor(chancellorId) {
        this.send(MESSAGE_TYPES.NOMINATE_CHANCELLOR, {
            playerId: this.playerId,
            roomId: this.roomId,
            chancellorId
        });
        this.showWaitingUI('Nomination envoyée. En attente du vote...');
    }

    handleNominationResult(data) {
        const chancellorName = this.allPlayers.find(p => p.id === data.chancellorId)?.name || 'Inconnu';
        this.showNotification(`🎯 ${chancellorName} a été nominé Chancelier !`);
    }

    // === VOTE ===
    showVoteUI() {
        const container = document.getElementById('action-container');
        const chancellorName = this.allPlayers.find(p => p.id === this.gameState.nominatedChancellorId)?.name || 'Inconnu';

        container.innerHTML = `
            <h2 class="action-title">Vote du Conseil</h2>
            <div class="action-content">
                <p style="font-size: 1.3rem; text-align: center; margin: 20px 0;">
                    Approuvez-vous <strong style="color: var(--gold);">${chancellorName}</strong> comme Chancelier ?
                </p>
                <div class="vote-buttons">
                    <button class="vote-btn yes" id="vote-yes">
                        <div style="font-size: 3rem; margin-bottom: 10px;">✓</div>
                        <div>OUI</div>
                    </button>
                    <button class="vote-btn no" id="vote-no">
                        <div style="font-size: 3rem; margin-bottom: 10px;">✗</div>
                        <div>NON</div>
                    </button>
                </div>
            </div>
        `;

        document.getElementById('vote-yes').onclick = () => this.vote(VOTE_OPTIONS.YES);
        document.getElementById('vote-no').onclick = () => this.vote(VOTE_OPTIONS.NO);
    }

    vote(voteChoice) {
        this.send(MESSAGE_TYPES.VOTE, {
            playerId: this.playerId,
            roomId: this.roomId,
            vote: voteChoice
        });
        this.showWaitingUI('Vote envoyé. En attente des autres joueurs...');
    }

    handleVoteStatus(data) {
        this.votedPlayerIds = data.votedPlayerIds || [];
        // Mettre à jour l'affichage des joueurs
        if (this.gameState) {
            this.updateGamePlayersList(this.gameState);
        }
    }

    handleVoteResult(data) {
        // Réinitialiser le statut des votes
        this.votedPlayerIds = [];

        if (data.voteResult.passed) {
            this.showNotification(`✅ Vote accepté ! (${data.voteResult.yes} OUI, ${data.voteResult.no} NON)`);
            soundManager.playVoteAccepted();
        } else {
            this.showNotification(`❌ Vote rejeté ! (${data.voteResult.yes} OUI, ${data.voteResult.no} NON)`);
            soundManager.playVoteRejected();
        }

        // Afficher les détails des votes sous les pseudos pendant 7 secondes
        if (data.voteDetails) {
            this.currentVoteDetails = data.voteDetails;
            this.updateGamePlayersList(this.gameState);

            // Effacer après 7 secondes
            if (this.voteDisplayTimeout) {
                clearTimeout(this.voteDisplayTimeout);
            }
            this.voteDisplayTimeout = setTimeout(() => {
                this.currentVoteDetails = null;
                if (this.gameState) {
                    this.updateGamePlayersList(this.gameState);
                }
            }, 10000);
        }
    }

    // === AUTRES MÉTHODES ===
    handleDecreePassed(data) {
        const decreeType = data.decree === DECREE_TYPES.PLOT ? 'Complot 🗡️' : 'Édit Royal ⚜️';
        this.showNotification(`📜 Un ${decreeType} a été adopté !`);

        // Jouer le son approprié selon le type de décret
        if (data.decree === DECREE_TYPES.PLOT) {
            soundManager.playPlotPassed();
        } else {
            soundManager.playEditPassed();
        }
    }

    showDebateUI() {
        const container = document.getElementById('action-container');
        const isKing = this.gameState && this.gameState.currentKingId === this.playerId;

        let buttonHtml = '';
        if (isKing) {
            buttonHtml = `
                <button id="next-turn-btn" class="btn btn-primary" style="margin-top: 30px;">
                    Passer au Tour Suivant
                </button>
            `;
        } else {
            buttonHtml = `
                <p style="text-align: center; font-style: italic; margin-top: 20px; color: #888;">
                    En attente que le Roi passe au tour suivant...
                </p>
            `;
        }

        container.innerHTML = `
            <h2 class="action-title">💬 Débat de la Cour</h2>
            <div class="action-content">
                <p style="text-align: center; font-size: 1.2rem;">
                    Discutez avec les autres joueurs dans le chat.
                </p>
                ${buttonHtml}
            </div>
        `;

        // Ajouter l'événement au bouton si c'est le roi
        if (isKing) {
            document.getElementById('next-turn-btn').onclick = () => {
                this.endTurn();
            };
        }
    }

    endTurn() {
        this.send(MESSAGE_TYPES.END_TURN, {
            playerId: this.playerId,
            roomId: this.roomId
        });
    }

    showWaitingUI(message) {
        const container = document.getElementById('action-container');
        container.innerHTML = `
            <div class="action-content" style="text-align: center; padding: 60px 20px;">
                <div class="pulse" style="font-size: 5rem; margin-bottom: 30px;">⏳</div>
                <p style="font-size: 1.4rem; color: var(--gold);">${message}</p>
            </div>
        `;
    }

    // === CHAT ===
    sendChatMessage() {
        const input = document.getElementById('chat-input');
        const message = input.value.trim();

        if (!message) return;

        this.send(MESSAGE_TYPES.CHAT_MESSAGE, {
            playerId: this.playerId,
            roomId: this.roomId,
            message
        });

        input.value = '';
    }

    // Mettre à jour le bouton de partage des cartes
    updateShareCardsButton() {
        const container = document.getElementById('share-cards-container');
        if (!container) return;

        if (!this.lastReceivedCards) {
            container.innerHTML = '';
            return;
        }

        const { role, cards } = this.lastReceivedCards;
        const roleLabel = role === 'king' ? 'Roi' : 'Chancelier';

        // Créer les boutons pour chaque combinaison possible
        const cardIcons = cards.map(c => c === DECREE_TYPES.PLOT ? '🗡️' : '⚜️').join('');
        const cardLetters = cards.map(c => c === DECREE_TYPES.PLOT ? 'R' : 'B').join('');

        container.innerHTML = `
            <div class="share-cards-section">
                <span class="share-cards-label">Partager mes cartes (${roleLabel}) :</span>
                <div class="share-cards-buttons">
                    <button class="share-card-btn" data-message="J'avais : ${cardIcons}">
                        ${cardIcons}
                    </button>
                    <button class="share-card-btn" data-message="J'avais : ${cardLetters}">
                        ${cardLetters}
                    </button>
                </div>
            </div>
        `;

        // Ajouter les événements
        container.querySelectorAll('.share-card-btn').forEach(btn => {
            btn.onclick = () => {
                const message = btn.dataset.message;
                this.send(MESSAGE_TYPES.CHAT_MESSAGE, {
                    playerId: this.playerId,
                    roomId: this.roomId,
                    message
                });
            };
        });
    }

    handleChatMessage(data) {
        const container = document.getElementById('chat-messages');

        const messageDiv = document.createElement('div');
        messageDiv.className = 'chat-message';
        messageDiv.innerHTML = `
            <div class="chat-author">${data.playerName}</div>
            <div class="chat-text">${this.escapeHtml(data.message)}</div>
        `;

        container.appendChild(messageDiv);
        container.scrollTop = container.scrollHeight;
    }

    // === EXÉCUTION ===
    handleExecutionResult(data) {
        const { executedName, wasUsurper } = data;

        // Jouer le son d'exécution
        soundManager.playExecution();

        if (wasUsurper) {
            this.showNotification(`💀 ${executedName} a été exécuté... C'ÉTAIT L'USURPATEUR ! 👑💀`);
        } else {
            this.showNotification(`💀 ${executedName} a été exécuté. Ce n'était PAS l'Usurpateur.`);
        }
    }

    // === GAME OVER ===
    handleGameOver(data) {
        this.showScreen('game-over-screen');

        const title = document.getElementById('winner-title');
        const reason = document.getElementById('winner-reason');
        const rolesContainer = document.getElementById('final-roles-container');

        // Déterminer si le joueur a gagné ou perdu
        const playerWon = (data.winner === FACTIONS.LOYALISTS && this.playerFaction === FACTIONS.LOYALISTS) ||
                          (data.winner === FACTIONS.CONSPIRATORS && this.playerFaction === FACTIONS.CONSPIRATORS);

        // Jouer le son de victoire ou défaite
        if (playerWon) {
            soundManager.playVictory();
        } else {
            soundManager.playDefeat();
        }

        if (data.winner === FACTIONS.LOYALISTS) {
            title.textContent = '⚜️ Les Loyalistes ont gagné !';
            title.style.color = '#4a7bbf';
        } else {
            title.textContent = '🗡️ Les Conspirateurs ont gagné !';
            title.style.color = '#8b0000';
        }

        reason.textContent = data.reason;

        // Afficher tous les rôles
        if (data.allRoles && rolesContainer) {
            rolesContainer.innerHTML = '<h3>Révélation des Rôles</h3>';

            const rolesGrid = document.createElement('div');
            rolesGrid.className = 'final-roles-grid';

            data.allRoles.forEach(player => {
                const roleCard = document.createElement('div');
                roleCard.className = `final-role-card ${player.faction}`;
                if (!player.isAlive) {
                    roleCard.classList.add('dead');
                }

                const roleNames = {
                    [ROLES.USURPER]: '👑💀 Usurpateur',
                    [ROLES.CONSPIRATOR]: '🗡️ Conspirateur',
                    [ROLES.LOYALIST]: '⚜️ Loyaliste'
                };

                roleCard.innerHTML = `
                    <div class="final-role-name">${player.name}</div>
                    <div class="final-role-type">${roleNames[player.role] || player.role}</div>
                    ${!player.isAlive ? '<div class="final-role-dead">💀 Éliminé</div>' : ''}
                `;

                rolesGrid.appendChild(roleCard);
            });

            rolesContainer.appendChild(rolesGrid);
        }
    }

    // === UTILITAIRES ===
    showNotification(message) {
        const notification = document.createElement('div');
        notification.style.cssText = `
            position: fixed;
            top: 30px;
            right: 30px;
            background: linear-gradient(135deg, var(--gold) 0%, var(--bronze) 100%);
            color: var(--midnight-black);
            padding: 25px 35px;
            border-radius: 15px;
            box-shadow: 0 10px 40px rgba(0,0,0,0.6);
            z-index: 10000;
            font-weight: 700;
            font-size: 1.1rem;
            animation: slideIn 0.5s cubic-bezier(0.4, 0, 0.2, 1);
        `;
        notification.textContent = message;

        document.body.appendChild(notification);

        setTimeout(() => {
            notification.style.animation = 'slideOut 0.5s cubic-bezier(0.4, 0, 0.2, 1)';
            setTimeout(() => notification.remove(), 500);
        }, 3500);
    }

    showError(message) {
        alert('❌ ' + message);
    }

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    handlePhaseChange(phase) {
        console.log('Phase changée:', phase);
    }

    handlePowerActivated(data) {
        console.log('Pouvoir activé:', data);
        this.isUsingPower = true;
        const powers = data.availablePowers || [];

        if (powers.length === 0) {
            this.isUsingPower = false;
            return;
        }

        // Afficher l'UI selon le pouvoir disponible
        const power = powers[0]; // Généralement un seul pouvoir à la fois

        switch (power) {
            case POWERS.PEEK:
                this.showPeekPowerUI();
                break;
            case POWERS.INVESTIGATION:
                this.showInvestigationPowerUI();
                break;
            case POWERS.SPECIAL_DESIGNATION:
                this.showDesignationPowerUI();
                break;
            case POWERS.EXECUTION:
                this.showExecutionPowerUI();
                break;
            case POWERS.VETO:
                // Le véto est géré différemment (pendant la session législative)
                this.isUsingPower = false;
                break;
            default:
                this.isUsingPower = false;
        }
    }

    // === POUVOIRS EXÉCUTIFS ===

    showPeekPowerUI() {
        const container = document.getElementById('action-container');
        container.innerHTML = `
            <h2 class="action-title">👁️ Pouvoir : Inspection de la Pioche</h2>
            <div class="action-content">
                <p style="text-align: center; font-size: 1.2rem; margin-bottom: 30px;">
                    Vous pouvez regarder les <strong>3 prochaines cartes</strong> de la pioche.
                </p>
                <button id="use-peek-power" class="btn btn-primary">
                    Regarder les cartes
                </button>
            </div>
        `;

        document.getElementById('use-peek-power').onclick = () => {
            this.usePower(POWERS.PEEK, null);
        };
    }

    showInvestigationPowerUI() {
        const container = document.getElementById('action-container');
        container.innerHTML = `
            <h2 class="action-title">🔍 Pouvoir : Enquête</h2>
            <div class="action-content">
                <p style="text-align: center; font-size: 1.2rem; margin-bottom: 30px;">
                    Choisissez un joueur pour <strong>voir sa faction</strong> (Loyaliste ou Conspirateur).
                </p>
                <div class="player-selector" id="investigation-selector"></div>
                <button id="confirm-investigation" class="btn btn-primary" disabled>
                    Enquêter
                </button>
            </div>
        `;

        this.populatePowerTargetSelector('investigation-selector', (targetId) => {
            document.getElementById('confirm-investigation').disabled = false;
            document.getElementById('confirm-investigation').onclick = () => {
                this.usePower(POWERS.INVESTIGATION, targetId);
            };
        });
    }

    showDesignationPowerUI() {
        const container = document.getElementById('action-container');
        container.innerHTML = `
            <h2 class="action-title">👑 Pouvoir : Succession Spéciale</h2>
            <div class="action-content">
                <p style="text-align: center; font-size: 1.2rem; margin-bottom: 30px;">
                    Choisissez le <strong>prochain Roi</strong>.
                </p>
                <div class="player-selector" id="designation-selector"></div>
                <button id="confirm-designation" class="btn btn-primary" disabled>
                    Désigner comme Roi
                </button>
            </div>
        `;

        this.populatePowerTargetSelector('designation-selector', (targetId) => {
            document.getElementById('confirm-designation').disabled = false;
            document.getElementById('confirm-designation').onclick = () => {
                this.usePower(POWERS.SPECIAL_DESIGNATION, targetId);
            };
        });
    }

    showExecutionPowerUI() {
        const container = document.getElementById('action-container');
        container.innerHTML = `
            <h2 class="action-title">💀 Pouvoir : Exécution</h2>
            <div class="action-content">
                <p style="text-align: center; font-size: 1.2rem; margin-bottom: 30px; color: #ff6666;">
                    Choisissez un joueur à <strong>éliminer</strong>.<br>
                    <small>Si c'est l'Usurpateur, les Loyalistes gagnent !</small>
                </p>
                <div class="player-selector" id="execution-selector"></div>
                <button id="confirm-execution" class="btn btn-danger" disabled>
                    Exécuter
                </button>
            </div>
        `;

        this.populatePowerTargetSelector('execution-selector', (targetId) => {
            document.getElementById('confirm-execution').disabled = false;
            document.getElementById('confirm-execution').onclick = () => {
                this.usePower(POWERS.EXECUTION, targetId);
            };
        });
    }

    populatePowerTargetSelector(containerId, onSelect) {
        const container = document.getElementById(containerId);
        container.innerHTML = '';

        // Filtrer les joueurs vivants sauf soi-même
        const eligiblePlayers = this.allPlayers.filter(player => {
            if (player.id === this.playerId) return false;
            if (!player.isAlive) return false;
            return true;
        });

        if (eligiblePlayers.length === 0) {
            container.innerHTML = '<p style="text-align:center;">Aucun joueur éligible</p>';
            return;
        }

        eligiblePlayers.forEach(player => {
            const div = document.createElement('div');
            div.className = 'selectable-player';
            div.innerHTML = `
                <div class="player-icon">🎭</div>
                <div class="player-name-selector">${player.name}</div>
            `;

            div.onclick = () => {
                container.querySelectorAll('.selectable-player').forEach(p => {
                    p.classList.remove('selected');
                });
                div.classList.add('selected');
                onSelect(player.id);
            };

            container.appendChild(div);
        });
    }

    usePower(power, targetId) {
        this.send(MESSAGE_TYPES.USE_POWER, {
            playerId: this.playerId,
            roomId: this.roomId,
            power,
            targetId
        });
        this.showWaitingUI('Utilisation du pouvoir...');
    }

    showKingDecrees(decrees) {
        console.log('Roi reçoit 3 cartes:', decrees);
        this.isSelectingDecrees = true;
        const container = document.getElementById('action-container');

        // Sauvegarder les cartes pour partage dans le chat
        this.lastReceivedCards = { role: 'king', cards: [...decrees] };
        this.updateShareCardsButton();

        // Jouer le son de révélation des cartes
        soundManager.playCardFlip();

        container.innerHTML = `
            <h2 class="action-title">👑 Session Législative - Roi</h2>
            <div class="action-content">
                <p style="text-align: center; font-size: 1.2rem; margin-bottom: 30px;">
                    Vous avez tiré <strong>3 décrets</strong>.<br>
                    Défaussez-en <strong>UN</strong> et passez les 2 autres au Chancelier.
                </p>
                <div class="decree-cards" id="king-decrees-container"></div>
                <button id="confirm-king-discard" class="btn btn-primary" disabled>
                    Défausser et Passer au Chancelier
                </button>
            </div>
        `;

        const decreesContainer = document.getElementById('king-decrees-container');
        let selectedIndex = null;

        decrees.forEach((decree, index) => {
            const card = document.createElement('div');
            card.className = `decree-card ${decree}`;
            
            const isPlot = decree === DECREE_TYPES.PLOT;
            card.innerHTML = `
                <div class="decree-card-inner">
                    <div class="card-icon">${isPlot ? '🗡️' : '⚜️'}</div>
                    <div class="card-label">${isPlot ? 'COMPLOT' : 'ÉDIT ROYAL'}</div>
                </div>
            `;

            card.onclick = () => {
                // Désélectionner toutes les cartes
                decreesContainer.querySelectorAll('.decree-card').forEach(c => {
                    c.classList.remove('selected');
                });
                // Sélectionner cette carte
                card.classList.add('selected');
                selectedIndex = index;
                document.getElementById('confirm-king-discard').disabled = false;
            };

            decreesContainer.appendChild(card);
        });

        document.getElementById('confirm-king-discard').onclick = () => {
            if (selectedIndex !== null) {
                soundManager.playCardDiscard(); // Son de défausse
                this.isSelectingDecrees = false;
                this.send(MESSAGE_TYPES.DISCARD_DECREE, {
                    playerId: this.playerId,
                    roomId: this.roomId,
                    discardedIndex: selectedIndex,
                    isKing: true
                });
                this.showWaitingUI('Cartes envoyées au Chancelier...');
            }
        };
    }

    showChancellorDecrees(decrees, vetoRejected = false) {
        console.log('Chancelier reçoit 2 cartes:', decrees);
        this.isSelectingDecrees = true;
        const container = document.getElementById('action-container');

        // Sauvegarder les cartes pour partage dans le chat
        this.lastReceivedCards = { role: 'chancellor', cards: [...decrees] };
        this.updateShareCardsButton();

        // Jouer le son de révélation des cartes
        soundManager.playCardFlip();

        // Vérifier si le véto est disponible
        const vetoAvailable = this.gameState && this.gameState.vetoUnlocked && !vetoRejected;

        let vetoButtonHtml = '';
        if (vetoAvailable) {
            vetoButtonHtml = `
                <button id="propose-veto" class="btn btn-danger" style="margin-top: 15px;">
                    🚫 Proposer le Véto
                </button>
                <p style="text-align: center; font-size: 0.85rem; color: #888; margin-top: 10px;">
                    Le véto permet de défausser les 2 cartes (le Roi doit accepter)
                </p>
            `;
        }

        let headerText = vetoRejected
            ? 'Le Roi a <strong style="color: #c44;">REFUSÉ</strong> votre véto.<br>Vous devez choisir une carte.'
            : 'Le Roi vous a passé <strong>2 décrets</strong>.<br>Défaussez-en <strong>UN</strong>, l\'autre sera <strong>adopté</strong>.';

        container.innerHTML = `
            <h2 class="action-title">🎯 Session Législative - Chancelier</h2>
            <div class="action-content">
                <p style="text-align: center; font-size: 1.2rem; margin-bottom: 30px;">
                    ${headerText}
                </p>
                <div class="decree-cards" id="chancellor-decrees-container"></div>
                <button id="confirm-chancellor-discard" class="btn btn-primary" disabled>
                    Défausser et Adopter l'Autre
                </button>
                ${vetoButtonHtml}
            </div>
        `;

        const decreesContainer = document.getElementById('chancellor-decrees-container');
        let selectedIndex = null;

        decrees.forEach((decree, index) => {
            const card = document.createElement('div');
            card.className = `decree-card ${decree}`;

            const isPlot = decree === DECREE_TYPES.PLOT;
            card.innerHTML = `
                <div class="decree-card-inner">
                    <div class="card-icon">${isPlot ? '🗡️' : '⚜️'}</div>
                    <div class="card-label">${isPlot ? 'COMPLOT' : 'ÉDIT ROYAL'}</div>
                </div>
            `;

            card.onclick = () => {
                // Désélectionner toutes les cartes
                decreesContainer.querySelectorAll('.decree-card').forEach(c => {
                    c.classList.remove('selected');
                });
                // Sélectionner cette carte
                card.classList.add('selected');
                selectedIndex = index;
                document.getElementById('confirm-chancellor-discard').disabled = false;
            };

            decreesContainer.appendChild(card);
        });

        document.getElementById('confirm-chancellor-discard').onclick = () => {
            if (selectedIndex !== null) {
                soundManager.playCardDiscard(); // Son de défausse
                this.isSelectingDecrees = false;
                this.send(MESSAGE_TYPES.DISCARD_DECREE, {
                    playerId: this.playerId,
                    roomId: this.roomId,
                    discardedIndex: selectedIndex,
                    isKing: false
                });
                this.showWaitingUI('Décret en cours d\'adoption...');
            }
        };

        // Bouton véto
        if (vetoAvailable) {
            document.getElementById('propose-veto').onclick = () => {
                this.isSelectingDecrees = false;
                this.send(MESSAGE_TYPES.PROPOSE_VETO, {
                    playerId: this.playerId,
                    roomId: this.roomId
                });
                this.showWaitingUI('Véto proposé... En attente de la décision du Roi.');
            };
        }
    }

    showPowerResult(data) {
        console.log('Résultat du pouvoir:', data);
        this.isUsingPower = false;

        const { power, result } = data;
        const container = document.getElementById('action-container');

        switch (power) {
            case POWERS.PEEK:
                this.showPeekResult(result.cards);
                break;

            case POWERS.INVESTIGATION:
                this.showInvestigationResult(result);
                break;

            case POWERS.SPECIAL_DESIGNATION:
                const designatedPlayer = this.allPlayers.find(p => p.id === result.designatedKingId);
                this.showNotification(`👑 ${designatedPlayer?.name || 'Inconnu'} sera le prochain Roi !`);
                break;

            case POWERS.EXECUTION:
                const executedPlayer = this.allPlayers.find(p => p.id === result.executedId);
                if (result.wasUsurper) {
                    this.showNotification(`💀 ${executedPlayer?.name || 'Inconnu'} était l'Usurpateur !`);
                } else {
                    this.showNotification(`💀 ${executedPlayer?.name || 'Inconnu'} a été exécuté.`);
                }
                break;
        }
    }

    showPeekResult(cards) {
        const container = document.getElementById('action-container');

        // Empêcher l'écrasement par le débat
        this.isShowingPowerResult = true;

        // Jouer le son de révélation des cartes
        soundManager.playCardFlip();

        const cardHtml = cards.map(card => {
            const isPlot = card === DECREE_TYPES.PLOT;
            return `
                <div class="decree-card ${card}" style="pointer-events: none;">
                    <div class="decree-card-inner">
                        <div class="card-icon">${isPlot ? '🗡️' : '⚜️'}</div>
                        <div class="card-label">${isPlot ? 'COMPLOT' : 'ÉDIT ROYAL'}</div>
                    </div>
                </div>
            `;
        }).join('');

        container.innerHTML = `
            <h2 class="action-title">👁️ Les 3 prochaines cartes</h2>
            <div class="action-content">
                <p style="text-align: center; font-size: 1.1rem; margin-bottom: 20px;">
                    Voici les 3 prochaines cartes de la pioche (de gauche à droite) :
                </p>
                <div class="decree-cards">${cardHtml}</div>
                <p style="text-align: center; font-size: 0.9rem; color: #888; margin-top: 20px;">
                    Ces informations sont secrètes. À vous de décider si vous les partagez...
                </p>
                <button id="close-peek-result" class="btn btn-primary" style="margin-top: 30px;">
                    J'ai compris
                </button>
            </div>
        `;

        // Bouton pour fermer et passer au débat
        document.getElementById('close-peek-result').onclick = () => {
            this.isShowingPowerResult = false;
            this.showDebateUI();
        };
    }

    showInvestigationResult(result) {
        const container = document.getElementById('action-container');
        const isConspirator = result.faction === FACTIONS.CONSPIRATORS;

        // Empêcher l'écrasement par le débat
        this.isShowingPowerResult = true;

        container.innerHTML = `
            <h2 class="action-title">🔍 Résultat de l'enquête</h2>
            <div class="action-content">
                <div style="text-align: center; padding: 30px;">
                    <div style="font-size: 4rem; margin-bottom: 20px;">
                        ${isConspirator ? '🗡️' : '⚜️'}
                    </div>
                    <p style="font-size: 1.3rem; margin-bottom: 10px;">
                        <strong>${result.targetName}</strong>
                    </p>
                    <p style="font-size: 1.5rem; font-weight: bold; color: ${isConspirator ? '#c44' : '#4a7bbf'};">
                        ${isConspirator ? 'CONSPIRATEUR' : 'LOYALISTE'}
                    </p>
                    <p style="font-size: 0.9rem; color: #888; margin-top: 20px;">
                        Ces informations sont secrètes. Vous pouvez mentir au conseil...
                    </p>
                    <button id="close-investigation-result" class="btn btn-primary" style="margin-top: 30px;">
                        J'ai compris
                    </button>
                </div>
            </div>
        `;

        // Bouton pour fermer et passer au débat
        document.getElementById('close-investigation-result').onclick = () => {
            this.isShowingPowerResult = false;
            this.showDebateUI();
        };
    }
}

// Ajouter les animations CSS nécessaires
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from { transform: translateX(400px); opacity: 0; }
        to { transform: translateX(0); opacity: 1; }
    }
    @keyframes slideOut {
        from { transform: translateX(0); opacity: 1; }
        to { transform: translateX(400px); opacity: 0; }
    }
    .pulse {
        animation: pulse 2s ease-in-out infinite;
    }
    @keyframes pulse {
        0%, 100% { transform: scale(1); opacity: 1; }
        50% { transform: scale(1.1); opacity: 0.8; }
    }
`;
document.head.appendChild(style);

// Initialiser le client
const client = new CourtOfShadowsClient();
