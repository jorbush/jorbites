'use client';

import React from 'react';
import Link from 'next/link';
import { AiOutlineDelete } from 'react-icons/ai';
import { GiPadlock, GiPadlockOpen } from 'react-icons/gi';
import { SafeList } from '@/app/types';
import Avatar from '@/app/components/utils/Avatar';
import { formatDate } from '@/app/utils/date-utils';
import CustomProxyImage from '@/app/components/optimization/CustomProxyImage';

export interface ListCardProps {
    list: SafeList;
    showDelete?: boolean;
    onDeleteClick?: (listId: string) => void;
    push: (url: string) => void;
    t: any;
    language: string;
}

const getPreviewRecipes = (list: SafeList) => {
    if (!list.recipes) return [];
    const unique: any[] = [];
    const seen = new Set();
    for (const recipe of list.recipes) {
        if (recipe && recipe.id && !seen.has(recipe.id)) {
            seen.add(recipe.id);
            unique.push(recipe);
        }
    }
    return unique.slice(0, 4);
};

export const ListCard: React.FC<ListCardProps> = ({
    list,
    showDelete = false,
    onDeleteClick,
    push,
    t,
    language,
}) => {
    const previews = getPreviewRecipes(list);

    return (
        <div
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
                                <span>{t('private') || 'Private'}</span>
                            </>
                        ) : (
                            <>
                                <GiPadlockOpen size={11} />
                                <span>{t('public') || 'Public'}</span>
                            </>
                        )}
                    </span>

                    {showDelete && (
                        <button
                            type="button"
                            onClick={(e) => {
                                e.stopPropagation();
                                onDeleteClick?.(list.id);
                            }}
                            data-cy="delete-list-button"
                            className="z-10 flex size-8 cursor-pointer items-center justify-center rounded-lg border border-red-200/80 bg-red-50 text-red-600 shadow-2xs transition-colors duration-200 hover:bg-red-100 dark:border-red-900/50 dark:bg-red-950/40 dark:text-red-400 dark:hover:bg-red-900/60"
                            title={t('delete_list') || 'Delete list'}
                        >
                            <AiOutlineDelete size={16} />
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
                        className="hover:text-green-450 dark:hover:text-green-450 group-hover:text-green-450 dark:group-hover:text-green-450 decoration-green-450 line-clamp-1 cursor-pointer text-left font-bold decoration-2 underline-offset-4 transition-colors duration-200 group-hover:underline hover:underline focus:outline-hidden"
                    >
                        {list.isDefault ? t('to_cook_later') : list.name}
                    </Link>
                </h2>
            </div>

            {/* Recipes Preview */}
            <div className="mt-4 flex flex-row items-center overflow-hidden py-0.5">
                {previews.map((recipe: any) => (
                    <CustomProxyImage
                        key={recipe.id}
                        src={recipe.imageSrc}
                        alt={recipe.title}
                        className="-ml-2.5 inline-block size-8 rounded-full object-cover ring-2 ring-white transition-transform duration-200 first:ml-0 dark:ring-neutral-900"
                        width={32}
                        height={32}
                        circular={true}
                    />
                ))}
                {previews.length === 0 && (
                    <span className="text-xs text-neutral-400 italic">
                        {t('no_recipes_yet') || 'No recipes yet'}
                    </span>
                )}
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
                                    push(`/profile/${list.user!.id}`);
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
                                {formatDate(list.createdAt, language)}
                            </span>
                        )}
                    </div>
                    <div className="flex items-center gap-2 text-xs font-semibold text-neutral-500 dark:text-neutral-400">
                        <span>
                            {list.recipeIds.length} {t('recipes') || 'recipes'}
                        </span>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ListCard;
