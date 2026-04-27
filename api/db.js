const { Pool } = require('pg');
require('dotenv').config();

if (!process.env.DATABASE_URL) {
  console.error('❌ DATABASE_URL environment variable тохируулагдаагүй байна');
  process.exit(1);
}

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
  connectionTimeoutMillis: 10000,
  idleTimeoutMillis: 30000,   // 30 секунд ашиглагдаагүй connection-ийг хаах
  max: 10,                    // нэгэн зэрэг хамгийн ихдээ 10 connection
});

// Idle client алдааг барих
pool.on('error', (err) => {
  console.error('❌ Unexpected error on idle client:', err.message);
});

// Connection шалгах
pool.query('SELECT NOW()', (err) => {
  if (err) {
    console.error('❌ Database connection failed:', err.message);
  } else {
    console.log('✅ Database connected successfully');
  }
});

module.exports = pool;