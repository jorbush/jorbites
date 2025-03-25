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
            height="128"
            width="29"
            unoptimized
            src={logoImagePath}
            style={{ width: '128px', height: '29px' }}
            data-cy="logo"
        />
    );
};

export default Logo;
