const { DataTypes, Model } = require('sequelize');
const { sequelize } = require('../../config/sequelize');

class Category extends Model {
  static associate(models) {
    Category.hasMany(models.SubCategory, {
      foreignKey: 'category_id',
      as: 'subCategories',
      onDelete: 'CASCADE'
    });
    Category.hasMany(models.Prompt, {
      foreignKey: 'category_id',
      as: 'prompts',
      onDelete: 'RESTRICT'
    });
  }
}

Category.init({
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false
  }
}, {
  sequelize,
  modelName: 'Category',
  tableName: 'categories',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: false
});

module.exports = Category;
