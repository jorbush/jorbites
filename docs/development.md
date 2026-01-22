# Development Setup

This guide will help you set up Jorbites locally for development.

## Prerequisites

- **Node.js** 18+ and npm
- **MongoDB** database (local or MongoDB Atlas)
- **Git** for version control

## Environment Setup

### 1. Clone the Repository

```bash
git clone https://github.com/jorbush/jorbites.git
cd jorbites
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Environment Variables

Create a `.env` file in the root directory with the following variables:

```bash
# Database
DATABASE_URL=your_mongodb_connection_string

# NextAuth Configuration
NEXTAUTH_SECRET=your_nextauth_secret_key
NEXTAUTH_URL=http://localhost:3000

# OAuth Providers
GITHUB_ID=your_github_oauth_app_id
GITHUB_SECRET=your_github_oauth_app_secret
GOOGLE_CLIENT_ID=your_google_oauth_client_id
GOOGLE_CLIENT_SECRET=your_google_oauth_client_secret

# Cloudinary (Image Storage)
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET=your_cloudinary_upload_preset
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret

# Upstash Redis (Rate Limiting & Draft Storage)
UPSTASH_REDIS_REST_URL=your_upstash_redis_url
UPSTASH_REDIS_REST_TOKEN=your_upstash_redis_token

# Kafka (User Event Tracking for Recommendations)
KAFKA_BROKER=your_kafka_broker_url
# SSL Configuration (Optional - only required for production or SSL-enabled Kafka brokers)
KAFKA_SSL_KEY=your_kafka_ssl_key
KAFKA_SSL_CERT=your_kafka_ssl_certificate
KAFKA_SSL_CA=your_kafka_ssl_certificate_authority

# Microservices (Optional for local development)
BADGE_FORGE_API_URL=http://localhost:8080
BADGE_FORGE_API_KEY=your_badge_forge_api_key
NOTIFIER_API_URL=http://localhost:3001
NOTIFIER_API_KEY=your_notifier_api_key
```

### 4. Database Setup

Generate and apply Prisma migrations:

```bash
npx prisma generate
npx prisma db push
```

Optionally, seed the database with sample data:

```bash
npm run seed
```

## Running Locally

### Start the Development Server

```bash
npm run dev
```

The application will be available at `http://localhost:3000`.

### Running Tests

```bash
# Unit and component tests
npm run vitest

# API and server action tests
npm run jest

# End-to-end tests
npm run cypress:run

# Open Cypress GUI
npm run cypress:open
```

### Code Quality

```bash
# Linting
npm run lint

# Additional linting with Oxlint
npx oxlint

# Format code
npm run format

# Check formatting
npm run check-format
```

## Development Workflow

### 1. Database Changes

When making schema changes:

```bash
# Update schema.prisma
# Then generate and push changes
npx prisma generate
npx prisma db push

# Or create a migration
npx prisma migrate dev --name your_migration_name
```

### 2. Adding Dependencies

```bash
# Production dependency
npm install package-name

# Development dependency
npm install --save-dev package-name
```

### 3. Working with Microservices

For full functionality, you may want to run the microservices locally:

- **Badge Forge:** Follow setup in the [Badge Forge repository](https://github.com/jorbush/badge_forge)
- **Jorbites Notifier:** Follow setup in the [Notifier repository](https://github.com/jorbush/jorbites-notifier)
- **Pantry Keeper:** Follow setup in the [Pantry Keeper repository](https://github.com/jorbush/pantry_keeper)

The main application will work without these services, but some features may be limited.
