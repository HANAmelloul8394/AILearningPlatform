const mysql = require('mysql2/promise');
require('dotenv').config({ path: '../../.env' });

// Simple pool connection
const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 3306,
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME || 'AILearningPlatform',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

const testConnection = async () => {
  try {
    const connection = await pool.getConnection();
    console.log('Connected to MySQL database successfully');
    connection.release();
  } catch (error) {
    console.error('Database connection failed:', error.message);
    process.exit(1);
  }
};

const query = async (sql, params = []) => {
  try {
    const [rows] = await pool.execute(sql, params);
    return rows;
  } catch (error) {
    console.error('Database query error:', error.message);
    throw error;
  }
};

testConnection();

module.exports = { pool, query };