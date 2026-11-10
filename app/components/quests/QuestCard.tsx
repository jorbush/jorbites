'use client';

import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useTranslation } from 'react-i18next';
import { FiCheckCircle, FiClock, FiCircle } from 'react-icons/fi';
import { SafeQuest } from '@/app/types';
import Avatar from '@/app/components/utils/Avatar';
import CustomProxyImage from '@/app/components/optimization/CustomProxyImage';
import { formatDistanceToNowLocale } from '@/app/utils/date-utils';
import useIsMounted from '@/app/hooks/useIsMounted';

export const getQuestStatusIcon = (status: string) => {
    switch (status) {
        case 'open':
            return <FiCircle size={13} />;
        case 'in_progress':
            return (
                <FiClock
                    className="dark:text-green-450 text-neutral-800"
                    size={13}
                />
            );
        case 'completed':
            return (
                <FiCheckCircle
                    className="text-neutral-600 dark:text-neutral-300"
                    size={13}
                />
            );
        default:
            return <FiCircle size={13} />;
    }
};

export const getQuestStatusColor = (status: string) => {
    switch (status) {
        case 'in_progress':
            return 'border border-green-450/40 bg-green-450/15 text-neutral-800 dark:text-green-450';
        case 'open':
            return 'border border-neutral-200/80 bg-neutral-100 text-neutral-700 dark:border-neutral-700/60 dark:bg-neutral-800 dark:text-neutral-300';
        case 'completed':
            return 'border border-neutral-200/80 bg-neutral-50 text-neutral-600 dark:border-neutral-800 dark:bg-neutral-900/50 dark:text-neutral-400';
        default:
            return 'border border-neutral-200/80 bg-neutral-100 text-neutral-700 dark:border-neutral-800 dark:bg-neutral-800 dark:text-neutral-300';
    }
};

export interface QuestCardProps {
    quest: SafeQuest;
    push?: (url: string) => void;
    t?: any;
    language?: string;
    showRepliesPreview?: boolean;
}

export const QuestCard: React.FC<QuestCardProps> = ({
    quest,
    push,
    t,
    language,
    showRepliesPreview = false,
}) => {
    const { t: hookT, i18n } = useTranslation();
    const router = useRouter();
    const mounted = useIsMounted();

    const translate = t || hookT;
    const currentLang = language || i18n?.language || 'en';

    const handleNavigate = (url: string) => {
        if (push) {
            push(url);
        } else if (router?.push) {
            router.push(url);
        }
    };

    return (
        <div
            data-cy="quest-card"
            className="group relative flex w-full flex-col justify-between overflow-hidden rounded-2xl border border-neutral-200/80 bg-white p-5 shadow-xs transition-colors duration-200 hover:border-neutral-300 dark:border-neutral-800 dark:bg-neutral-900/90 dark:hover:border-neutral-700"
        >
            <div>
                {/* Header: Title & Status */}
                <div className="mb-2 flex items-start justify-between gap-3">
                    <h3 className="text-base font-bold text-neutral-900 sm:text-lg dark:text-white">
                        <Link
                            href={`/quests/${quest.id}`}
                            onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                handleNavigate(`/quests/${quest.id}`);
                            }}
                            data-cy="quest-card-title"
                            className="decoration-green-450 line-clamp-1 cursor-pointer text-left font-bold decoration-2 underline-offset-4 transition-colors duration-200 group-hover:underline hover:underline focus:outline-hidden"
                        >
                            {quest.title}
                        </Link>
                    </h3>
                    <span
                        className={`inline-flex shrink-0 items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ${getQuestStatusColor(
                            quest.status
                        )}`}
                        data-cy="quest-card-status"
                    >
                        {getQuestStatusIcon(quest.status)}
                        <span>{translate(quest.status) || quest.status}</span>
                    </span>
                </div>

                {/* Description */}
                <p
                    className="line-clamp-2 text-sm leading-relaxed text-neutral-600 sm:line-clamp-3 dark:text-neutral-400"
                    data-cy="quest-card-description"
                >
                    {quest.description ||
                        translate('no_description', {
                            defaultValue: 'No description',
                        })}
                </p>
            </div>

            {/* Footer */}
            <div className="mt-4 border-t border-neutral-100 pt-3 dark:border-neutral-800">
                <div className="flex items-center justify-between gap-2">
                    <div className="flex min-w-0 items-center gap-2.5">
                        <Avatar
                            src={quest.user?.image || null}
                            size={32}
                        />
                        <div className="flex min-w-0 flex-col">
                            <span className="truncate text-xs font-semibold text-neutral-800 dark:text-neutral-200">
                                {quest.user?.name ||
                                    translate('anonymous', {
                                        defaultValue: 'Anonymous',
                                    })}
                            </span>
                            <span className="text-[11px] text-neutral-500 dark:text-neutral-400">
                                {mounted && quest.createdAt
                                    ? formatDistanceToNowLocale(
                                          new Date(quest.createdAt),
                                          currentLang
                                      )
                                    : ''}
                            </span>
                        </div>
                    </div>
                    {quest.recipes && (
                        <span className="shrink-0 text-xs font-semibold text-neutral-500 dark:text-neutral-400">
                            {quest.recipes.length}{' '}
                            {quest.recipes.length === 1
                                ? translate('reply', {
                                      defaultValue: 'reply',
                                  })
                                : translate('replies', {
                                      defaultValue: 'replies',
                                  })}
                        </span>
                    )}
                </div>

                {/* Optional Recipes Preview */}
                {showRepliesPreview &&
                    quest.recipes &&
                    quest.recipes.length > 0 && (
                        <div className="mt-3 flex gap-2 overflow-x-auto pt-1">
                            {quest.recipes.slice(0, 3).map((recipe) => (
                                <Link
                                    key={recipe.id}
                                    href={`/recipes/${recipe.id}`}
                                    onClick={(e) => {
                                        e.preventDefault();
                                        e.stopPropagation();
                                        handleNavigate(`/recipes/${recipe.id}`);
                                    }}
                                    className="group/reply relative size-12 flex-shrink-0 cursor-pointer overflow-hidden rounded-xl border border-neutral-200/80 p-0 dark:border-neutral-700/60"
                                    aria-label={recipe.title}
                                >
                                    <CustomProxyImage
                                        src={recipe.imageSrc || '/avocado.webp'}
                                        fill
                                        className="object-cover transition-transform duration-200 group-hover/reply:scale-105"
                                        alt={recipe.title}
                                        quality="auto:eco"
                                        width={48}
                                        height={48}
                                    />
                                </Link>
                            ))}
                            {quest.recipes.length > 3 && (
                                <div className="flex size-12 flex-shrink-0 items-center justify-center rounded-xl border border-neutral-200/80 bg-neutral-100 dark:border-neutral-700/60 dark:bg-neutral-800">
                                    <span className="text-xs font-semibold text-neutral-700 dark:text-neutral-300">
                                        +{quest.recipes.length - 3}
                                    </span>
                                </div>
                            )}
                        </div>
                    )}
            </div>
        </div>
    );
};

export default QuestCard;
