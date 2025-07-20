const { DataTypes, Model } = require('sequelize');
const { sequelize } = require('../../config/sequelize');

class Prompt extends Model {
  static associate(models) {
    Prompt.belongsTo(models.User, {
      foreignKey: 'user_id',
      as: 'user'
    });
    Prompt.belongsTo(models.Category, {
      foreignKey: 'category_id',
      as: 'category'
    });
    Prompt.belongsTo(models.SubCategory, {
      foreignKey: 'sub_category_id',
      as: 'subCategory'
    });
  }
}

Prompt.init({
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  user_id: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  category_id: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  sub_category_id: {
    type: DataTypes.INTEGER,
    allowNull: false
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
  sequelize,
  modelName: 'Prompt',
  tableName: 'prompts',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: false
});

module.exports = Prompt;
