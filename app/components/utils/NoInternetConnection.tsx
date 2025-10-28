'use client';

import { useTranslation } from 'react-i18next';
import Button from '@/app/components/buttons/Button';
import useOnlineStatus from '@/app/hooks/useOnlineStatus';

export default function NoInternetConnection() {
    const { t } = useTranslation();
    const isOnline = useOnlineStatus();

    const handleRetry = () => {
        window.location.reload();
    };

    if (isOnline) {
        return null;
    }

    return (
        <div className="dark:bg-dark fixed inset-0 z-50 flex items-center justify-center bg-white">
            <div className="flex flex-col items-center justify-center gap-6 px-4">
                {/* Avocado Illustration */}
                <div className="relative h-48 w-48">
                    <svg
                        viewBox="0 0 200 200"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-full w-full"
                    >
                        {/* Background circles */}
                        <circle
                            cx="100"
                            cy="100"
                            r="90"
                            fill="#86efac"
                            opacity="0.2"
                        />
                        <circle
                            cx="100"
                            cy="100"
                            r="70"
                            fill="#86efac"
                            opacity="0.3"
                        />

                        {/* Avocado outer (dark green) */}
                        <ellipse
                            cx="100"
                            cy="110"
                            rx="45"
                            ry="55"
                            fill="#4d7c0f"
                        />

                        {/* Avocado inner (light green flesh) */}
                        <ellipse
                            cx="100"
                            cy="110"
                            rx="35"
                            ry="45"
                            fill="#86efac"
                        />

                        {/* Avocado pit (brown) */}
                        <circle
                            cx="100"
                            cy="115"
                            r="18"
                            fill="#92400e"
                        />

                        {/* Face on pit - Eyes */}
                        <circle
                            cx="93"
                            cy="112"
                            r="3"
                            fill="#FFF"
                        />
                        <circle
                            cx="107"
                            cy="112"
                            r="3"
                            fill="#FFF"
                        />

                        {/* Face - Smile */}
                        <path
                            d="M 92 120 Q 100 125 108 120"
                            stroke="#FFF"
                            strokeWidth="2"
                            fill="none"
                            strokeLinecap="round"
                        />

                        {/* Disconnected WiFi symbol above avocado */}
                        <g transform="translate(100, 45)">
                            {/* WiFi arc 1 (outer) - crossed out */}
                            <path
                                d="M -20 0 Q 0 -20 20 0"
                                stroke="#ef4444"
                                strokeWidth="3"
                                fill="none"
                                strokeLinecap="round"
                            />
                            {/* WiFi arc 2 (middle) - crossed out */}
                            <path
                                d="M -13 5 Q 0 -8 13 5"
                                stroke="#ef4444"
                                strokeWidth="3"
                                fill="none"
                                strokeLinecap="round"
                            />
                            {/* WiFi arc 3 (inner) - crossed out */}
                            <path
                                d="M -7 10 Q 0 4 7 10"
                                stroke="#ef4444"
                                strokeWidth="3"
                                fill="none"
                                strokeLinecap="round"
                            />
                            {/* X mark through WiFi */}
                            <line
                                x1="-22"
                                y1="-5"
                                x2="22"
                                y2="15"
                                stroke="#ef4444"
                                strokeWidth="3"
                                strokeLinecap="round"
                            />
                            <line
                                x1="22"
                                y1="-5"
                                x2="-22"
                                y2="15"
                                stroke="#ef4444"
                                strokeWidth="3"
                                strokeLinecap="round"
                            />
                        </g>
                    </svg>
                </div>

                {/* Text content */}
                <div className="flex flex-col items-center gap-2 text-center">
                    <h1 className="text-2xl font-semibold dark:text-neutral-100">
                        {t('connect_to_internet')}
                    </h1>
                    <p className="text-neutral-600 dark:text-neutral-400">
                        {t('you_are_offline')}
                    </p>
                </div>

                {/* Retry button */}
                <div className="w-48">
                    <Button
                        outline
                        onClick={handleRetry}
                        label={t('retry')}
                    />
                </div>

                {/* No Internet connection text at bottom */}
                <p className="mt-8 text-sm text-neutral-500 dark:text-neutral-500">
                    {t('no_internet_connection')}
                </p>
            </div>
        </div>
    );
}
