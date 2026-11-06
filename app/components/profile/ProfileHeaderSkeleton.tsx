import Container from '@/app/components/utils/Container';
import ScrollableContainer from '@/app/components/utils/ScrollableContainer';

const ProfileHeaderSkeleton = () => {
    return (
        <Container>
            {/* Top Navigation & Actions Bar Skeleton */}
            <div className="mb-2 flex flex-wrap items-center justify-between gap-3 pt-1 sm:mb-3 sm:pt-2">
                {/* Back button skeleton */}
                <div className="flex items-center gap-2.5">
                    <div className="size-9 animate-pulse rounded-xl bg-neutral-200 dark:bg-neutral-700"></div>
                    <div className="h-4 w-12 animate-pulse rounded bg-neutral-200 dark:bg-neutral-700"></div>
                </div>

                {/* Action buttons skeleton */}
                <div className="flex items-center gap-2">
                    <div className="size-9 animate-pulse rounded-xl bg-neutral-200 md:h-9 md:w-24 dark:bg-neutral-700"></div>
                    <div className="size-9 animate-pulse rounded-xl bg-neutral-200 md:h-9 md:w-28 dark:bg-neutral-700"></div>
                    <div className="size-9 animate-pulse rounded-xl bg-neutral-200 md:h-9 md:w-20 dark:bg-neutral-700"></div>
                </div>
            </div>

            {/* User Identity Block Skeleton */}
            <div className="flex items-center gap-3.5 p-2 sm:gap-4">
                {/* Avatar skeleton */}
                <div className="size-18 shrink-0 animate-pulse rounded-full bg-neutral-200 sm:size-22 md:size-[100px] dark:bg-neutral-700"></div>

                <div className="flex min-w-0 flex-1 flex-col gap-1 text-2xl sm:gap-2 md:text-3xl">
                    <div className="flex items-center gap-1.5 sm:gap-2">
                        {/* Name skeleton */}
                        <div className="h-8 w-40 animate-pulse rounded bg-neutral-200 dark:bg-neutral-700"></div>
                    </div>
                    {/* Level skeleton */}
                    <div className="h-5 w-20 animate-pulse rounded-full bg-neutral-200 dark:bg-neutral-700"></div>
                    {/* Member since skeleton */}
                    <div className="h-4 w-28 animate-pulse rounded bg-neutral-200 dark:bg-neutral-700"></div>
                </div>
            </div>

            {/* Creator Bio & Backlinks skeleton */}
            <div className="mt-1 px-2 pb-2">
                <div className="mb-1.5 h-4 w-3/4 max-w-lg animate-pulse rounded bg-neutral-200 dark:bg-neutral-700"></div>
                <div className="h-4 w-1/2 max-w-sm animate-pulse rounded bg-neutral-200 dark:bg-neutral-700"></div>
                <div className="mt-3 flex flex-wrap items-center gap-3">
                    {/* Website pill skeleton */}
                    <div className="h-7 w-36 animate-pulse rounded-full bg-neutral-200 dark:bg-neutral-700"></div>
                    {/* Social icons skeleton */}
                    <div className="size-6 animate-pulse rounded-full bg-neutral-200 dark:bg-neutral-700"></div>
                    <div className="size-6 animate-pulse rounded-full bg-neutral-200 dark:bg-neutral-700"></div>
                    <div className="size-6 animate-pulse rounded-full bg-neutral-200 dark:bg-neutral-700"></div>
                    <div className="size-6 animate-pulse rounded-full bg-neutral-200 dark:bg-neutral-700"></div>
                </div>
            </div>

            {/* Badges skeleton */}
            <div className="mt-3 rounded-2xl border border-neutral-200/80 bg-white p-3.5 shadow-xs sm:p-4 dark:border-neutral-800 dark:bg-neutral-800/90">
                <div className="mb-2 px-1">
                    <div className="h-3.5 w-24 animate-pulse rounded bg-neutral-200 dark:bg-neutral-700"></div>
                </div>
                <ScrollableContainer>
                    {[1, 2, 3, 4, 5, 6].map((index) => (
                        <div
                            key={index}
                            className="size-12 shrink-0 animate-pulse rounded-full bg-neutral-200 dark:bg-neutral-700"
                        ></div>
                    ))}
                </ScrollableContainer>
            </div>
        </Container>
    );
};

export default ProfileHeaderSkeleton;
