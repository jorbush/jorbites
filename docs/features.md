# Features Documentation

This document provides a comprehensive overview of all features available in Jorbites.

## Core Features

### Recipe Management

**Recipe Creation**
- Rich text editor with markdown support
- Ingredient list management
- Step-by-step cooking instructions
- Multiple image uploads
- **Auto-save drafts** with Redis storage for seamless editing
- Category selection
- Cooking time estimation

**Recipe Discovery**
- Advanced search with filters by category
- Pagination for efficient browsing

**Recipe Interactions**
- Like/unlike recipes
- Comment system with threading
- Share recipes via social media

### User System

**Authentication**
- Google OAuth integration
- GitHub OAuth integration
- Normal login with email and password.

**User Profiles**
- See the user's photo, badges and level.
- See the user's recipes.
- See statistics about the user.

**Gamification System**
- **User Levels:** Automatic progression based on activity
- **Achievement Badges:** Earned through various milestones
- **Verification System:** Special badge for verified users

### Events System ⭐

**Community Challenges**
- Weekly cooking challenges
- Recipe contests
- Temporary events

### Top Jorbiters ⭐

**Leaderboard System**
- Top 10 jorbiters.

**Ranking Criteria**
- Based on the user level.

**Recognition Features**
- If you are a top jorbiter, you will be rewarded with the verification badge.

## Social Features

### Community Interaction

**Engagement Features**
- Like recipes and comments
- Comment with rich text formatting
- Share recipes externally

### Notifications

**Email Notifications**
- New recipes
- Comments on your recipes
- Likes on your recipes and comments

## Technical Features

### Performance Optimizations

**Image Handling**
- Custom image proxy system (replacing Next.js Image)
- Automatic WebP/AVIF conversion
- Responsive image sizing
- Lazy loading with skeleton placeholders
- Aggressive caching strategy

**Caching & Storage**
- Redis-based rate limiting and API protection
- **Recipe draft storage** with auto-save functionality
- Browser caching for static assets
- Database query optimization
- CDN integration via Vercel

### Security

**Rate Limiting**
- Upstash Redis-based protection
- Sliding window algorithm (4 requests per 20 seconds)
- User-based and IP-based limiting
- Graceful error handling

**Data Protection**
- Input validation and sanitization
- XSS protection
- CSRF protection via NextAuth
- Secure file uploads

### Internationalization

**Multi-language Support**
- English (default)
- Spanish (Español)
- Catalan (Català)

**Localization Features**
- Translated UI elements
- Localized recipe categories
- Regional cooking units
- Cultural recipe adaptations

## User Experience Features

### Responsive Design

**Mobile Optimization**
- Touch-friendly interface
- Optimized navigation for mobile
- Responsive image galleries
- Mobile-specific interactions

**Dark Mode**
- System preference detection
- Manual toggle option
- Consistent theming across components
- Reduced eye strain for night usage

### Accessibility

**WCAG Compliance**
- Keyboard navigation support
- Screen reader compatibility
- High contrast mode
- Alt text for all images
- Semantic HTML structure

### Rate Limiting

**API Protection**
- Request throttling
- Abuse prevention
- Fair usage policies
- Error handling

## Integration Features

### External Services

**Cloudinary Integration**
- Image storage and optimization
- Transformation on-the-fly
- CDN delivery
- Upload preset management

**OAuth Providers**
- Google authentication
- GitHub authentication
- Profile synchronization
- Account linking

### Microservices Integration

**Badge Forge (Rust)**
- Asynchronous badge calculation
- Level progression algorithms
- Achievement tracking
- Performance optimization

**Jorbites Notifier (Go)**
- Email notification queuing
- Delivery status tracking
- Template management
- Failure handling

**Pantry Keeper (Python)**
- Automated database backups
- Data integrity monitoring
- Recovery procedures
- Maintenance scheduling
