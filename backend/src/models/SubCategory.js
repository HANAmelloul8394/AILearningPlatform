const { DataTypes, Model } = require('sequelize');
const { sequelize } = require('../../config/sequelize');

class SubCategory extends Model {
  static associate(models) {
    SubCategory.belongsTo(models.Category, {
      foreignKey: 'category_id',
      as: 'category'
    });
    SubCategory.hasMany(models.Prompt, {
      foreignKey: 'sub_category_id',
      as: 'prompts',
      onDelete: 'SET NULL'
    });
  }
}

SubCategory.init({
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false
  },
  category_id: {
    type: DataTypes.INTEGER,
    allowNull: false
  }
}, {
  sequelize,
  modelName: 'SubCategory',
  tableName: 'sub_categories',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: false
});

module.exports = SubCategory;
