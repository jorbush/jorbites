'use client';

import React, { useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { SafeWorkshop, SafeUser } from '@/app/types';
import Container from '@/app/components/utils/Container';
import WorkshopsHeader from '@/app/components/workshops/WorkshopsHeader';
import { FcConferenceCall } from 'react-icons/fc';
import { BiPlus } from 'react-icons/bi';
import WorkshopList from '@/app/components/workshops/WorkshopList';
import TabNavigation, {
    NavigationTab,
} from '@/app/components/utils/TabNavigation';
import useWorkshopModal from '@/app/hooks/useWorkshopModal';
import useLoginModal from '@/app/hooks/useLoginModal';

interface WorkshopsClientProps {
    currentUser?: SafeUser | null;
    upcomingWorkshops?: SafeWorkshop[];
    pastWorkshops?: SafeWorkshop[];
}

const EMPTY_WORKSHOPS: SafeWorkshop[] = [];

const WorkshopsClient: React.FC<WorkshopsClientProps> = ({
    currentUser,
    upcomingWorkshops = EMPTY_WORKSHOPS,
    pastWorkshops = EMPTY_WORKSHOPS,
}) => {
    const { t } = useTranslation();
    const workshopModal = useWorkshopModal();
    const loginModal = useLoginModal();

    const [activeTab, setActiveTab] = useState<'upcoming' | 'my' | 'past'>(
        'upcoming'
    );

    const onCreateWorkshop = () => {
        if (!currentUser) {
            return loginModal.onOpen();
        }
        workshopModal.onOpen();
    };

    const myWorkshops = useMemo(() => {
        if (!currentUser) return EMPTY_WORKSHOPS;
        const all = [...upcomingWorkshops, ...pastWorkshops];
        const seen = new Set<string>();
        return all.filter((w) => {
            if (seen.has(w.id)) return false;
            const isHost = w.hostId === currentUser.id;
            const isParticipant = w.participants?.some(
                (p) => p.userId === currentUser.id
            );
            if (isHost || isParticipant) {
                seen.add(w.id);
                return true;
            }
            return false;
        });
    }, [currentUser, upcomingWorkshops, pastWorkshops]);

    const tabs: NavigationTab[] = [
        { id: 'upcoming', label: t('upcoming_workshops') },
        ...(currentUser ? [{ id: 'my', label: t('my_workshops') }] : []),
        { id: 'past', label: t('past_workshops') },
    ];

    const currentWorkshops =
        activeTab === 'upcoming'
            ? upcomingWorkshops
            : activeTab === 'my'
              ? myWorkshops
              : pastWorkshops;

    const emptyStateConfig = useMemo(() => {
        switch (activeTab) {
            case 'my':
                return {
                    title: t('no_workshops_found', 'No workshops found'),
                    subtitle: t(
                        'create_first_workshop_prompt',
                        'Create your first workshop to share your culinary skills'
                    ),
                };
            case 'past':
                return {
                    title: t('no_past_workshops_found'),
                    subtitle: t('check_back_later_past'),
                };
            case 'upcoming':
            default:
                return {
                    title: t('no_upcoming_workshops_found'),
                    subtitle: t('check_back_later'),
                };
        }
    }, [activeTab, t]);

    const headerAction = (
        <button
            type="button"
            onClick={onCreateWorkshop}
            className="inline-flex cursor-pointer items-center gap-2 rounded-xl bg-neutral-900 px-4 py-2.5 text-sm font-semibold text-white shadow-xs transition-colors duration-200 hover:bg-neutral-800 dark:bg-white dark:text-neutral-900 dark:hover:bg-neutral-100"
            data-testid="create-workshop-button"
            data-cy="create-workshop"
        >
            <BiPlus size={18} />
            <span>{t('create_workshop')}</span>
        </button>
    );

    return (
        <Container>
            <div className="flex flex-col gap-6 pt-2 pb-12 sm:pt-4 dark:text-white">
                <WorkshopsHeader
                    icon={FcConferenceCall}
                    title={t('workshops')}
                    description={t('workshops_description')}
                    action={headerAction}
                />

                <TabNavigation
                    tabs={tabs}
                    activeTab={activeTab}
                    onTabChange={(tabId) =>
                        setActiveTab(tabId as 'upcoming' | 'my' | 'past')
                    }
                />

                <div className="mt-2">
                    <WorkshopList
                        workshops={currentWorkshops}
                        currentUser={currentUser}
                        emptyStateTitle={emptyStateConfig.title}
                        emptyStateSubtitle={emptyStateConfig.subtitle}
                    />
                </div>
            </div>

            {/* Floating Action Button for mobile */}
            <button
                type="button"
                onClick={onCreateWorkshop}
                className="fixed right-6 bottom-[calc(4rem+env(safe-area-inset-bottom,0px))] z-10 flex size-14 cursor-pointer items-center justify-center rounded-full bg-neutral-900 text-white shadow-lg transition-colors duration-200 hover:bg-neutral-800 md:hidden dark:bg-white dark:text-neutral-900 dark:hover:bg-neutral-100"
                data-testid="create-workshop-button-mobile"
                data-cy="create-workshop-mobile"
                aria-label={String(t('create_workshop'))}
                title={String(t('create_workshop'))}
            >
                <BiPlus className="size-6" />
            </button>
        </Container>
    );
};

export default WorkshopsClient;
