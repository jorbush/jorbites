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
                {/* Astronaut Illustration */}
                <div className="relative h-48 w-48">
                    <svg
                        viewBox="0 0 200 200"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-full w-full"
                    >
                        {/* Space background circles */}
                        <circle
                            cx="100"
                            cy="100"
                            r="90"
                            fill="#8B5CF6"
                            opacity="0.2"
                        />
                        <circle
                            cx="100"
                            cy="100"
                            r="70"
                            fill="#8B5CF6"
                            opacity="0.3"
                        />

                        {/* Stars */}
                        <circle
                            cx="40"
                            cy="40"
                            r="2"
                            fill="#FFF"
                        />
                        <circle
                            cx="160"
                            cy="50"
                            r="2"
                            fill="#FFF"
                        />
                        <circle
                            cx="50"
                            cy="150"
                            r="2"
                            fill="#FFF"
                        />
                        <circle
                            cx="150"
                            cy="140"
                            r="2"
                            fill="#FFF"
                        />

                        {/* Astronaut body */}
                        <ellipse
                            cx="100"
                            cy="130"
                            rx="30"
                            ry="40"
                            fill="#8B5CF6"
                        />

                        {/* Astronaut helmet */}
                        <circle
                            cx="100"
                            cy="70"
                            r="35"
                            fill="#A78BFA"
                        />

                        {/* Helmet glass */}
                        <ellipse
                            cx="100"
                            cy="70"
                            rx="25"
                            ry="28"
                            fill="#E9D5FF"
                            opacity="0.5"
                        />

                        {/* Face */}
                        <circle
                            cx="92"
                            cy="65"
                            r="3"
                            fill="#6B21A8"
                        />
                        <circle
                            cx="108"
                            cy="65"
                            r="3"
                            fill="#6B21A8"
                        />
                        <path
                            d="M 92 75 Q 100 80 108 75"
                            stroke="#6B21A8"
                            strokeWidth="2"
                            fill="none"
                            strokeLinecap="round"
                        />

                        {/* Laptop */}
                        <rect
                            x="115"
                            y="55"
                            width="30"
                            height="25"
                            rx="2"
                            fill="#C084FC"
                            transform="rotate(15 130 67.5)"
                        />
                        <rect
                            x="117"
                            y="57"
                            width="26"
                            height="18"
                            fill="#E9D5FF"
                            transform="rotate(15 130 66)"
                        />

                        {/* Arms */}
                        <ellipse
                            cx="70"
                            cy="120"
                            rx="8"
                            ry="25"
                            fill="#8B5CF6"
                            transform="rotate(-20 70 120)"
                        />
                        <ellipse
                            cx="130"
                            cy="120"
                            rx="8"
                            ry="25"
                            fill="#8B5CF6"
                            transform="rotate(20 130 120)"
                        />
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
                    No Internet connection
                </p>
            </div>
        </div>
    );
}
