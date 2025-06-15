# Architecture Documentation

This document provides a detailed overview of Jorbites' architecture, explaining the transition from a monolithic to microservices architecture and the technical decisions behind it.

## Overview

Jorbites evolved from a traditional Next.js monolithic application to a modern microservices architecture to address scalability limitations and improve performance. The system now consists of a main application and several specialized microservices.

![Architecture Diagram](architecture/architecture.png)

## Architecture Evolution

### The Problem with Monolithic Approach

Initially, Jorbites was built as a traditional Next.js application with all functionality contained within API routes. However, this approach faced several limitations:

1. **Vercel Function Timeout:** The 10-second timeout limit for serverless functions
2. **Scalability Issues:** Compute-intensive operations blocking the main application
3. **Resource Constraints:** Limited processing power for complex calculations
4. **Deployment Coupling:** All features deployed together, increasing deployment risk

### Microservices Solution

The microservices architecture addresses these issues by:

- **Dedicated Services:** Each service handles specific functionality
- **Independent Scaling:** Services can scale based on individual needs
- **Language Optimization:** Using the best language for each service's purpose
- **Fault Isolation:** Issues in one service don't affect others

## System Components

### 1. Main Application (Next.js)

**Technology Stack:**
- Next.js 14 with App Router
- TypeScript for type safety
- Tailwind CSS for styling
- Prisma ORM for database operations
- NextAuth for authentication

**Responsibilities:**
- User interface and experience
- Authentication and session management
- Recipe CRUD operations
- User interactions (likes, comments)
- Image proxy and optimization
- Rate limiting and security

**Deployment:** Vercel (Hobby Plan)

### 2. Database Layer

**MongoDB Atlas**
- Primary data store for all user data, recipes, comments, likes
- Hosted on AWS infrastructure
- Prisma ORM provides type-safe database access
- Connection pooling for optimal performance

**Upstash Redis**
- Recipe draft storage for in-progress recipes
- Rate limiting and API protection
- Session caching and temporary data storage

**Data Models:**

*MongoDB:*
- Users (profiles, authentication data)
- Recipes (content, metadata, relationships)
- Comments and Likes (user interactions)
- Events (community challenges)
- Badges and Levels (gamification data)

*Redis:*
- Recipe drafts (temporary storage during creation/editing)
- Rate limiting counters
- Session data and temporary caches

### 3. Microservices

#### Jorbites Notifier (Go)

**Purpose:** Handles all notification processing and delivery

**Features:**
- FIFO notification queue for ordered processing
- Email notifications for user interactions
- RESTful API for notification management
- Minimal dependencies for fast startup

**Technology Choice:** Go was chosen for its excellent concurrency model and performance in handling queue operations.

#### Badge Forge (Rust)

**Purpose:** Calculates and assigns user badges and experience levels

**Features:**
- Asynchronous processing queue
- User level calculations based on engagement metrics
- Achievement badge assignment
- API key authentication
- Real-time queue monitoring

**Technology Choice:** Rust was selected for its memory safety and performance in mathematical calculations.

**Processing Logic:**
1. Receives user activity data
2. Calculates experience points and levels
3. Determines eligible badges
4. Updates user records in MongoDB
5. Triggers notifications if needed

#### Pantry Keeper (Python)

**Purpose:** Automated database backup and maintenance

**Features:**
- Weekly automated backups
- Backup retention (1 month)
- Failure monitoring and alerting
- Restoration capabilities

**Technology Choice:** Python was chosen for its excellent MongoDB tools and scripting capabilities.

**Backup Process:**
1. Creates MongoDB dump
2. Compresses and stores locally
3. Validates backup integrity
4. Cleans up old backups
5. Sends success/failure notifications

## Data Flow

### User Recipe Creation Flow

1. **User starts recipe** → Draft saved to Redis
2. **User edits recipe** → Auto-save drafts to Redis
3. **Images processed** → Cloudinary via Image Proxy
4. **Recipe published** → Final version saved to MongoDB via Prisma
5. **Draft cleaned up** → Removed from Redis
6. **Badge calculation triggered** → Badge Forge microservice
7. **Notification queued** → Jorbites Notifier
8. **Email sent** → Users following the author

