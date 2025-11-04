'use client';

import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import { IoReorderThree } from 'react-icons/io5';
import { useTranslation } from 'react-i18next';
import {
    OrderByType,
    ORDER_BY_OPTIONS,
    ORDER_BY_LABELS,
    ORDER_BY_FALLBACK_LABELS,
} from '@/app/utils/filter';
import Dropdown from '@/app/components/utils/Dropdown';

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

    const options = ORDER_BY_OPTIONS.map((orderBy) => ({
        value: orderBy,
        label: getOrderLabel(orderBy),
    }));

    const buttonContent = (
        <>
            {/* Mobile: Show reorder icon only */}
            <div className="flex items-center gap-1 lg:hidden">
                <IoReorderThree size={18} />
            </div>

            {/* Desktop: Show text and dropdown arrow */}
            <div className="hidden items-center gap-1 lg:flex">
                <span className="text-sm">{getOrderLabel(currentOrderBy)}</span>
            </div>
        </>
    );

    return (
        <Dropdown
            options={options}
            value={currentOrderBy}
            onChange={handleOrderChange}
            buttonContent={buttonContent}
            ariaLabel={t('order_by') || 'Order by'}
            showNotification={currentOrderBy !== OrderByType.NEWEST}
        />
    );
};

export default OrderByDropdown;
