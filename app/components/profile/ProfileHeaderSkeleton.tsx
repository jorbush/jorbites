import Container from '@/app/components/utils/Container';

const ProfileHeaderSkeleton = () => {
    return (
        <Container>
            <div className="col-span-2 flex flex-row items-center gap-4 p-2 text-xl font-semibold dark:text-neutral-100">
                {/* Avatar skeleton */}
                <div className="h-[100px] w-[100px] animate-pulse rounded-full bg-neutral-200 dark:bg-neutral-700"></div>

                <div className="flex flex-col gap-3 text-2xl md:text-3xl">
                    <div className="flex flex-row gap-2">
                        {/* Name skeleton */}
                        <div className="h-8 w-40 animate-pulse rounded bg-neutral-200 dark:bg-neutral-700"></div>
                    </div>
                    {/* Level skeleton */}
                    <div className="h-6 w-24 animate-pulse rounded bg-neutral-200 dark:bg-neutral-700"></div>
                </div>
            </div>
            <hr className="mt-2" />

            {/* Badges skeleton */}
            <div className="mt-2 flex flex-wrap gap-2">
                {[1, 2, 3].map((index) => (
                    <div
                        key={index}
                        className="h-[50px] w-[50px] animate-pulse rounded-full bg-neutral-200 dark:bg-neutral-700"
                    ></div>
                ))}
            </div>
            <hr className="mt-2" />
        </Container>
    );
};

export default ProfileHeaderSkeleton;
