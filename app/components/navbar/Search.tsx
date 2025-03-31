'use client';

import { BiSearch } from 'react-icons/bi';
import Logo from '@/app/components/navbar/Logo';
import { MouseEventHandler } from 'react';

interface SearchProps {
    onClick: MouseEventHandler<any>;
}

const Search: React.FC<SearchProps> = ({ onClick }) => {
    return (
        <div className="flex flex-row items-center gap-1 md:gap-3">
            <Logo />
            <div
                className="max-w-[35px] cursor-pointer rounded-full bg-green-450 p-2 text-white shadow-xs transition hover:shadow-md dark:text-dark"
                onClick={onClick}
            >
                <BiSearch size={18} />
            </div>
        </div>
    );
};
export default Search;
