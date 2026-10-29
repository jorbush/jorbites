'use client';

import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import {
    FiShare,
    FiPlusSquare,
    FiMoreVertical,
    FiDownload,
    FiCheckCircle,
    FiSmartphone,
} from 'react-icons/fi';
import { Platform, PwaStep, BeforeInstallPromptEvent } from './pwa/types';
import PwaHeader from './pwa/PwaHeader';
import PwaPlatformTabs from './pwa/PwaPlatformTabs';
import PwaStepCards from './pwa/PwaStepCards';
import PwaBenefits from './pwa/PwaBenefits';

const FooterPwaInstall: React.FC = () => {
    const { t } = useTranslation();
    const [platform, setPlatform] = useState<Platform>('ios');
    const [deferredPrompt, setDeferredPrompt] =
        useState<BeforeInstallPromptEvent | null>(null);
    const [isInstalled, setIsInstalled] = useState<boolean>(false);
    const [isExpanded, setIsExpanded] = useState<boolean>(false);

    useEffect(() => {
        if (typeof window === 'undefined') return;

        // Auto-detect platform from User Agent
        const ua = window.navigator.userAgent.toLowerCase();
        if (/iphone|ipad|ipod/.test(ua)) {
            setPlatform('ios');
        } else if (/android/.test(ua)) {
            setPlatform('android');
        } else {
            setPlatform('desktop');
        }

        // Check if already running standalone
        const isStandalone =
            (typeof window.matchMedia === 'function' &&
                window.matchMedia('(display-mode: standalone)').matches) ||
            (window.navigator as unknown as { standalone?: boolean })
                ?.standalone === true;
        setIsInstalled(isStandalone);

        // Listen for PWA install prompt on supported browsers
        const handleBeforeInstallPrompt = (e: Event) => {
            e.preventDefault();
            setDeferredPrompt(e as BeforeInstallPromptEvent);
        };

        const handleAppInstalled = () => {
            setIsInstalled(true);
            setDeferredPrompt(null);
        };

        window.addEventListener(
            'beforeinstallprompt',
            handleBeforeInstallPrompt
        );
        window.addEventListener('appinstalled', handleAppInstalled);

        return () => {
            window.removeEventListener(
                'beforeinstallprompt',
                handleBeforeInstallPrompt
            );
            window.removeEventListener('appinstalled', handleAppInstalled);
        };
    }, []);

    const handleInstallClick = async () => {
        if (!deferredPrompt) return;
        try {
            await deferredPrompt.prompt();
            const { outcome } = await deferredPrompt.userChoice;
            if (outcome === 'accepted') {
                setIsInstalled(true);
            }
            setDeferredPrompt(null);
        } catch {
            // User cancelled or unsupported
        }
    };

    const stepsMap: Record<Platform, PwaStep[]> = {
        ios: [
            {
                number: 1,
                icon: FiShare,
                title: t('footer_pwa_ios_step1_title'),
                desc: t('footer_pwa_ios_step1_desc'),
            },
            {
                number: 2,
                icon: FiPlusSquare,
                title: t('footer_pwa_ios_step2_title'),
                desc: t('footer_pwa_ios_step2_desc'),
            },
            {
                number: 3,
                icon: FiCheckCircle,
                title: t('footer_pwa_ios_step3_title'),
                desc: t('footer_pwa_ios_step3_desc'),
            },
        ],
        android: [
            {
                number: 1,
                icon: FiMoreVertical,
                title: t('footer_pwa_android_step1_title'),
                desc: t('footer_pwa_android_step1_desc'),
            },
            {
                number: 2,
                icon: FiDownload,
                title: t('footer_pwa_android_step2_title'),
                desc: t('footer_pwa_android_step2_desc'),
            },
            {
                number: 3,
                icon: FiCheckCircle,
                title: t('footer_pwa_android_step3_title'),
                desc: t('footer_pwa_android_step3_desc'),
            },
        ],
        desktop: [
            {
                number: 1,
                icon: FiDownload,
                title: t('footer_pwa_desktop_step1_title'),
                desc: t('footer_pwa_desktop_step1_desc'),
            },
            {
                number: 2,
                icon: FiCheckCircle,
                title: t('footer_pwa_desktop_step2_title'),
                desc: t('footer_pwa_desktop_step2_desc'),
            },
            {
                number: 3,
                icon: FiSmartphone,
                title: t('footer_pwa_desktop_step3_title'),
                desc: t('footer_pwa_desktop_step3_desc'),
            },
        ],
    };

    if (isInstalled) {
        return null;
    }

    return (
        <section
            id="pwa-install-guide"
            aria-label={String(t('footer_pwa_title'))}
            className="w-full max-w-4xl rounded-2xl border border-neutral-200/90 bg-neutral-50/70 p-4 transition-colors duration-200 sm:p-6 dark:border-neutral-800 dark:bg-neutral-900/50"
            data-testid="footer-pwa-install"
        >
            <div className="flex flex-col gap-4">
                <PwaHeader
                    hasDeferredPrompt={Boolean(deferredPrompt)}
                    isExpanded={isExpanded}
                    onInstall={handleInstallClick}
                    onToggle={() => setIsExpanded((prev) => !prev)}
                />

                <div
                    data-testid="pwa-collapsible-wrapper"
                    className={`grid transition-[grid-template-rows,opacity] duration-300 ease-in-out ${
                        isExpanded
                            ? 'grid-rows-[1fr] opacity-100'
                            : 'pointer-events-none grid-rows-[0fr] opacity-0'
                    }`}
                >
                    <div className="overflow-hidden">
                        <div className="flex flex-col gap-4 pt-1">
                            <PwaPlatformTabs
                                platform={platform}
                                onSelectPlatform={setPlatform}
                            />
                            <PwaStepCards
                                platform={platform}
                                steps={stepsMap[platform]}
                            />
                            <PwaBenefits />
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default FooterPwaInstall;
