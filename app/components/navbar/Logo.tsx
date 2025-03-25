'use client';

import Image from 'next/image';
import { useRouter } from 'next/navigation';

const Logo = () => {
    const router = useRouter();

    let logoImagePath = '/images/logo-nobg.webp';

    if (localStorage.getItem('theme') === 'dark') {
        logoImagePath = '/images/no_bg_white.webp';
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
        />
    );
};

export default Logo;
