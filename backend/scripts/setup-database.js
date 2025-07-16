const mysql = require('mysql2/promise');
require('dotenv').config({ path: '../../.env' });

async function setupDatabase() {
  let connection;
  
  try {
    connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      port: process.env.DB_PORT || 3306,
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD
    });

    const dbName = process.env.DB_NAME || 'AILearningPlatform';
    await connection.query(`CREATE DATABASE IF NOT EXISTS ${dbName}`);
    console.log(`Database ${dbName} created/verified`);

    await connection.query(`USE ${dbName}`);

    // Check if tables exist and drop them
    const tables = ['prompts', 'sub_categories', 'categories', 'users'];
    
    for (const table of tables) {
      await connection.query(`DROP TABLE IF EXISTS ${table}`);
    }
    console.log('Existing tables dropped');

    // Create users table
    await connection.query(`
      CREATE TABLE users (
        id INT PRIMARY KEY AUTO_INCREMENT,
        name VARCHAR(255) NOT NULL,
        phone VARCHAR(20) UNIQUE NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `);
    console.log('Users table created');

    // Create categories table
    await connection.query(`
      CREATE TABLE categories (
        id INT PRIMARY KEY AUTO_INCREMENT,
        name VARCHAR(255) UNIQUE NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('Categories table created');

    // Create sub_categories table
    await connection.query(`
      CREATE TABLE sub_categories (
        id INT PRIMARY KEY AUTO_INCREMENT,
        name VARCHAR(255) NOT NULL,
        category_id INT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE CASCADE,
        UNIQUE KEY unique_sub_category_per_category (name, category_id)
      )
    `);
    console.log('Sub_categories table created');

    // Create prompts table
    await connection.query(`
      CREATE TABLE prompts (
        id INT PRIMARY KEY AUTO_INCREMENT,
        user_id INT NOT NULL,
        category_id INT NOT NULL,
        sub_category_id INT,
        prompt TEXT NOT NULL,
        response TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE RESTRICT,
        FOREIGN KEY (sub_category_id) REFERENCES sub_categories(id) ON DELETE SET NULL
      )
    `);
    console.log('Prompts table created');

    // Insert initial data
    await connection.query(`
      INSERT INTO categories (name) VALUES
      ('Programming'),
      ('Mathematics'),
      ('Science')
    `);
    console.log('Categories inserted');

    await connection.query(`
      INSERT INTO sub_categories (name, category_id) VALUES
      ('JavaScript', 1),
      ('Python', 1),
      ('React', 1),
      ('Algebra', 2),
      ('Physics', 3)
    `);
    console.log('Sub_categories inserted');

    console.log('Database setup completed successfully!');

  } catch (error) {
    console.error('Database setup failed:', error.message);
    throw error;
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

setupDatabase()
  .then(() => process.exit(0))
  .catch(() => process.exit(1));

module.exports = { setupDatabase };