const express = require('express');
const cors = require('cors');
require('dotenv').config();
const {sequelize} = require('./config/sequelize');
const { errorHandler } = require('./src/middleware/errorHandler'); 

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors({ origin: process.env.FRONTEND_URL }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

app.use('/api/users', require('./src/routes/userRoutes'));
app.use('/api/categories', require('./src/routes/categoryRoutes'));
app.use('/api/prompts', require('./src/routes/promptRoutes'));
// app.use('/api/admin', require('./src/routes/adminRoutes'));

app.get('/', (req, res) => {
  res.json({
    message: 'AI Learning Platform API is running!',
    version: '1.0.0',
    timestamp: new Date().toISOString()
  });
});

app.get('/health', (req, res) => {
  res.json({
    success: true,
    message: 'API is healthy',
    timestamp: new Date().toISOString()
  });
});

app.use(errorHandler);

app.use('*', (req, res) => {
  res.status(404).json({ success: false, message: 'Route not found' });
});

sequelize.sync()
  .then(() => {
app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
      console.log(`Health check: http://localhost:${PORT}/health`);
});
  })
  .catch(err => {
    console.error('Failed to sync database:', err.message);
    process.exit(1);
  });
