export const publicUserSelect = {
    id: true,
    name: true,
    image: true,
    createdAt: true,
    updatedAt: true,
    level: true,
    verified: true,
    language: true,
    badges: true,
};

export const currentUserSelect = {
    ...publicUserSelect,
    email: true,
    emailVerified: true,
    favoriteIds: true,
    emailNotifications: true,
};
