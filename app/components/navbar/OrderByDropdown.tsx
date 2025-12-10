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

interface OrderByDropdownProps {
    renderAsIcon?: boolean;
}

const OrderByDropdown: React.FC<OrderByDropdownProps> = ({
    renderAsIcon,
}) => {
    const { t } = useTranslation();
    const router = useRouter();
    const searchParams = useSearchParams();
    const pathname = usePathname();

    const isMainPage = pathname === '/';
    const isProfilePage = pathname?.startsWith('/profile/');
    const isFavoritesPage = pathname === '/favorites';
    const currentOrderBy =
        (searchParams?.get('orderBy') as OrderByType) || OrderByType.NEWEST;

    const handleOrderChange = (orderBy: OrderByType) => {
        if (!isMainPage && !isProfilePage && !isFavoritesPage) return;
        const params = new URLSearchParams(searchParams?.toString() || '');
        if (orderBy === OrderByType.NEWEST) {
            params.delete('orderBy');
        } else {
            params.set('orderBy', orderBy);
        }
        // Reset pagination to page 1 when order changes
        if (isProfilePage || isFavoritesPage) {
            params.set('page', '1');
        }
        const newUrl = isMainPage
            ? params.toString()
                ? `/?${params.toString()}`
                : '/'
            : `${pathname}?${params.toString()}`;
        router.replace(newUrl, { scroll: false });
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
            {renderAsIcon ? (
                <IoReorderThree size={18} />
            ) : (
                <>
                    {/* Mobile: Show reorder icon only on main page, show text on profile and favorites */}
                    <div
                        className={`flex items-center gap-1 ${isProfilePage || isFavoritesPage ? '' : 'lg:hidden'}`}
                    >
                        {isProfilePage || isFavoritesPage ? (
                            <span className="text-sm">
                                {getOrderLabel(currentOrderBy)}
                            </span>
                        ) : (
                            <IoReorderThree size={18} />
                        )}
                    </div>

                    {/* Desktop: Show text on main page */}
                    {!isProfilePage && !isFavoritesPage && (
                        <div className="hidden items-center gap-1 lg:flex">
                            <span className="text-sm">
                                {getOrderLabel(currentOrderBy)}
                            </span>
                        </div>
                    )}
                </>
            )}
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
            chevronClassName={
                renderAsIcon
                    ? 'hidden'
                    : isProfilePage || isFavoritesPage
                      ? ''
                      : 'hidden lg:inline'
            }
        />
    );
};

export default OrderByDropdown;
