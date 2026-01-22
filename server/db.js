const { Pool } = require('pg');

const isProduction = process.env.NODE_ENV === 'production';

const poolConfig = {
    user: process.env.DB_USER || 'appuser',
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME || 'courtdb',
    port: parseInt(process.env.DB_PORT || '5432')
};

if (isProduction) {
    poolConfig.host = `/cloudsql/court-of-shadows-game:europe-west1:court-of-shadows-db`;
} else {
    poolConfig.host = process.env.DB_HOST || 'localhost';
}

console.log('Configuration DB:', {
    user: poolConfig.user,
    database: poolConfig.database,
    host: poolConfig.host,
    port: poolConfig.port,
    hasPassword: !!poolConfig.password
});

const pool = new Pool(poolConfig);

pool.on('error', (err) => {
    console.error('❌ Erreur PostgreSQL:', err);
});

pool.on('connect', () => {
    console.log('✅ Connecté à PostgreSQL');
});

async function initDatabase() {
    const client = await pool.connect();

    try {
        console.log('🔧 Initialisation de la base de données...');

        const result = await client.query('SELECT NOW()');
        console.log('✅ Connexion DB réussie:', result.rows[0].now);

        await client.query(`
            CREATE TABLE IF NOT EXISTS users (
                                                 id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                username VARCHAR(20) UNIQUE NOT NULL,
                email VARCHAR(255) UNIQUE,
                password_hash VARCHAR(255) NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                last_login TIMESTAMP,
                is_premium BOOLEAN DEFAULT FALSE,
                premium_until TIMESTAMP
                )
        `);

        await client.query(`CREATE INDEX IF NOT EXISTS idx_username ON users(username)`);
        await client.query(`CREATE INDEX IF NOT EXISTS idx_email ON users(email)`);

        await client.query(`
            CREATE TABLE IF NOT EXISTS user_stats (
                user_id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
                games_played INTEGER DEFAULT 0,
                games_won INTEGER DEFAULT 0,
                times_as_loyalist INTEGER DEFAULT 0,
                times_as_conspirator INTEGER DEFAULT 0,
                times_as_usurper INTEGER DEFAULT 0,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);

        await client.query(`
            CREATE TABLE IF NOT EXISTS sessions (
                id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                user_id UUID REFERENCES users(id) ON DELETE CASCADE,
                token VARCHAR(64) UNIQUE NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                expires_at TIMESTAMP NOT NULL
            )
        `);

        await client.query(`CREATE INDEX IF NOT EXISTS idx_token ON sessions(token)`);
        await client.query(`CREATE INDEX IF NOT EXISTS idx_expires ON sessions(expires_at)`);

        console.log('✅ Base de données initialisée');
    } catch (error) {
        console.error('❌ Erreur initialisation DB:', error);
        throw error;
    } finally {
        client.release();
    }
}

module.exports = { pool, initDatabase };