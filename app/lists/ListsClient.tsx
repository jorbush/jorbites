'use client';

import axios from 'axios';
import { useCallback, useEffect, useState } from 'react';
import { toast } from 'react-hot-toast';
import { SafeList } from '@/app/types';
import Container from '@/app/components/utils/Container';
import { useRouter } from 'next/navigation';
import { useTranslation } from 'react-i18next';
import { AiOutlineDelete } from 'react-icons/ai';
import ConfirmModal from '@/app/components/modals/ConfirmModal';

interface ListsClientProps {
    initialLists: SafeList[];
}

const ListsClient: React.FC<ListsClientProps> = ({ initialLists }) => {
    const router = useRouter();
    const { t } = useTranslation();
    const [lists, setLists] = useState<SafeList[]>(initialLists);

    useEffect(() => {
        setLists(initialLists);
    }, [initialLists]);

    const [deleteListId, setDeleteListId] = useState<string | null>(null);

    const onDelete = useCallback(async () => {
        if (!deleteListId) return;
        try {
            await axios.delete(`/api/lists/${deleteListId}`);
            toast.success(t('list_deleted') || 'List deleted');
            router.refresh();
            setLists((current) =>
                current.filter((list) => list.id !== deleteListId)
            );
        } catch (error: any) {
            toast.error(error?.response?.data || t('something_went_wrong'));
        } finally {
            setDeleteListId(null);
        }
    }, [deleteListId, router, t]);

    return (
        <Container>
            <div className="flex flex-col gap-6 pt-8 pb-12 dark:text-white">
                <div className="text-3xl font-bold">{t('my_lists')}</div>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
                    {lists.map((list) => (
                        <div
                            key={list.id}
                            onClick={() => router.push(`/lists/${list.id}`)}
                            className="group relative flex cursor-pointer flex-col gap-2 overflow-hidden rounded-xl border border-neutral-200 p-4 transition hover:shadow-lg dark:border-neutral-700"
                        >
                            <div className="text-xl font-bold">
                                {list.name === 'to cook later'
                                    ? t('to_cook_later')
                                    : list.name}
                            </div>
                            <div className="text-sm text-neutral-500">
                                {list.recipeIds.length} {t('recipes')}
                            </div>
                            <div className="text-xs text-neutral-400">
                                {list.isPrivate ? t('private') : t('public')}
                            </div>
                            {!list.isDefault && (
                                <div
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        setDeleteListId(list.id);
                                    }}
                                    className="absolute top-4 right-4 z-10 hidden rounded-full p-2 text-rose-500 transition group-hover:block hover:bg-rose-100 dark:hover:bg-rose-900"
                                    title={t('delete_list') || 'Delete list'}
                                >
                                    <AiOutlineDelete size={20} />
                                </div>
                            )}
                        </div>
                    ))}
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
