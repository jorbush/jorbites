'use client';

import { useReducer, useCallback } from 'react';

export interface Requirements {
    recipes: boolean;
    theme: boolean;
    badge: boolean;
    announcement: boolean;
}

export interface ContestManagerFormState {
    activeModuleId: string;
    reqs: Requirements;
    participantUserId: string;
    participantRecipeUrl: string;
    badgeXTopic: string;
    copiedBadgePrompt: boolean;
}

export type ContestManagerFormAction =
    | { type: 'SET_ACTIVE_MODULE'; payload: string }
    | { type: 'SET_REQS'; payload: Partial<Requirements> }
    | { type: 'SET_PARTICIPANT_USER_ID'; payload: string }
    | { type: 'SET_PARTICIPANT_RECIPE_URL'; payload: string }
    | { type: 'SET_BADGE_TOPIC'; payload: string }
    | { type: 'SET_COPIED_BADGE_PROMPT'; payload: boolean };

const initialState: ContestManagerFormState = {
    activeModuleId: 'requirements',
    reqs: {
        recipes: false,
        theme: false,
        badge: false,
        announcement: false,
    },
    participantUserId: '',
    participantRecipeUrl: '',
    badgeXTopic: 'Italian Pasta',
    copiedBadgePrompt: false,
};

function contestManagerFormReducer(
    state: ContestManagerFormState,
    action: ContestManagerFormAction
): ContestManagerFormState {
    switch (action.type) {
        case 'SET_ACTIVE_MODULE':
            return { ...state, activeModuleId: action.payload };
        case 'SET_REQS':
            return {
                ...state,
                reqs: { ...state.reqs, ...action.payload },
            };
        case 'SET_PARTICIPANT_USER_ID':
            return { ...state, participantUserId: action.payload };
        case 'SET_PARTICIPANT_RECIPE_URL':
            return { ...state, participantRecipeUrl: action.payload };
        case 'SET_BADGE_TOPIC':
            return { ...state, badgeXTopic: action.payload };
        case 'SET_COPIED_BADGE_PROMPT':
            return { ...state, copiedBadgePrompt: action.payload };
        default:
            return state;
    }
}

export function useContestManagerForm() {
    const [state, dispatch] = useReducer(
        contestManagerFormReducer,
        initialState
    );

    const setActiveModuleId = useCallback((id: string) => {
        dispatch({ type: 'SET_ACTIVE_MODULE', payload: id });
    }, []);

    const setReqs = useCallback((reqs: Partial<Requirements>) => {
        dispatch({ type: 'SET_REQS', payload: reqs });
    }, []);

    const setParticipantUserId = useCallback((id: string) => {
        dispatch({ type: 'SET_PARTICIPANT_USER_ID', payload: id });
    }, []);

    const setParticipantRecipeUrl = useCallback((url: string) => {
        dispatch({ type: 'SET_PARTICIPANT_RECIPE_URL', payload: url });
    }, []);

    const setBadgeXTopic = useCallback((topic: string) => {
        dispatch({ type: 'SET_BADGE_TOPIC', payload: topic });
    }, []);

    const setCopiedBadgePrompt = useCallback((copied: boolean) => {
        dispatch({ type: 'SET_COPIED_BADGE_PROMPT', payload: copied });
    }, []);

    return {
        ...state,
        setActiveModuleId,
        setReqs,
        setParticipantUserId,
        setParticipantRecipeUrl,
        setBadgeXTopic,
        setCopiedBadgePrompt,
    };
}
