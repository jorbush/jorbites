'use client';

import { useRouter } from 'next/navigation';
import Image from 'next/image';

const Logo = () => {
    const router = useRouter();

    let logoPath = '/images/logo-nobg.webp';

    if (localStorage.getItem('theme') === 'dark') {
        logoPath = '/images/no_bg_white.webp';
    }

    return (
        <Image
            onClick={() => router.push('/')}
            alt="Logo"
            className="w-32 cursor-pointer md:block"
            height={29}
            width={128}
            src={logoPath}
            data-cy="logo"
            priority
        />
    );
};

export default Logo;
