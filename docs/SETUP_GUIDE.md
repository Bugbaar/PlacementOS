# PlacementOS - Complete Setup Guide

## Prerequisites

- Node.js 18+ installed
- Git installed
- PostgreSQL database (Neon recommended)
- Redis database (Redis Cloud recommended)

## Quick Start

### 1. Clone the Repository

```bash
git clone https://github.com/yourusername/placement-os.git
cd placement-os/server
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Configure Environment Variables

Create a `.env` file in the server directory:

```env
# Database (Neon PostgreSQL)
DATABASE_URL="postgresql://user:password@host:5432/dbname?sslmode=require"

# JWT Secrets
JWT_SECRET="your-super-secret-jwt-key-min-32-chars"
JWT_REFRESH_SECRET="your-refresh-secret-key-min-32-chars"
JWT_EXPIRES_IN="7d"
JWT_REFRESH_EXPIRES_IN="30d"

# Server
PORT=5000
NODE_ENV=development
CLIENT_URL="http://localhost:5173"

# Redis Cloud
REDIS_URL="redis://default:password@host:port"

# Google Gemini AI
GEMINI_API_KEY="your-gemini-api-key"

# Cloudinary (File Storage)
CLOUDINARY_CLOUD_NAME="your-cloud-name"
CLOUDINARY_API_KEY="your-api-key"
CLOUDINARY_API_SECRET="your-api-secret"

# Email (Gmail SMTP)
SMTP_HOST="smtp.gmail.com"
SMTP_PORT="587"
SMTP_USER="your-email@gmail.com"
SMTP_PASS="your-app-password"
SMTP_FROM="your-email@gmail.com"

# Google OAuth
GOOGLE_CLIENT_ID="your-google-client-id"
GOOGLE_CLIENT_SECRET="your-google-client-secret"

# Sentry (Error Monitoring)
SENTRY_DSN="https://your-sentry-dsn@o123456.ingest.sentry.io/1234567"
```

### 4. Setup Database

```bash
# Generate Prisma client
npm run db:generate

# Run migrations
npm run db:migrate

# Seed database (optional)
npm run db:seed
```

### 5. Start the Server

```bash
# Development mode
npm run dev

# Production mode
npm start
```

### 6. Verify Installation

Visit these URLs in your browser:
- Health Check: http://localhost:5000/health
- Detailed Health: http://localhost:5000/health/detailed
- Prometheus Metrics: http://localhost:5000/metrics

## Getting API Keys

### Neon PostgreSQL
1. Go to https://neon.tech
2. Create a new project
3. Copy the connection string

### Redis Cloud
1. Go to https://cloud.redis.io
2. Create a free database
3. Copy the connection string

### Google Gemini AI
1. Go to https://aistudio.google.com/app/apikey
2. Create a new API key
3. Copy the key

### Cloudinary
1. Go to https://cloudinary.com
2. Create a free account
3. Copy API keys from dashboard

### Gmail SMTP
1. Enable 2FA on your Google account
2. Go to https://myaccount.google.com/apppasswords
3. Generate a new app password
4. Use the 16-character password

### Google OAuth
1. Go to https://console.cloud.google.com
2. Create a new project
3. Enable Google+ API
4. Create OAuth credentials
5. Add authorized redirect URIs:
   - http://localhost:5000/api/v1/auth/google/callback

### Sentry (Optional)
1. Go to https://sentry.io
2. Create a new project
3. Copy the DSN

## Running Tests

```bash
# Run all tests
npm test

# Run tests with coverage
npm run test:coverage

# Run tests in watch mode
npm run test:watch
```

## Common Issues

### Database Connection Failed
- Check DATABASE_URL is correct
- Ensure Neon database is not suspended
- Run `npm run db:migrate`

### Redis Connection Failed
- Check REDIS_URL is correct
- Ensure Redis Cloud database is active

### Gemini API 404 Error
- Check GEMINI_API_KEY is valid
- Visit https://aistudio.google.com/app/apikey to verify

### Email Not Sending
- Check Gmail App Password is correct
- Enable "Less secure apps" or use App Password

## Architecture

```
Client (React/Vite)
    ↓
Express API Server
    ↓
├── Controllers (Business Logic)
├── Middleware (Auth, Validation, Rate Limit)
├── Routes (API Endpoints)
├── Services (AI, Email, Cloudinary)
├── Queue (BullMQ + Redis)
└── Database (Prisma + PostgreSQL)
```

## Support

For issues and questions:
- GitHub Issues: https://github.com/yourusername/placement-os/issues
- Email: support@placementos.com
