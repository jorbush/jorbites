'use client';

import { useEffect, useRef } from 'react';
import { usePathname } from 'next/navigation';
import { trackAnalyticsEvent } from '@/app/lib/analytics/client';

export default function AnalyticsTracker() {
    const pathname = usePathname();
    const lastTrackedPathRef = useRef<string | null>(null);

    useEffect(() => {
        if (!pathname || lastTrackedPathRef.current === pathname) {
            return;
        }
        lastTrackedPathRef.current = pathname;

        const isDark =
            typeof document !== 'undefined' &&
            document.documentElement.classList.contains('dark');

        trackAnalyticsEvent(
            'page',
            'page_view',
            { theme: isDark ? 'dark' : 'light' },
            { path: pathname }
        );
    }, [pathname]);

    return null;
}
