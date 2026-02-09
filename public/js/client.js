// Client Court of Shadows - VERSION CORRIGÉE

// === POPUP DE CONFIRMATION ===
function showConfirmPopup(options = {}) {
    return new Promise((resolve) => {
        const overlay = document.getElementById('confirm-popup');
        const icon = document.getElementById('confirm-popup-icon');
        const title = document.getElementById('confirm-popup-title');
        const message = document.getElementById('confirm-popup-message');
        const cancelBtn = document.getElementById('confirm-popup-cancel');
        const confirmBtn = document.getElementById('confirm-popup-confirm');

        // Configurer le contenu
        icon.textContent = options.icon || '⚠️';
        title.textContent = options.title || 'Confirmation';
        message.textContent = options.message || 'Êtes-vous sûr ?';
        cancelBtn.textContent = options.cancelText || 'Annuler';
        confirmBtn.textContent = options.confirmText || 'Confirmer';

        // Configurer le style du bouton de confirmation
        confirmBtn.className = 'btn ' + (options.confirmClass || 'btn-danger');

        // Afficher la popup
        overlay.style.display = 'flex';

        // Fonction de nettoyage
        const cleanup = () => {
            overlay.style.display = 'none';
            cancelBtn.onclick = null;
            confirmBtn.onclick = null;
            overlay.onclick = null;
            document.removeEventListener('keydown', handleKeydown);
        };

        // Gestion du clavier (Escape pour annuler, Enter pour confirmer)
        const handleKeydown = (e) => {
            if (e.key === 'Escape') {
                cleanup();
                resolve(false);
            } else if (e.key === 'Enter') {
                cleanup();
                resolve(true);
            }
        };
        document.addEventListener('keydown', handleKeydown);

        // Bouton Annuler
        cancelBtn.onclick = () => {
            cleanup();
            resolve(false);
        };

        // Bouton Confirmer
        confirmBtn.onclick = () => {
            cleanup();
            resolve(true);
        };

        // Clic sur l'overlay (en dehors de la popup) = annuler
        overlay.onclick = (e) => {
            if (e.target === overlay) {
                cleanup();
                resolve(false);
            }
        };
    });
}

