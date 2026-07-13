'use client';

import { useCallback, useEffect, useRef } from 'react';
import { AiOutlineMinus, AiOutlinePlus } from 'react-icons/ai';

interface CounterProps {
    title: string;
    subtitle: string;
    value: number;
    onChange: (_value: number) => void;
}

const Counter: React.FC<CounterProps> = ({
    title,
    subtitle,
    value,
    onChange,
}) => {
    const isIncrementing = useRef(false);
    const isDecrementing = useRef(false);
    const lastUpdateTime = useRef<number>(0);
    const animationFrameId = useRef<number | undefined>(undefined);

    const valueRef = useRef(value);
    const onChangeRef = useRef(onChange);

    useEffect(() => {
        valueRef.current = value;
        onChangeRef.current = onChange;
    });

    const updateCounter = useCallback(() => {
        const currentTime = Date.now();

        if (currentTime - lastUpdateTime.current >= 100) {
            if (isIncrementing.current) {
                onChangeRef.current(valueRef.current + 1);
            } else if (isDecrementing.current && valueRef.current > 1) {
                onChangeRef.current(valueRef.current - 1);
            }
            lastUpdateTime.current = currentTime;
        }

        animationFrameId.current = requestAnimationFrame(updateCounter);
    }, []);

    const startUpdateLoop = useCallback(() => {
        if (animationFrameId.current) {
            cancelAnimationFrame(animationFrameId.current);
        }
        lastUpdateTime.current = Date.now();
        animationFrameId.current = requestAnimationFrame(updateCounter);
    }, [updateCounter]);

    const stopUpdateLoop = useCallback(() => {
        if (animationFrameId.current) {
            cancelAnimationFrame(animationFrameId.current);
            animationFrameId.current = undefined;
        }
    }, []);

    useEffect(() => {
        const id = animationFrameId;
        return () => {
            if (id.current) {
                cancelAnimationFrame(id.current);
            }
        };
    }, []);

    const handleStop = useCallback(() => {
        isIncrementing.current = false;
        isDecrementing.current = false;
        stopUpdateLoop();
    }, [stopUpdateLoop]);

    const handleIncrement = useCallback(() => {
        onChangeRef.current(valueRef.current + 1);
    }, []);

    const handleDecrement = useCallback(() => {
        if (valueRef.current > 1) {
            onChangeRef.current(valueRef.current - 1);
        }
    }, []);

    const handleIncrementStart = useCallback(() => {
        isIncrementing.current = true;
        isDecrementing.current = false;
        startUpdateLoop();
    }, [startUpdateLoop]);

    const handleDecrementStart = useCallback(() => {
        if (valueRef.current > 1) {
            isDecrementing.current = true;
            isIncrementing.current = false;
            startUpdateLoop();
        }
    }, [startUpdateLoop]);

    return (
        <div className="flex flex-row items-center justify-between">
            <div className="flex flex-col">
                <div className="font-medium">{title}</div>
                <div className="font-light text-neutral-600">{subtitle}</div>
            </div>
            <div className="flex flex-row items-center gap-4">
                <button
                    type="button"
                    onClick={handleDecrement}
                    onMouseDown={handleDecrementStart}
                    onMouseUp={handleStop}
                    onMouseLeave={handleStop}
                    onTouchStart={handleDecrementStart}
                    onTouchEnd={handleStop}
                    className="flex size-10 cursor-pointer items-center justify-center rounded-full border-[1px] border-neutral-400 text-neutral-600 transition select-none hover:opacity-80 active:bg-neutral-100"
                >
                    <AiOutlineMinus data-testid="AiOutlineMinus" />
                </button>
                <div className="text-xl font-light text-neutral-600">
                    {value}
                </div>
                <button
                    type="button"
                    onClick={handleIncrement}
                    onMouseDown={handleIncrementStart}
                    onMouseUp={handleStop}
                    onMouseLeave={handleStop}
                    onTouchStart={handleIncrementStart}
                    onTouchEnd={handleStop}
                    className="flex size-10 cursor-pointer items-center justify-center rounded-full border-[1px] border-neutral-400 text-neutral-600 transition select-none hover:opacity-80 active:bg-neutral-100"
                >
                    <AiOutlinePlus data-testid="AiOutlinePlus" />
                </button>
            </div>
        </div>
    );
};

export default Counter;
