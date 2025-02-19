'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { AiOutlineMinus, AiOutlinePlus } from 'react-icons/ai';

interface CounterProps {
    title: string;
    subtitle: string;
    value: number;
    onChange: (value: number) => void;
}

const Counter: React.FC<CounterProps> = ({
    title,
    subtitle,
    value,
    onChange,
}) => {
    const [isIncrementing, setIsIncrementing] = useState(false);
    const [isDecrementing, setIsDecrementing] = useState(false);
    const lastUpdateTime = useRef<number>(0);
    const animationFrameId = useRef<number>();

    const updateCounter = useCallback(() => {
        const currentTime = Date.now();

        if (currentTime - lastUpdateTime.current >= 100) {
            if (isIncrementing) {
                onChange(value + 1);
            } else if (isDecrementing && value > 1) {
                onChange(value - 1);
            }
            lastUpdateTime.current = currentTime;
        }

        animationFrameId.current = requestAnimationFrame(updateCounter);
    }, [isIncrementing, isDecrementing, onChange, value]);

    useEffect(() => {
        if (isIncrementing || isDecrementing) {
            lastUpdateTime.current = Date.now();
            animationFrameId.current = requestAnimationFrame(updateCounter);
        }

        return () => {
            if (animationFrameId.current) {
                cancelAnimationFrame(animationFrameId.current);
            }
        };
    }, [isIncrementing, isDecrementing, updateCounter]);

    const handleStartIncrement = useCallback(() => {
        setIsIncrementing(true);
        setIsDecrementing(false);
        onChange(value + 1);
    }, [onChange, value]);

    const handleStartDecrement = useCallback(() => {
        setIsDecrementing(true);
        setIsIncrementing(false);
        if (value > 1) {
            onChange(value - 1);
        }
    }, [onChange, value]);

    const handleStop = useCallback(() => {
        setIsIncrementing(false);
        setIsDecrementing(false);
    }, []);

    return (
        <div className="flex flex-row items-center justify-between">
            <div className="flex flex-col">
                <div className="font-medium">{title}</div>
                <div className="font-light text-gray-600">{subtitle}</div>
            </div>
            <div className="flex flex-row items-center gap-4">
                <button
                    type="button"
                    onMouseDown={handleStartDecrement}
                    onMouseUp={handleStop}
                    onMouseLeave={handleStop}
                    onTouchStart={handleStartDecrement}
                    onTouchEnd={handleStop}
                    className="flex h-10 w-10 cursor-pointer select-none items-center justify-center rounded-full border-[1px] border-neutral-400 text-neutral-600 transition hover:opacity-80 active:bg-neutral-100"
                >
                    <AiOutlineMinus data-testid="AiOutlineMinus" />
                </button>
                <div className="text-xl font-light text-neutral-600">
                    {value}
                </div>
                <button
                    type="button"
                    onMouseDown={handleStartIncrement}
                    onMouseUp={handleStop}
                    onMouseLeave={handleStop}
                    onTouchStart={handleStartIncrement}
                    onTouchEnd={handleStop}
                    className="flex h-10 w-10 cursor-pointer select-none items-center justify-center rounded-full border-[1px] border-neutral-400 text-neutral-600 transition hover:opacity-80 active:bg-neutral-100"
                >
                    <AiOutlinePlus data-testid="AiOutlinePlus" />
                </button>
            </div>
        </div>
    );
};

export default Counter;
