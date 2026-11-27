'use client';

import { useRouter } from 'next/navigation';
import Image from 'next/image';

const Logo = () => {
    const { push } = useRouter() || {};

    return (
        <button
            type="button"
            onClick={() => push('/')}
            data-cy="logo"
            aria-label="Jorbites"
            className="group flex cursor-pointer items-center gap-1.5 border-0 bg-transparent p-0 focus:outline-hidden"
        >
            <Image
                alt="Jorbites Logo"
                className="h-7 w-auto transition-transform duration-200 group-hover:scale-105"
                height={194}
                width={222}
                src="/avocado.webp"
                priority
            />
            <span className="text-[1.375rem] leading-none font-extrabold tracking-tight text-[#0F0F0F] dark:text-white">
                Jorbites
            </span>
        </button>
    );
};

export default Logo;
