# AI Learning Platform - Backend

A RESTful API built with Node.js and Express.js, integrated with OpenAI and PostgreSQL, for generating personalized educational content.

## Technologies

- Node.js & Express
- PostgreSQL
- OpenAI API
- JWT for authentication (optional)
- Helmet, CORS, and rate-limiting for security
- dotenv for environment configuration

## Setup Instructions

1. Install dependencies:
   ```bash
   npm install
   ```

2. Configure environment variables:
   ```bash
   cp .env.example .env
   # Edit .env with your credentials
   ```

3. Setup the database:
   ```bash
   npm run setup-db
   ```

4. Run the server:
   ```bash
   npm run dev     # Development (with nodemon)
   npm start       # Production
   ```

## API Endpoints

### Health
```
GET /
GET /health
```

### Users
```
POST   /api/users
GET    /api/users
GET    /api/users/:id
GET    /api/users/:id/history
```

### Categories
```
POST   /api/categories
GET    /api/categories
GET    /api/categories/:id
GET    /api/categories/:id/sub-categories
POST   /api/categories/sub-categories
```

### Prompts
```
POST   /api/prompts
GET    /api/prompts
GET    /api/prompts/:id
DELETE /api/prompts/:id
GET    /api/prompts/user/:userId
```

### Admin
```
GET /api/admin/dashboard
GET /api/admin/users
GET /api/admin/prompts
GET /api/admin/users/:id/analytics
GET /api/admin/categories/analytics
GET /api/admin/export
```

## Database Schema

```sql
Users
  - id, name, phone, email, created_at

Categories
  - id, name, description

Sub_Categories
  - id, name, category_id, description

Prompts
  - id, user_id, category_id, sub_category_id, prompt, response
```

## Security

- Rate Limiting: 100 req / 15 min
- Input Validation: Express Validator
- Headers: Helmet
- Sanitization: Middleware
- CORS: Configurable by environment

## Directory Structure

```
backend/
├── src/
│   ├── config/          # DB and app config
│   ├── controllers/     # Route logic
│   ├── services/        # Business logic
│   ├── routes/          # Express routes
│   └── middleware/      # Middleware
├── scripts/             # DB setup
├── tests/               # Unit tests (future)
├── .env.example
└── server.js             # Entry point
```

## 🔍 Troubleshooting

### PostgreSQL Connection Errors
```bash
# Ensure PostgreSQL is running
sudo service postgresql status

# Check credentials in .env
```

### OpenAI API Errors
- Ensure your API key is valid
- Check for quota limits
- Inspect server logs

## Useful Scripts

```bash
npm run dev         # Development server with nodemon
npm run setup-db    # Create tables and seed data
npm test            # Run tests (future)
npm run lint        # Lint code (future)
```
