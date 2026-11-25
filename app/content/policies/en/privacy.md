---
title: 'Privacy Policy'
description: 'Jorbites Privacy Policy'
---

Last Updated: November 25, 2026

This Privacy Policy explains how **Jorbites** ("we", "us", or "our") collects, uses, stores, and discloses your personal information when you use our website, accessible at [https://jorbites.com](https://jorbites.com) (the "Website"), and our associated microservices (collectively, the "Platform").

## 1. Data Controller

The Platform is an independent, open-source community project operated by **Jorbites** ("Data Controller").

- **Contact Email**: [jorbites.app@gmail.com](mailto:jorbites.app@gmail.com)
- **Website**: [https://jorbites.com](https://jorbites.com)

## 2. Information We Collect

We collect only the information needed to operate, secure, and improve the Platform:

- **User & Account Data**:
  - **Identification & Contact**: Name, email address, profile picture, and optional public profile details (bio, website URL, and social media handles such as Instagram, X/Twitter, YouTube, and TikTok).
  - **Authentication & Security**: Authentication via third-party OAuth providers ([Google SSO](https://policies.google.com/privacy), [GitHub SSO](https://docs.github.com/en/site-policy/privacy-policies/github-privacy-statement)) or email/password credentials (passwords are salted and hashed with bcrypt), password reset tokens (stored hashed), and optional Two-Factor Authentication (2FA) secrets (encrypted at rest with AES-256-GCM) and hashed backup codes.
  - **Preferences & Settings**: Display language (`en`, `es`, `ca`), visual theme (`dark`/`light`), profile visibility preferences, and email/push notification preferences.
- **Activity & User-Generated Content**:
  - **Recipes & Community Content**: Recipes you create, edit, fork, or save to favorites; collaborative or solo recipe drafts; cooksnaps; comments and ratings; quests; custom lists and weekly meal plannings; workshop listings and attendance records; and weekly/monthly/yearly recipe votes.
  - **Courses & Certificates**: Course completion certificates you request (containing the display name you submit, course title, and issue date). Issued certificates are publicly verifiable via their unique URL.
  - **Engagement & Levels**: Activity metrics (recipe creations, interactions, completed quests) processed to calculate user levels and award achievement badges.
- **Media Files**: Images you upload (avatars, recipes, cooksnaps, comments, workshops) are stored and served via [Cloudinary](https://cloudinary.com/privacy) and [Cloudflare R2](https://www.cloudflare.com/privacypolicy/).
- **Web Push Subscriptions (Optional)**: If you explicitly opt in to browser push notifications, we store your browser push subscription endpoint and cryptographic keys (`p256dh`, `auth`) to deliver notifications through your browser vendor's push service.
- **Aggregated Feature & Usage Analytics**: Strictly anonymous, cookieless interaction metrics (normalized page routes, feature usage such as cooking tools or search filters, display language, coarse device class, country code, and referring domain). We do **not** attach user IDs, email addresses, IP addresses, cookies, or browser storage identifiers to these analytics events, and we respect the browser `Do Not Track` (`DNT`) signal.

Please note that public profiles, public recipes, public lists, and public workshops may be indexed by search engines (including via our XML sitemap and [IndexNow](https://www.indexnow.org/)).

## 3. Artificial Intelligence & Microservices Processing

Our Platform integrates automated background microservices, telemetry, and AI technologies to enhance functionality:

- **AI Processing (Google Gemini API)**: When you use AI-assisted features, prompts and recipe inputs are processed via the Google Gemini API in accordance with [Google's Privacy Policy](https://policies.google.com/privacy).
- **Automated Recipe Auditing (Tagatoni)**: Publicly shared recipes are processed by our automated microservice (*Tagatoni*) using the Google Gemini API to estimate nutritional data (calories and macronutrients), detect dietary tags/allergens, and classify cuisine categories.
- **Gamification & Badges (Badge Forge)**: Your activity metrics are asynchronously processed by our *Badge Forge* service to calculate user levels and award achievement badges.
- **Transactional & Opt-In Notifications (Jorbites Notifier)**: Password resets, security messages, and opted-in email/push activity notifications are dispatched via our *Jorbites Notifier* service.
- **Automated Backups (Pantry Keeper)**: Database backups are processed by our automated system (*Pantry Keeper*) to prevent data loss and ensure system resiliency.
- **Server Logging & Error Monitoring (Axiom)**: Technical logs, error diagnostics, and application performance metrics are processed by [Axiom](https://axiom.co/legal/privacy). We minimize personal data in application logs and avoid logging raw email addresses or passwords.
- **Cookieless Analytics Aggregation (Kafkaroni)**: Anonymous feature-usage events streamed through [Aiven](https://aiven.io/privacy) (`analytics-events` topic) are aggregated by our internal *Kafkaroni* service into daily rollups stored in an isolated [Turso](https://turso.tech/privacy-policy) database (EU region) with no personally identifiable information.

## 4. Legal Bases for Processing (GDPR Art. 6)

When processing personal data under the GDPR, we rely on the following legal bases:

- **Performance of a Contract (Art. 6(1)(b))**: Providing account registration, authentication, recipe hosting, lists, meal plannings, workshops, collaborative drafts, certificates, and password resets.
- **Consent (Art. 6(1)(a))**: Sending optional activity email notifications (`emailNotifications`, disabled by default) and browser Web Push notifications. You may withdraw consent at any time in your account settings without affecting prior lawful processing.
- **Legitimate Interest (Art. 6(1)(f))**: Securing the Platform against abuse and brute-force attacks (including transient IP rate limiting via Upstash Redis), error diagnostics and performance monitoring (Axiom and Vercel Speed Insights), automated recipe metadata enrichment (*Tagatoni*), gamification (*Badge Forge*), and strictly cookieless, aggregated usage analytics (*Kafkaroni*) without cross-site tracking or individual profiling.
- **Legal Obligation (Art. 6(1)(c))**: Complying with applicable legal duties, lawful requests from authorities, or notice-and-takedown obligations.

## 5. Third-Party Service Providers & International Data Transfers

We do **not** sell or rent your personal data. We share data only with service providers necessary to operate the Platform:

- **Hosting & Infrastructure**: [Vercel](https://vercel.com/legal/privacy-policy), [Hostinger](https://www.hostinger.com/privacy).
- **Databases & Caching**: [MongoDB](https://www.mongodb.com/legal/privacy-policy), [Upstash Redis](https://upstash.com/trust/privacy.pdf), [Turso](https://turso.tech/privacy-policy) (EU region for anonymous analytics).
- **Event Streaming**: [Aiven](https://aiven.io/privacy) (Managed Kafka).
- **Media Storage & Delivery**: [Cloudinary](https://cloudinary.com/privacy), [Cloudflare R2](https://www.cloudflare.com/privacypolicy/).
- **Logging & Diagnostic Telemetry**: [Axiom](https://axiom.co/legal/privacy).
- **AI & Performance**: [Google Gemini API](https://policies.google.com/privacy), [Vercel Speed Insights](https://vercel.com/legal/privacy-policy).
- **Web Push Delivery (Opt-In Only)**: Browser vendor push gateways corresponding to your browser/device (Google FCM, Apple APNs, Mozilla Push, Microsoft WNS, or Samsung Push).

Some of these providers are located or process data outside the European Economic Area (EEA), including in the United States. Where personal data is transferred internationally, such transfers rely on adequacy decisions (such as the **EU–U.S. Data Privacy Framework**) and/or **European Commission Standard Contractual Clauses (SCCs)** with supplementary security safeguards.

## 6. Data Protection Rights (GDPR & Applicable Law)

Under the GDPR and applicable data protection laws, you have the following rights:

- **Access (Art. 15)**: Request confirmation and a copy of the personal data we hold about you.
- **Rectification (Art. 16)**: Correct inaccurate or incomplete personal data (many fields can be edited directly in Account Settings).
- **Erasure / Deletion (Art. 17)**: Delete your account directly in Account Settings or request full erasure of your personal data.
- **Restriction of Processing (Art. 18)**: Request that we restrict processing of your data in specific circumstances.
- **Data Portability (Art. 20)**: Receive your personal data in a structured, commonly used, machine-readable format.
- **Objection (Art. 21)**: Object to processing based on legitimate interests.
- **Withdraw Consent (Art. 7(3))**: Withdraw consent for email or push notifications at any time via Account Settings.
- **Lodge a Complaint (Art. 77)**: Lodge a complaint with your local Data Protection Supervisory Authority, such as the **Spanish Data Protection Agency (AEPD)** at [https://www.aepd.es](https://www.aepd.es).

To exercise any of these rights, contact us at [jorbites.app@gmail.com](mailto:jorbites.app@gmail.com). We will respond within one month as required by the GDPR.

## 7. Data Security & Retention

We implement technical and organizational safeguards including HTTPS/HSTS encryption in transit, bcrypt password hashing, AES-256-GCM encryption for 2FA secrets, rate limiting, and strict access controls for private lists, plannings, and workshops.

We retain data according to the following criteria:

- **Account & User Content**: Retained while your account remains active. When you delete your account, we immediately delete your account record, associated database content, workshop participations, recipe votes, and active Redis drafts. Associated uploaded media files stored in Cloudinary and Cloudflare R2 are purged asynchronously within 30 days (or promptly upon request via email).
- **Collaborative & Solo Drafts (Upstash Redis)**: Ephemeral drafts automatically expire according to their configured Time-To-Live (TTL) or are removed upon publication or account deletion.
- **Rate-Limiting Counters (Upstash Redis)**: Transient IP/user identifiers expire automatically within minutes to hours.
- **Server Logs (Axiom)**: Technical diagnostic logs are retained on a short-term rolling basis for debugging and security monitoring.
- **Automated Backups (Pantry Keeper)**: Encrypted backups are rotated on a rolling schedule and purged automatically upon expiration.
- **Anonymous Analytics (Turso)**: Contains strictly aggregated, non-personal daily metrics with no user identifiers.

## 8. Children's Privacy

The Platform is not directed to children below the applicable minimum age of digital consent (**14 years old in Spain**, or between **13 and 16 years old** depending on your country of residence; at least **13 years old** worldwide). We do not knowingly collect personal data from children under these age thresholds. If you believe an underage user has created an account, please contact [jorbites.app@gmail.com](mailto:jorbites.app@gmail.com) so we can promptly delete it.

## 9. Changes to This Policy

We may update this Privacy Policy from time to time. Any updates will be posted on this page with a revised "Last Updated" date.

## 10. Contact

If you have any questions about this Privacy Policy or wish to exercise your privacy rights, please contact us at [jorbites.app@gmail.com](mailto:jorbites.app@gmail.com).
