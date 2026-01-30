'use client';

import { useEffect, useState, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { FiRefreshCw } from 'react-icons/fi';

interface PullToRefreshProps {
    threshold?: number;
    indicator?: boolean;
}

const PullToRefresh: React.FC<PullToRefreshProps> = ({
    threshold = 150,
    indicator = true,
}) => {
    const startYRef = useRef<number | null>(null);
    const pullDistanceRef = useRef<number>(0);
    const [refreshing, setRefreshing] = useState(false);
    const [displayPullDistance, setDisplayPullDistance] = useState(0);
    const router = useRouter();

    // Helper function to check if the touch event is inside a modal
    const isInsideModal = useCallback((target: Node): boolean => {
        const modalOpen = document.querySelector('.z-50');
        if (!modalOpen) return false;

        let targetElement = target;
        while (targetElement) {
            if (
                targetElement instanceof Element &&
                targetElement.classList.contains('z-50')
            ) {
                return true;
            }
            targetElement = targetElement.parentNode as Node;
        }
        return false;
    }, []);

    useEffect(() => {
        const handleTouchStart = (e: TouchEvent) => {
            if (isInsideModal(e.target as Node)) {
                return;
            }

            if (window.scrollY <= 0) {
                startYRef.current = e.touches[0].clientY;
            } else {
                startYRef.current = null;
            }
        };

        const handleTouchMove = (e: TouchEvent) => {
            if (isInsideModal(e.target as Node)) {
                return;
            }

            if (startYRef.current !== null) {
                const currentY = e.touches[0].clientY;
                const distance = currentY - startYRef.current;

                if (distance > 0) {
                    pullDistanceRef.current = distance;
                    setDisplayPullDistance(distance);
                    if (distance > 10) {
                        e.preventDefault();
                    }
                }
            }
        };

        const handleTouchEnd = () => {
            if (startYRef.current !== null) {
                if (pullDistanceRef.current > threshold) {
                    setRefreshing(true);
                    setTimeout(() => {
                        router.refresh();
                        setTimeout(() => {
                            setRefreshing(false);
                        }, 500);
                    }, 800);
                }
                startYRef.current = null;
                pullDistanceRef.current = 0;
                setDisplayPullDistance(0);
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
    }, [threshold, router, isInsideModal]);

    return (
        <>
            {(displayPullDistance > 0 || refreshing) && indicator && (
                <div
                    className="fixed left-0 z-20 flex w-full justify-center transition-transform"
                    style={{
                        top: '70px',
                        transform: `translateY(${Math.min(displayPullDistance / 2.5, threshold / 2)}px)`,
                        opacity: Math.min(displayPullDistance / threshold, 1),
                    }}
                >
                    <div className="text-green-450 border-green-450 flex items-center justify-center rounded-full border bg-white p-3 shadow-lg dark:bg-black">
                        <FiRefreshCw
                            size={24}
                            className={`text-green-450 ${refreshing ? 'animate-spin' : ''}`}
                            style={
                                refreshing
                                    ? undefined
                                    : {
                                          transform: `rotate(${Math.min((displayPullDistance / threshold) * 360, 360)}deg)`,
                                      }
                            }
                        />
                    </div>
                </div>
            )}
        </>
    );
};

export default PullToRefresh;
