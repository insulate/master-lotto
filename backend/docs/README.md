# Backend API Documentation

## Overview

This is the backend API documentation for the Lotto System. The API is built with Node.js and Express, providing RESTful endpoints for authentication, user management, and lotto operations.

## Documentation Files

- **[API.md](./API.md)** - Complete API endpoint documentation with examples
- **README.md** - This file (Overview and quick start)

## Quick Start

### Prerequisites

- Node.js (v18 or higher)
- npm or yarn
- MySQL database

### Installation

```bash
cd backend
npm install
```

### Environment Setup

Create a `.env` file in the backend directory:

```env
PORT=3000
NODE_ENV=development

# JWT Configuration
JWT_SECRET=your-secret-key-change-this
JWT_REFRESH_SECRET=your-refresh-secret-key-change-this
JWT_EXPIRE=15m

# Database Configuration (for future use)
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=
DB_NAME=lotto_system
DB_PORT=3306

# CORS Configuration
CORS_ORIGIN=*
```

### Running the Server

```bash
# Development mode with auto-reload
npm run dev

# Production mode
npm start
```

The server will start on `http://localhost:3000`

## API Endpoints

### Base URL
```
http://localhost:3000/api/v1
```

### Health Check
```
GET http://localhost:3000/
```

### Authentication Endpoints

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/auth/login` | User login | No |
| POST | `/auth/logout` | User logout | Yes |
| GET | `/auth/me` | Get current user | Yes |
| POST | `/auth/refresh` | Refresh access token | No |
| PUT | `/auth/change-password` | Change password | Yes |

For detailed documentation with request/response examples, see [API.md](./API.md)

## Project Structure

```
backend/
├── controllers/          # Request handlers
│   └── auth.controller.js
├── middlewares/          # Custom middleware
│   └── auth.middleware.js
├── models/              # Data models
│   └── user.model.js
├── routes/              # API routes
│   ├── index.js
│   └── auth.routes.js
├── docs/                # Documentation
│   ├── README.md
│   └── API.md
├── server.js            # Application entry point
├── package.json
└── .env
```

## Authentication

The API uses JWT (JSON Web Tokens) for authentication with two types of tokens:

- **Access Token**: Short-lived (15 minutes) - used for API requests
- **Refresh Token**: Long-lived (7 days) - used to get new access tokens

### Using Authentication

1. Login to get tokens:
```bash
POST /api/v1/auth/login
{
  "username": "admin",
  "password": "password123"
}
```

2. Use access token in requests:
```bash
Authorization: Bearer <access_token>
```

3. Refresh token when expired:
```bash
POST /api/v1/auth/refresh
{
  "refreshToken": "<refresh_token>"
}
```

## User Roles

- **Master**: Full system access, manages agents
- **Agent**: Manages members
- **Member**: End user, plays lotto

## Development

### Available Scripts

```bash
# Start development server with nodemon
npm run dev

# Start production server
npm start
```

## Testing API

### Using cURL

```bash
# Login
curl -X POST http://localhost:3000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"password123"}'

# Get current user
curl -X GET http://localhost:3000/api/v1/auth/me \
  -H "Authorization: Bearer <your_access_token>"
```

### Using Postman

Import the base URL: `http://localhost:3000/api/v1`

See [API.md](./API.md) for complete endpoint documentation.

## CORS Configuration

The API currently allows requests from all origins (`*`). For production, update the CORS configuration in `server.js`:

```javascript
app.use(cors({
  origin: 'https://your-frontend-domain.com',
  credentials: true
}));
```

## Error Handling

All API responses follow a consistent format:

**Success:**
```json
{
  "success": true,
  "message": "Operation successful",
  "data": {}
}
```

**Error:**
```json
{
  "success": false,
  "message": "Error message"
}
```

## Future Development

- [ ] Database integration (MySQL)
- [ ] User management endpoints
- [ ] Lotto draw management
- [ ] Betting system
- [ ] Transaction history
- [ ] Admin dashboard endpoints
- [ ] Real-time notifications

## Support

For issues or questions, please refer to:
- [API Documentation](./API.md)
- Project README in root directory

## License

ISC
