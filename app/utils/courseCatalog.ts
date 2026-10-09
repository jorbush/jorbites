export interface CourseCatalogEntry {
    id: string;
    title: string;
    badgeUrl: string;
}

export const COURSE_CATALOG: Record<string, CourseCatalogEntry> = {
    'jorbites-basics': {
        id: 'jorbites-basics',
        title: 'Jorbites Basics',
        badgeUrl: '/badges/basics_badge.webp',
    },
    'recipe-creator': {
        id: 'recipe-creator',
        title: 'Recipe Creator',
        badgeUrl: '/badges/recipe_creator_badge.webp',
    },
    'recipe-lists': {
        id: 'recipe-lists',
        title: 'Recipe Lists & Bookmarks',
        badgeUrl: '/badges/recipe_lists_badge.webp',
    },
    'meal-planner': {
        id: 'meal-planner',
        title: 'Meal Planner',
        badgeUrl: '/badges/meal_planner_badge.webp',
    },
    'community-events': {
        id: 'community-events',
        title: 'Community Events',
        badgeUrl: '/badges/community_events_badge.webp',
    },
    workshops: {
        id: 'workshops',
        title: 'Workshops & Classes',
        badgeUrl: '/badges/workshops_badge.webp',
    },
    quests: {
        id: 'quests',
        title: 'Recipe Quests',
        badgeUrl: '/badges/quests_badge.webp',
    },
    'recipe-book-builder': {
        id: 'recipe-book-builder',
        title: 'Recipe Book Builder',
        badgeUrl: '/badges/recipe_book_badge.webp',
    },
    'contest-manager': {
        id: 'contest-manager',
        title: 'Contest Manager',
        badgeUrl: '/badges/contest_manager_badge.webp',
    },
    drafts: {
        id: 'drafts',
        title: 'Recipe Drafts & Collaboration',
        badgeUrl: '/badges/drafts_badge.webp',
    },
};

export const VALID_COURSE_IDS = Object.keys(COURSE_CATALOG);

export function isValidCourseId(courseId?: string | null): boolean {
    if (!courseId) return false;
    return Object.prototype.hasOwnProperty.call(
        COURSE_CATALOG,
        courseId.trim()
    );
}

export function getCourseCatalogEntry(
    courseId: string
): CourseCatalogEntry | undefined {
    return COURSE_CATALOG[courseId.trim()];
}
