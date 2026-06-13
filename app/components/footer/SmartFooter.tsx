'use client';

import { useSyncExternalStore } from 'react';
import dynamic from 'next/dynamic';
import FooterSkeleton from '@/app/components/footer/FooterSkeleton';

const ClientFooter = dynamic(() => import('@/app/components/footer/Footer'), {
    ssr: false,
    loading: () => <FooterSkeleton />,
});

const subscribe = () => () => {};

export default function SmartFooter() {
    const mounted = useSyncExternalStore(
        subscribe,
        () => true,
        () => false
    );

    return mounted ? <ClientFooter /> : <FooterSkeleton />;
}
