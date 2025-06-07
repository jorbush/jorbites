# Jorbites

**Jorbites** is a web platform for sharing and discovering delicious recipes. Users can post their own recipes, like and comment on others.

## Features
- **CRUD Operations:** Create, Read, Update and Delete.
- **Authentication:** SSO via Google and GitHub using NextAuth.
- **Image Handling:** Image optimization with Next Image, storage via Cloudinary.
- **User Interactions:** Pagination, recipe filtering by category, dark theme, email notifications and multi-language support (English, Spanish, Catalan).
- **Gamification:** User leveling and verification.
- **Notifications:** Receive emails for comments, likes, and new recipes.

## Architecture

![architecture](/docs/architecture/architecture.png)

- **Fullstack APP:** [Next.js](https://nextjs.org/) (React with Server Side Rendering), TypeScript and Tailwind CSS. Deployed on Vercel.
- **Database:** [MongoDB](https://www.mongodb.com/). Deployed on MongoDB Atlas (AWS under the hood). The NextJS APP uses [Prisma ORM](https://www.prisma.io/) to interact with the database.
- **Authentication:** [NextAuth](https://next-auth.js.org/) with Google and GitHub providers for SSO.
- **Image Handling:** [Cloudinary](https://cloudinary.com/) for image storage and optimization. It is used for recipe images and user avatars.

## Getting Started

### Prerequisites

To run Jorbites locally, you will need to set up a MongoDB database and create a `.env` file with the following content:

```bash
DATABASE_URL=your_mongodb_url
NEXTAUTH_SECRET=your_nextauth_secret
GITHUB_ID=your_github_id
GITHUB_SECRET=your_github_secret
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET=your_cloudinary_upload_preset
```

### Running Locally
Use the following command to start the development server:
```bash
npm run dev
```

## Testing

Jorbites is thoroughly tested to ensure a robust experience.

- **Component & Page Testing:** [Vitest](https://vitest.dev/).

    ```bash
    npm run vitest
    ```
- **API & Server Actions Testing:** [Jest](https://jestjs.io/).

    ```bash
    npm run jest
    ```
- **End-to-End Testing:** [Cypress](https://www.cypress.io/).

    ```bash
    npm run cypress
    npm run cypress:open # to open the Cypress GUI
    ```

## Linting & Formatting

Jorbites uses Next Lint and Oxlint for linting:
```bash
npm run lint # Next Lint
npx run oxlint # Oxlint
```

And Prettier for code formatting:
```bash
npm run format
npm run check-format # check for formatting issues
```
