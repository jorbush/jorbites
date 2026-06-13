'use client';

import dynamic from 'next/dynamic';
import FooterSkeleton from '@/app/components/footer/FooterSkeleton';
import useIsMounted from '@/app/hooks/useIsMounted';

const ClientFooter = dynamic(() => import('@/app/components/footer/Footer'), {
    ssr: false,
    loading: () => <FooterSkeleton />,
});

export default function SmartFooter() {
    const mounted = useIsMounted();

    return mounted ? <ClientFooter /> : <FooterSkeleton />;
}