// === POPUP D'INFORMATION (un seul bouton) ===
function showInfoPopup(options = {}) {
    return new Promise((resolve) => {
        const overlay = document.getElementById('confirm-popup');
        const icon = document.getElementById('confirm-popup-icon');
        const title = document.getElementById('confirm-popup-title');
        const message = document.getElementById('confirm-popup-message');
        const cancelBtn = document.getElementById('confirm-popup-cancel');
        const confirmBtn = document.getElementById('confirm-popup-confirm');

        // Configurer le contenu
        icon.textContent = options.icon || 'ℹ️';
        title.textContent = options.title || 'Information';
        message.textContent = options.message || '';
        confirmBtn.textContent = options.buttonText || 'OK';

        // Cacher le bouton annuler
        cancelBtn.style.display = 'none';
        confirmBtn.className = 'btn btn-primary';

        // Afficher la popup
        overlay.style.display = 'flex';

        // Fonction de nettoyage
        const cleanup = () => {
            overlay.style.display = 'none';
            cancelBtn.style.display = ''; // Restaurer le bouton annuler
            confirmBtn.onclick = null;
            overlay.onclick = null;
            document.removeEventListener('keydown', handleKeydown);
        };

        // Gestion du clavier (Enter ou Escape pour fermer)
        const handleKeydown = (e) => {
            if (e.key === 'Escape' || e.key === 'Enter') {
                cleanup();
                resolve();
            }
        };
        document.addEventListener('keydown', handleKeydown);

        // Bouton OK
        confirmBtn.onclick = () => {
            cleanup();
            resolve();
        };

        // Clic sur l'overlay = fermer aussi
        overlay.onclick = (e) => {
            if (e.target === overlay) {
                cleanup();
                resolve();
            }
        };
    });
}

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

        // Qualité de connexion
        this.latencies = [];
        this.lastPingTime = null;

        // Suivi des joueurs en salle d'attente (pour détecter join/leave)
        this.previousWaitingPlayers = [];

        this.init();
    }

    init() {
        this.setupAuthListeners();
        this.setupEventListeners();
        this.setupConnectionMonitoring(); // Visibility API + Network detection
        this.initRouter(); // Routing SPA
        this.checkStoredAuth();
        this.connect(); // Se connecter au serveur dès le début
        soundManager.init(); // Initialiser le gestionnaire de sons
    }

    // === MONITORING DE CONNEXION ===
    setupConnectionMonitoring() {
        // Visibility API - Reconnexion quand l'onglet redevient visible
        document.addEventListener('visibilitychange', () => {
            if (document.visibilityState === 'visible') {
                console.log('👁️ Onglet visible, vérification connexion...');
                if (!this.ws || this.ws.readyState !== WebSocket.OPEN) {
                    console.log('🔄 Connexion perdue, reconnexion...');
                    this.reconnectAttempts = 0; // Reset pour reconnexion immédiate
                    this.isReconnecting = false;
                    this.connect();
                } else {
                    // Forcer un ping pour vérifier que la connexion est vraiment active
                    try {
                        this.ws.send(JSON.stringify({ type: 'ping' }));
                    } catch (e) {
                        console.log('🔄 Ping échoué, reconnexion...');
                        this.connect();
                    }
                }
            }
        });

        // Détection changement réseau
        window.addEventListener('online', () => {
            console.log('🌐 Réseau restauré');
            if (!this.ws || this.ws.readyState !== WebSocket.OPEN) {
                this.reconnectAttempts = 0;
                this.isReconnecting = false;
                this.connect();
            }
        });

        window.addEventListener('offline', () => {
            console.log('📴 Réseau perdu');
            this.showConnectionStatus(true);
            this.updateConnectionStatus('Connexion réseau perdue...');
        });
    }

    // Enregistrer une mesure de latence et mettre à jour l'indicateur
    recordLatency(latency) {
        this.latencies.push(latency);
        if (this.latencies.length > 10) {
            this.latencies.shift(); // Garder les 10 dernières mesures
        }
        this.updateConnectionQuality();
    }

    // Mettre à jour l'indicateur visuel de qualité de connexion
    updateConnectionQuality() {
        const indicator = document.getElementById('connection-quality');
        if (!indicator) return;

        const avg = this.latencies.reduce((a, b) => a + b, 0) / this.latencies.length;
        const icon = indicator.querySelector('.quality-icon');

        if (avg < 100) {
            icon.textContent = '🟢';
            indicator.title = `Excellente connexion (${Math.round(avg)}ms)`;
        } else if (avg < 250) {
            icon.textContent = '🟡';
            indicator.title = `Bonne connexion (${Math.round(avg)}ms)`;
        } else if (avg < 500) {
            icon.textContent = '🟠';
            indicator.title = `Connexion moyenne (${Math.round(avg)}ms)`;
        } else {
            icon.textContent = '🔴';
            indicator.title = `Connexion lente (${Math.round(avg)}ms)`;
        }
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

        // Toggle password visibility
        document.querySelectorAll('.btn-toggle-password').forEach(btn => {
            btn.addEventListener('click', () => {
                const targetId = btn.dataset.target;
                const input = document.getElementById(targetId);
                if (input.type === 'password') {
                    input.type = 'text';
                    btn.textContent = '🙈';
                    btn.classList.add('active');
                } else {
                    input.type = 'password';
                    btn.textContent = '👁️';
                    btn.classList.remove('active');
                }
            });
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

                // Récupérer le roomId stocké (pour reconnexion après F5)
                const storedRoomId = sessionStorage.getItem('courtOfShadows_roomId');
                if (storedRoomId) {
                    this.roomId = storedRoomId;
                    this.wasInGame = true;
                    // Ne pas montrer le lobby, attendre la reconnexion après connect()
                } else {
                    this.showLobby();
                }
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

        // Sauvegarder temporairement pour la reconnexion automatique
        sessionStorage.setItem('tempPassword', password);
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

            // Si on était en partie, tenter de se reconnecter à la partie
            if (this.wasInGame && this.roomId) {
                console.log('🔄 Tentative de reconnexion à la partie...');
                this.send(MESSAGE_TYPES.RECONNECT, {
                    playerName: this.playerName,
                    roomId: this.roomId
                });
            } else {
                this.showLobby();
            }
        } else {
            // Si c'était une tentative de reconnexion par token qui a échoué
            if (this.user?.token && !sessionStorage.getItem('tempPassword')) {
                // Token expiré, nettoyer et montrer l'écran de connexion
                console.log('⚠️ Token expiré, reconnexion requise');
                localStorage.removeItem('courtOfShadows_user');
                sessionStorage.removeItem('courtOfShadows_roomId');
                this.user = null;
                this.isAuthenticated = false;
                this.wasInGame = false;
                this.showScreen('auth-screen');
                this.showAuthError('Session expirée, veuillez vous reconnecter');
            } else {
                this.showAuthError(data.error);
            }
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
        this.wasAuthenticated = false;
        this.playerName = null;
        localStorage.removeItem('courtOfShadows_user');
        sessionStorage.removeItem('tempPassword');
        sessionStorage.removeItem('courtOfShadows_roomId');
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
        // Éviter les reconnexions multiples simultanées
        if (this.isReconnecting) return;

        const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
        const wsUrl = `${protocol}//${window.location.host}`;

        this.ws = new WebSocket(wsUrl);
        this.pingInterval = null;

        this.ws.onopen = () => {
            console.log('✅ Connecté au serveur');
            this.reconnectAttempts = 0;
            this.isReconnecting = false;

            // Cacher l'indicateur de connexion perdue
            this.showConnectionStatus(false);

            // Envoyer un ping toutes les 10 secondes pour maintenir la connexion et mesurer la latence
            this.pingInterval = setInterval(() => {
                if (this.ws && this.ws.readyState === WebSocket.OPEN) {
                    this.lastPingTime = Date.now();
                    this.ws.send(JSON.stringify({ type: 'ping' }));
                }
            }, 10000);

            // Ré-authentification automatique (priorité: token > password)
            if (this.user?.token) {
                // Authentification par token (fonctionne même après fermeture navigateur)
                console.log('🔐 Ré-authentification par token...');
                this.send('login_with_token', { token: this.user.token });
            } else {
                // Fallback: authentification par password (sessionStorage)
                const savedPassword = sessionStorage.getItem('tempPassword');
                if (savedPassword && this.playerName && (this.wasAuthenticated || this.isAuthenticated)) {
                    console.log('🔄 Ré-authentification par password...');
                    this.send('login', { username: this.playerName, password: savedPassword });
                } else if (this.isAuthenticated) {
                    // Pas de token ni password, impossible de re-login
                    // Nettoyer et retourner à l'auth
                    console.log('⚠️ Impossible de ré-authentifier, retour à l\'écran de connexion');
                    localStorage.removeItem('courtOfShadows_user');
                    sessionStorage.removeItem('courtOfShadows_roomId');
                    this.isAuthenticated = false;
                    this.wasInGame = false;
                    this.user = null;
                    this.showScreen('auth-screen');
                }
            }
        };

        this.ws.onmessage = (event) => {
            const message = JSON.parse(event.data);
            // Mesurer la latence sur les pong
            if (message.type === 'pong') {
                if (this.lastPingTime) {
                    const latency = Date.now() - this.lastPingTime;
                    this.recordLatency(latency);
                }
                return;
            }
            this.handleMessage(message);
        };

        this.ws.onerror = (error) => {
            console.error('❌ Erreur WebSocket:', error);
            // Ne pas afficher d'erreur, la reconnexion automatique s'en chargera
        };

        this.ws.onclose = () => {
            console.log('🔌 Connexion fermée');
            // Nettoyer l'intervalle de ping
            if (this.pingInterval) {
                clearInterval(this.pingInterval);
                this.pingInterval = null;
            }

            // Sauvegarder l'état d'authentification pour la reconnexion
            if (this.isAuthenticated) {
                this.wasAuthenticated = true;
            }

            // Sauvegarder si on était en partie (pour reconnexion automatique)
            const gameScreen = document.getElementById('game-screen');
            const waitingRoom = document.getElementById('waiting-room');
            if ((gameScreen && gameScreen.classList.contains('active')) ||
                (waitingRoom && waitingRoom.classList.contains('active'))) {
                this.wasInGame = true;
            }

            // Afficher l'indicateur de connexion perdue
            this.showConnectionStatus(true);

            // Reconnexion automatique silencieuse
            this.autoReconnect();
        };
    }

    autoReconnect() {
        if (this.isReconnecting) return;

        const MAX_RECONNECT_ATTEMPTS = 20;

        this.isReconnecting = true;
        this.reconnectAttempts = (this.reconnectAttempts || 0) + 1;

        // Vérifier si on a dépassé le nombre max de tentatives
        if (this.reconnectAttempts > MAX_RECONNECT_ATTEMPTS) {
            console.log('❌ Nombre maximum de tentatives de reconnexion atteint');
            this.updateConnectionStatus(`Connexion perdue. <button onclick="window.location.reload()" style="margin-left: 10px; padding: 5px 15px; cursor: pointer; background: var(--primary); color: white; border: none; border-radius: 4px;">Recharger la page</button>`);
            this.isReconnecting = false;
            return;
        }

        // Délai exponentiel avec maximum de 10 secondes
        const delay = Math.min(1000 * Math.pow(1.5, this.reconnectAttempts - 1), 10000);

        console.log(`🔄 Reconnexion automatique dans ${Math.round(delay/1000)}s (tentative ${this.reconnectAttempts}/${MAX_RECONNECT_ATTEMPTS})...`);
        this.updateConnectionStatus(`Reconnexion... (${this.reconnectAttempts}/${MAX_RECONNECT_ATTEMPTS})`);

        setTimeout(() => {
            this.isReconnecting = false;
            this.connect();
        }, delay);
    }

    showConnectionStatus(show) {
        let overlay = document.getElementById('connection-status-overlay');

        if (show) {
            if (!overlay) {
                overlay = document.createElement('div');
                overlay.id = 'connection-status-overlay';
                overlay.style.cssText = `
                    position: fixed;
                    top: 0;
                    left: 0;
                    right: 0;
                    background: rgba(239, 68, 68, 0.95);
                    color: white;
                    padding: 12px 20px;
                    text-align: center;
                    z-index: 10000;
                    font-weight: 500;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    gap: 10px;
                    box-shadow: 0 2px 10px rgba(0,0,0,0.3);
                `;
                overlay.innerHTML = `
                    <span class="connection-spinner" style="
                        width: 16px;
                        height: 16px;
                        border: 2px solid rgba(255,255,255,0.3);
                        border-top-color: white;
                        border-radius: 50%;
                        animation: spin 1s linear infinite;
                    "></span>
                    <span class="connection-message">Connexion perdue... Reconnexion en cours</span>
                `;
                document.body.prepend(overlay);
            }
            overlay.style.display = 'flex';
        } else if (overlay) {
            overlay.style.display = 'none';
        }
    }

    updateConnectionStatus(message) {
        const overlay = document.getElementById('connection-status-overlay');
        if (overlay) {
            const messageSpan = overlay.querySelector('.connection-message');
            if (messageSpan) {
                messageSpan.innerHTML = message;
            }
        }
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
            case MESSAGE_TYPES.PLAYER_KICKED:
                this.handlePlayerKicked(message.data);
                break;
            case MESSAGE_TYPES.PLAYER_BANNED:
                this.handlePlayerBanned(message.data);
                break;
            case MESSAGE_TYPES.GAME_STOPPED:
                this.handleGameStopped(message.data);
                break;
        }
    }

    handleGameStopped(data) {
        this.showNotification(`🛑 ${data.message}`);
        // Reset complet de l'état de jeu
        this.playerRole = null;
        this.playerFaction = null;
        this.knownPlayers = [];
        this.gameState = null;
        this.currentVoteDetails = null;
        this.votedPlayerIds = [];
        this.isSelectingDecrees = false;
        this.isUsingPower = false;
        this.isShowingPowerResult = false;
        this.isWaitingForVetoResponse = false;
        this.lastReceivedCards = null;
        // Retourner à la salle d'attente
        this.showWaitingRoom();
    }

    async handlePlayerKicked(data) {
        if (data.reason) {
            // C'est moi qui ai été kické - afficher une popup et rediriger après OK
            await showInfoPopup({
                icon: '👢',
                title: 'Exclu de la partie',
                message: data.reason,
                buttonText: 'OK'
            });
            sessionStorage.removeItem('courtOfShadows_roomId');
            this.roomId = null;
            this.gameState = null;
            this.showLobby();
        } else if (data.kickedPlayerName) {
            // Un autre joueur a été kické
            this.showNotification(`👢 ${data.kickedPlayerName} a été exclu de la partie`);
        }
    }

    async handlePlayerBanned(data) {
        if (data.reason) {
            // C'est moi qui ai été banni - afficher une popup et rediriger après OK
            await showInfoPopup({
                icon: '🚫',
                title: 'Banni de la partie',
                message: data.reason,
                buttonText: 'OK'
            });
            sessionStorage.removeItem('courtOfShadows_roomId');
            this.roomId = null;
            this.gameState = null;
            this.showLobby();
        } else if (data.bannedPlayerName) {
            // Un autre joueur a été banni
            this.showNotification(`🚫 ${data.bannedPlayerName} a été banni de la partie`);
        }
    }

    async kickPlayer(targetPlayerId) {
        const targetPlayer = this.allPlayers.find(p => p.id === targetPlayerId);
        const playerName = targetPlayer ? targetPlayer.name : 'ce joueur';

        const confirmed = await showConfirmPopup({
            icon: '👢',
            title: 'Exclure un joueur',
            message: `Exclure ${playerName} de la partie ? Il pourra revenir.`,
            cancelText: 'Annuler',
            confirmText: 'Exclure',
            confirmClass: 'btn-warning'
        });

        if (confirmed) {
            this.send(MESSAGE_TYPES.KICK_PLAYER, {
                playerId: this.playerId,
                roomId: this.roomId,
                targetPlayerId
            });
        }
    }

    async banPlayer(targetPlayerId) {
        const targetPlayer = this.allPlayers.find(p => p.id === targetPlayerId);
        const playerName = targetPlayer ? targetPlayer.name : 'ce joueur';

        const confirmed = await showConfirmPopup({
            icon: '🚫',
            title: 'Bannir un joueur',
            message: `Bannir ${playerName} définitivement de cette partie ?`,
            cancelText: 'Annuler',
            confirmText: 'Bannir',
            confirmClass: 'btn-danger'
        });

        if (confirmed) {
            this.send(MESSAGE_TYPES.BAN_PLAYER, {
                playerId: this.playerId,
                roomId: this.roomId,
                targetPlayerId
            });
        }
    }

    // === ROUTING ===
    screenToRoute = {
        'auth-screen': '/login',
        'lobby-screen': '/home',
        'waiting-room': '/room/',
        'role-reveal': '/game/',
        'game-screen': '/game/',
        'game-over-screen': '/game/',
        'rules-screen': '/rules'
    };

    routeToScreen = {
        '/': 'lobby-screen',
        '/home': 'lobby-screen',
        '/login': 'auth-screen',
        '/register': 'auth-screen',
        '/rules': 'rules-screen'
    };

    initRouter() {
        // Gérer les boutons back/forward du navigateur
        window.addEventListener('popstate', (event) => {
            const currentScreen = document.querySelector('.screen.active');
            const currentScreenId = currentScreen ? currentScreen.id : null;

            // Si on quitte la salle d'attente, quitter proprement la partie
            if (currentScreenId === 'waiting-room' && this.roomId) {
                // Envoyer un message au serveur pour quitter
                if (this.ws && this.ws.readyState === WebSocket.OPEN) {
                    this.send({
                        type: 'leave_game',
                        playerId: this.playerId,
                        roomId: this.roomId
                    });
                }
                sessionStorage.removeItem('courtOfShadows_roomId');
                this.roomId = null;
                this.isHost = false;
            }

            if (event.state && event.state.screen) {
                this.showScreenWithoutPush(event.state.screen);
            } else {
                this.handleRoute(window.location.pathname);
            }
        });

        // Gérer la route initiale
        this.handleRoute(window.location.pathname);
    }

    handleRoute(path) {
        // Routes avec paramètres
        if (path.startsWith('/room/')) {
            const code = path.split('/room/')[1];
            if (code && this.isAuthenticated) {
                this.roomId = code.toUpperCase();
                sessionStorage.setItem('courtOfShadows_roomId', this.roomId);
                // Le WebSocket gérera la reconnexion
            }
            return;
        }

        if (path.startsWith('/game/')) {
            const code = path.split('/game/')[1];
            if (code && this.isAuthenticated) {
                this.roomId = code.toUpperCase();
                sessionStorage.setItem('courtOfShadows_roomId', this.roomId);
            }
            return;
        }

        // Routes simples
        const screen = this.routeToScreen[path];
        if (screen) {
            // Si la route est /register, afficher l'onglet inscription
            if (path === '/register') {
                setTimeout(() => {
                    const registerTab = document.querySelector('[data-tab="register"]');
                    if (registerTab) registerTab.click();
                }, 100);
            }
        }
    }

    updateUrl(screenId) {
        let path = this.screenToRoute[screenId] || '/';

        // Ajouter le code de room si nécessaire
        if ((screenId === 'waiting-room' || screenId === 'game-screen' || screenId === 'role-reveal') && this.roomId) {
            if (screenId === 'waiting-room') {
                path = '/room/' + this.roomId;
            } else {
                path = '/game/' + this.roomId;
            }
        }

        // Ne pas pusher si on est déjà sur cette URL
        if (window.location.pathname !== path) {
            history.pushState({ screen: screenId }, '', path);
        }
    }

    showScreenWithoutPush(screenId) {
        document.querySelectorAll('.screen').forEach(screen => {
            screen.classList.remove('active');
        });
        const screenEl = document.getElementById(screenId);
        if (screenEl) {
            screenEl.classList.add('active');
        }
    }

    // === ÉCRANS ===
    screenTitles = {
        'auth-screen': 'Login - Court of Shadows',
        'lobby-screen': 'Home - Court of Shadows',
        'waiting-room': 'Waiting Room - Court of Shadows',
        'role-reveal': 'Game - Court of Shadows',
        'game-screen': 'Game - Court of Shadows',
        'game-over-screen': 'Game Over - Court of Shadows',
        'rules-screen': 'Rules - Court of Shadows'
    };

    showScreen(screenId) {
        document.querySelectorAll('.screen').forEach(screen => {
            screen.classList.remove('active');
        });
        const screenEl = document.getElementById(screenId);
        if (screenEl) {
            screenEl.classList.add('active');
        }

        // Mettre à jour l'URL
        this.updateUrl(screenId);

        // Mettre à jour le titre de la page
        document.title = this.screenTitles[screenId] || 'Court of Shadows';
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

        const settingLimitedKnowledge = document.getElementById('setting-limited-conspirators-knowledge');
        if (settingLimitedKnowledge) {
            settingLimitedKnowledge.addEventListener('change', (e) => {
                this.updateSettings({ limitedConspiratorsKnowledge: e.target.checked });
            });
        }

        const settingPreviousKing = document.getElementById('setting-previous-king-cannot-be-chancellor');
        if (settingPreviousKing) {
            settingPreviousKing.addEventListener('change', (e) => {
                this.updateSettings({ previousKingCannotBeChancellor: e.target.checked });
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

        // Sections pliables (mobile)
        const toggleBoards = document.getElementById('toggle-boards');
        const toggleChat = document.getElementById('toggle-chat');

        if (toggleBoards) {
            toggleBoards.addEventListener('click', () => {
                const section = document.getElementById('boards-section');
                section.classList.toggle('collapsed');
            });
        }

        if (toggleChat) {
            toggleChat.addEventListener('click', () => {
                const section = document.getElementById('chat-section');
                section.classList.toggle('collapsed');
            });
        }

        // Game over
        const newGameBtn = document.getElementById('new-game-btn');
        const returnLobbyBtn = document.getElementById('return-lobby-btn');

        if (newGameBtn) {
            newGameBtn.addEventListener('click', () => {
                sessionStorage.removeItem('courtOfShadows_roomId');
                this.roomId = null;
                this.gameState = null;
                this.showLobby();
            });
        }

        if (returnLobbyBtn) {
            returnLobbyBtn.addEventListener('click', () => {
                sessionStorage.removeItem('courtOfShadows_roomId');
                this.roomId = null;
                this.gameState = null;
                this.showLobby();
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

        // Bouton pour afficher les règles depuis le lobby
        const showRulesBtn = document.getElementById('show-rules-btn');
        if (showRulesBtn) {
            showRulesBtn.addEventListener('click', () => {
                this.showScreen('rules-screen');
            });
        }

        // Bouton règles mobile
        const showRulesBtnMobile = document.getElementById('show-rules-btn-mobile');
        if (showRulesBtnMobile) {
            showRulesBtnMobile.addEventListener('click', () => {
                this.showScreen('rules-screen');
            });
        }

        // Bouton pour fermer les règles et retourner au lobby
        const closeRulesBtn = document.getElementById('close-rules-btn');
        if (closeRulesBtn) {
            closeRulesBtn.addEventListener('click', () => {
                this.showScreen('lobby-screen');
            });
        }

        // Bouton retour en haut de la page des règles
        const backFromRulesBtn = document.getElementById('back-from-rules-btn');
        if (backFromRulesBtn) {
            backFromRulesBtn.addEventListener('click', () => {
                this.showScreen('lobby-screen');
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
            this.wasInGame = false; // Reset le flag

            // Stocker le roomId pour reconnexion après F5
            sessionStorage.setItem('courtOfShadows_roomId', this.roomId);

            // Si reconnexion, aller directement à l'écran de jeu
            if (message.data.reconnected) {
                this.showScreen('game-screen');
                this.updatePlayerNameDisplay();
                this.showNotification('Reconnecté à la partie !');
            } else {
                this.showWaitingRoom();
            }
        } else {
            // Reconnexion échouée, aller au lobby
            this.wasInGame = false;
            sessionStorage.removeItem('courtOfShadows_roomId');
            if (this.isAuthenticated) {
                this.showLobby();
            }
        }
    }

    showWaitingRoom() {
        this.showScreen('waiting-room');
        document.getElementById('display-room-code').textContent = this.roomId;

        // Initialiser le log d'activité
        this.clearActivityLog();
        this.addActivityMessage('Vous avez rejoint la partie', 'join');

        // Afficher les paramètres pour tous les joueurs
        const gameSettings = document.getElementById('game-settings');
        if (gameSettings) {
            gameSettings.style.display = 'block';

            // Désactiver les contrôles pour les non-hôtes
            const settingsInputs = gameSettings.querySelectorAll('input');
            settingsInputs.forEach(input => {
                input.disabled = !this.isHost;
            });

            // Ajouter une classe pour le style visuel
            if (this.isHost) {
                gameSettings.classList.remove('settings-readonly');
            } else {
                gameSettings.classList.add('settings-readonly');
            }
        }

        if (this.isHost) {
            document.getElementById('start-game-btn').style.display = 'block';
        } else {
            document.getElementById('start-game-btn').style.display = 'none';
        }
    }

    updateSettings(settings) {
        this.send(MESSAGE_TYPES.UPDATE_SETTINGS, {
            playerId: this.playerId,
            roomId: this.roomId,
            settings
        });
    }

    // Mettre à jour l'affichage des paramètres pour tous les joueurs
    updateSettingsDisplay(settings, playerCount) {
        const conspiratorsKnowUsurper = document.getElementById('setting-conspirators-know-usurper');
        const usurperKnowsAllies = document.getElementById('setting-usurper-knows-allies');
        const limitedKnowledge = document.getElementById('setting-limited-conspirators-knowledge');
        const previousKingCannotBeChancellor = document.getElementById('setting-previous-king-cannot-be-chancellor');
        const limitedKnowledgeContainer = document.getElementById('setting-limited-knowledge-container');

        if (conspiratorsKnowUsurper) {
            conspiratorsKnowUsurper.checked = settings.conspiratorsKnowUsurper || false;
        }
        if (usurperKnowsAllies) {
            usurperKnowsAllies.checked = settings.usurperKnowsAllies || false;
        }
        if (limitedKnowledge) {
            limitedKnowledge.checked = settings.limitedConspiratorsKnowledge || false;
        }
        if (previousKingCannotBeChancellor) {
            previousKingCannotBeChancellor.checked = settings.previousKingCannotBeChancellor || false;
        }

        // Afficher/masquer l'option de connaissance limitée selon le nombre de joueurs
        if (limitedKnowledgeContainer) {
            limitedKnowledgeContainer.style.display = playerCount >= 9 ? 'block' : 'none';
        }
    }

    copyRoomCode() {
        navigator.clipboard.writeText(this.roomId);
        this.showNotification('📋 Code de la partie copié !');
    }

    updatePlayerList(players) {
        // Détecter les joueurs qui ont rejoint ou quitté
        if (this.previousWaitingPlayers && this.previousWaitingPlayers.length > 0) {
            const previousIds = this.previousWaitingPlayers.map(p => p.id);
            const currentIds = players.map(p => p.id);

            // Joueurs qui ont rejoint
            players.forEach(player => {
                if (!previousIds.includes(player.id) && player.id !== this.playerId) {
                    this.addActivityMessage(`${player.name} a rejoint la partie`, 'join');
                }
            });

            // Joueurs qui ont quitté
            this.previousWaitingPlayers.forEach(player => {
                if (!currentIds.includes(player.id) && player.id !== this.playerId) {
                    this.addActivityMessage(`${player.name} a quitté la partie`, 'leave');
                }
            });
        }

        this.previousWaitingPlayers = [...players];
        this.allPlayers = players; // SAUVEGARDER LA LISTE

        // Mettre à jour le statut d'hôte du joueur actuel
        const currentPlayer = players.find(p => p.id === this.playerId);
        const wasHost = this.isHost;
        if (currentPlayer) {
            this.isHost = currentPlayer.isHost;
        }

        // Si on vient de devenir hôte, mettre à jour l'UI
        if (!wasHost && this.isHost) {
            document.getElementById('start-game-btn').style.display = 'block';
            document.getElementById('game-settings').style.display = 'block';
            this.showNotification('👑 Vous êtes maintenant le maître de la partie !');
            this.addActivityMessage('Vous êtes maintenant le maître de la partie', 'info');
        }

        const container = document.getElementById('players-container');
        const count = document.getElementById('player-count');

        count.textContent = players.length;
        container.innerHTML = '';

        players.forEach(player => {
            const div = document.createElement('div');
            div.className = 'player-card' + (player.isHost ? ' host' : '') + (player.id === this.playerId ? ' self' : '');

            // Boutons visibles uniquement pour l'hôte et pas sur soi-même
            const showActions = this.isHost && player.id !== this.playerId;

            div.innerHTML = `
                <div class="player-card-icon">${player.isHost ? '👑' : '🎭'}</div>
                <div class="player-card-name">${player.name}</div>
                ${showActions ? `
                    <div class="player-card-actions">
                        <button class="btn-kick" data-player-id="${player.id}" title="Exclure">👢 Kick</button>
                        <button class="btn-ban" data-player-id="${player.id}" title="Bannir">🚫 Ban</button>
                    </div>
                ` : ''}
            `;
            container.appendChild(div);
        });

        // Ajouter les listeners pour les boutons kick et ban
        if (this.isHost) {
            const self = this;
            container.querySelectorAll('.btn-kick').forEach(btn => {
                btn.addEventListener('click', async (e) => {
                    e.stopPropagation();
                    const targetId = btn.dataset.playerId;
                    await self.kickPlayer(targetId);
                });
            });
            container.querySelectorAll('.btn-ban').forEach(btn => {
                btn.addEventListener('click', async (e) => {
                    e.stopPropagation();
                    const targetId = btn.dataset.playerId;
                    await self.banPlayer(targetId);
                });
            });
        }

        // Afficher/masquer l'option "Connaissance limitée" selon le nombre de joueurs (9-10)
        const limitedKnowledgeContainer = document.getElementById('setting-limited-knowledge-container');
        if (limitedKnowledgeContainer) {
            if (players.length >= 9) {
                limitedKnowledgeContainer.style.display = 'block';
            } else {
                limitedKnowledgeContainer.style.display = 'none';
                // Réinitialiser l'option si on passe en dessous de 9 joueurs
                const checkbox = document.getElementById('setting-limited-conspirators-knowledge');
                if (checkbox && checkbox.checked) {
                    checkbox.checked = false;
                    this.updateSettings({ limitedConspiratorsKnowledge: false });
                }
            }
        }
    }

    startGame() {
        this.send(MESSAGE_TYPES.START_GAME, {
            playerId: this.playerId,
            roomId: this.roomId
        });
    }

    leaveGame() {
        // Envoyer un message au serveur pour quitter proprement
        if (this.ws && this.ws.readyState === WebSocket.OPEN) {
            this.send({
                type: 'leave_game',
                playerId: this.playerId,
                roomId: this.roomId
            });
        }

        // Nettoyer l'état local
        sessionStorage.removeItem('courtOfShadows_roomId');
        this.roomId = null;
        this.isHost = false;
        this.gameState = null;

        // Retourner au lobby
        this.showLobby();
    }

    // === RÉVÉLATION DES RÔLES ===
    handleRoleAssignment(data) {
        // Reset complet pour nouvelle partie
        this.knownPlayers = [];
        this.playerRole = data.role;
        this.playerFaction = data.faction;
        this.gameState = null;
        this.currentVoteDetails = null;
        this.votedPlayerIds = [];
        this.isSelectingDecrees = false;
        this.isUsingPower = false;
        this.isShowingPowerResult = false;
        this.isWaitingForVetoResponse = false;
        this.lastReceivedCards = null;

        this.showScreen('role-reveal');

        const roleCard = document.querySelector('.role-card');
        const roleIcon = document.getElementById('role-icon');
        const roleTitle = document.getElementById('role-title');
        const roleDesc = document.getElementById('role-description');

        // Nettoyer les éléments dynamiques de la partie précédente
        const oldAlliesInfo = roleCard.querySelector('.allies-info');
        if (oldAlliesInfo) {
            oldAlliesInfo.remove();
        }

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

        // Bouton règles (visible par tous)
        const rulesBtn = document.getElementById('game-rules-btn');
        if (rulesBtn) {
            rulesBtn.onclick = () => this.showRulesPopup();
        }

        // Afficher le bouton paramètres (roue crantée) pour le créateur
        const settingsBtn = document.getElementById('host-settings-btn');
        if (settingsBtn) {
            if (this.isHost) {
                settingsBtn.style.display = 'flex';
                settingsBtn.onclick = () => this.openGameSettingsPopup();
            } else {
                settingsBtn.style.display = 'none';
            }
        }

        // Initialiser les boutons de la popup paramètres
        this.initGameSettingsPopup();

        // Sur mobile, plier la section joueurs par défaut
        if (window.innerWidth <= 768) {
            const playersSection = document.getElementById('players-section');
            if (playersSection && !playersSection.classList.contains('collapsed')) {
                playersSection.classList.add('collapsed');
            }
        }
    }

    showRulesPopup() {
        // Créer une popup avec les règles résumées
        const existing = document.getElementById('rules-popup-overlay');
        if (existing) existing.remove();

        const overlay = document.createElement('div');
        overlay.id = 'rules-popup-overlay';
        overlay.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: rgba(0, 0, 0, 0.85);
            z-index: 9998;
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 20px;
        `;

        overlay.innerHTML = `
            <div style="
                background: var(--bg-secondary);
                border-radius: var(--radius-lg);
                padding: 24px;
                max-width: 600px;
                max-height: 80vh;
                overflow-y: auto;
                border: 1px solid var(--border);
                box-shadow: var(--shadow-lg);
            ">
                <h2 style="color: var(--primary-light); margin: 0 0 16px 0; text-align: center;">📖 Règles Rapides</h2>

                <div style="color: var(--text-secondary); font-size: 0.95rem; line-height: 1.6;">
                    <h3 style="color: var(--loyalist-blue); margin: 16px 0 8px;">⚜️ Loyalistes (bleu)</h3>
                    <p>Adopter <strong>5 Édits Royaux</strong> OU identifier et exécuter l'Usurpateur.</p>

                    <h3 style="color: var(--conspirator-red); margin: 16px 0 8px;">🗡️ Conspirateurs (rouge)</h3>
                    <p>Adopter <strong>6 Complots</strong> OU faire élire l'Usurpateur Chancelier après 3 Complots.</p>

                    <h3 style="color: var(--primary-light); margin: 16px 0 8px;">👑 Tour de jeu</h3>
                    <ol style="margin: 0; padding-left: 20px;">
                        <li><strong>Nomination</strong> : Le Roi nomme un Chancelier</li>
                        <li><strong>Vote</strong> : Tous votent OUI ou NON</li>
                        <li><strong>Session Législative</strong> : Roi tire 3 cartes → en défausse 1 → Chancelier choisit parmi les 2 restantes</li>
                        <li><strong>Pouvoir Exécutif</strong> : Après certains Complots, le Roi peut utiliser un pouvoir</li>
                    </ol>

                    <h3 style="color: var(--warning); margin: 16px 0 8px;">⚡ Pouvoirs</h3>
                    <ul style="margin: 0; padding-left: 20px;">
                        <li>👁️ <strong>Inspection</strong> : Voir les 3 prochaines cartes</li>
                        <li>🔍 <strong>Enquête</strong> : Voir la faction d'un joueur</li>
                        <li>👑 <strong>Succession</strong> : Choisir le prochain Roi</li>
                        <li>💀 <strong>Exécution</strong> : Éliminer un joueur</li>
                    </ul>
                </div>

                <button id="close-rules-popup" style="
                    margin-top: 20px;
                    width: 100%;
                    padding: 12px;
                    background: var(--primary);
                    color: white;
                    border: none;
                    border-radius: var(--radius-md);
                    cursor: pointer;
                    font-weight: 700;
                    font-size: 1rem;
                ">Fermer</button>
            </div>
        `;

        document.body.appendChild(overlay);

        document.getElementById('close-rules-popup').onclick = () => overlay.remove();
        overlay.onclick = (e) => {
            if (e.target === overlay) overlay.remove();
        };
    }

    openGameSettingsPopup() {
        const popup = document.getElementById('game-settings-popup');
        if (popup) {
            popup.style.display = 'flex';
        }
    }

    closeGameSettingsPopup() {
        const popup = document.getElementById('game-settings-popup');
        if (popup) {
            popup.style.display = 'none';
        }
    }

    initGameSettingsPopup() {
        const closeBtn = document.getElementById('close-settings-popup');
        const pauseBtn = document.getElementById('settings-pause-btn');
        const stopBtn = document.getElementById('settings-stop-btn');
        const overlay = document.getElementById('game-settings-popup');

        if (closeBtn) {
            closeBtn.onclick = () => this.closeGameSettingsPopup();
        }

        // Fermer en cliquant sur l'overlay
        if (overlay) {
            overlay.onclick = (e) => {
                if (e.target === overlay) {
                    this.closeGameSettingsPopup();
                }
            };
        }

        if (pauseBtn) {
            pauseBtn.onclick = async () => {
                this.closeGameSettingsPopup();
                const confirmed = await showConfirmPopup({
                    icon: '⏸️',
                    title: 'Mettre en pause',
                    message: 'Voulez-vous mettre la partie en pause ?',
                    cancelText: 'Annuler',
                    confirmText: 'Mettre en pause',
                    confirmClass: 'btn-primary'
                });

                if (confirmed) {
                    this.send(MESSAGE_TYPES.FORCE_PAUSE, {
                        playerId: this.playerId,
                        roomId: this.roomId
                    });
                }
            };
        }

        if (stopBtn) {
            stopBtn.onclick = async () => {
                this.closeGameSettingsPopup();
                const confirmed = await showConfirmPopup({
                    icon: '🛑',
                    title: 'Arrêter la partie',
                    message: 'Voulez-vous arrêter la partie ? Tous les joueurs retourneront au lobby.',
                    cancelText: 'Annuler',
                    confirmText: 'Arrêter la partie',
                    confirmClass: 'btn-danger'
                });

                if (confirmed) {
                    this.send(MESSAGE_TYPES.STOP_GAME, {
                        playerId: this.playerId,
                        roomId: this.roomId
                    });
                }
            };
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

        // Mettre à jour l'affichage des paramètres (salle d'attente)
        if (state.settings) {
            this.updateSettingsDisplay(state.settings, state.playerCount);
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
            if (player.isHost) {
                div.classList.add('is-host');
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
        const hasDisconnectedPlayers = state.disconnectedPlayers && state.disconnectedPlayers.length > 0;
        const disconnectedNames = hasDisconnectedPlayers ? state.disconnectedPlayers.join(', ') : '';

        let pauseMessage = '';
        let hostButtons = '';

        if (hasDisconnectedPlayers) {
            // Pause automatique - joueur déconnecté
            pauseMessage = `
                <p style="font-size: 1.2rem; color: #ccc;">
                    En attente de reconnexion de : <strong>${disconnectedNames}</strong>
                </p>
                <p style="font-size: 1rem; color: #888; margin-top: 20px;">
                    La partie reprendra automatiquement quand le joueur se reconnectera.
                </p>
            `;

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
        } else {
            // Pause manuelle par le créateur
            pauseMessage = `
                <p style="font-size: 1.2rem; color: #ccc;">
                    Le créateur a mis la partie en pause.
                </p>
                <p style="font-size: 1rem; color: #888; margin-top: 20px;">
                    En attente de la reprise par le créateur.
                </p>
            `;

            if (this.isHost) {
                hostButtons = `
                    <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid rgba(255,255,255,0.2);">
                        <button id="force-resume-btn" class="btn btn-primary">
                            ▶️ Reprendre la partie
                        </button>
                    </div>
                `;
            }
        }

        container.innerHTML = `
            <div class="action-content" style="text-align: center; padding: 60px 20px;">
                <div style="font-size: 5rem; margin-bottom: 30px;">⏸️</div>
                <h2 style="color: var(--gold); margin-bottom: 20px;">Partie en Pause</h2>
                ${pauseMessage}
                ${hostButtons}
            </div>
        `;

        if (this.isHost) {
            document.getElementById('force-resume-btn').onclick = async () => {
                if (hasDisconnectedPlayers) {
                    const confirmed = await showConfirmPopup({
                        icon: '⚠️',
                        title: 'Forcer la reprise',
                        message: 'Les joueurs déconnectés seront éliminés de la partie. Voulez-vous continuer ?',
                        cancelText: 'Annuler',
                        confirmText: 'Forcer la reprise',
                        confirmClass: 'btn-danger'
                    });

                    if (confirmed) {
                        this.send(MESSAGE_TYPES.FORCE_RESUME, {
                            playerId: this.playerId,
                            roomId: this.roomId
                        });
                    }
                } else {
                    // Pause manuelle - pas besoin de confirmation
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
        if (data.message) {
            // Message personnalisé du serveur
            this.showNotification(`▶️ ${data.message}`);
        } else if (data.playerName === 'Le créateur') {
            // Reprise par le créateur
            this.showNotification(`▶️ La partie reprend !`);
        } else {
            // Reconnexion d'un joueur
            this.showNotification(`▶️ ${data.playerName} s'est reconnecté ! La partie reprend.`);
        }
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
            // Pas le chancelier précédent
            if (player.id === state.previousChancellorId) return false;
            // Pas le roi précédent (si l'option est activée)
            if (state.settings?.previousKingCannotBeChancellor && player.id === state.previousKingId) return false;
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
        const isPlot = data.decree === DECREE_TYPES.PLOT;
        const decreeType = isPlot ? 'Complot' : 'Édit Royal';
        const decreeIcon = isPlot ? '🗡️' : '⚜️';

        // Jouer le son approprié selon le type de décret
        if (isPlot) {
            soundManager.playPlotPassed();
        } else {
            soundManager.playEditPassed();
        }

        // Notification simple à droite
        this.showNotification(`📜 ${decreeType} ${decreeIcon} adopté !`);

        // Ajouter le détail dans le chat
        let actionMessage = `${decreeIcon} ${decreeType} adopté`;
        if (data.isDeadlock) {
            actionMessage += ` (Impasse)`;
        } else if (data.kingName && data.chancellorName) {
            actionMessage += ` | 👑 ${data.kingName} → 📜 ${data.chancellorName}`;
        }
        this.addSystemChatMessage(actionMessage, isPlot ? 'conspirator' : 'loyalist');
    }

    addSystemChatMessage(message, type = 'system') {
        const container = document.getElementById('chat-messages');
        if (!container) return;

        const timestamp = new Date();
        const timeStr = timestamp.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });

        const messageDiv = document.createElement('div');
        messageDiv.className = `chat-message system-message ${type}`;
        messageDiv.innerHTML = `
            <div class="chat-header">
                <span class="chat-author system">⚔️ Action</span>
                <span class="chat-time">${timeStr}</span>
            </div>
            <div class="chat-text">${message}</div>
        `;

        container.appendChild(messageDiv);
        container.scrollTop = container.scrollHeight;
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

        // Rate limiting: 500ms entre chaque message
        const now = Date.now();
        if (this.lastChatMessageTime && (now - this.lastChatMessageTime) < 500) {
            this.showNotification('⏳ Attendez avant d\'envoyer un autre message');
            return;
        }
        this.lastChatMessageTime = now;

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

        const { role } = this.lastReceivedCards;
        const roleLabel = role === 'king' ? 'Roi' : 'Chancelier';

        container.innerHTML = `
            <div class="share-cards-section">
                <button class="share-cards-open-btn" id="open-share-popup">
                    📢 Déclarer mes cartes (${roleLabel})
                </button>
            </div>
        `;

        document.getElementById('open-share-popup').onclick = () => {
            this.openShareCardsPopup();
        };
    }

    // Ouvrir la popup de partage de cartes avec TOUTES les combinaisons
    openShareCardsPopup() {
        if (!this.lastReceivedCards) return;

        const { role } = this.lastReceivedCards;
        const roleLabel = role === 'king' ? 'Roi' : 'Chancelier';
        const isKing = role === 'king';

        // Générer toutes les combinaisons possibles
        const combinations = isKing ? [
            { icons: '🗡️🗡️🗡️', label: '3 Complots', letters: 'RRR' },
            { icons: '🗡️🗡️⚜️', label: '2 Complots, 1 Édit', letters: 'RRB' },
            { icons: '🗡️⚜️⚜️', label: '1 Complot, 2 Édits', letters: 'RBB' },
            { icons: '⚜️⚜️⚜️', label: '3 Édits', letters: 'BBB' }
        ] : [
            { icons: '🗡️🗡️', label: '2 Complots', letters: 'RR' },
            { icons: '🗡️⚜️', label: '1 Complot, 1 Édit', letters: 'RB' },
            { icons: '⚜️⚜️', label: '2 Édits', letters: 'BB' }
        ];

        // Créer la popup modale
        const popup = document.createElement('div');
        popup.className = 'share-cards-popup-overlay';
        popup.innerHTML = `
            <div class="share-cards-popup">
                <div class="share-cards-popup-header">
                    <h3>📢 Déclarer mes cartes</h3>
                    <span class="share-cards-popup-subtitle">En tant que ${roleLabel} - Choisissez ce que vous voulez déclarer</span>
                </div>
                <div class="share-cards-popup-warning">
                    ⚠️ Vous pouvez mentir ! Choisissez stratégiquement.
                </div>
                <div class="share-cards-popup-options">
                    ${combinations.map(combo => `
                        <button class="share-cards-option" data-message="J'avais : ${combo.icons}">
                            <span class="share-option-icons">${combo.icons}</span>
                            <span class="share-option-label">${combo.label}</span>
                        </button>
                    `).join('')}
                </div>
                <div class="share-cards-popup-footer">
                    <button class="share-cards-cancel-btn" id="close-share-popup">Annuler</button>
                </div>
            </div>
        `;

        document.body.appendChild(popup);

        // Fermer la popup
        const closePopup = () => {
            popup.classList.add('closing');
            setTimeout(() => popup.remove(), 200);
        };

        document.getElementById('close-share-popup').onclick = closePopup;
        popup.onclick = (e) => {
            if (e.target === popup) closePopup();
        };

        // Gérer les clics sur les options
        popup.querySelectorAll('.share-cards-option').forEach(btn => {
            btn.onclick = () => {
                const message = btn.dataset.message;
                this.send(MESSAGE_TYPES.CHAT_MESSAGE, {
                    playerId: this.playerId,
                    roomId: this.roomId,
                    message
                });
                closePopup();
            };
        });
    }

    handleChatMessage(data) {
        const container = document.getElementById('chat-messages');

        // Formater le timestamp en HH:MM
        const timestamp = data.timestamp ? new Date(data.timestamp) : new Date();
        const timeStr = timestamp.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });

        const messageDiv = document.createElement('div');
        messageDiv.className = 'chat-message';
        messageDiv.innerHTML = `
            <div class="chat-header">
                <span class="chat-author">${data.playerName}</span>
                <span class="chat-time">${timeStr}</span>
            </div>
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
        // Nettoyer le roomId - la partie est terminée
        sessionStorage.removeItem('courtOfShadows_roomId');
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

    addActivityMessage(message, type = 'info') {
        const activityLog = document.getElementById('activity-log');
        if (!activityLog) return;

        const now = new Date();
        const timeStr = now.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });

        const messageDiv = document.createElement('div');
        messageDiv.className = `activity-message ${type}`;
        messageDiv.innerHTML = `
            <span>${message}</span>
            <span class="activity-time">${timeStr}</span>
        `;

        activityLog.appendChild(messageDiv);
        activityLog.scrollTop = activityLog.scrollHeight;
    }

    clearActivityLog() {
        const activityLog = document.getElementById('activity-log');
        if (activityLog) {
            activityLog.innerHTML = '';
        }
        this.previousWaitingPlayers = [];
    }

    showError(message) {
        showInfoPopup({
            icon: '❌',
            title: 'Erreur',
            message: message,
            buttonText: 'OK'
        });
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

