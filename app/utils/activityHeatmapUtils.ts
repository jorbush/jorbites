import { useMemo } from 'react';
import { formatDateLanguage } from '@/app/utils/date-utils';

export interface ActivityItem {
    id?: string;
    createdAt?: string | Date;
    date?: string | Date;
    type?: 'recipe' | 'comment' | 'challenge' | 'cooksnap' | 'review' | string;
    count?: number;
}

export interface HeatmapRecipe {
    id?: string;
    createdAt?: string | Date;
    questId?: string | null;
}

export interface ActivityHeatmapProps {
    recipes?: HeatmapRecipe[];
    comments?: Array<{
        id?: string;
        createdAt?: string | Date;
        isCooked?: boolean;
        rating?: number | null;
        comment?: string;
    }>;
    challengeSubmissions?: Array<{ id?: string; createdAt?: string | Date }>;
    activities?: ActivityItem[];
    title?: string;
    showTitle?: boolean;
}

export interface ActivityDayData {
    date: Date;
    dateKey: string;
    count: number;
    level: number; // 0-4
    recipesCount: number;
    cooksnapsCount: number;
    reviewsCount: number;
    commentsCount: number;
    challengesCount: number;
}

export const getActivityDayColor = (level: number): string => {
    switch (level) {
        case 0:
            return 'bg-neutral-100 dark:bg-neutral-800';
        case 1:
            return 'bg-green-450/30 dark:bg-green-450/20';
        case 2:
            return 'bg-green-450/50 dark:bg-green-450/40';
        case 3:
            return 'bg-green-450/70 dark:bg-green-450/60';
        case 4:
            return 'bg-green-450 dark:bg-green-450';
        default:
            return 'bg-neutral-100 dark:bg-neutral-800';
    }
};

export const formatLocalDateKey = (d: Date): string => {
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
};

export const toDateKey = (val?: string | Date | null): string | null => {
    if (!val) return null;
    const d = new Date(val);
    if (isNaN(d.getTime())) return null;
    return formatLocalDateKey(d);
};

export const useActivityCalendar = (
    recipes: HeatmapRecipe[] = [],
    comments: Array<{
        id?: string;
        createdAt?: string | Date;
        isCooked?: boolean;
        rating?: number | null;
    }> = [],
    challengeSubmissions: Array<{
        id?: string;
        createdAt?: string | Date;
    }> = [],
    activities: ActivityItem[] = [],
    language: string = 'en'
) => {
    const { weeks, totalActivities } = useMemo(() => {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const dataMap = new Map<
            string,
            {
                recipesCount: number;
                cooksnapsCount: number;
                reviewsCount: number;
                commentsCount: number;
                challengesCount: number;
                total: number;
            }
        >();

        const getOrCreate = (key: string) => {
            let entry = dataMap.get(key);
            if (!entry) {
                entry = {
                    recipesCount: 0,
                    cooksnapsCount: 0,
                    reviewsCount: 0,
                    commentsCount: 0,
                    challengesCount: 0,
                    total: 0,
                };
                dataMap.set(key, entry);
            }
            return entry;
        };

        let overallTotal = 0;

        // Process recipes
        recipes.forEach((r) => {
            const key = toDateKey(r.createdAt);
            if (key) {
                const e = getOrCreate(key);
                e.recipesCount += 1;
                if (r.questId) {
                    e.challengesCount += 1;
                }
                e.total += 1;
                overallTotal += 1;
            }
        });

        // Process comments
        comments.forEach((c) => {
            const key = toDateKey(c.createdAt);
            if (key) {
                const e = getOrCreate(key);
                e.total += 1;
                overallTotal += 1;
                if (c.isCooked) {
                    e.cooksnapsCount += 1;
                }
                if (c.rating !== undefined && c.rating !== null) {
                    e.reviewsCount += 1;
                }
                if (!c.isCooked && c.rating == null) {
                    e.commentsCount += 1;
                }
            }
        });

        // Process challenge submissions (avoid double-counting recipes already tracked)
        const recipeIdSet = new Set(recipes.map((r) => r.id).filter(Boolean));

        challengeSubmissions.forEach((cs) => {
            if (cs.id && recipeIdSet.has(cs.id)) {
                return;
            }
            const key = toDateKey(cs.createdAt);
            if (key) {
                const e = getOrCreate(key);
                e.challengesCount += 1;
                e.total += 1;
                overallTotal += 1;
            }
        });

        // Process generic activities
        activities.forEach((act) => {
            const key = toDateKey(act.date || act.createdAt);
            if (key) {
                const e = getOrCreate(key);
                const count = act.count || 1;
                e.total += count;
                overallTotal += count;
                if (act.type === 'recipe') e.recipesCount += count;
                else if (act.type === 'cooksnap') e.cooksnapsCount += count;
                else if (act.type === 'review') e.reviewsCount += count;
                else if (act.type === 'challenge') e.challengesCount += count;
                else e.commentsCount += count;
            }
        });

        const todayDayOfWeek = today.getDay();
        const startDate = new Date(today);
        startDate.setDate(startDate.getDate() - todayDayOfWeek - 52 * 7);

        const weeksArray: ActivityDayData[][] = [];
        const date = new Date(startDate);
        for (let i = 0; i < 371; i++) {
            if (i > 0) {
                date.setDate(date.getDate() + 1);
            }
            const dateKey = formatLocalDateKey(date);
            const entry = dataMap.get(dateKey);
            const count = entry ? entry.total : 0;

            let level = 0;
            if (count > 0) {
                if (count === 1) level = 1;
                else if (count <= 2) level = 2;
                else if (count <= 4) level = 3;
                else level = 4;
            }

            const dayData: ActivityDayData = {
                date: new Date(date),
                dateKey,
                count,
                level,
                recipesCount: entry?.recipesCount || 0,
                cooksnapsCount: entry?.cooksnapsCount || 0,
                reviewsCount: entry?.reviewsCount || 0,
                commentsCount: entry?.commentsCount || 0,
                challengesCount: entry?.challengesCount || 0,
            };

            if (i % 7 === 0) {
                weeksArray.push([]);
            }
            weeksArray[weeksArray.length - 1].push(dayData);
        }

        return { weeks: weeksArray, totalActivities: overallTotal };
    }, [recipes, comments, challengeSubmissions, activities]);

    const monthLabels = useMemo(() => {
        const labels: Array<{ weekIndex: number; month: string }> = [];
        let lastMonth = '';

        weeks.forEach((week, weekIndex) => {
            const firstDay = week[0]?.date;
            if (firstDay) {
                const month = formatDateLanguage(firstDay, 'MMM', language);
                if (month !== lastMonth) {
                    labels.push({ weekIndex, month });
                    lastMonth = month;
                }
            }
        });

        return labels;
    }, [weeks, language]);

    return { weeks, monthLabels, totalActivities };
};
