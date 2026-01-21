const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const USERS_FILE = path.join(__dirname, 'users.json');

// Charger les utilisateurs
function loadUsers() {
    try {
        const data = fs.readFileSync(USERS_FILE, 'utf8');
        return JSON.parse(data);
    } catch (error) {
        return { users: [] };
    }
}

// Sauvegarder les utilisateurs
function saveUsers(data) {
    fs.writeFileSync(USERS_FILE, JSON.stringify(data, null, 2), 'utf8');
}

// Hash du mot de passe
function hashPassword(password) {
    return crypto.createHash('sha256').update(password).digest('hex');
}

// Générer un token de session
function generateToken() {
    return crypto.randomBytes(32).toString('hex');
}

// Inscription
function register(username, password) {
    const data = loadUsers();

    // Vérifier si l'utilisateur existe déjà
    const existingUser = data.users.find(u => u.username.toLowerCase() === username.toLowerCase());
    if (existingUser) {
        return { success: false, error: 'Ce nom d\'utilisateur existe déjà' };
    }

    // Valider le nom d'utilisateur
    if (!username || username.length < 3 || username.length > 20) {
        return { success: false, error: 'Le nom d\'utilisateur doit contenir entre 3 et 20 caractères' };
    }

    // Valider le mot de passe
    if (!password || password.length < 4) {
        return { success: false, error: 'Le mot de passe doit contenir au moins 4 caractères' };
    }

    const token = generateToken();
    const newUser = {
        id: crypto.randomUUID(),
        username: username,
        password: hashPassword(password),
        token: token,
        createdAt: new Date().toISOString(),
        stats: {
            gamesPlayed: 0,
            gamesWon: 0,
            timesAsLoyalist: 0,
            timesAsConspirator: 0,
            timesAsUsurper: 0
        }
    };

    data.users.push(newUser);
    saveUsers(data);

    return {
        success: true,
        user: {
            id: newUser.id,
            username: newUser.username,
            token: token,
            stats: newUser.stats
        }
    };
}

// Connexion
function login(username, password) {
    const data = loadUsers();

    const user = data.users.find(u =>
        u.username.toLowerCase() === username.toLowerCase() &&
        u.password === hashPassword(password)
    );

    if (!user) {
        return { success: false, error: 'Nom d\'utilisateur ou mot de passe incorrect' };
    }

    // Générer un nouveau token
    const token = generateToken();
    user.token = token;
    saveUsers(data);

    return {
        success: true,
        user: {
            id: user.id,
            username: user.username,
            token: token,
            stats: user.stats
        }
    };
}

// Vérifier le token
function verifyToken(userId, token) {
    const data = loadUsers();
    const user = data.users.find(u => u.id === userId && u.token === token);
    return !!user;
}

// Récupérer un utilisateur par ID
function getUserById(userId) {
    const data = loadUsers();
    const user = data.users.find(u => u.id === userId);
    if (!user) return null;

    return {
        id: user.id,
        username: user.username,
        stats: user.stats
    };
}

// Mettre à jour les stats d'un utilisateur
function updateUserStats(userId, updates) {
    const data = loadUsers();
    const user = data.users.find(u => u.id === userId);

    if (!user) return false;

    user.stats = { ...user.stats, ...updates };
    saveUsers(data);
    return true;
}

module.exports = {
    register,
    login,
    verifyToken,
    getUserById,
    updateUserStats
};
