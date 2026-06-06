const FooterSkeleton = () => {
    return (
        <footer className="dark:bg-dark min-h-[230px] w-full border-t border-neutral-200 bg-white px-4 py-8 dark:border-neutral-800">
            <div className="mx-auto max-w-6xl">
                <div className="flex flex-col items-center gap-6">
                    <div className="h-6 w-24 rounded-full bg-neutral-100 dark:bg-neutral-800"></div>
                    <div className="flex gap-6">
                        {[1, 2, 3, 4, 5].map((i) => (
                            <div
                                key={i}
                                className="size-5 rounded-full bg-neutral-200 dark:bg-neutral-700"
                            ></div>
                        ))}
                    </div>
                    <div className="flex flex-wrap justify-center gap-6">
                        <div className="h-4 w-24 rounded-sm bg-neutral-200 dark:bg-neutral-700"></div>
                        <div className="h-4 w-24 rounded-sm bg-neutral-200 dark:bg-neutral-700"></div>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="size-6 rounded-sm bg-neutral-200 dark:bg-neutral-700"></div>
                        <div className="h-4 w-20 rounded-sm bg-neutral-200 dark:bg-neutral-700"></div>
                    </div>
                    <div className="h-4 w-64 rounded-sm bg-neutral-200 dark:bg-neutral-700"></div>
                </div>
            </div>
        </footer>
    );
};

export default FooterSkeleton;
