const { Pool } = require('pg');

const pool = new Pool({
    host: process.env.DB_HOST || '/cloudsql/court-of-shadows-game:europe-west1:court-of-shadows-db',
    user: process.env.DB_USER || 'appuser',
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME || 'courtdb',
    port: process.env.DB_PORT || 5432
});

pool.on('error', (err) => {
    console.error('Erreur inattendue du pool PostgreSQL', err);
});

async function initDatabase() {
    const client = await pool.connect();

    try {
        await client.query(`
            CREATE TABLE IF NOT EXISTS users (
                id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                username VARCHAR(20) UNIQUE NOT NULL,
                email VARCHAR(255) UNIQUE,
                password_hash VARCHAR(255) NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                last_login TIMESTAMP,
                is_premium BOOLEAN DEFAULT FALSE,
                premium_until TIMESTAMP,
                INDEX idx_username (username),
                INDEX idx_email (email)
            )
        `);

        await client.query(`
            CREATE TABLE IF NOT EXISTS user_stats (
                user_id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
                games_played INTEGER DEFAULT 0,
                games_won INTEGER DEFAULT 0,
                times_as_loyalist INTEGER DEFAULT 0,
                times_as_conspirator INTEGER DEFAULT 0,
                times_as_usurper INTEGER DEFAULT 0,
                loyalist_wins INTEGER DEFAULT 0,
                conspirator_wins INTEGER DEFAULT 0,
                usurper_wins INTEGER DEFAULT 0,
                total_votes_cast INTEGER DEFAULT 0,
                total_decrees_played INTEGER DEFAULT 0,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);

        await client.query(`
            CREATE TABLE IF NOT EXISTS game_history (
                id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                room_id VARCHAR(10) NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                ended_at TIMESTAMP,
                winner_faction VARCHAR(20),
                reason TEXT,
                duration_seconds INTEGER,
                player_count INTEGER,
                plots_count INTEGER,
                edits_count INTEGER,
                INDEX idx_created_at (created_at)
            )
        `);

        await client.query(`
            CREATE TABLE IF NOT EXISTS game_participants (
                id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                game_id UUID REFERENCES game_history(id) ON DELETE CASCADE,
                user_id UUID REFERENCES users(id) ON DELETE CASCADE,
                role VARCHAR(20) NOT NULL,
                faction VARCHAR(20) NOT NULL,
                is_alive BOOLEAN,
                won BOOLEAN,
                INDEX idx_game_user (game_id, user_id)
            )
        `);

        await client.query(`
            CREATE TABLE IF NOT EXISTS sessions (
                id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                user_id UUID REFERENCES users(id) ON DELETE CASCADE,
                token VARCHAR(64) UNIQUE NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                expires_at TIMESTAMP NOT NULL,
                INDEX idx_token (token),
                INDEX idx_expires (expires_at)
            )
        `);

        console.log('✅ Base de données initialisée');
    } catch (error) {
        console.error('❌ Erreur initialisation DB:', error);
        throw error;
    } finally {
        client.release();
    }
}

module.exports = { pool, initDatabase };