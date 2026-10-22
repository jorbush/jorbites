import Container from '@/app/components/utils/Container';
import ScrollableContainer from '@/app/components/utils/ScrollableContainer';

const ProfileHeaderSkeleton = () => {
    return (
        <Container>
            <div className="col-span-2 flex flex-row items-center justify-between gap-3 p-2 text-xl font-semibold sm:gap-4 dark:text-neutral-100">
                <div className="flex min-w-0 flex-1 items-center gap-3 sm:gap-4">
                    {/* Avatar skeleton */}
                    <div className="size-18 shrink-0 animate-pulse rounded-full bg-neutral-200 sm:size-22 md:size-[100px] dark:bg-neutral-700"></div>

                    <div className="flex min-w-0 flex-1 flex-col gap-1 text-2xl sm:gap-2 md:text-3xl">
                        <div className="flex items-center gap-1.5 sm:gap-2">
                            {/* Name skeleton */}
                            <div className="h-8 w-40 animate-pulse rounded bg-neutral-200 dark:bg-neutral-700"></div>
                        </div>
                        {/* Level skeleton */}
                        <div className="h-5 w-24 animate-pulse rounded bg-neutral-200 dark:bg-neutral-700"></div>
                        {/* Member since skeleton */}
                        <div className="h-4 w-28 animate-pulse rounded bg-neutral-200 dark:bg-neutral-700"></div>
                    </div>
                </div>

                {/* Action buttons placeholder */}
                <div className="flex shrink-0 items-center gap-2 self-start pt-1 sm:gap-3.5 sm:self-center sm:pt-0">
                    <div className="size-5 animate-pulse rounded-full bg-neutral-200 dark:bg-neutral-700"></div>
                    <div className="size-5 animate-pulse rounded-full bg-neutral-200 dark:bg-neutral-700"></div>
                    <div className="size-5 animate-pulse rounded-full bg-neutral-200 dark:bg-neutral-700"></div>
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

            <hr className="mt-2" />

            {/* Badges skeleton */}
            <ScrollableContainer className="mt-2">
                {[1, 2, 3, 4, 5, 6].map((index) => (
                    <div
                        key={index}
                        className="size-[50px] shrink-0 animate-pulse rounded-full bg-neutral-200 dark:bg-neutral-700"
                    ></div>
                ))}
            </ScrollableContainer>
            <hr className="mt-2" />
        </Container>
    );
};

export default ProfileHeaderSkeleton;
