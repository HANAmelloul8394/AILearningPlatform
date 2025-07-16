# AI Learning Platform

An intelligent and modular learning platform powered by AI, enabling users to generate customized learning content.

## Overview

AI Learning Platform leverages the power of OpenAI to allow users to create structured and personalized lessons based on topics of interest. The platform supports smart categorization, an intuitive UI, and an admin analytics dashboard.

## Architecture

The platform is structured into two main services:

- **Backend**: Node.js + Express API with PostgreSQL and OpenAI integration
- **Frontend**: React.js web application

## Tech Stack

- **Backend**: Node.js, Express, PostgreSQL, OpenAI API, JWT, Helmet, CORS
- **Frontend**: React.js, Axios, React Router, Context API
- **DevOps**: Docker (optional), ESLint, dotenv

## Getting Started

### Prerequisites

- Node.js 16+
- PostgreSQL 12+
- npm or yarn
- OpenAI API key

### Installation

1. **Clone the repository:**
   ```bash
   git clone [your-repo-url]
   cd AILearningPlatform
   ```

2. **Start the backend:**
   ```bash
   cd backend
   npm install
   cp .env.example .env
   # configure your .env
   npm run setup-db
   npm run dev
   ```

3. **Start the frontend:**
   ```bash
   cd ../frontend
   npm install
   npm start
   ```

## Environment Variables

### Backend (`backend/.env`)
```env
DB_HOST=localhost
DB_PORT=5432
DB_NAME=AILearningPlatform
DB_USER=postgres
DB_PASSWORD=your_password

OPENAI_API_KEY=your_openai_key

PORT=5000
NODE_ENV=development
FRONTEND_URL=http://localhost:3000

JWT_SECRET=your_jwt_secret
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
```

### Frontend (`frontend/.env`)
```env
REACT_APP_API_URL=http://localhost:5000
REACT_APP_ENV=development
```

## Folder Structure

```
AILearningPlatform/
├── backend/     # Node.js server
├── frontend/    # React application
└── docs/        # Documentation & specifications
```

## Testing

Basic unit and integration tests planned using Jest (backend) and React Testing Library (frontend).


## Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/my-feature`
3. Commit your changes: `git commit -m "Add my feature"`
4. Push the branch: `git push origin feature/my-feature`
5. Open a Pull Request

## License

This project is licensed under the MIT License.
