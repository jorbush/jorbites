'use client';

import axios from 'axios';
import { useCallback, useState } from 'react';
import { toast } from 'react-hot-toast';
import { SafeList, SafeUser } from '@/app/types';
import Container from '@/app/components/utils/Container';
import { useRouter } from 'next/navigation';
import { useTranslation } from 'react-i18next';
import { AiOutlineDelete } from 'react-icons/ai';
import ConfirmModal from '@/app/components/modals/ConfirmModal';
import Avatar from '@/app/components/utils/Avatar';
import { formatDate } from '@/app/utils/date-utils';
import { FcBookmark } from 'react-icons/fc';
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
            <div className="flex flex-col gap-6 pb-12 md:pt-8 dark:text-white">
                <div className="flex flex-row items-center gap-2">
                    <FcBookmark size={32} />
                    <div className="text-3xl font-bold">
                        {t('lists') || 'Lists'}
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
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 2xl:grid-cols-4">
                    {listsToRender.length === 0 ? (
                        <div className="col-span-full flex h-48 w-full flex-col items-center justify-center rounded-2xl border border-dashed border-neutral-300 py-10 text-neutral-500 dark:border-neutral-700">
                            <p className="text-lg font-light">
                                {t('no_lists') || 'No lists found'}
                            </p>
                        </div>
                    ) : (
                        listsToRender.map((list) => (
                            <div
                                key={list.id}
                                className="group relative flex w-full flex-col gap-2 overflow-hidden rounded-xl border border-neutral-200 p-4 transition hover:shadow-lg dark:border-neutral-700"
                            >
                                <div className="text-xl font-bold">
                                    <button
                                        type="button"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            push(`/lists/${list.id}`);
                                        }}
                                        className="cursor-pointer text-left font-bold after:absolute after:inset-0 after:rounded-xl after:content-[''] hover:underline focus:outline-hidden"
                                    >
                                        {list.isDefault
                                            ? t('to_cook_later')
                                            : list.name}
                                    </button>
                                </div>
                                <div className="flex flex-row items-center gap-2">
                                    <div className="text-sm text-neutral-500">
                                        {list.recipeIds.length} {t('recipes')}
                                    </div>
                                    <div className="size-1 rounded-full bg-neutral-300 dark:bg-neutral-600" />
                                    <div className="text-sm text-neutral-500">
                                        {formatDate(
                                            list.createdAt,
                                            i18n.language
                                        )}
                                    </div>
                                </div>
                                <div className="flex flex-row items-center justify-between">
                                    <div className="text-xs text-neutral-400">
                                        {list.isPrivate
                                            ? t('private')
                                            : t('public')}
                                    </div>
                                    {list.user && (
                                        <div className="flex flex-row items-center gap-2">
                                            <Avatar
                                                src={list.user.image}
                                                size={16}
                                            />
                                            <div className="text-xs font-medium text-neutral-500">
                                                {list.user.name}
                                            </div>
                                        </div>
                                    )}
                                </div>
                                {activeTab === 'my' && !list.isDefault && (
                                    <button
                                        type="button"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            setDeleteListId(list.id);
                                        }}
                                        className="absolute top-4 right-4 z-10 cursor-pointer rounded-full border-0 bg-transparent p-2 text-rose-500 transition group-hover:block hover:bg-rose-100 focus:outline-hidden md:hidden dark:hover:bg-rose-900"
                                        title={
                                            t('delete_list') || 'Delete list'
                                        }
                                    >
                                        <AiOutlineDelete size={20} />
                                    </button>
                                )}
                            </div>
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
