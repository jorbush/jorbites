'use client';

import {
    FieldErrors,
    FieldValues,
    UseFormRegister,
    RegisterOptions,
} from 'react-hook-form';
import { BiDollar } from 'react-icons/bi';
import { useState, useRef } from 'react';
import { CHAR_COUNT_WARNING_THRESHOLD } from '@/app/utils/constants';

interface InputProps {
    id: string;
    label: string;
    type?: string;
    disabled?: boolean;
    formatPrice?: boolean;
    required?: boolean;
    register: UseFormRegister<FieldValues>;
    errors: FieldErrors;
    dataCy?: string;
    maxLength?: number;
    validation?: RegisterOptions;
}

const Input: React.FC<InputProps> = ({
    id,
    label,
    type = 'text',
    disabled,
    formatPrice,
    register,
    required,
    errors,
    dataCy,
    maxLength,
    validation = {},
}) => {
    const [charCount, setCharCount] = useState(0);
    const inputRef = useRef<HTMLInputElement>(null);

    // Combine validation rules
    const validationRules = {
        required,
        maxLength,
        ...validation,
    };

    const {
        onChange,
        ref: registerRef,
        ...rest
    } = register(id, validationRules);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        if (maxLength && value.length > maxLength) {
            e.target.value = value.slice(0, maxLength);
        }
        onChange(e);
        setCharCount(e.target.value.length);
    };

    return (
        <div
            className={`relative w-full ${type === 'date' || type === 'datetime-local' ? 'flex-shrink' : ''}`}
        >
            {formatPrice && (
                <BiDollar
                    size={24}
                    className="absolute top-5 left-2 text-neutral-700 dark:text-neutral-300"
                    data-testid="BiDollar"
                />
            )}
            <input
                id={id}
                ref={(e) => {
                    registerRef(e);
                    inputRef.current = e;
                    if (e) {
                        setCharCount(e.value.length);
                    }
                }}
                disabled={disabled}
                {...rest}
                onChange={handleChange}
                placeholder=" "
                type={type}
                maxLength={maxLength}
                className={`peer w-full rounded-md border-2 bg-white p-4 pt-6 font-light text-zinc-900 outline-hidden transition disabled:cursor-not-allowed disabled:opacity-70 dark:bg-zinc-800 dark:text-zinc-100 ${formatPrice ? 'pl-9' : 'pl-4'} ${
                    errors[id]
                        ? 'border-rose-500'
                        : 'border-neutral-300 dark:border-neutral-600'
                } ${
                    errors[id]
                        ? 'focus:border-rose-500'
                        : 'focus:border-black dark:focus:border-white'
                } `}
                data-cy={dataCy}
            />
            <label
                htmlFor={id}
                className={`text-md absolute top-5 z-10 origin-[0] -translate-y-3 transform duration-150 ${formatPrice ? 'left-9' : 'left-4'} peer-placeholder-shown:translate-y-0 peer-placeholder-shown:scale-100 peer-focus:-translate-y-4 peer-focus:scale-75 ${
                    errors[id]
                        ? 'text-rose-500'
                        : 'text-zinc-400 dark:text-zinc-500'
                } `}
            >
                {label}
            </label>

            {/* Error message */}
            {errors[id] && (
                <div className="mt-1 text-sm text-rose-500">
                    {errors[id]?.message as string}
                </div>
            )}

            {maxLength && (
                <div
                    className={`absolute top-2 right-2 text-xs transition-opacity duration-200 ${
                        charCount >= maxLength * CHAR_COUNT_WARNING_THRESHOLD
                            ? 'text-neutral-500 opacity-100 dark:text-neutral-400'
                            : 'opacity-0'
                    }`}
                    data-testid="char-count"
                >
                    {charCount}/{maxLength}
                </div>
            )}
        </div>
    );
};

export default Input;
