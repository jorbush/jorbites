'use client';

import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';

const Logo = () => {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(true);
    let logoImagePath = '/images/logo-nobg.webp';

    if (localStorage.getItem('theme') === 'dark') {
        logoImagePath = '/images/no_bg_white.webp';
    }

    useEffect(() => {
        setIsLoading(false);
    }, []);

    if (isLoading) {
        return (
            <div
                className="h-7 w-32 animate-pulse cursor-pointer rounded bg-gray-200 dark:bg-gray-700 md:block"
                onClick={() => router.push('/')}
                data-cy="logo-skeleton"
            />
        );
    }
    return (
        <Image
            onClick={() => router.push('/')}
            alt="Logo"
            className="cursor-pointer md:block"
            height="29"
            width="128"
            unoptimized
            src={logoImagePath}
            data-cy="logo"
            priority
        />
    );
};

export default Logo;
