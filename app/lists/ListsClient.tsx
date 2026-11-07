'use client';

import axios from 'axios';
import { useCallback, useState } from 'react';
import { toast } from 'react-hot-toast';
import { SafeList, SafeUser } from '@/app/types';
import Container from '@/app/components/utils/Container';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useTranslation } from 'react-i18next';
import { AiOutlineDelete } from 'react-icons/ai';
import ConfirmModal from '@/app/components/modals/ConfirmModal';
import Avatar from '@/app/components/utils/Avatar';
import { formatDate } from '@/app/utils/date-utils';
import { FcBookmark } from 'react-icons/fc';
import { GiPadlock, GiPadlockOpen } from 'react-icons/gi';
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
                            <div
                                key={list.id}
                                data-cy="list-card"
                                className="group relative flex w-full flex-col justify-between overflow-hidden rounded-2xl border border-neutral-200/80 bg-white p-5 shadow-xs transition-colors duration-200 hover:border-neutral-300 dark:border-neutral-800 dark:bg-neutral-900/90 dark:hover:border-neutral-700"
                            >
                                <div>
                                    {/* Card Top: Privacy Pill & Actions */}
                                    <div className="mb-3 flex items-center justify-between gap-2">
                                        <span
                                            className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                                                list.isPrivate
                                                    ? 'border border-neutral-200/80 bg-neutral-100 text-neutral-700 dark:border-neutral-700/60 dark:bg-neutral-800 dark:text-neutral-300'
                                                    : 'border-green-450/40 bg-green-450/15 dark:text-green-450 border text-neutral-800'
                                            }`}
                                        >
                                            {list.isPrivate ? (
                                                <>
                                                    <GiPadlock size={11} />
                                                    <span>
                                                        {t('private') ||
                                                            'Private'}
                                                    </span>
                                                </>
                                            ) : (
                                                <>
                                                    <GiPadlockOpen size={11} />
                                                    <span>
                                                        {t('public') ||
                                                            'Public'}
                                                    </span>
                                                </>
                                            )}
                                        </span>

                                        {activeTab === 'my' &&
                                            !list.isDefault && (
                                                <button
                                                    type="button"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        setDeleteListId(
                                                            list.id
                                                        );
                                                    }}
                                                    data-cy="delete-list-button"
                                                    className="z-10 flex size-8 cursor-pointer items-center justify-center rounded-lg border border-red-200/80 bg-red-50 text-red-600 shadow-2xs transition-colors duration-200 hover:bg-red-100 dark:border-red-900/50 dark:bg-red-950/40 dark:text-red-400 dark:hover:bg-red-900/60"
                                                    title={
                                                        t('delete_list') ||
                                                        'Delete list'
                                                    }
                                                >
                                                    <AiOutlineDelete
                                                        size={16}
                                                    />
                                                </button>
                                            )}
                                    </div>

                                    {/* Card Title */}
                                    <h2 className="mb-2 text-lg font-bold text-neutral-900 dark:text-white">
                                        <Link
                                            href={`/lists/${list.id}`}
                                            onClick={(e) => {
                                                e.preventDefault();
                                                e.stopPropagation();
                                                push(`/lists/${list.id}`);
                                            }}
                                            data-cy="list-card-title"
                                            className="hover:text-green-450 line-clamp-1 cursor-pointer text-left font-bold transition-colors duration-200 focus:outline-hidden"
                                        >
                                            {list.isDefault
                                                ? t('to_cook_later')
                                                : list.name}
                                        </Link>
                                    </h2>
                                </div>

                                {/* Inset Shelf / Footer */}
                                <div className="mt-4 border-t border-neutral-100 pt-3 dark:border-neutral-800">
                                    <div className="flex items-center justify-between">
                                        <div className="flex min-w-0 items-center gap-2">
                                            {list.user ? (
                                                <Link
                                                    href={`/profile/${list.user.id}`}
                                                    onClick={(e) => {
                                                        e.preventDefault();
                                                        e.stopPropagation();
                                                        push(
                                                            `/profile/${list.user!.id}`
                                                        );
                                                    }}
                                                    className="group/author flex min-w-0 cursor-pointer items-center gap-2 text-left focus:outline-hidden"
                                                >
                                                    <Avatar
                                                        src={list.user.image}
                                                        size={22}
                                                        quality="auto:eco"
                                                    />
                                                    <span className="group-hover/author:text-green-450 dark:group-hover/author:text-green-450 truncate text-xs font-medium text-neutral-700 transition-colors duration-200 dark:text-neutral-300">
                                                        {list.user.name}
                                                    </span>
                                                </Link>
                                            ) : (
                                                <span className="text-xs text-neutral-500 dark:text-neutral-400">
                                                    {formatDate(
                                                        list.createdAt,
                                                        i18n.language
                                                    )}
                                                </span>
                                            )}
                                        </div>
                                        <div className="flex items-center gap-2 text-xs font-semibold text-neutral-500 dark:text-neutral-400">
                                            <span>
                                                {list.recipeIds.length}{' '}
                                                {t('recipes') || 'recipes'}
                                            </span>
                                        </div>
                                    </div>
                                </div>
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
