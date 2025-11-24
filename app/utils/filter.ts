export enum OrderByType {
    NEWEST = 'newest',
    OLDEST = 'oldest',
    TITLE_ASC = 'title_asc',
    TITLE_DESC = 'title_desc',
    MOST_LIKED = 'most_liked',
}

export const ORDER_BY_OPTIONS = [
    OrderByType.NEWEST,
    OrderByType.OLDEST,
    OrderByType.TITLE_ASC,
    OrderByType.TITLE_DESC,
    OrderByType.MOST_LIKED,
] as const;

export const ORDER_BY_LABELS = {
    [OrderByType.NEWEST]: 'newest_first',
    [OrderByType.OLDEST]: 'oldest_first',
    [OrderByType.TITLE_ASC]: 'title_a_z',
    [OrderByType.TITLE_DESC]: 'title_z_a',
    [OrderByType.MOST_LIKED]: 'most_liked',
} as const;

export const ORDER_BY_FALLBACK_LABELS = {
    [OrderByType.NEWEST]: 'Newest first',
    [OrderByType.OLDEST]: 'Oldest first',
    [OrderByType.TITLE_ASC]: 'Title A-Z',
    [OrderByType.TITLE_DESC]: 'Title Z-A',
    [OrderByType.MOST_LIKED]: 'Most liked',
} as const;

export const getPrismaOrderByClause = (orderBy: OrderByType) => {
    switch (orderBy) {
        case OrderByType.OLDEST:
            return { createdAt: 'asc' } as const;
        case OrderByType.TITLE_ASC:
            return { title: 'asc' } as const;
        case OrderByType.TITLE_DESC:
            return { title: 'desc' } as const;
        case OrderByType.MOST_LIKED:
            return { numLikes: 'desc' } as const;
        case OrderByType.NEWEST:
        default:
            return { createdAt: 'desc' } as const;
    }
};

// Date range filtering utilities
export interface DateRangeFilter {
    startDate?: string;
    endDate?: string;
}

export interface PrismaDateFilter {
    createdAt?: {
        gte?: Date;
        lte?: Date;
    };
}

export const getDateRangeFilter = (
    startDate?: string,
    endDate?: string
): PrismaDateFilter => {
    const filter: PrismaDateFilter = {};

    if (startDate || endDate) {
        filter.createdAt = {};

        if (startDate) {
            filter.createdAt.gte = new Date(startDate);
        }

        if (endDate) {
            // Set end date to end of day
            const endDateTime = new Date(endDate);
            endDateTime.setHours(23, 59, 59, 999);
            filter.createdAt.lte = endDateTime;
        }
    }

    return filter;
};

// Chef ordering types
export enum ChefOrderByType {
    TRENDING = 'trending',
    NEWEST = 'newest',
    OLDEST = 'oldest',
    NAME_ASC = 'name_asc',
    NAME_DESC = 'name_desc',
    MOST_RECIPES = 'most_recipes',
    MOST_LIKED = 'most_liked',
    HIGHEST_LEVEL = 'highest_level',
}
