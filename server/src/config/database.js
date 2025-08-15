import pg from 'pg';
import dotenv from 'dotenv';

dotenv.config({ path: '../.env' });

const { Pool } = pg;

// Optimized connection pool configuration
const poolConfig = {
  connectionString: process.env.DATABASE_URL,
  
  // Connection pool optimization
  max: parseInt(process.env.DB_MAX_CONNECTIONS) || 20, // Maximum pool size
  min: parseInt(process.env.DB_MIN_CONNECTIONS) || 2,  // Minimum pool size
  idle: parseInt(process.env.DB_IDLE_TIMEOUT) || 10000, // Close idle clients after 10s
  
  // Connection timeout settings
  connectionTimeoutMillis: parseInt(process.env.DB_CONNECTION_TIMEOUT) || 2000,
  idleTimeoutMillis: parseInt(process.env.DB_IDLE_TIMEOUT) || 10000,
  
  // Query settings
  query_timeout: parseInt(process.env.DB_QUERY_TIMEOUT) || 30000,
  statement_timeout: parseInt(process.env.DB_STATEMENT_TIMEOUT) || 30000,
  
  // SSL configuration - secure by default
  ssl: process.env.NODE_ENV === 'production' ? {
    rejectUnauthorized: true,
    ca: process.env.DB_SSL_CA,
    cert: process.env.DB_SSL_CERT,
    key: process.env.DB_SSL_KEY
  } : process.env.DATABASE_URL?.includes('localhost') ? false : {
    rejectUnauthorized: false // Only for development with cloud databases
  }
};

const pool = new Pool(poolConfig);

// Enhanced connection monitoring
pool.on('connect', (client) => {
  console.log(`✅ Database connection established. Pool: ${pool.totalCount}/${pool.options.max}`);
  
  // Set connection-level optimizations
  client.query(`
    SET statement_timeout = '${poolConfig.statement_timeout}ms';
    SET idle_in_transaction_session_timeout = '10s';
    SET search_path = public;
  `).catch(err => console.warn('Failed to set connection optimizations:', err.message));
});

pool.on('acquire', () => {
  console.log(`🔄 Connection acquired. Active: ${pool.totalCount - pool.idleCount}/${pool.totalCount}`);
});

pool.on('release', () => {
  console.log(`📤 Connection released. Idle: ${pool.idleCount}/${pool.totalCount}`);
});

pool.on('error', (err, client) => {
  console.error('❌ Unexpected database error:', {
    message: err.message,
    code: err.code,
    severity: err.severity,
    detail: err.detail,
    pool_stats: {
      total: pool.totalCount,
      idle: pool.idleCount,
      waiting: pool.waitingCount
    }
  });
  
  // Don't exit process, let the pool handle reconnection
  if (err.code === 'ECONNRESET' || err.code === 'ENOTFOUND') {
    console.log('🔄 Attempting to reconnect to database...');
  }
});

// Graceful shutdown
process.on('SIGINT', async () => {
  console.log('🛑 Shutting down database pool...');
  await pool.end();
  console.log('✅ Database pool closed');
  process.exit(0);
});

process.on('SIGTERM', async () => {
  console.log('🛑 Shutting down database pool...');
  await pool.end();
  console.log('✅ Database pool closed');
  process.exit(0);
});

// Health check function
export const checkDatabaseHealth = async () => {
  try {
    const client = await pool.connect();
    const result = await client.query('SELECT NOW() as current_time, version() as db_version');
    client.release();
    
    return {
      healthy: true,
      timestamp: result.rows[0].current_time,
      version: result.rows[0].db_version,
      pool_stats: {
        total: pool.totalCount,
        idle: pool.idleCount,
        waiting: pool.waitingCount
      }
    };
  } catch (error) {
    return {
      healthy: false,
      error: error.message,
      pool_stats: {
        total: pool.totalCount,
        idle: pool.idleCount,
        waiting: pool.waitingCount
      }
    };
  }
};

// Performance monitoring
export const getPoolStats = () => ({
  total: pool.totalCount,
  idle: pool.idleCount,
  waiting: pool.waitingCount,
  max: pool.options.max,
  min: pool.options.min
});

export default pool;