'use client';

import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import Image from 'next/image';
import { FaApple, FaAndroid, FaDesktop } from 'react-icons/fa';
import {
    FiShare,
    FiPlusSquare,
    FiMoreVertical,
    FiDownload,
    FiCheckCircle,
    FiSmartphone,
    FiZap,
    FiBell,
    FiChevronDown,
    FiChevronUp,
} from 'react-icons/fi';

type Platform = 'ios' | 'android' | 'desktop';

interface BeforeInstallPromptEvent extends Event {
    prompt: () => Promise<void>;
    userChoice: Promise<{
        outcome: 'accepted' | 'dismissed';
        platform: string;
    }>;
}

const FooterPwaInstall: React.FC = () => {
    const { t } = useTranslation();
    const [platform, setPlatform] = useState<Platform>('ios');
    const [deferredPrompt, setDeferredPrompt] =
        useState<BeforeInstallPromptEvent | null>(null);
    const [isInstalled, setIsInstalled] = useState<boolean>(false);
    const [isExpanded, setIsExpanded] = useState<boolean>(true);

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

    const steps = {
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

    return (
        <section
            id="pwa-install-guide"
            aria-label={String(t('footer_pwa_title'))}
            className="w-full max-w-4xl rounded-2xl border border-neutral-200/90 bg-neutral-50/70 p-4 transition-all duration-200 sm:p-6 dark:border-neutral-800 dark:bg-neutral-900/50"
            data-testid="footer-pwa-install"
        >
            <div className="flex flex-col gap-4">
                {/* Header row */}
                <div className="flex flex-wrap items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                        <div className="relative flex size-10 shrink-0 items-center justify-center rounded-xl bg-white shadow-xs dark:bg-neutral-800">
                            <Image
                                src="/avocado.webp"
                                alt="Jorbites"
                                width={28}
                                height={28}
                                className="size-7 object-contain"
                            />
                        </div>
                        <div>
                            <div className="flex flex-wrap items-center gap-2">
                                <h3 className="text-base font-bold text-neutral-800 dark:text-neutral-100">
                                    {t('footer_pwa_title')}
                                </h3>
                                <span className="inline-flex items-center rounded-md bg-emerald-100 px-2 py-0.5 text-[11px] font-semibold text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-300">
                                    {t('footer_pwa_badge')}
                                </span>
                            </div>
                            <p className="mt-0.5 text-xs text-neutral-500 dark:text-neutral-400">
                                {t('footer_pwa_description')}
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center gap-2">
                        {isInstalled && (
                            <span
                                data-testid="pwa-installed-badge"
                                className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300"
                            >
                                <FiCheckCircle className="size-3.5" />
                                {t('footer_pwa_btn_installed')}
                            </span>
                        )}

                        {deferredPrompt && !isInstalled && (
                            <button
                                type="button"
                                onClick={handleInstallClick}
                                data-testid="pwa-install-button"
                                className="inline-flex items-center gap-2 rounded-lg bg-neutral-900 px-3.5 py-1.5 text-xs font-semibold text-white shadow-xs transition hover:bg-neutral-800 active:scale-95 dark:bg-white dark:text-neutral-900 dark:hover:bg-neutral-100"
                            >
                                <FiDownload className="size-3.5" />
                                {t('footer_pwa_btn_install')}
                            </button>
                        )}

                        <button
                            type="button"
                            onClick={() => setIsExpanded(!isExpanded)}
                            aria-expanded={isExpanded}
                            aria-label={String(
                                isExpanded
                                    ? t('footer_pwa_toggle_hide')
                                    : t('footer_pwa_toggle_show')
                            )}
                            data-testid="pwa-toggle-button"
                            className="inline-flex items-center gap-1 rounded-lg border border-neutral-200 bg-white px-2.5 py-1.5 text-xs font-medium text-neutral-600 transition hover:bg-neutral-100 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-300 dark:hover:bg-neutral-700"
                        >
                            <span>
                                {isExpanded
                                    ? t('footer_pwa_toggle_hide')
                                    : t('footer_pwa_toggle_show')}
                            </span>
                            {isExpanded ? (
                                <FiChevronUp className="size-3.5" />
                            ) : (
                                <FiChevronDown className="size-3.5" />
                            )}
                        </button>
                    </div>
                </div>

                {/* Collapsible content */}
                {isExpanded && (
                    <div className="flex flex-col gap-4 pt-1">
                        {/* Platform tabs */}
                        <div
                            role="tablist"
                            aria-label="PWA Platform Instructions"
                            className="inline-flex self-start rounded-xl bg-neutral-200/70 p-1 dark:bg-neutral-800/80"
                        >
                            <button
                                type="button"
                                role="tab"
                                id="pwa-tab-ios"
                                aria-selected={platform === 'ios'}
                                aria-controls="pwa-panel-ios"
                                data-testid="pwa-tab-ios"
                                onClick={() => setPlatform('ios')}
                                className={`inline-flex items-center gap-2 rounded-lg px-3 py-1.5 text-xs font-medium transition-all ${
                                    platform === 'ios'
                                        ? 'bg-white font-semibold text-neutral-900 shadow-xs dark:bg-neutral-700 dark:text-white'
                                        : 'text-neutral-600 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-white'
                                }`}
                            >
                                <FaApple className="size-3.5" />
                                <span>{t('footer_pwa_tab_ios')}</span>
                            </button>

                            <button
                                type="button"
                                role="tab"
                                id="pwa-tab-android"
                                aria-selected={platform === 'android'}
                                aria-controls="pwa-panel-android"
                                data-testid="pwa-tab-android"
                                onClick={() => setPlatform('android')}
                                className={`inline-flex items-center gap-2 rounded-lg px-3 py-1.5 text-xs font-medium transition-all ${
                                    platform === 'android'
                                        ? 'bg-white font-semibold text-neutral-900 shadow-xs dark:bg-neutral-700 dark:text-white'
                                        : 'text-neutral-600 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-white'
                                }`}
                            >
                                <FaAndroid className="size-3.5" />
                                <span>{t('footer_pwa_tab_android')}</span>
                            </button>

                            <button
                                type="button"
                                role="tab"
                                id="pwa-tab-desktop"
                                aria-selected={platform === 'desktop'}
                                aria-controls="pwa-panel-desktop"
                                data-testid="pwa-tab-desktop"
                                onClick={() => setPlatform('desktop')}
                                className={`inline-flex items-center gap-2 rounded-lg px-3 py-1.5 text-xs font-medium transition-all ${
                                    platform === 'desktop'
                                        ? 'bg-white font-semibold text-neutral-900 shadow-xs dark:bg-neutral-700 dark:text-white'
                                        : 'text-neutral-600 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-white'
                                }`}
                            >
                                <FaDesktop className="size-3.5" />
                                <span>{t('footer_pwa_tab_desktop')}</span>
                            </button>
                        </div>

                        {/* Step cards */}
                        <div
                            id={`pwa-panel-${platform}`}
                            role="tabpanel"
                            aria-labelledby={`pwa-tab-${platform}`}
                            data-testid="pwa-steps-container"
                            className="grid grid-cols-1 gap-3 sm:grid-cols-3"
                        >
                            {steps[platform].map((step) => {
                                const Icon = step.icon;
                                return (
                                    <div
                                        key={step.number}
                                        className="flex flex-col gap-2 rounded-xl border border-neutral-200/80 bg-white p-3.5 shadow-2xs dark:border-neutral-800 dark:bg-neutral-800/80"
                                    >
                                        <div className="flex items-center justify-between">
                                            <span className="inline-flex size-6 items-center justify-center rounded-full bg-neutral-100 text-xs font-bold text-neutral-700 dark:bg-neutral-700 dark:text-neutral-200">
                                                {step.number}
                                            </span>
                                            <div className="flex size-7 items-center justify-center rounded-lg bg-neutral-50 text-neutral-600 dark:bg-neutral-700/60 dark:text-neutral-300">
                                                <Icon className="size-3.5" />
                                            </div>
                                        </div>
                                        <div>
                                            <h4 className="text-xs font-semibold text-neutral-900 dark:text-neutral-100">
                                                {step.title}
                                            </h4>
                                            <p className="mt-1 text-[11px] leading-relaxed text-neutral-500 dark:text-neutral-400">
                                                {step.desc}
                                            </p>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>

                        {/* Benefits row */}
                        <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 border-t border-neutral-200/60 pt-3 text-xs text-neutral-500 dark:border-neutral-800 dark:text-neutral-400">
                            <div className="flex items-center gap-1.5">
                                <FiSmartphone className="size-3.5 text-neutral-600 dark:text-neutral-300" />
                                <span>
                                    {t('footer_pwa_benefit_standalone')}
                                </span>
                            </div>
                            <div className="flex items-center gap-1.5">
                                <FiZap className="size-3.5 text-neutral-600 dark:text-neutral-300" />
                                <span>{t('footer_pwa_benefit_offline')}</span>
                            </div>
                            <div className="flex items-center gap-1.5">
                                <FiBell className="size-3.5 text-neutral-600 dark:text-neutral-300" />
                                <span>
                                    {t('footer_pwa_benefit_notifications')}
                                </span>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </section>
    );
};

export default FooterPwaInstall;
