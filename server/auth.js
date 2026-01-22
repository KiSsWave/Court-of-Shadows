const { pool } = require('./db');
const bcrypt = require('bcrypt');
const crypto = require('crypto');

const SALT_ROUNDS = 10;
const TOKEN_EXPIRY_DAYS = 30;

function generateToken() {
    return crypto.randomBytes(32).toString('hex');
}

async function register(username, password, email = null) {
    const client = await pool.connect();

    try {
        if (!username || username.length < 3 || username.length > 20) {
            return { success: false, error: 'Le nom d\'utilisateur doit contenir entre 3 et 20 caractères' };
        }

        if (!/^[a-zA-Z0-9_-]+$/.test(username)) {
            return { success: false, error: 'Le nom d\'utilisateur ne peut contenir que des lettres, chiffres, tirets et underscores' };
        }

        if (!password || password.length < 4) {
            return { success: false, error: 'Le mot de passe doit contenir au moins 4 caractères' };
        }

        const existingUser = await client.query(
            'SELECT id FROM users WHERE LOWER(username) = LOWER($1)',
            [username]
        );

        if (existingUser.rows.length > 0) {
            return { success: false, error: 'Ce nom d\'utilisateur existe déjà' };
        }

        const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);

        const result = await client.query(
            'INSERT INTO users (username, email, password_hash) VALUES ($1, $2, $3) RETURNING id, username',
            [username, email, passwordHash]
        );

        const userId = result.rows[0].id;

        await client.query(
            'INSERT INTO user_stats (user_id) VALUES ($1)',
            [userId]
        );

        const token = generateToken();
        const expiresAt = new Date(Date.now() + TOKEN_EXPIRY_DAYS * 24 * 60 * 60 * 1000);

        await client.query(
            'INSERT INTO sessions (user_id, token, expires_at) VALUES ($1, $2, $3)',
            [userId, token, expiresAt]
        );

        return {
            success: true,
            user: {
                id: userId,
                username: result.rows[0].username,
                token: token
            }
        };
    } catch (error) {
        console.error('Erreur registration:', error);
        return { success: false, error: 'Erreur serveur lors de l\'inscription' };
    } finally {
        client.release();
    }
}

async function login(username, password) {
    const client = await pool.connect();

    try {
        const result = await client.query(
            'SELECT id, username, password_hash, is_premium, premium_until FROM users WHERE LOWER(username) = LOWER($1)',
            [username]
        );

        if (result.rows.length === 0) {
            return { success: false, error: 'Nom d\'utilisateur ou mot de passe incorrect' };
        }

        const user = result.rows[0];
        const passwordMatch = await bcrypt.compare(password, user.password_hash);

        if (!passwordMatch) {
            return { success: false, error: 'Nom d\'utilisateur ou mot de passe incorrect' };
        }

        await client.query(
            'DELETE FROM sessions WHERE user_id = $1',
            [user.id]
        );

        const token = generateToken();
        const expiresAt = new Date(Date.now() + TOKEN_EXPIRY_DAYS * 24 * 60 * 60 * 1000);

        await client.query(
            'INSERT INTO sessions (user_id, token, expires_at) VALUES ($1, $2, $3)',
            [user.id, token, expiresAt]
        );

        await client.query(
            'UPDATE users SET last_login = CURRENT_TIMESTAMP WHERE id = $1',
            [user.id]
        );

        const statsResult = await client.query(
            'SELECT * FROM user_stats WHERE user_id = $1',
            [user.id]
        );

        return {
            success: true,
            user: {
                id: user.id,
                username: user.username,
                token: token,
                isPremium: user.is_premium,
                premiumUntil: user.premium_until,
                stats: statsResult.rows[0] || {}
            }
        };
    } catch (error) {
        console.error('Erreur login:', error);
        return { success: false, error: 'Erreur serveur lors de la connexion' };
    } finally {
        client.release();
    }
}

async function verifyToken(userId, token) {
    const client = await pool.connect();

    try {
        const result = await client.query(
            'SELECT * FROM sessions WHERE user_id = $1 AND token = $2 AND expires_at > CURRENT_TIMESTAMP',
            [userId, token]
        );

        return result.rows.length > 0;
    } catch (error) {
        console.error('Erreur vérification token:', error);
        return false;
    } finally {
        client.release();
    }
}

