'use client';

import { useEffect, useRef, useReducer, useEffectEvent } from 'react';
import { useRouter } from 'next/navigation';
import { FiRefreshCw } from 'react-icons/fi';
import { pullToRefreshReducer } from './pullToRefreshReducer';

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
    const { refresh } = useRouter() || {};

    const [state, dispatch] = useReducer(pullToRefreshReducer, {
        refreshing: false,
        displayPullDistance: 0,
    });
    const { refreshing, displayPullDistance } = state;

    // Helper function to check if the touch event is inside a modal
    const isInsideModal = useEffectEvent((target: Node): boolean => {
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
    });

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
                    dispatch({ type: 'SET_PULL_DISTANCE', payload: distance });
                }
            }
        };

        const handleTouchEnd = () => {
            if (startYRef.current !== null) {
                if (pullDistanceRef.current > threshold) {
                    dispatch({ type: 'START_REFRESHING' });
                    setTimeout(() => {
                        refresh();
                        setTimeout(() => {
                            dispatch({ type: 'STOP_REFRESHING' });
                        }, 500);
                    }, 800);
                } else {
                    dispatch({ type: 'RESET' });
                }
                startYRef.current = null;
                pullDistanceRef.current = 0;
            }
        };

        document.addEventListener('touchstart', handleTouchStart, {
            passive: true,
        });
        document.addEventListener('touchmove', handleTouchMove, {
            passive: true,
        });
        document.addEventListener('touchend', handleTouchEnd, {
            passive: true,
        });

        return () => {
            document.removeEventListener('touchstart', handleTouchStart);
            document.removeEventListener('touchmove', handleTouchMove);
            document.removeEventListener('touchend', handleTouchEnd);
        };
    }, [threshold, refresh]);

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
                    <div className="text-green-450 border-green-450 flex items-center justify-center rounded-full border bg-white p-3 shadow-lg dark:bg-neutral-950">
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
