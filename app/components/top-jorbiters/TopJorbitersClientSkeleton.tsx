import Container from '@/app/components/utils/Container';
import JorbiterCardSkeleton from './JorbiterCardSkeleton';

const TopJorbitersClientSkeleton = () => {
    return (
        <Container>
            <div className="mx-auto max-w-(--breakpoint-lg) sm:px-2 md:px-4">
                {/* Leaderboard Header Skeleton */}
                <div className="mb-6 text-center">
                    <div className="mx-auto mb-3 h-8 w-48 animate-pulse rounded bg-neutral-200 dark:bg-neutral-700"></div>
                    <div className="mx-auto h-4 w-3/4 animate-pulse rounded bg-neutral-200 dark:bg-neutral-700"></div>
                </div>

                {/* Leaderboard Grid Skeleton */}
                <div className="space-y-4">
                    {[1, 2, 3, 4, 5, 6, 7, 8].map((index) => (
                        <JorbiterCardSkeleton key={index} />
                    ))}
                </div>

                {/* Call to Action Skeleton */}
                <div className="mt-8 rounded-lg border border-neutral-200 bg-white p-6 dark:border-neutral-700 dark:bg-neutral-800">
                    <div className="mb-4 h-7 w-3/4 animate-pulse rounded bg-neutral-200 dark:bg-neutral-700"></div>
                    <div className="mb-6 space-y-2">
                        <div className="h-4 w-full animate-pulse rounded bg-neutral-200 dark:bg-neutral-700"></div>
                        <div className="h-4 w-5/6 animate-pulse rounded bg-neutral-200 dark:bg-neutral-700"></div>
                    </div>
                    <div className="flex justify-center">
                        <div className="h-10 w-32 animate-pulse rounded-lg bg-green-200 dark:bg-green-900/30"></div>
                    </div>
                </div>
            </div>
        </Container>
    );
};

export default TopJorbitersClientSkeleton;
