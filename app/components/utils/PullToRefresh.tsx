'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { FiRefreshCw } from 'react-icons/fi';

interface PullToRefreshProps {
    threshold?: number; // Distance in px to trigger refresh
    indicator?: boolean; // Whether to show a loading indicator
}

const PullToRefresh: React.FC<PullToRefreshProps> = ({
    threshold = 150,
    indicator = true,
}) => {
    const [startY, setStartY] = useState<number | null>(null);
    const [pullDistance, setPullDistance] = useState(0);
    const [refreshing, setRefreshing] = useState(false);
    const router = useRouter();

    useEffect(() => {
        const handleTouchStart = (e: TouchEvent) => {
            if (window.scrollY <= 0) {
                setStartY(e.touches[0].clientY);
            } else {
                setStartY(null);
            }
        };

        const handleTouchMove = (e: TouchEvent) => {
            if (startY !== null) {
                const currentY = e.touches[0].clientY;
                const distance = currentY - startY;

                if (distance > 0) {
                    setPullDistance(distance);
                    if (distance > 10) {
                        e.preventDefault();
                    }
                }
            }
        };

        const handleTouchEnd = () => {
            if (startY !== null) {
                if (pullDistance > threshold) {
                    setRefreshing(true);
                    setTimeout(() => {
                        router.refresh();
                        window.location.reload();
                    }, 500);
                }
                setStartY(null);
                setPullDistance(0);
            }
        };

        document.addEventListener('touchstart', handleTouchStart, {
            passive: false,
        });
        document.addEventListener('touchmove', handleTouchMove, {
            passive: false,
        });
        document.addEventListener('touchend', handleTouchEnd);

        return () => {
            document.removeEventListener('touchstart', handleTouchStart);
            document.removeEventListener('touchmove', handleTouchMove);
            document.removeEventListener('touchend', handleTouchEnd);
        };
    }, [startY, pullDistance, threshold, router]);

    return (
        <>
            {(pullDistance > 0 || refreshing) && indicator && (
                <div
                    className="fixed left-0 z-20 flex w-full justify-center transition-transform"
                    style={{
                        // Position below the navbar
                        top: '70px',
                        transform: `translateY(${Math.min(pullDistance / 2.5, threshold / 2)}px)`,
                        opacity: Math.min(pullDistance / threshold, 1),
                    }}
                >
                    <div className="text-green-450 border-green-450 flex items-center justify-center rounded-full border bg-white p-3 shadow-lg dark:bg-gray-800">
                        {refreshing ? (
                            <svg
                                className="text-green-450 h-6 w-6 animate-spin"
                                xmlns="http://www.w3.org/2000/svg"
                                fill="none"
                                viewBox="0 0 24 24"
                            >
                                <circle
                                    className="opacity-25"
                                    cx="12"
                                    cy="12"
                                    r="10"
                                    stroke="currentColor"
                                    strokeWidth="4"
                                ></circle>
                                <path
                                    className="opacity-75"
                                    fill="currentColor"
                                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                                ></path>
                            </svg>
                        ) : (
                            <FiRefreshCw
                                size={24}
                                className="text-green-450"
                                style={{
                                    transform: `rotate(${Math.min((pullDistance / threshold) * 360, 360)}deg)`,
                                }}
                            />
                        )}
                    </div>
                </div>
            )}
        </>
    );
};

export default PullToRefresh;