async function getUserById(userId) {
    const client = await pool.connect();

    try {
        const userResult = await client.query(
            'SELECT id, username, email, is_premium, premium_until, created_at FROM users WHERE id = $1',
            [userId]
        );

        if (userResult.rows.length === 0) {
            return null;
        }

        const statsResult = await client.query(
            'SELECT * FROM user_stats WHERE user_id = $1',
            [userId]
        );

        return {
            ...userResult.rows[0],
            stats: statsResult.rows[0] || {}
        };
    } catch (error) {
        console.error('Erreur getUserById:', error);
        return null;
    } finally {
        client.release();
    }
}

async function updateUserStats(userId, updates) {
    const client = await pool.connect();

    try {
        const fields = Object.keys(updates).map((key, i) => `${key} = $${i + 2}`).join(', ');
        const values = Object.values(updates);

        await client.query(
            `UPDATE user_stats SET ${fields}, updated_at = CURRENT_TIMESTAMP WHERE user_id = $1`,
            [userId, ...values]
        );

        return true;
    } catch (error) {
        console.error('Erreur updateUserStats:', error);
        return false;
    } finally {
        client.release();
    }
}

async function saveGameHistory(gameData) {
    const client = await pool.connect();

    try {
        await client.query('BEGIN');

        const gameResult = await client.query(
            `INSERT INTO game_history 
            (room_id, ended_at, winner_faction, reason, duration_seconds, player_count, plots_count, edits_count)
            VALUES ($1, CURRENT_TIMESTAMP, $2, $3, $4, $5, $6, $7)
            RETURNING id`,
            [
                gameData.roomId,
                gameData.winnerFaction,
                gameData.reason,
                gameData.durationSeconds,
                gameData.playerCount,
                gameData.plotsCount,
                gameData.editsCount
            ]
        );

        const gameId = gameResult.rows[0].id;

        for (const participant of gameData.participants) {
            await client.query(
                `INSERT INTO game_participants (game_id, user_id, role, faction, is_alive, won)
                VALUES ($1, $2, $3, $4, $5, $6)`,
                [
                    gameId,
                    participant.userId,
                    participant.role,
                    participant.faction,
                    participant.isAlive,
                    participant.won
                ]
            );

            const statsUpdate = {
                games_played: 1,
                games_won: participant.won ? 1 : 0
            };

            if (participant.role === 'loyalist') {
                statsUpdate.times_as_loyalist = 1;
                if (participant.won) statsUpdate.loyalist_wins = 1;
            } else if (participant.role === 'conspirator') {
                statsUpdate.times_as_conspirator = 1;
                if (participant.won) statsUpdate.conspirator_wins = 1;
            } else if (participant.role === 'usurper') {
                statsUpdate.times_as_usurper = 1;
                if (participant.won) statsUpdate.usurper_wins = 1;
            }

            const fields = Object.keys(statsUpdate).map(key => `${key} = ${key} + $${Object.keys(statsUpdate).indexOf(key) + 2}`).join(', ');
            const values = Object.values(statsUpdate);

            await client.query(
                `UPDATE user_stats SET ${fields}, updated_at = CURRENT_TIMESTAMP WHERE user_id = $1`,
                [participant.userId, ...values]
            );
        }

        await client.query('COMMIT');
        return { success: true, gameId };
    } catch (error) {
        await client.query('ROLLBACK');
        console.error('Erreur saveGameHistory:', error);
        return { success: false, error: error.message };
    } finally {
        client.release();
    }
}

async function cleanupExpiredSessions() {
    const client = await pool.connect();

    try {
        const result = await client.query(
            'DELETE FROM sessions WHERE expires_at < CURRENT_TIMESTAMP'
        );
        console.log(`🧹 ${result.rowCount} sessions expirées nettoyées`);
    } catch (error) {
        console.error('Erreur cleanup sessions:', error);
    } finally {
        client.release();
    }
}

setInterval(cleanupExpiredSessions, 24 * 60 * 60 * 1000);

module.exports = {
    register,
    login,
    verifyToken,
    getUserById,
    updateUserStats,
    saveGameHistory,
    cleanupExpiredSessions
};