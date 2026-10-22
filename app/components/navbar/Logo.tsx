'use client';

import { useRouter } from 'next/navigation';
import Image from 'next/image';

const Logo = () => {
    const { push } = useRouter() || {};

    return (
        <button
            type="button"
            onClick={() => push('/')}
            className="flex shrink-0 items-center cursor-pointer border-0 bg-transparent p-0 focus:outline-hidden md:block"
        >
            <Image
                alt="Logo"
                className="h-auto w-32 shrink-0 dark:hidden"
                height={29}
                width={128}
                src="/images/logo-nobg.webp"
                data-cy="logo"
                priority
            />
            <Image
                alt="Logo"
                className="hidden h-auto w-32 shrink-0 dark:block"
                height={29}
                width={128}
                src="/images/no_bg_white.webp"
                data-cy="logo-dark"
                priority
            />
        </button>
    );
};

export default Logo;
