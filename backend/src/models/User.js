const { query, transaction } = require('../config/db');

class User {
  constructor(data = {}) {
    this.id = data.id || null;
    this.name = data.name || '';
    this.phone = data.phone || '';
    this.email = data.email || null;
    this.created_at = data.created_at || new Date();
    this.updated_at = data.updated_at || new Date();
  }

  static async createTable() {
    const queryText = `
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        phone VARCHAR(20) UNIQUE NOT NULL,
        email VARCHAR(255) UNIQUE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `;
    
    try {
      await query(queryText);
      console.log('✅ Users table ready');
    } catch (error) {
      console.error('❌ Error creating users table:', error.message);
      throw error;
    }
  }

  static async findAll(options = {}) {
    const { limit = 50, offset = 0, search = '' } = options;
    
    let query = `
      SELECT id, name, phone, email, created_at, updated_at 
      FROM users
    `;
    const params = [];
    
    if (search) {
      query += ` WHERE name ILIKE $1 OR phone ILIKE $1`;
      params.push(`%${search}%`);
    }
    
    query += ` ORDER BY created_at DESC LIMIT $${params.length + 1} OFFSET $${params.length + 2}`;
    params.push(limit, offset);
    
    try {
      const result = await database.query(query, params);
      return result.rows.map(row => new User(row));
    } catch (error) {
      console.error('Error fetching users:', error.message);
      throw error;
    }
  }

  static async findById(id) {
    const query = 'SELECT * FROM users WHERE id = $1';
    
    try {
      const result = await database.query(query, [id]);
      return result.rows.length ? new User(result.rows[0]) : null;
    } catch (error) {
      console.error('Error fetching user by ID:', error.message);
      throw error;
    }
  }

  static async findByPhone(phone) {
    const query = 'SELECT * FROM users WHERE phone = $1';
    
    try {
      const result = await database.query(query, [phone]);
      return result.rows.length ? new User(result.rows[0]) : null;
    } catch (error) {
      console.error('Error fetching user by phone:', error.message);
      throw error;
    }
  }

  static async count(search = '') {
    let query = 'SELECT COUNT(*) FROM users';
    const params = [];
    
    if (search) {
      query += ' WHERE name ILIKE $1 OR phone ILIKE $1';
      params.push(`%${search}%`);
    }
    
    try {
      const result = await database.query(query, params);
      return parseInt(result.rows[0].count);
    } catch (error) {
      console.error('Error counting users:', error.message);
      throw error;
    }
  }

  async save() {
    const isUpdate = !!this.id;
    
    if (isUpdate) {
      return this.update();
    } else {
      return this.create();
    }
  }

  async create() {
    const query = `
      INSERT INTO users (name, phone, email)
      VALUES ($1, $2, $3)
      RETURNING *
    `;
    
    try {
      const result = await database.query(query, [this.name, this.phone, this.email]);
      const userData = result.rows[0];
      
      Object.assign(this, userData);
      return this;
    } catch (error) {
      if (error.code === '23505') {
        throw new Error('Phone number already exists');
      }
      console.error('Error creating user:', error.message);
      throw error;
    }
  }

  async update() {
    const query = `
      UPDATE users 
      SET name = $1, phone = $2, email = $3, updated_at = CURRENT_TIMESTAMP
      WHERE id = $4
      RETURNING *
    `;
    
    try {
      const result = await database.query(query, [this.name, this.phone, this.email, this.id]);
      
      if (result.rows.length === 0) {
        throw new Error('User not found');
      }
      
      Object.assign(this, result.rows[0]);
      return this;
    } catch (error) {
      if (error.code === '23505') {
        throw new Error('Phone number already exists');
      }
      console.error('Error updating user:', error.message);
      throw error;
    }
  }

  async delete() {
    if (!this.id) {
      throw new Error('Cannot delete user without ID');
    }
    
    const query = 'DELETE FROM users WHERE id = $1 RETURNING id';
    
    try {
      const result = await database.query(query, [this.id]);
      return result.rows.length > 0;
    } catch (error) {
      console.error('Error deleting user:', error.message);
      throw error;
    }
  }

  async getPromptHistory(options = {}) {
    const { limit = 20, offset = 0 } = options;
    
    const query = `
      SELECT p.*, c.name as category_name, sc.name as sub_category_name
      FROM prompts p
      LEFT JOIN categories c ON p.category_id = c.id
      LEFT JOIN sub_categories sc ON p.sub_category_id = sc.id
      WHERE p.user_id = $1
      ORDER BY p.created_at DESC
      LIMIT $2 OFFSET $3
    `;
    
    try {
      const result = await database.query(query, [this.id, limit, offset]);
      return result.rows;
    } catch (error) {
      console.error('Error fetching user prompt history:', error.message);
      throw error;
    }
  }

  toJSON() {
    return {
      id: this.id,
      name: this.name,
      phone: this.phone,
      email: this.email,
      created_at: this.created_at,
      updated_at: this.updated_at
    };
  }

  static validate(data) {
    const errors = [];
    
    if (!data.name || data.name.trim().length < 2) {
      errors.push('Name must be at least 2 characters long');
    }
    
    if (!data.phone || !/^\+?[\d\s\-\(\)]{10,}$/.test(data.phone)) {
      errors.push('Phone number must be valid');
    }
    
    if (data.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
      errors.push('Email must be valid');
    }
    
    return errors;
  }
}

module.exports = User;