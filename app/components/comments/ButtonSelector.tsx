'use client';

import React from 'react';
import { FaSortAmountDown, FaSortAmountUp } from 'react-icons/fa';
import { useTranslation } from 'react-i18next';
import useIsMounted from '@/app/hooks/useIsMounted';
import Dropdown from '@/app/components/utils/Dropdown';

interface ButtonSelectorProps {
    sortOrder: 'asc' | 'desc' | 'most_liked';
    onSortChange: (_sortOrder: 'asc' | 'desc' | 'most_liked') => void;
}

const ButtonSelector: React.FC<ButtonSelectorProps> = ({
    sortOrder,
    onSortChange,
}) => {
    const mounted = useIsMounted();
    const { t } = useTranslation();

    const getLabel = (order: 'asc' | 'desc' | 'most_liked') => {
        if (!mounted) {
            if (order === 'asc') return 'oldest_first';
            if (order === 'desc') return 'newest_first';
            return 'most_liked';
        }
        return t(
            order === 'asc'
                ? 'oldest_first'
                : order === 'desc'
                  ? 'newest_first'
                  : 'most_liked'
        );
    };

    const options = [
        { value: 'desc' as const, label: getLabel('desc') },
        { value: 'asc' as const, label: getLabel('asc') },
        { value: 'most_liked' as const, label: getLabel('most_liked') },
    ];

    const buttonContent = (
        <span className="flex items-center gap-2">
            {sortOrder === 'asc' ? <FaSortAmountUp /> : <FaSortAmountDown />}
            <span>{getLabel(sortOrder)}</span>
        </span>
    );

    return (
        <Dropdown
            options={options}
            value={sortOrder}
            onChange={onSortChange}
            buttonContent={buttonContent}
            className="flex cursor-pointer items-center gap-2 rounded-lg px-3 py-1 text-sm font-medium text-neutral-700 hover:bg-neutral-200 dark:text-neutral-200 dark:hover:bg-neutral-800"
            showChevron={true}
        />
    );
};

export default ButtonSelector;
