# Jorbites Documentation

Welcome to the Jorbites documentation! This directory contains comprehensive documentation for the Jorbites recipe sharing platform.

## 📚 Documentation Overview

### Getting Started
- **[Development Setup](development.md)** - Complete guide for setting up Jorbites locally for development
- **[Features Overview](features.md)** - Comprehensive list of all platform features including new additions

### Architecture & Design
- **[Architecture Documentation](architecture.md)** - Detailed system architecture and microservices overview
- **[API Error Handling](api-error-handling.md)** - API endpoint documentation and error handling patterns

### Technical Implementation
- **[Image Optimization](image_optimization.md)** - Custom image proxy implementation and optimization techniques
- **[Rate Limiting](rate_limit.md)** - Security implementation with Upstash Redis

## 🏗️ Architecture Overview

Jorbites has evolved into a modern microservices architecture:

```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   Main App      │    │  Badge Forge     │    │ Jorbites        │
│   (Next.js)     │◄──►│  (Rust)          │    │ Notifier (Go)   │
│                 │    │                  │    │                 │
└─────────────────┘    └──────────────────┘    └─────────────────┘
         │                       │                       │
         ▼                       ▼                       ▼
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   MongoDB       │    │  Badge           │    │ Email           │
│   Atlas         │    │  Calculations    │    │ Notifications   │
└─────────────────┘    └──────────────────┘    └─────────────────┘
         │
         ▼
┌─────────────────┐
│ Pantry Keeper   │
│ (Python)        │
│ Backup Service  │
└─────────────────┘
```

## 🚀 Quick Links

### For Developers
- [Environment Setup](development.md#environment-setup)
- [Running Tests](development.md#running-tests)
- [Code Quality Tools](development.md#code-quality)

### For Architecture Understanding
- [Microservices Overview](architecture.md#system-components)
- [Data Flow Diagrams](architecture.md#data-flow)
- [Security Architecture](architecture.md#security-architecture)

### For Feature Information
- [New Features: Events & Top Jorbiters](features.md#events-system)
- [Gamification System](features.md#gamification-system)
- [Social Features](features.md#social-features)

## 🔧 Technical Highlights

### Modern Tech Stack
- **Frontend:** Next.js 15 with TypeScript and Tailwind CSS
- **Database:** MongoDB Atlas with Prisma ORM
- **Authentication:** NextAuth with Google/GitHub OAuth
- **Images:** Custom Cloudinary proxy (replacing Next.js Image)
- **Security:** Upstash Redis rate limiting

### Microservices
- **Badge Forge (Rust):** High-performance badge and level calculation
- **Jorbites Notifier (Go):** Notification queue and email delivery
- **Pantry Keeper (Python):** Automated database backup system

### Key Features
- Recipe sharing with rich media support
- User leveling and achievement system
- Community events and challenges
- Top contributors leaderboard
- Multi-language support (EN/ES/CA)
- Mobile-responsive design with dark mode
