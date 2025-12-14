'use client';

import Script from 'next/script';
import { useAds } from '@/app/providers/AdProvider';
import { ADSENSE_PUBLISHER_ID } from '@/app/utils/constants';

const AdSenseLoader = () => {
    const { showAds, isLoading } = useAds();

    // Don't load script until we know the user's preference
    if (isLoading || !showAds) {
        return null;
    }

    return (
        <Script
            async
            src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${ADSENSE_PUBLISHER_ID}`}
            crossOrigin="anonymous"
            strategy="lazyOnload"
        />
    );
};

export default AdSenseLoader;
