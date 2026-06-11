'use client';

import React from 'react';
import Avatar from '@/app/components/utils/Avatar';
import VerificationBadge from '@/app/components/VerificationBadge';

interface RecipeCoCooksProps {
    isLoadingRelatedData: boolean;
    coCooks: any[];
    mounted: boolean;
    t: any;
    push: (url: string) => void;
}

export const RecipeCoCooks: React.FC<RecipeCoCooksProps> = ({
    isLoadingRelatedData,
    coCooks,
    mounted,
    t,
    push,
}) => {
    if (isLoadingRelatedData) {
        return (
            <div className="flex flex-col gap-2">
                <h3 className="text-md font-semibold dark:text-neutral-100">
                    {mounted ? t('co_cooks') || 'Co-Cooks' : 'co_cooks'}
                </h3>
                <div className="flex flex-wrap gap-2">
                    {/* Loading skeleton */}
                    <div className="h-8 w-32 animate-pulse rounded-full bg-neutral-200 dark:bg-neutral-800" />
                    <div className="h-8 w-28 animate-pulse rounded-full bg-neutral-200 dark:bg-neutral-800" />
                </div>
            </div>
        );
    }

    if (coCooks.length === 0) {
        return null;
    }

    return (
        <div className="flex flex-col gap-2">
            <h3 className="text-md font-semibold dark:text-neutral-100">
                {mounted ? t('co_cooks') || 'Co-Cooks' : 'co_cooks'}
            </h3>
            <div className="flex flex-wrap gap-2">
                {coCooks.map((cook) => (
                    <button
                        key={cook.id}
                        type="button"
                        className="flex cursor-pointer items-center gap-2 rounded-full bg-neutral-100 px-2 py-1 text-left focus:outline-hidden dark:bg-neutral-900"
                        onClick={() => push(`/profile/${cook.id}`)}
                    >
                        <Avatar
                            src={cook.image}
                            size={24}
                        />
                        <span className="text-sm dark:text-neutral-100">
                            {cook.name}
                        </span>
                        {cook.verified && (
                            <VerificationBadge
                                className="ml-1"
                                size={16}
                            />
                        )}
                    </button>
                ))}
            </div>
        </div>
    );
};
