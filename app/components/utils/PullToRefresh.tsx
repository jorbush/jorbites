'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { FiRefreshCw } from 'react-icons/fi';
import { motion } from 'framer-motion';

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
                    }, 800);
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
                        top: '70px',
                        transform: `translateY(${Math.min(pullDistance / 2.5, threshold / 2)}px)`,
                        opacity: Math.min(pullDistance / threshold, 1),
                    }}
                >
                    <div className="text-green-450 border-green-450 flex items-center justify-center rounded-full border bg-white p-3 shadow-lg dark:bg-gray-800">
                        {refreshing ? (
                            <motion.div
                                animate={{ rotate: 360 }}
                                transition={{
                                    duration: 1,
                                    repeat: Infinity,
                                    ease: 'linear',
                                }}
                            >
                                <FiRefreshCw
                                    size={24}
                                    className="text-green-450"
                                />
                            </motion.div>
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
