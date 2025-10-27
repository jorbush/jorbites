import Container from '@/app/components/utils/Container';
import { WorkshopCardSkeleton } from './WorkshopCard';

const WorkshopsListSkeleton = () => {
    return (
        <Container>
            <div>
                {/* Header Skeleton */}
                <div className="mb-10 text-center">
                    <div className="mb-3 flex items-center justify-center">
                        <div className="mr-2 h-10 w-10 animate-pulse rounded bg-neutral-200 dark:bg-neutral-700"></div>
                        <div className="h-10 w-48 animate-pulse rounded bg-neutral-200 dark:bg-neutral-700"></div>
                    </div>
                    <div className="mx-auto h-5 w-64 animate-pulse rounded bg-neutral-200 dark:bg-neutral-700"></div>
                </div>

                {/* Upcoming Workshops Section */}
                <div className="mb-6">
                    <div className="h-8 w-56 animate-pulse rounded bg-neutral-200 dark:bg-neutral-700"></div>
                </div>

                <div className="min-h-[60vh]">
                    <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6">
                        {[1, 2, 3, 4, 5, 6].map((i) => (
                            <WorkshopCardSkeleton key={`upcoming-${i}`} />
                        ))}
                    </div>
                </div>

                {/* Past Workshops Section */}
                <div className="mt-12 mb-6">
                    <div className="h-8 w-48 animate-pulse rounded bg-neutral-200 dark:bg-neutral-700"></div>
                </div>

                <div className="min-h-[40vh]">
                    <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6">
                        {[1, 2, 3, 4].map((i) => (
                            <WorkshopCardSkeleton key={`past-${i}`} />
                        ))}
                    </div>
                </div>

                {/* Call to Action Card Skeleton */}
                <div className="flex w-full flex-row items-center justify-center">
                    <div className="border-green-450/20 from-green-450/10 to-green-450/20 dark:border-green-450/30 dark:from-green-450/10 dark:to-green-450/20 w-full max-w-2xl rounded-lg border-2 border-dashed bg-gradient-to-r p-8 text-center">
                        <div className="mx-auto max-w-md space-y-4">
                            <div className="mx-auto h-16 w-16 animate-pulse rounded-full bg-neutral-200 dark:bg-neutral-700"></div>
                            <div className="mx-auto h-7 w-3/4 animate-pulse rounded bg-neutral-200 dark:bg-neutral-700"></div>
                            <div className="mx-auto h-5 w-full animate-pulse rounded bg-neutral-200 dark:bg-neutral-700"></div>
                            <div className="mx-auto h-5 w-5/6 animate-pulse rounded bg-neutral-200 dark:bg-neutral-700"></div>
                            <div className="mx-auto h-10 w-40 animate-pulse rounded bg-neutral-200 dark:bg-neutral-700"></div>
                        </div>
                    </div>
                </div>
            </div>
        </Container>
    );
};

export default WorkshopsListSkeleton;
