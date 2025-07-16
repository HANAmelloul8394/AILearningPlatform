const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');
const User = require('./User');
const Category = require('./Category');
const SubCategory = require('./SubCategory');

const Prompt = sequelize.define('Prompt', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  user_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: User,
      key: 'id'
    }
  },
  category_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: Category,
      key: 'id'
    }
  },
  sub_category_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: SubCategory,
      key: 'id'
    }
  },
  prompt: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  response: {
    type: DataTypes.TEXT,
    allowNull: false
  }
}, {
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: false,
  tableName: 'prompts'
});

module.exports = Prompt;
