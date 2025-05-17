import Container from '@/app/components/utils/Container';

const PolicySkeleton = () => {
    return (
        <Container>
            <div className="mx-auto max-w-(--breakpoint-md) dark:text-neutral-100">
                <div className="mx-auto max-w-[700px] gap-10 px-1 py-0 md:px-4 md:py-6">
                    {/* Header with back button and title */}
                    <div className="mb-5 flex items-center justify-between">
                        <div className="h-6 w-6 animate-pulse rounded-full bg-neutral-200 dark:bg-neutral-700"></div>
                        <div className="h-10 w-48 animate-pulse rounded bg-neutral-200 dark:bg-neutral-700"></div>
                        <div className="w-8"></div>
                    </div>

                    {/* Last update date */}
                    <div className="mb-4 h-5 w-40 animate-pulse rounded bg-neutral-200 dark:bg-neutral-700"></div>

                    {/* Introduction paragraph */}
                    <div className="mb-4 space-y-2">
                        <div className="h-4 w-full animate-pulse rounded bg-neutral-200 dark:bg-neutral-700"></div>
                        <div className="h-4 w-5/6 animate-pulse rounded bg-neutral-200 dark:bg-neutral-700"></div>
                        <div className="h-4 w-4/5 animate-pulse rounded bg-neutral-200 dark:bg-neutral-700"></div>
                    </div>

                    {/* Multiple sections */}
                    {[1, 2, 3, 4, 5].map((section) => (
                        <div
                            key={section}
                            className="mb-6"
                        >
                            {/* Section heading */}
                            <div className="mt-4 mb-2 h-8 w-64 animate-pulse rounded bg-neutral-200 dark:bg-neutral-700"></div>

                            {/* Section content */}
                            <div className="mb-4 space-y-2">
                                <div className="h-4 w-full animate-pulse rounded bg-neutral-200 dark:bg-neutral-700"></div>
                                <div className="h-4 w-5/6 animate-pulse rounded bg-neutral-200 dark:bg-neutral-700"></div>
                            </div>

                            {/* List items */}
                            <div className="mb-4 ml-6 space-y-3">
                                {[1, 2, 3].map((item) => (
                                    <div
                                        key={item}
                                        className="flex"
                                    >
                                        <div className="mt-2 mr-2 h-2 w-2 animate-pulse rounded-full bg-neutral-200 dark:bg-neutral-700"></div>
                                        <div className="h-4 w-5/6 animate-pulse rounded bg-neutral-200 dark:bg-neutral-700"></div>
                                    </div>
                                ))}
                            </div>

                            {/* Subsection (if any) */}
                            {section % 2 === 0 && (
                                <div className="mb-3 ml-6">
                                    <div className="mt-2 mb-2 h-6 w-48 animate-pulse rounded bg-neutral-200 dark:bg-neutral-700"></div>
                                    <div className="space-y-2">
                                        <div className="h-4 w-full animate-pulse rounded bg-neutral-200 dark:bg-neutral-700"></div>
                                        <div className="h-4 w-5/6 animate-pulse rounded bg-neutral-200 dark:bg-neutral-700"></div>
                                    </div>
                                </div>
                            )}
                        </div>
                    ))}

                    {/* Contact section */}
                    <div className="mt-6">
                        <div className="mt-4 mb-2 h-8 w-40 animate-pulse rounded bg-neutral-200 dark:bg-neutral-700"></div>
                        <div className="space-y-2">
                            <div className="h-4 w-full animate-pulse rounded bg-neutral-200 dark:bg-neutral-700"></div>
                            <div className="h-4 w-3/4 animate-pulse rounded bg-neutral-200 dark:bg-neutral-700"></div>
                        </div>
                    </div>
                </div>
            </div>
        </Container>
    );
};

export default PolicySkeleton;
