'use client';

import { useReducer, useEffect } from 'react';
import { SafeCertificate } from '@/app/types';

export interface CoursesProgressState {
    contest: number;
    lists: number;
    events: number;
    workshops: number;
    quests: number;
    recipeCreator: number;
    recipeBook: number;
    mealPlanner: number;
    basics: number;
    drafts: number;
}

type Action = { type: 'REFRESH'; certificates?: SafeCertificate[] };

const STORAGE_KEYS = {
    contest: 'jorbites_course_contest_manager_progress:v2',
    lists: 'jorbites_course_recipe_lists_progress:v2',
    events: 'jorbites_course_community_events_progress:v2',
    workshops: 'jorbites_course_workshops_progress:v2',
    quests: 'jorbites_course_quests_progress:v2',
    recipeCreator: 'jorbites_course_recipe_creator_progress:v2',
    recipeBook: 'jorbites_course_recipe_book_progress:v2',
    mealPlanner: 'jorbites_course_meal_planner_progress:v2',
    basics: 'jorbites_course_basics_progress:v2',
    drafts: 'jorbites_course_drafts_progress:v2',
} as const;

export const COURSE_SLUG_TO_PROGRESS_KEY: Record<
    string,
    keyof CoursesProgressState
> = {
    'jorbites-basics': 'basics',
    'recipe-creator': 'recipeCreator',
    'recipe-lists': 'lists',
    'meal-planner': 'mealPlanner',
    'community-events': 'events',
    workshops: 'workshops',
    quests: 'quests',
    'recipe-book-builder': 'recipeBook',
    'contest-manager': 'contest',
    drafts: 'drafts',
};

const getProgressFromStorage = (key: string): number => {
    if (typeof window === 'undefined') return 0;
    const stored = localStorage.getItem(key);
    return stored ? parseInt(stored, 10) : 0;
};

const getInitialState = (
    certificates?: SafeCertificate[]
): CoursesProgressState => {
    const state: CoursesProgressState = {
        contest: getProgressFromStorage(STORAGE_KEYS.contest),
        lists: getProgressFromStorage(STORAGE_KEYS.lists),
        events: getProgressFromStorage(STORAGE_KEYS.events),
        workshops: getProgressFromStorage(STORAGE_KEYS.workshops),
        quests: getProgressFromStorage(STORAGE_KEYS.quests),
        recipeCreator: getProgressFromStorage(STORAGE_KEYS.recipeCreator),
        recipeBook: getProgressFromStorage(STORAGE_KEYS.recipeBook),
        mealPlanner: getProgressFromStorage(STORAGE_KEYS.mealPlanner),
        basics: getProgressFromStorage(STORAGE_KEYS.basics),
        drafts: getProgressFromStorage(STORAGE_KEYS.drafts),
    };

    if (certificates && certificates.length > 0) {
        certificates.forEach((cert) => {
            const key = COURSE_SLUG_TO_PROGRESS_KEY[cert.courseId];
            if (key) {
                state[key] = 100;
            }
        });
    }

    return state;
};

function coursesProgressReducer(
    state: CoursesProgressState,
    action: Action
): CoursesProgressState {
    switch (action.type) {
        case 'REFRESH':
            return getInitialState(action.certificates);
        default:
            return state;
    }
}

export function useAllCoursesProgress(initialCertificates?: SafeCertificate[]) {
    const [state, dispatch] = useReducer(
        coursesProgressReducer,
        initialCertificates,
        getInitialState
    );

    useEffect(() => {
        if (initialCertificates && initialCertificates.length > 0) {
            dispatch({
                type: 'REFRESH',
                certificates: initialCertificates,
            });
        }
    }, [initialCertificates]);

    return {
        progress: state,
        refresh: () =>
            dispatch({
                type: 'REFRESH',
                certificates: initialCertificates,
            }),
    };
}
