'use client';

import dynamic from 'next/dynamic';
import FooterSkeleton from '@/app/components/footer/FooterSkeleton';

const Footer = dynamic(() => import('@/app/components/footer/Footer'), {
    ssr: false,
    loading: () => <FooterSkeleton />,
});

export default function SmartFooter() {
    return <Footer />;
}
