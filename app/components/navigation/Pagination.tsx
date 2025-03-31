'use client';

import { useRouter } from 'next/navigation';
import { FiChevronLeft, FiChevronRight } from 'react-icons/fi';
import { useTranslation } from 'react-i18next';

interface PaginationProps {
    totalPages: number;
    currentPage: number;
    searchParams: any;
}

const Pagination = ({
    totalPages,
    currentPage,
    searchParams,
}: PaginationProps) => {
    const router = useRouter();
    const { t } = useTranslation();

    const handlePageChange = (page: number) => {
        const newSearchParams = { ...searchParams, page };
        const queryString = new URLSearchParams(newSearchParams).toString();
        const newUrl = `?${queryString}`;

        router.push(newUrl);
    };

    return (
        <div
            className="mt-10 flex justify-center pt-10"
            role="navigation"
            aria-label="Pagination"
        >
            <button
                className="cursor-pointer items-center rounded-md bg-green-450 px-3 py-2 text-white shadow-xs transition hover:shadow-md disabled:opacity-50 dark:text-dark"
                onClick={() => handlePageChange(+currentPage - 1)}
                disabled={currentPage <= 1}
                aria-label="Previous page"
            >
                <FiChevronLeft
                    className="text-xl"
                    aria-hidden="true"
                />
            </button>
            <span className="px-4 py-2 dark:text-gray-600">
                {currentPage} {t('of')} {totalPages}
            </span>
            <button
                className="cursor-pointer items-center rounded-md bg-green-450 px-3 py-2 text-white shadow-xs transition hover:shadow-md disabled:opacity-50 dark:text-dark"
                onClick={() => handlePageChange(+currentPage + 1)}
                disabled={currentPage >= totalPages}
                aria-label="Next page"
            >
                <FiChevronRight
                    className="text-xl"
                    aria-hidden="true"
                />
            </button>
        </div>
    );
};

export default Pagination;
