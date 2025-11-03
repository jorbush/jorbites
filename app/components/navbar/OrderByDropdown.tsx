'use client';

import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import { FiChevronDown } from 'react-icons/fi';
import { IoReorderThree } from 'react-icons/io5';
import { useTranslation } from 'react-i18next';
import {
    OrderByType,
    ORDER_BY_OPTIONS,
    ORDER_BY_LABELS,
    ORDER_BY_FALLBACK_LABELS,
} from '@/app/utils/filter';
import Dropdown from '../utils/Dropdown';

const OrderByDropdown: React.FC = () => {
    const { t } = useTranslation();
    const router = useRouter();
    const searchParams = useSearchParams();
    const pathname = usePathname();

    const isMainPage = pathname === '/';
    const currentOrderBy =
        (searchParams?.get('orderBy') as OrderByType) || OrderByType.NEWEST;

    const handleOrderChange = (orderBy: OrderByType) => {
        if (!isMainPage) return;
        const params = new URLSearchParams(searchParams?.toString() || '');
        if (orderBy === OrderByType.NEWEST) {
            params.delete('orderBy');
        } else {
            params.set('orderBy', orderBy);
        }
        router.replace(params.toString() ? `/?${params.toString()}` : '/');
    };

    const getOrderLabel = (orderBy: OrderByType) => {
        const translationKey = ORDER_BY_LABELS[orderBy];
        const fallbackLabel = ORDER_BY_FALLBACK_LABELS[orderBy];
        return t(translationKey) || fallbackLabel;
    };

    const buttonContent = (
        <>
            {/* Mobile: Show reorder icon only */}
            <div className="flex items-center gap-1 lg:hidden">
                <IoReorderThree size={18} />
            </div>

            {/* Desktop: Show text and dropdown arrow */}
            <div className="hidden items-center gap-1 lg:flex">
                <span className="text-sm">
                    {getOrderLabel(currentOrderBy)}
                </span>
                <FiChevronDown size={14} />
            </div>

            {/* Notification circle when non-default order is selected */}
            {currentOrderBy !== OrderByType.NEWEST && (
                <span className="absolute -top-1 -right-1 h-3 w-3 rounded-full border-2 border-white bg-rose-500 dark:border-neutral-900"></span>
            )}
        </>
    );

    return (
        <Dropdown
            buttonAriaLabel={t('order_by') || 'Order by'}
            buttonContent={buttonContent}
        >
            <div className="w-max cursor-pointer">
                {ORDER_BY_OPTIONS.map((orderBy) => (
                    <div
                        key={orderBy}
                        onClick={() => handleOrderChange(orderBy)}
                        className={`flex w-full cursor-pointer items-center px-4 py-3 text-left text-sm transition hover:bg-neutral-100 dark:hover:bg-neutral-700 ${
                            currentOrderBy === orderBy
                                ? 'bg-green-450/10 text-green-450 dark:bg-green-450/20 dark:text-green-450'
                                : 'text-neutral-700 dark:text-neutral-300'
                        }`}
                    >
                        <span className="whitespace-nowrap">
                            {getOrderLabel(orderBy)}
                        </span>
                    </div>
                ))}
            </div>
        </Dropdown>
    );
};

export default OrderByDropdown;
