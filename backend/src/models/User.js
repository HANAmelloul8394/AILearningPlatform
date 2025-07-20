const { DataTypes, Model } = require('sequelize');
const { sequelize } = require('../../config/sequelize');

class User extends Model {
  static associate(models) {
    User.hasMany(models.Prompt, {
      foreignKey: 'user_id',
      as: 'prompts',
      onDelete: 'CASCADE'
    });
  }
}

User.init({
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  name: {
    type: DataTypes.STRING(255),
    allowNull: false
  },
  phone: {
    type: DataTypes.STRING(20),
    allowNull: true,
    unique: true
  },
  password: {
    type: DataTypes.STRING(255),
    allowNull: false,
    unique: true
  },
}, {
  sequelize,
  modelName: 'User',
  tableName: 'users',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at'
});

module.exports = User;
