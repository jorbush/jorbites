'use client';

import axios from 'axios';
import { useCallback, useState } from 'react';
import { toast } from 'react-hot-toast';
import { SafeList, SafeUser } from '@/app/types';
import Container from '@/app/components/utils/Container';
import { useRouter } from 'next/navigation';
import { useTranslation } from 'react-i18next';
import ConfirmModal from '@/app/components/modals/ConfirmModal';
import { FcBookmark } from 'react-icons/fc';
import ListCard from '@/app/components/lists/ListCard';
import TabNavigation, {
    NavigationTab,
} from '@/app/components/utils/TabNavigation';

interface ListsClientProps {
    initialMyLists: SafeList[];
    initialCommunityLists: SafeList[];
    currentUser?: SafeUser | null;
}

const ListsClient: React.FC<ListsClientProps> = ({
    initialMyLists,
    initialCommunityLists,
    currentUser,
}) => {
    const { push, refresh } = useRouter() || {};
    const { t, i18n } = useTranslation();

    const [activeTab, setActiveTab] = useState<'my' | 'community'>(
        currentUser ? 'my' : 'community'
    );
    const [deleteListId, setDeleteListId] = useState<string | null>(null);

    const onDelete = useCallback(async () => {
        if (!deleteListId) return;
        try {
            await axios.delete(`/api/lists/${deleteListId}`);
            toast.success(t('list_deleted') || 'List deleted');
            refresh();
        } catch (error: any) {
            toast.error(error?.response?.data || t('something_went_wrong'));
        } finally {
            setDeleteListId(null);
        }
    }, [deleteListId, refresh, t]);

    const listsToRender =
        activeTab === 'my' ? initialMyLists : initialCommunityLists;

    const tabs: NavigationTab[] = [
        ...(currentUser ? [{ id: 'my', label: t('my_lists') }] : []),
        { id: 'community', label: t('community_lists') || 'Community Lists' },
    ];

    return (
        <Container>
            <div className="flex flex-col gap-6 pt-2 pb-12 sm:pt-4 dark:text-white">
                {/* Header */}
                <div className="flex items-center gap-3.5">
                    <div className="flex size-11 items-center justify-center rounded-xl border border-neutral-200/80 bg-neutral-100 shadow-2xs sm:size-12 dark:border-neutral-700/60 dark:bg-neutral-800">
                        <FcBookmark size={28} />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight text-neutral-900 sm:text-3xl dark:text-white">
                            {t('lists') || 'Lists'}
                        </h1>
                        <p className="text-sm text-neutral-500 dark:text-neutral-400">
                            {t('lists_subtitle') ||
                                'Organize your favorite recipes into custom collections or discover community lists'}
                        </p>
                    </div>
                </div>

                {/* Tab Navigation */}
                <TabNavigation
                    tabs={tabs}
                    activeTab={activeTab}
                    onTabChange={(tabId) =>
                        setActiveTab(tabId as 'my' | 'community')
                    }
                />

                {/* Tab Content */}
                <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                    {listsToRender.length === 0 ? (
                        <div className="col-span-full flex h-48 w-full flex-col items-center justify-center rounded-2xl border border-dashed border-neutral-300 py-10 text-neutral-500 dark:border-neutral-800 dark:text-neutral-400">
                            <p className="text-sm font-medium">
                                {t('no_lists') || 'No lists found'}
                            </p>
                        </div>
                    ) : (
                        listsToRender.map((list) => (
                            <ListCard
                                key={list.id}
                                list={list}
                                showDelete={
                                    activeTab === 'my' && !list.isDefault
                                }
                                showPublicBadge={activeTab === 'my'}
                                onDeleteClick={(id) => setDeleteListId(id)}
                                push={push}
                                t={t}
                                language={i18n.language}
                            />
                        ))
                    )}
                </div>
            </div>
            <ConfirmModal
                open={!!deleteListId}
                setIsOpen={(open) => {
                    if (!open) setDeleteListId(null);
                }}
                onConfirm={onDelete}
                description={
                    t('delete_list_confirmation') ||
                    'Are you sure you want to delete this list?'
                }
            />
        </Container>
    );
};

export default ListsClient;
