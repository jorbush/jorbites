import React from 'react';

const SKELETON_CARDS = [1, 2, 3];

const ProfileCollectionSkeleton: React.FC = () => {
    return (
        <div
            className="pt-2"
            data-testid="profile-collection-skeleton"
        >
            <div className="mb-6 h-10 w-full animate-pulse rounded-xl bg-neutral-200 sm:max-w-sm lg:w-72 xl:w-80 dark:bg-neutral-700" />
            <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
                {SKELETON_CARDS.map((index) => (
                    <div
                        key={index}
                        className="flex flex-col justify-between rounded-2xl border border-neutral-200/80 bg-white p-5 dark:border-neutral-800 dark:bg-neutral-900/90"
                    >
                        <div>
                            <div className="mb-3 h-5 w-2/3 animate-pulse rounded bg-neutral-200 dark:bg-neutral-700" />
                            <div className="mb-2 h-4 w-full animate-pulse rounded bg-neutral-200 dark:bg-neutral-700" />
                            <div className="h-4 w-4/5 animate-pulse rounded bg-neutral-200 dark:bg-neutral-700" />
                        </div>
                        <div className="mt-4 flex gap-2">
                            <div className="size-8 animate-pulse rounded-full bg-neutral-200 dark:bg-neutral-700" />
                            <div className="size-8 animate-pulse rounded-full bg-neutral-200 dark:bg-neutral-700" />
                        </div>
                        <div className="mt-4 flex items-center justify-between border-t border-neutral-100 pt-3 dark:border-neutral-800">
                            <div className="h-4 w-24 animate-pulse rounded bg-neutral-200 dark:bg-neutral-700" />
                            <div className="h-4 w-16 animate-pulse rounded bg-neutral-200 dark:bg-neutral-700" />
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default ProfileCollectionSkeleton;
