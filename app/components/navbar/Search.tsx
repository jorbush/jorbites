'use client';

import { BiSearch } from 'react-icons/bi'
import Logo from './Logo';
import { MouseEventHandler } from 'react';

interface SearchProps {
    onClick: MouseEventHandler<any>
}

const Search: React.FC<SearchProps> = ({
    onClick
}) => {
    return (
        <div className="flex flex-row items-center gap-3">
            <Logo/>
            <div className="
                p-2
                bg-green-450
                rounded-full
                text-white
                dark:text-dark
                shadow-sm
                hover:shadow-md
                transition
                cursor-pointer
                max-w-[35px]
            "
            onClick={onClick}
            >
                <BiSearch size={18}/>
            </div>
        </div>
    );
}
export default Search