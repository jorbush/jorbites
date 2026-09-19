'use client';

import React, { useState, useRef, useEffect } from 'react';
import { SafeRecipe } from '@/app/types';

interface UseBiteCardGestureProps {
    recipe: SafeRecipe;
    isTop: boolean;
    onSwipeRight: (recipe: SafeRecipe) => void;
    onSwipeLeft: (recipe: SafeRecipe) => void;
    onSwipeUp: (recipe: SafeRecipe) => void;
}

const getCoords = (e: React.PointerEvent<HTMLDivElement>) => {
    const native = e.nativeEvent as any;
    return {
        x:
            e.clientX ??
            native?.clientX ??
            (e as any).pageX ??
            native?.pageX ??
            0,
        y:
            e.clientY ??
            native?.clientY ??
            (e as any).pageY ??
            native?.pageY ??
            0,
    };
};

export function useBiteCardGesture({
    recipe,
    isTop,
    onSwipeRight,
    onSwipeLeft,
    onSwipeUp,
}: UseBiteCardGestureProps) {
    const [dragOffset, setDragOffset] = useState<{ x: number; y: number }>({
        x: 0,
        y: 0,
    });
    const dragOffsetRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
    const isDraggingRef = useRef(false);
    const [isDragging, setIsDragging] = useState(false);
    const dragStartRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
    const activePointerIdRef = useRef<number | null>(null);
    const cardRef = useRef<HTMLDivElement>(null);

    // Prevent Safari iOS native edge-swipe back navigation when touch starts near screen edge
    useEffect(() => {
        const cardEl = cardRef.current;
        if (!cardEl || !isTop) return;

        const handleTouchStart = (e: TouchEvent) => {
            const touch = e.touches[0];
            if (!touch) return;
            const edgeThreshold = 28;
            if (
                touch.clientX < edgeThreshold ||
                touch.clientX > window.innerWidth - edgeThreshold
            ) {
                e.preventDefault();
            }
        };

        cardEl.addEventListener('touchstart', handleTouchStart, {
            passive: false,
        });
        return () => {
            cardEl.removeEventListener('touchstart', handleTouchStart);
        };
    }, [isTop]);

    // Cleanup pointer capture on unmount
    useEffect(() => {
        const pointerId = activePointerIdRef.current;
        const card = cardRef.current;
        return () => {
            if (
                pointerId !== null &&
                card &&
                typeof card.releasePointerCapture === 'function'
            ) {
                try {
                    card.releasePointerCapture(pointerId);
                } catch {}
            }
        };
    }, []);

    const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
        if (!isTop) return;
        const coords = getCoords(e);
        isDraggingRef.current = true;
        setIsDragging(true);
        dragStartRef.current = coords;
        dragOffsetRef.current = { x: 0, y: 0 };
        activePointerIdRef.current = e.pointerId;

        if (
            cardRef.current &&
            typeof cardRef.current.setPointerCapture === 'function'
        ) {
            try {
                cardRef.current.setPointerCapture(e.pointerId);
            } catch {}
        }
    };

    const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
        if (!isDraggingRef.current || !isTop) return;
        const coords = getCoords(e);
        const deltaX = coords.x - dragStartRef.current.x;
        const deltaY = coords.y - dragStartRef.current.y;
        dragOffsetRef.current = { x: deltaX, y: deltaY };
        setDragOffset({ x: deltaX, y: deltaY });
    };

    const handlePointerUp = (e?: React.PointerEvent<HTMLDivElement>) => {
        if (!isDraggingRef.current || !isTop) return;
        isDraggingRef.current = false;
        setIsDragging(false);

        const pointerId = e?.pointerId ?? activePointerIdRef.current;
        if (
            pointerId !== null &&
            cardRef.current &&
            typeof cardRef.current.releasePointerCapture === 'function'
        ) {
            try {
                if (
                    typeof cardRef.current.hasPointerCapture === 'function'
                        ? cardRef.current.hasPointerCapture(pointerId)
                        : true
                ) {
                    cardRef.current.releasePointerCapture(pointerId);
                }
            } catch {}
        }
        activePointerIdRef.current = null;

        const thresholdX = 85;
        const thresholdY = -100;
        const currentOffset = dragOffsetRef.current;

        if (currentOffset.x > thresholdX) {
            onSwipeRight(recipe);
        } else if (currentOffset.x < -thresholdX) {
            onSwipeLeft(recipe);
        } else if (currentOffset.y < thresholdY) {
            onSwipeUp(recipe);
        }

        dragOffsetRef.current = { x: 0, y: 0 };
        setDragOffset({ x: 0, y: 0 });
    };

    const rotate = (dragOffset.x || 0) / 20;
    const rightOpacity = Math.min(Math.max((dragOffset.x || 0) / 80, 0), 1);
    const leftOpacity = Math.min(Math.max(-(dragOffset.x || 0) / 80, 0), 1);
    const upOpacity = Math.min(Math.max(-(dragOffset.y || 0) / 90, 0), 1);

    const transformStyle = isTop
        ? {
              transform: `translate3d(${dragOffset.x}px, ${dragOffset.y}px, 0px) rotate(${rotate}deg)`,
              transition: isDragging
                  ? 'none'
                  : 'transform 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
              touchAction: 'none' as const,
          }
        : {};

    return {
        cardRef,
        transformStyle,
        isDragging,
        handlePointerDown,
        handlePointerMove,
        handlePointerUp,
        rightOpacity,
        leftOpacity,
        upOpacity,
    };
}
