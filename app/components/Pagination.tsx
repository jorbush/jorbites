'use client';

import { useRouter } from 'next/navigation';
import { FiChevronLeft, FiChevronRight } from 'react-icons/fi';
import { useTranslation } from "react-i18next";

interface PaginationProps {
  totalPages: number;
  currentPage: number;
  searchParams: any;
}

const Pagination = ({ totalPages, currentPage, searchParams }: PaginationProps) => {
  const router = useRouter();
  const { t } = useTranslation();

  const handlePageChange = (page: number) => {
    const newSearchParams = { ...searchParams, page };
    const queryString = new URLSearchParams(newSearchParams).toString();
    const newUrl = `?${queryString}`;

    router.push(newUrl);
  };

  return (
    <div className="flex justify-center mt-10 pt-10">
      <button className="
            py-2
            px-3
            items-center
            bg-green-450
            rounded-md
            text-white
            dark:text-dark
            shadow-sm
            hover:shadow-md
            transition
            cursor-pointer
            disabled:opacity-50
        "
        onClick={() => handlePageChange(+currentPage - 1)}
        disabled={currentPage <= 1}
        >
          <FiChevronLeft className="text-xl" />
      </button>
      <span className="px-4 py-2">{currentPage} {t('of')} {totalPages}</span>
      <button className="
            py-2
            px-3
            items-center
            bg-green-450
            rounded-md
            text-white
            dark:text-dark
            shadow-sm
            hover:shadow-md
            transition
            cursor-pointer
            disabled:opacity-50
        "
        onClick={() => handlePageChange(+currentPage + 1)}
        disabled={currentPage >= totalPages}
        >
          <FiChevronRight className="text-xl" />
      </button>
    </div>
  );
};

export default Pagination;
