'use client';

import { usePathname, useSearchParams } from 'next/navigation';
import Container from '@/app/components/utils/Container';
import CategoryBox from '@/app/components/CategoryBox';
import { categories } from './categoriesData';

const Categories = () => {
    const searchParamsVal = useSearchParams();
    const get = searchParamsVal
        ? searchParamsVal.get.bind(searchParamsVal)
        : () => null;
    const category = get('category');
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
                    <CategoryBox
                        key={item.label}
                        label={item.label}
                        icon={item.icon}
                        selected={category === item.label}
                    />
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

export default Categories;
