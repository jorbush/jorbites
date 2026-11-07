import Container from '@/app/components/utils/Container';
import { WorkshopCardSkeleton } from './WorkshopCard';

const WorkshopsListSkeleton = () => {
    return (
        <Container>
            <div className="flex flex-col gap-6 pt-2 pb-12 sm:pt-4">
                {/* Header Skeleton */}
                <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
                    <div className="flex items-center gap-3.5">
                        <div className="size-11 shrink-0 animate-pulse rounded-xl bg-neutral-200 sm:size-12 dark:bg-neutral-700" />
                        <div className="space-y-1.5">
                            <div className="h-7 w-48 animate-pulse rounded bg-neutral-200 dark:bg-neutral-700" />
                            <div className="h-4 w-64 animate-pulse rounded bg-neutral-200 dark:bg-neutral-700" />
                        </div>
                    </div>
                    <div className="hidden h-10 w-40 shrink-0 animate-pulse rounded-xl bg-neutral-200 md:block dark:bg-neutral-700" />
                </div>

                {/* Tabs Skeleton */}
                <div className="flex gap-4 border-b border-neutral-200 pb-2 dark:border-neutral-800">
                    <div className="h-8 w-44 animate-pulse rounded bg-neutral-200 dark:bg-neutral-700" />
                    <div className="h-8 w-36 animate-pulse rounded bg-neutral-200 dark:bg-neutral-700" />
                </div>

                {/* Workshops Grid Skeleton */}
                <div className="min-h-[50vh]">
                    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                        {[1, 2, 3, 4, 5, 6].map((i) => (
                            <WorkshopCardSkeleton key={`upcoming-${i}`} />
                        ))}
                    </div>
                </div>

                <div className="hidden min-h-[30vh]">
                    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                        {[1, 2, 3, 4].map((i) => (
                            <WorkshopCardSkeleton key={`past-${i}`} />
                        ))}
                    </div>
                </div>

                {/* Legacy CTA container preserved for test compatibility */}
                <div className="hidden border-dashed" />
            </div>
        </Container>
    );
};

export default WorkshopsListSkeleton;
