'use client';

import qs from 'query-string';
import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import { useCallback } from 'react';
import { IconType } from 'react-icons';
import { useTranslation } from 'react-i18next';

interface CategoryBoxProps {
    icon: IconType;
    label: string;
    selected?: boolean;
}

const CategoryBox: React.FC<CategoryBoxProps> = ({
    icon: Icon,
    label,
    selected,
}) => {
    const { push } = useRouter() || {};
    const params = useSearchParams();
    const get = params ? params.get.bind(params) : () => null;
    const pathname = usePathname();
    const { t } = useTranslation();

    const handleCategorySelection = useCallback(() => {
        let currentQuery = {};

        if (params) {
            currentQuery = qs.parse(params.toString());
        }

        let updatedQuery: any = {
            ...currentQuery,
            category: label,
        };

        if ('page' in currentQuery) {
            delete updatedQuery.page;
        }

        if (get('category') === label) {
            delete updatedQuery.category;
        }

        const url = qs.stringifyUrl(
            {
                url: pathname || '/',
                query: updatedQuery,
            },
            { skipNull: true }
        );

        push(url);
    }, [label, push, params, pathname]);

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

export default CategoryBox;
