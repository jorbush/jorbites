'use client';

import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import { useTranslation } from 'react-i18next';
import { IoReorderThree } from 'react-icons/io5';
import { FiChevronDown } from 'react-icons/fi';
import Dropdown from '@/app/components/utils/Dropdown';
import {
    OrderByType,
    ORDER_BY_OPTIONS,
    ORDER_BY_LABELS,
    ORDER_BY_FALLBACK_LABELS,
} from '@/app/utils/filter';

const OrderByDropdown: React.FC = () => {
    const { t } = useTranslation();
    const router = useRouter();
    const searchParams = useSearchParams();
    const pathname = usePathname();

    const isMainPage = pathname === '/';
    const currentOrderBy =
        (searchParams?.get('orderBy') as OrderByType) || OrderByType.NEWEST;

    const handleOrderChange = (orderBy: string) => {
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

    const options = ORDER_BY_OPTIONS.map((orderBy) => ({
        value: orderBy,
        label: getOrderLabel(orderBy),
    }));

    return (
        <Dropdown
            options={options}
            value={currentOrderBy}
            onChange={handleOrderChange}
            ariaLabel={t('order_by') || 'Order by'}
            renderButton={(isOpen, _, selectedLabel) => (
                <div
                    className="relative flex items-center gap-1 rounded-full bg-neutral-100 px-2 py-2 text-sm text-neutral-600 shadow-xs transition hover:bg-neutral-200 hover:shadow-md lg:px-3 dark:bg-neutral-800 dark:text-neutral-400 dark:hover:bg-neutral-700"
                >
                    {/* Mobile: Show reorder icon only */}
                    <div className="flex items-center gap-1 lg:hidden">
                        <IoReorderThree size={18} />
                    </div>

                    {/* Desktop: Show text and dropdown arrow */}
                    <div className="hidden items-center gap-1 lg:flex">
                        <span className="text-sm">
                            {selectedLabel}
                        </span>
                        <FiChevronDown
                            size={14}
                            className={`transition-transform ${
                                isOpen ? 'rotate-180' : ''
                            }`}
                        />
                    </div>

                    {/* Notification circle when non-default order is selected */}
                    {currentOrderBy !== OrderByType.NEWEST && (
                        <span className="absolute -top-1 -right-1 h-3 w-3 rounded-full border-2 border-white bg-rose-500 dark:border-neutral-900"></span>
                    )}
                </div>
            )}
        />
    );
};

export default OrderByDropdown;
