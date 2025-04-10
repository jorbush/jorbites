'use client';

import qs from 'query-string';
import { useRouter, useSearchParams } from 'next/navigation';
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
    const router = useRouter();
    const params = useSearchParams();
    const { t } = useTranslation();

    const handleClick = useCallback(() => {
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

        if (params?.get('category') === label) {
            delete updatedQuery.category;
        }

        const url = qs.stringifyUrl(
            {
                url: '/',
                query: updatedQuery,
            },
            { skipNull: true }
        );

        router.push(url);
    }, [label, router, params]);

    return (
        <div
            onClick={handleClick}
            className={`flex cursor-pointer flex-col items-center justify-center gap-2 border-b-2 p-3 transition hover:text-neutral-800 ${selected ? 'border-b-neutral-800 dark:border-b-neutral-100' : 'border-transparent'} ${selected ? 'text-neutral-800 dark:text-neutral-100' : 'text-neutral-500'} `}
        >
            <Icon
                size={26}
                data-testid={`fa-${label.toLowerCase()}`}
            />
            <div className="text-sm font-medium whitespace-nowrap">
                {t(label.toLocaleLowerCase())}
            </div>
        </div>
    );
};

export default CategoryBox;
