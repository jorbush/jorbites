'use client';

import { Suspense } from 'react';
import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import { useTranslation } from 'react-i18next';
import {
    OrderByType,
    ORDER_BY_OPTIONS,
    ORDER_BY_LABELS,
    ORDER_BY_FALLBACK_LABELS,
} from '@/app/utils/filter';
import Dropdown from '@/app/components/utils/Dropdown';

const OrderByDropdownComponent: React.FC = () => {
    const { t } = useTranslation();
    const { replace } = useRouter() || {};
    const searchParams = useSearchParams();
    const get = searchParams ? searchParams.get.bind(searchParams) : () => null;
    const pathname = usePathname();

    const isMainPage = pathname === '/';
    const isProfilePage = pathname?.startsWith('/profile/');
    const isFavoritesPage = pathname === '/favorites';
    const currentOrderBy =
        (get('orderBy') as OrderByType) || OrderByType.NEWEST;

    const handleOrderChange = (orderBy: OrderByType) => {
        if (!isMainPage && !isProfilePage && !isFavoritesPage) return;
        const params = new URLSearchParams(searchParams?.toString() || '');
        if (orderBy === OrderByType.NEWEST) {
            params.delete('orderBy');
        } else {
            params.set('orderBy', orderBy);
        }
        params.set('page', '1');
        const newUrl = isMainPage
            ? params.toString()
                ? `/?${params.toString()}`
                : '/'
            : `${pathname}?${params.toString()}`;
        replace(newUrl, { scroll: false });
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
        <div className="flex items-center gap-1">
            <span className="text-sm">{getOrderLabel(currentOrderBy)}</span>
        </div>
    );

    return (
        <Dropdown
            options={options}
            value={currentOrderBy}
            onChange={handleOrderChange}
            buttonContent={buttonContent}
            ariaLabel={t('order_by') || 'Order by'}
            showNotification={currentOrderBy !== OrderByType.NEWEST}
            chevronClassName=""
        />
    );
};

const OrderByDropdown: React.FC = () => (
    <Suspense fallback={null}>
        <OrderByDropdownComponent />
    </Suspense>
);

export default OrderByDropdown;