### User Interaction Flow

1. **User likes/comments** → Main App with rate limiting
2. **Interaction saved** → MongoDB
3. **Author notification** → Jorbites Notifier queue
4. **Badge recalculation** → Badge Forge (if milestone reached)
5. **Email notification** → Recipe author

## Security Architecture

### Authentication & Authorization

- **NextAuth.js:** Handles OAuth flows with Google and GitHub
- **Session Management:** Secure JWT tokens with rotation
- **API Protection:** Route-level authentication checks

### Rate Limiting

- **Upstash Redis:** Distributed rate limiting
- **Sliding Window Algorithm:** 4 requests per 20-second window
- **User-based Limiting:** Authenticated users by ID, anonymous by IP
- **Graceful Degradation:** Informative error messages

### API Security

- **CORS Configuration:** Strict origin policies
- **Input Validation:** Zod schemas for all inputs
- **SQL Injection Prevention:** Prisma ORM parameterized queries
- **XSS Protection:** Content sanitization

## Performance Optimizations

### Recipe Draft Storage

**Problem:** Users losing work when creating long recipes or experiencing connection issues

**Solution:** Redis-based draft storage system
- Auto-save functionality during recipe creation/editing
- Temporary storage in Redis with TTL expiration
- Seamless recovery of unsaved work
- Reduced database writes for incomplete recipes

### Image Handling

**Problem:** Next.js Image component limitations and third-party cookie issues

**Solution:** Custom image proxy system
- Server-side image fetching
- Cloudinary optimization parameters
- Aggressive caching (1 year TTL)
- WebP/AVIF format conversion

### Caching Strategy

- **Static Assets:** CDN caching via Vercel
- **Database Queries:** Prisma query caching
- **Images:** Browser and CDN caching
- **API Responses:** Conditional caching based on data sensitivity

### Database Optimization

- **Indexes:** Strategic indexing on frequently queried fields
- **Aggregation Pipelines:** Efficient data aggregation
- **Connection Pooling:** Optimized connection management

## Monitoring and Observability

### Application Monitoring

- **Vercel Analytics:** Performance and usage metrics
- **Error Tracking:** Built-in error boundaries and logging
- **Custom Metrics:** User engagement and feature usage

### Microservices Monitoring

- **Health Checks:** Regular service availability checks
- **Queue Metrics:** Processing times and queue lengths
- **Resource Usage:** Memory and CPU monitoring

### Database Monitoring

- **MongoDB Atlas Monitoring:** Built-in performance metrics
- **Query Performance:** Slow query identification
- **Connection Monitoring:** Pool usage and connection health

## Deployment Strategy

### Main Application

- **Platform:** Vercel with automatic deployments
- **Environment:** Production and preview environments
- **CI/CD:** GitHub Actions integration

### Microservices

- **Containerization:** Docker containers for consistent deployment
- **Orchestration:** Service-specific deployment strategies
- **Environment Management:** Separate staging and production environments

## Scalability Considerations

### Horizontal Scaling

- **Microservices:** Independent scaling based on load
- **Database:** MongoDB Atlas auto-scaling
- **CDN:** Global content distribution

### Vertical Scaling

- **Service Resources:** Adjustable CPU and memory allocation
- **Database Tiers:** Upgradeable MongoDB Atlas clusters

## Technical Decisions

### Language Choices

- **Go (Notifier):** Excellent concurrency for queue processing
- **Rust (Badge Forge):** Memory safety and performance for calculations
- **Python (Backup):** Rich ecosystem for database operations
- **TypeScript (Main App):** Type safety and developer experience

### Database Decisions

- **MongoDB:** Flexible schema for diverse content types
- **Prisma ORM:** Type safety and migration management
- **Atlas Hosting:** Managed service with built-in scaling

### Infrastructure Decisions

- **Vercel:** Excellent Next.js integration and global CDN
- **Cloudinary:** Comprehensive image processing capabilities
- **Upstash:** Serverless Redis for rate limiting
