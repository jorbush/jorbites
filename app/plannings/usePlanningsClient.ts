'use client';

import {
    useCallback,
    useEffect,
    useMemo,
    useReducer,
    useRef,
    useState,
} from 'react';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import { useRouter } from 'next/navigation';
import { useTranslation } from 'react-i18next';
import useLoginModal from '@/app/hooks/useLoginModal';
import { SafePlanning, SafeUser } from '@/app/types';
import { NavigationTab } from '@/app/components/utils/TabNavigation';
import { planningsReducer } from './planningsReducer';

export type PlanningsTab = 'my' | 'saved' | 'community';

export interface UsePlanningsClientProps {
    initialMyPlannings?: SafePlanning[];
    initialCommunityPlannings?: SafePlanning[];
    initialSavedPlannings?: SafePlanning[];
    currentUser?: SafeUser | null;
}

const EMPTY_PLANNINGS: SafePlanning[] = [];

export function usePlanningsClient({
    initialMyPlannings = EMPTY_PLANNINGS,
    initialCommunityPlannings = EMPTY_PLANNINGS,
    initialSavedPlannings = EMPTY_PLANNINGS,
    currentUser,
}: UsePlanningsClientProps) {
    const { push, refresh } = useRouter() || {};
    const { t, i18n } = useTranslation();
    const loginModal = useLoginModal();

    const [state, dispatch] = useReducer(planningsReducer, {
        my: initialMyPlannings,
        community: initialCommunityPlannings,
        saved: initialSavedPlannings,
    });

    const {
        my: myPlannings,
        community: communityPlannings,
        saved: savedPlannings,
    } = state;

    // Create plan form state
    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const [isCreating, setIsCreating] = useState(false);

    // Delete confirmation state
    const [deletePlanId, setDeletePlanId] = useState<string | null>(null);

    // Tab state: 'my', 'saved', or 'community'
    const [activeTab, setActiveTab] = useState<PlanningsTab>(
        currentUser ? 'my' : 'community'
    );

    const isFirstRender = useRef(true);

    useEffect(() => {
        if (isFirstRender.current) {
            isFirstRender.current = false;
            return;
        }

        dispatch({
            type: 'SYNC',
            payload: {
                my: initialMyPlannings,
                community: initialCommunityPlannings,
                saved: initialSavedPlannings,
            },
        });
    }, [initialMyPlannings, initialCommunityPlannings, initialSavedPlannings]);

    const onUnsave = useCallback(
        async (planId: string) => {
            try {
                await axios.delete(`/api/saves/${planId}`);
                toast.success(t('meal_plan_updated'));
                dispatch({ type: 'UNSAVE', payload: planId });
                refresh?.();
            } catch {
                toast.error(t('something_went_wrong'));
            }
        },
        [refresh, t]
    );

    const handleCreateClick = useCallback(() => {
        if (!currentUser) {
            loginModal.onOpen();
            return;
        }
        setIsCreateOpen(true);
    }, [currentUser, loginModal]);

    const onCreateSubmit = useCallback(
        async (data: {
            name: string;
            description: string;
            isPrivate: boolean;
        }) => {
            setIsCreating(true);
            try {
                const response = await axios.post('/api/plannings', {
                    name: data.name,
                    description: data.description,
                    isPrivate: data.isPrivate,
                });
                toast.success(t('meal_plan_created'));
                setIsCreateOpen(false);
                push?.(`/plannings/${response.data.id}`);
                refresh?.();
            } catch {
                toast.error(t('something_went_wrong'));
            } finally {
                setIsCreating(false);
            }
        },
        [push, refresh, t]
    );

    const onDelete = useCallback(async () => {
        if (!deletePlanId) return;

        try {
            await axios.delete(`/api/plannings/${deletePlanId}`);
            toast.success(t('meal_plan_deleted'));
            dispatch({ type: 'DELETE', payload: deletePlanId });
            refresh?.();
        } catch {
            toast.error(t('something_went_wrong'));
        } finally {
            setDeletePlanId(null);
        }
    }, [deletePlanId, refresh, t]);

    const tabs: NavigationTab[] = useMemo(
        () => [
            ...(currentUser ? [{ id: 'my', label: t('my_meal_plans') }] : []),
            ...(currentUser
                ? [
                      {
                          id: 'saved',
                          label: t('saved_meal_plans') || 'Saved Plans',
                      },
                  ]
                : []),
            { id: 'community', label: t('community_meal_plans') },
        ],
        [currentUser, t]
    );

    const activePlans = useMemo(() => {
        if (activeTab === 'my') return myPlannings;
        if (activeTab === 'saved') return savedPlannings;
        return communityPlannings;
    }, [activeTab, myPlannings, savedPlannings, communityPlannings]);

    return {
        activeTab,
        setActiveTab,
        tabs,
        activePlans,
        myPlannings,
        communityPlannings,
        savedPlannings,
        isCreateOpen,
        setIsCreateOpen,
        isCreating,
        deletePlanId,
        setDeletePlanId,
        handleCreateClick,
        onCreateSubmit,
        onDelete,
        onUnsave,
        push,
        t,
        language: i18n.language,
    };
}
