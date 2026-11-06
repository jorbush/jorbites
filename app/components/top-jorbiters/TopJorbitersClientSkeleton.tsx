import Container from '@/app/components/utils/Container';
import JorbiterCardSkeleton from './JorbiterCardSkeleton';

const TopJorbitersClientSkeleton = () => {
    return (
        <Container>
            <div className="mx-auto max-w-(--breakpoint-lg) pt-2 pb-12 sm:px-2 sm:pt-4 md:px-4">
                {/* Leaderboard Header Skeleton */}
                <div className="mb-10 text-center">
                    <div className="mx-auto mb-3 h-9 w-64 animate-pulse rounded-md bg-neutral-200 dark:bg-neutral-800"></div>
                    <div className="mx-auto h-4 w-3/4 max-w-md animate-pulse rounded bg-neutral-200 dark:bg-neutral-800"></div>
                </div>

                {/* Leaderboard Grid Skeleton */}
                <div className="space-y-3.5 sm:space-y-4">
                    {[1, 2, 3, 4, 5, 6, 7, 8].map((index) => (
                        <JorbiterCardSkeleton key={index} />
                    ))}
                </div>

                {/* Call to Action Skeleton */}
                <div className="mt-8 rounded-2xl border border-neutral-200/80 bg-white p-6 shadow-xs sm:p-8 dark:border-neutral-800 dark:bg-neutral-900/90">
                    <div className="mx-auto max-w-md text-center">
                        <div className="mx-auto mb-4 size-10 animate-pulse rounded-full bg-neutral-200 dark:bg-neutral-800"></div>
                        <div className="mx-auto mb-3 h-6 w-3/4 animate-pulse rounded bg-neutral-200 dark:bg-neutral-800"></div>
                        <div className="mx-auto mb-6 h-4 w-5/6 animate-pulse rounded bg-neutral-200 dark:bg-neutral-800"></div>
                        <div className="flex justify-center">
                            <div className="h-10 w-36 animate-pulse rounded-xl bg-neutral-200 dark:bg-neutral-800"></div>
                        </div>
                    </div>
                </div>
            </div>
        </Container>
    );
};

export default TopJorbitersClientSkeleton;
