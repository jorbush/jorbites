---
title: 'Cookies Policy'
description: 'Jorbites Cookies Policy'
---

Last Updated: November 25, 2026

This Cookies Policy explains how **Jorbites** ("we", "us", or "our") uses cookies, browser local storage (`localStorage` / `sessionStorage`), and service workers on our website, accessible at [https://jorbites.com](https://jorbites.com) (the "Website").

## 1. What are cookies and local storage?

Cookies are small text files stored on your device when you visit a website. Browser storage technologies (such as HTML5 `localStorage`, `sessionStorage`, and Service Workers) allow websites to preserve essential application state, remember your preferences, and deliver features you explicitly enable (such as optional Web Push notifications).

## 2. Cookies and Browser Storage We Use

We do **not** use advertising cookies, cross-site tracking cookies, or third-party marketing pixels.

### A. Essential Technical Cookies (Strictly Necessary)

These cookies and security tokens are required for the Website to function securely. They enable user authentication, maintain your session, and protect against security vulnerabilities such as CSRF attacks. They cannot be disabled without breaking login functionality.

- **`next-auth.session-token` / `__Secure-next-auth.session-token`**: Identifies your authenticated user session (Type: Essential HTTP-only Cookie, Expiration: 30 days).
- **`next-auth.csrf-token` / `__Host-next-auth.csrf-token`**: CSRF protection for authentication forms and API requests (Type: Essential Cookie, Expiration: Session).
- **`next-auth.callback-url` / `__Secure-next-auth.callback-url`**: Stores redirect targets during OAuth login flows (Google/GitHub) (Type: Essential Cookie, Expiration: Session).
- **`i18next`**: Remembers your selected interface language (`en`, `es`, `ca`) for server-rendered pages (Type: Functional Cookie, Expiration: 1 year / `max-age=31536000`).

### B. Functional & Preference Storage (`localStorage` & `sessionStorage`)

We use browser storage locally on your device to save preferences and in-progress UI state requested by you:

- **`theme`** (`localStorage`, Persistent): Remembers your display theme preference (Dark Mode / Light Mode).
- **`i18nextLng`** (`localStorage`, Persistent): Stores your preferred interface language (English, Spanish, Catalan).
- **Course Progress Keys** (`localStorage`, Persistent): Saves your local module completion progress in interactive Jorbites cooking courses.
- **Recipe Checklist State** (`localStorage`, Persistent): Remembers checked ingredients and steps while you cook a recipe.
- **Cooking Guide Audio Preferences** (`localStorage`, Persistent): Saves your background audio/music preference inside the step-by-step Cooking Guide.
- **`commentSortOrder`** (`localStorage`, Persistent): Remembers how you prefer recipe comments to be sorted.
- **Bite Cards Session State** (`sessionStorage`, Browser Tab Session): Preserves your current card deck position while browsing Bite Cards.
- **Course Completion Token** (`sessionStorage`, Browser Tab Session): Temporarily stores your signed quiz completion token when generating a course certificate.

### C. Service Worker & Web Push (Opt-In Only)

- **`/sw.js` (Service Worker)**: Registered only when you explicitly enable browser push notifications in Account Settings. It listens for incoming Web Push messages and opens the corresponding Jorbites page when clicked. You can disable push notifications at any time in Account Settings or your browser settings.

### D. Cookieless Analytics & Performance

We utilize [Vercel Speed Insights](https://vercel.com/docs/speed-insights) to measure aggregate performance metrics (page load times, Web Vitals) and our own first-party cookieless interaction analytics pipeline (*Kafkaroni*) to measure aggregated feature usage. Neither system sets analytics cookies, reads or writes browser `localStorage`/`sessionStorage`, stores IP addresses, or tracks users across websites. Our client tracker also automatically respects your browser's `Do Not Track` (`DNT`) setting.

## 3. Third-Party Infrastructure

Our Website relies on third-party infrastructure providers that process standard technical network connections:

- **Hosting**: [Vercel Privacy Policy](https://vercel.com/legal/privacy-policy), [Hostinger Privacy Policy](https://www.hostinger.com/privacy)
- **Database & Caching**: [MongoDB Privacy Policy](https://www.mongodb.com/legal/privacy-policy), [Upstash Privacy Policy](https://upstash.com/trust/privacy.pdf), [Turso Privacy Policy](https://turso.tech/privacy-policy)
- **Event Streaming**: [Aiven Privacy Policy](https://aiven.io/privacy)
- **Media Storage**: [Cloudinary Privacy Policy](https://cloudinary.com/privacy), [Cloudflare Privacy Policy](https://www.cloudflare.com/privacypolicy/)
- **Logging & Monitoring**: [Axiom Privacy Policy](https://axiom.co/legal/privacy)

## 4. How to Manage Cookies and Browser Storage

You can clear cookies, `localStorage`, `sessionStorage`, and Service Workers at any time through your web browser settings:

- **Chrome**: Settings -> Privacy and security -> Cookies and other site data
- **Firefox**: Settings -> Privacy & Security -> Cookies and Site Data
- **Safari**: Settings -> Privacy -> Manage Website Data

*Note: Disabling or clearing essential cookies will log you out of your Jorbites account, and clearing local storage will reset saved preferences such as theme, checklists, and local course progress.*

## 5. Changes to This Policy

We may update this Cookies Policy from time to time. Any changes will be published on this page with an updated "Last Updated" date.

## 6. Contact Us

If you have any questions regarding this Cookies Policy, please contact us at [jorbites.app@gmail.com](mailto:jorbites.app@gmail.com) or consult our [Privacy Policy](/policies/privacy).
