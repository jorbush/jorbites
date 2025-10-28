import Container from '@/app/components/utils/Container';

const AboutClientSkeleton = () => {
    return (
        <Container>
            <div className="mx-auto max-w-4xl">
                {/* Heading Skeleton */}
                <div className="py-8 text-center">
                    <div className="mx-auto mb-2 h-10 w-32 animate-pulse rounded bg-neutral-200 dark:bg-neutral-700"></div>
                    <div className="mx-auto h-6 w-64 animate-pulse rounded bg-neutral-200 dark:bg-neutral-700"></div>
                </div>

                <div className="space-y-8">
                    {/* Section Skeletons */}
                    {[1, 2, 3, 4, 5, 6].map((index) => (
                        <section
                            key={index}
                            className="rounded-lg bg-neutral-50 p-6 dark:bg-neutral-900"
                        >
                            <div className="mb-4 h-8 w-48 animate-pulse rounded bg-neutral-200 dark:bg-neutral-700"></div>
                            <div className="space-y-2">
                                <div className="h-4 w-full animate-pulse rounded bg-neutral-200 dark:bg-neutral-700"></div>
                                <div className="h-4 w-5/6 animate-pulse rounded bg-neutral-200 dark:bg-neutral-700"></div>
                                <div className="h-4 w-4/6 animate-pulse rounded bg-neutral-200 dark:bg-neutral-700"></div>
                            </div>
                        </section>
                    ))}
                </div>
            </div>
        </Container>
    );
};

export default AboutClientSkeleton;
