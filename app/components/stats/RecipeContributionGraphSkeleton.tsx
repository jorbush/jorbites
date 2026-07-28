import Container from '@/app/components/utils/Container';

const WEEKS = 53;
const DAYS = 7;

const RecipeContributionGraphSkeleton = () => {
    return (
        <Container>
            <div className="w-full py-4">
                {/* Title skeleton */}
                <div className="mb-4 px-2">
                    <div className="h-6 w-56 animate-pulse rounded bg-neutral-200 sm:h-7 dark:bg-neutral-700" />
                </div>

                {/* Scrollable outer wrapper — matches the real component */}
                <div className="scrollbar-hide w-full overflow-x-auto">
                    <div
                        className="inline-flex flex-col"
                        style={
                            {
                                '--cell': '11px',
                                '--gap': '3px',
                            } as React.CSSProperties
                        }
                    >
                        {/* Month labels row */}
                        <div className="mb-1 flex">
                            <div
                                className="shrink-0"
                                style={{ width: 26 }}
                            />
                            <div
                                className="flex"
                                style={{ gap: 'var(--gap)' }}
                            >
                                {Array.from({ length: WEEKS }).map((_, wi) => (
                                    <div
                                        key={wi}
                                        className="shrink-0 overflow-visible"
                                        style={{ width: 'var(--cell)' }}
                                    >
                                        {wi % 13 === 0 && (
                                            <div className="h-[10px] w-7 animate-pulse rounded bg-neutral-200 dark:bg-neutral-700" />
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Grid + day labels */}
                        <div
                            className="flex"
                            style={{ gap: 'var(--gap)' }}
                        >
                            {/* Day labels column */}
                            <div
                                className="flex shrink-0 flex-col"
                                style={{ gap: 'var(--gap)', width: 26 }}
                            >
                                {Array.from({ length: DAYS }).map((_, idx) => (
                                    <div
                                        key={idx}
                                        className="flex items-center justify-end pr-1"
                                        style={{ height: 'var(--cell)' }}
                                    >
                                        {idx % 2 !== 0 && (
                                            <div className="h-[8px] w-5 animate-pulse rounded bg-neutral-200 dark:bg-neutral-700" />
                                        )}
                                    </div>
                                ))}
                            </div>

                            {/* Week columns */}
                            <div
                                className="flex"
                                style={{ gap: 'var(--gap)' }}
                            >
                                {Array.from({ length: WEEKS }).map((_, wi) => (
                                    <div
                                        key={wi}
                                        className="flex flex-col"
                                        style={{ gap: 'var(--gap)' }}
                                    >
                                        {Array.from({ length: DAYS }).map(
                                            (_, di) => (
                                                <div
                                                    key={di}
                                                    className="shrink-0 animate-pulse rounded-sm bg-neutral-200 dark:bg-neutral-700"
                                                    style={{
                                                        width: 'var(--cell)',
                                                        height: 'var(--cell)',
                                                    }}
                                                />
                                            )
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Legend skeleton */}
                        <div className="mt-4 flex items-center justify-end gap-2">
                            <div className="h-[10px] w-6 animate-pulse rounded bg-neutral-200 dark:bg-neutral-700" />
                            <div
                                className="flex"
                                style={{ gap: 'var(--gap)' }}
                            >
                                {Array.from({ length: 5 }).map((_, i) => (
                                    <div
                                        key={i}
                                        className="shrink-0 animate-pulse rounded-sm bg-neutral-200 dark:bg-neutral-700"
                                        style={{
                                            width: 'var(--cell)',
                                            height: 'var(--cell)',
                                        }}
                                    />
                                ))}
                            </div>
                            <div className="h-[10px] w-7 animate-pulse rounded bg-neutral-200 dark:bg-neutral-700" />
                        </div>
                    </div>
                </div>
            </div>
        </Container>
    );
};

export default RecipeContributionGraphSkeleton;
