'use client';

import { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import FooterSkeleton from './FooterSkeleton';

const ClientFooter = dynamic(() => import('./Footer'), {
    ssr: false,
    loading: () => <FooterSkeleton />,
});

export default function SmartFooter() {
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    return mounted ? <ClientFooter /> : <FooterSkeleton />;
}
