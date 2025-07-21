# AI Learning Platform

An intelligent and modular learning platform powered by AI, enabling users to generate customized learning content.

## Overview

AI Learning Platform leverages OpenAI to allow users to create structured and personalized lessons based on topics of interest. Users can register, log in, select a category/subcategory, enter a prompt, and receive AI-generated learning content. Admins can view prompt history for all users.

## Architecture

* **Backend**: Node.js + Express API with MySQL + Sequelize ORM and OpenAI integration
* **Frontend**: React.js SPA using Context API and React Router

## Tech Stack

* **Backend**: Node.js, Express, MySQL, Sequelize, OpenAI API, JWT, Helmet, CORS
* **Frontend**: React.js, Axios, Context API
* **DevOps**: Docker, Docker Compose, ESLint, dotenv

## Features

* AI-generated lesson based on user input
* Secure login/register with JWT (stored in localStorage)
* Prompt history per user
* Admin dashboard for user/prompt management

## Setup Instructions

### Prerequisites

* Node.js 16+
* Docker + Docker Compose
* OpenAI API key

### Installation

1. **Clone the repository:**

```bash
git clone [https://github.com/HANAmelloul8394/AILearningPlatform.git]
cd AILearningPlatform
```

2. **Configure environment variables:**
   Create a `.env` file in the root:

```env
DB_HOST=db
DB_PORT=3306
DB_NAME=ai_learning
DB_USER=root
DB_PASSWORD=example
OPENAI_API_KEY=your_openai_key
JWT_SECRET=your_secret
FRONTEND_URL=http://localhost:3000
PORT=5000
```

3. **Run using Docker Compose:**

```bash
docker-compose up --build
```

Frontend will be available at [http://localhost:3000](http://localhost:3000)
Backend will run on [http://localhost:5000](http://localhost:5000)

## Docker Compose

The system includes 3 services:

* **db**: MySQL 8.0 database
* **backend**: Express API with Sequelize
* **frontend**: React app with live reload

### docker-compose.yml Highlights

* Healthcheck on MySQL
* `depends_on` ensures correct order
* Volume persistence for database
* Shared network between services

## AI Integration

* The backend sends prompts from users to the OpenAI API
* Endpoint: `POST /prompts`
* Example payload:

```json
{
  "category_id": 1,
  "sub_category_id": 2,
  "prompt": "Explain how volcanoes work"
}
```

* Example response:

```json
{
  "success": true,
  "data": {
    "response": "Volcanoes are geological formations that..."
  }
}
```

## Authentication

* JWT-based login/register
* Tokens stored in `localStorage`
* Protected routes via middleware (e.g. `/users/me`, `/prompts/user/:id`)

## Error Handling

Centralized error handler returns:

```json
{
  "success": false,
  "error": "ValidationError",
  "message": "Password must be at least 6 characters"
}
```

## Folder Structure

```
AILearningPlatform/
├── backend/       # Express API
├── frontend/      # React App
├── docker-compose.yml
├── .env.example
└── README.md
```

## Screenshots Suggestions

*  Login/Register page
*  Prompt submission form
*  Lesson generated view
*  Prompt history per user
*  Admin dashboard (user list + prompt logs)

## Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/my-feature`
3. Commit your changes: `git commit -m "Add my feature"`
4. Push the branch: `git push origin feature/my-feature`
5. Open a Pull Request

## License

Made with full of love!!😉😀