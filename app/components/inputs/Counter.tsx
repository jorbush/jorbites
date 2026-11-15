'use client';

import { useCallback, useEffect, useRef } from 'react';
import { AiOutlineMinus, AiOutlinePlus } from 'react-icons/ai';

interface CounterProps {
    title: string;
    subtitle?: string | null;
    value: number;
    onChange: (_value: number) => void;
    minValue?: number;
    compact?: boolean;
}

const Counter: React.FC<CounterProps> = ({
    title,
    subtitle,
    value,
    onChange,
    minValue = 1,
    compact = false,
}) => {
    const isIncrementing = useRef(false);
    const isDecrementing = useRef(false);
    const lastUpdateTime = useRef<number>(0);
    const animationFrameId = useRef<number | undefined>(undefined);

    const valueRef = useRef(value);
    const onChangeRef = useRef(onChange);
    const minValueRef = useRef(minValue);

    useEffect(() => {
        valueRef.current = value;
        onChangeRef.current = onChange;
        minValueRef.current = minValue;
    });

    const updateCounter = useCallback(() => {
        const currentTime = Date.now();

        if (currentTime - lastUpdateTime.current >= 100) {
            if (isIncrementing.current) {
                onChangeRef.current(valueRef.current + 1);
            } else if (
                isDecrementing.current &&
                valueRef.current > minValueRef.current
            ) {
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
        if (valueRef.current > minValueRef.current) {
            onChangeRef.current(valueRef.current - 1);
        }
    }, []);

    const handleIncrementStart = useCallback(() => {
        isIncrementing.current = true;
        isDecrementing.current = false;
        startUpdateLoop();
    }, [startUpdateLoop]);

    const handleDecrementStart = useCallback(() => {
        if (valueRef.current > minValueRef.current) {
            isDecrementing.current = true;
            isIncrementing.current = false;
            startUpdateLoop();
        }
    }, [startUpdateLoop]);

    const buttonClassName = compact
        ? 'flex size-6 cursor-pointer items-center justify-center rounded-full border border-neutral-300 bg-white text-neutral-600 transition select-none hover:border-neutral-400 hover:bg-neutral-100 active:bg-neutral-200 dark:border-neutral-600 dark:bg-neutral-800 dark:text-neutral-300 dark:hover:border-neutral-500 dark:hover:bg-neutral-700'
        : 'flex size-10 cursor-pointer items-center justify-center rounded-full border-[1px] border-neutral-400 text-neutral-600 transition select-none hover:opacity-80 active:bg-neutral-100';

    return (
        <div
            className={
                compact
                    ? 'inline-flex items-center gap-2 rounded-full border border-neutral-200/80 bg-neutral-50/80 px-2.5 py-1 dark:border-neutral-700/60 dark:bg-neutral-800/60'
                    : 'flex flex-row items-center justify-between'
            }
            data-testid={compact ? 'servings-counter' : undefined}
            data-cy={compact ? 'servings-counter' : undefined}
        >
            {compact ? (
                title ? (
                    <div className="text-xs font-medium text-neutral-500 dark:text-neutral-400">
                        {title}
                    </div>
                ) : null
            ) : (
                <div className="flex flex-col">
                    <div className="font-medium">{title}</div>
                    {subtitle && (
                        <div className="font-light text-neutral-600">
                            {subtitle}
                        </div>
                    )}
                </div>
            )}
            <div
                className={
                    compact
                        ? 'flex flex-row items-center gap-1.5'
                        : 'flex flex-row items-center gap-4'
                }
            >
                <button
                    type="button"
                    aria-label={`Decrease ${title}`}
                    onClick={handleDecrement}
                    onMouseDown={handleDecrementStart}
                    onMouseUp={handleStop}
                    onMouseLeave={handleStop}
                    onTouchStart={handleDecrementStart}
                    onTouchEnd={handleStop}
                    className={buttonClassName}
                >
                    <AiOutlineMinus
                        size={compact ? 12 : undefined}
                        data-testid="AiOutlineMinus"
                    />
                </button>
                <div
                    className={
                        compact
                            ? 'min-w-[1.25rem] text-center text-sm font-semibold text-neutral-900 dark:text-white'
                            : 'text-xl font-light text-neutral-600'
                    }
                    data-testid="counter-value"
                >
                    {value}
                </div>
                <button
                    type="button"
                    aria-label={`Increase ${title}`}
                    onClick={handleIncrement}
                    onMouseDown={handleIncrementStart}
                    onMouseUp={handleStop}
                    onMouseLeave={handleStop}
                    onTouchStart={handleIncrementStart}
                    onTouchEnd={handleStop}
                    className={buttonClassName}
                >
                    <AiOutlinePlus
                        size={compact ? 12 : undefined}
                        data-testid="AiOutlinePlus"
                    />
                </button>
            </div>
        </div>
    );
};

export default Counter;
