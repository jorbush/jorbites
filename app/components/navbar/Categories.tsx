'use client';

import { usePathname, useSearchParams } from 'next/navigation';
import { Suspense, useMemo } from 'react';
import Container from '@/app/components/utils/Container';
import CategoryBox from '@/app/components/CategoryBox';
import { categories } from './categoriesData';

const CategoriesComponent = () => {
    const searchParamsVal = useSearchParams();
    const selectedCategories = useMemo(() => {
        if (!searchParamsVal) return [];
        const categoryParams = searchParamsVal.getAll('category');
        return categoryParams
            .flatMap((c) => c.split(','))
            .map((c) => c.trim())
            .filter(Boolean);
    }, [searchParamsVal]);

    const pathname = usePathname();
    const isMainPage = pathname === '/';
    const isFavoritesPage = pathname === '/favorites';
    const isFilterablePage = isMainPage || isFavoritesPage;

    if (!isFilterablePage) {
        return null;
    }

    return (
        <Container>
            <div className="flex flex-row items-center justify-between overflow-x-auto pt-4">
                {categories.map((item) => (
                    <Suspense
                        key={item.label}
                        fallback={null}
                    >
                        <CategoryBox
                            label={item.label}
                            icon={item.icon}
                            selected={selectedCategories.includes(item.label)}
                        />
                    </Suspense>
                ))}
            </div>
        </Container>
    );
};

export const CategoriesSkeleton = () => {
    return (
        <Container>
            <div className="flex flex-row items-center justify-between overflow-x-auto pt-4">
                {Array.from({ length: 8 }).map((_, i) => (
                    <div
                        key={i}
                        className="flex min-w-[60px] flex-col items-center gap-2 p-3"
                    >
                        <div className="size-6 animate-pulse rounded-full bg-neutral-200 dark:bg-neutral-800" />
                        <div className="h-3 w-12 animate-pulse rounded bg-neutral-200 dark:bg-neutral-800" />
                    </div>
                ))}
            </div>
        </Container>
    );
};

const Categories = () => (
    <Suspense fallback={<CategoriesSkeleton />}>
        <CategoriesComponent />
    </Suspense>
);

export default Categories;
