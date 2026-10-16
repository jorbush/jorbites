'use client';

import qs from 'query-string';
import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import { useCallback, useMemo, Suspense } from 'react';
import { IconType } from 'react-icons';
import { useTranslation } from 'react-i18next';

interface CategoryBoxProps {
    icon: IconType;
    label: string;
    selected?: boolean;
}

const CategoryBoxComponent: React.FC<CategoryBoxProps> = ({
    icon: Icon,
    label,
    selected,
}) => {
    const { push } = useRouter() || {};
    const params = useSearchParams();

    const { get, toString } = useMemo(() => {
        return {
            get: params ? params.get.bind(params) : () => null,
            toString: params ? params.toString.bind(params) : () => '',
        };
    }, [params]);

    const pathname = usePathname();
    const { t } = useTranslation();

    const handleCategorySelection = useCallback(() => {
        const currentQuery = qs.parse(toString());

        const existingCategoryRaw = currentQuery.category;
        let currentCategories: string[] = [];

        if (Array.isArray(existingCategoryRaw)) {
            currentCategories = existingCategoryRaw.filter(
                (item): item is string =>
                    typeof item === 'string' && Boolean(item)
            );
        } else if (
            typeof existingCategoryRaw === 'string' &&
            existingCategoryRaw
        ) {
            currentCategories = existingCategoryRaw
                .split(',')
                .map((c) => c.trim())
                .filter(Boolean);
        }

        let updatedCategories: string[];
        if (currentCategories.includes(label)) {
            updatedCategories = currentCategories.filter((c) => c !== label);
        } else {
            updatedCategories = [...currentCategories, label];
        }

        let updatedQuery: any = {
            ...currentQuery,
        };

        if (updatedCategories.length > 0) {
            updatedQuery.category = updatedCategories;
        } else {
            delete updatedQuery.category;
        }

        if ('page' in updatedQuery) {
            delete updatedQuery.page;
        }

        const url = qs.stringifyUrl(
            {
                url: pathname || '/',
                query: updatedQuery,
            },
            { skipNull: true }
        );

        push(url);
    }, [label, push, pathname, toString]);

    return (
        <button
            type="button"
            onClick={handleCategorySelection}
            className={`flex cursor-pointer flex-col items-center justify-center gap-2 border-b-2 bg-transparent p-3 transition hover:text-neutral-800 focus:outline-hidden ${selected ? 'border-b-neutral-800 dark:border-b-neutral-100' : 'border-transparent'} ${selected ? 'text-neutral-800 dark:text-neutral-100' : 'text-neutral-500'} `}
        >
            <Icon
                size={26}
                data-testid={`fa-${label.toLowerCase()}`}
            />
            <div className="text-sm font-medium whitespace-nowrap">
                {t(label.toLocaleLowerCase())}
            </div>
        </button>
    );
};

const CategoryBox: React.FC<CategoryBoxProps> = (props) => (
    <Suspense fallback={null}>
        <CategoryBoxComponent {...props} />
    </Suspense>
);

export default CategoryBox;
