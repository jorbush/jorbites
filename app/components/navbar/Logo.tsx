'use client';

import { useRouter } from 'next/navigation';

const Logo = () => {
    const router = useRouter();

    let logoPath = '/images/logo-nobg.webp';

    if (localStorage.getItem('theme') === 'dark') {
        logoPath = '/images/no_bg_white.webp';
    }

    return (
        <img
            onClick={() => router.push('/')}
            alt="Logo"
            className="h-auto w-32 cursor-pointer md:block"
            height="29"
            width="128"
            src={logoPath}
            data-cy="logo"
            fetchPriority="high"
        />
    );
};

export default Logo;
