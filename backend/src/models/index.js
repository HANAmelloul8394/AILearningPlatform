const { sequelize } = require('../../config/sequelize');

const User = require('./User');
const Prompt = require('./Prompt');
const Category = require('./Category');
const SubCategory = require('./SubCategory');

const models = {
  User,
  Prompt,
  Category,
  SubCategory
};

Object.values(models).forEach(model => {
  if (typeof model.associate === 'function') {
    model.associate(models);
  }
});

const initializeDatabase = async () => {
  try {
    await sequelize.sync({ force: false });
    console.log('Database synchronized');
  } catch (error) {
    console.error('Database sync failed:', error);
    throw error;
  }
};

module.exports = {
  ...models,
  sequelize,
  initializeDatabase
};
