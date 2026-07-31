import React from 'react';
import { FiEye, FiEyeOff } from 'react-icons/fi';
import { UseFormRegisterReturn } from 'react-hook-form';

interface PasswordFieldInputProps {
    id: string;
    label: string;
    placeholder: string;
    registerProps: UseFormRegisterReturn;
    showPassword: boolean;
    onToggleShowPassword: () => void;
    disabled?: boolean;
    errorText?: string | false | null;
    secondaryErrorText?: string | false | null;
    testId: string;
    toggleTestId: string;
    hidePasswordLabel: string;
    showPasswordLabel: string;
}

export const PasswordFieldInput: React.FC<PasswordFieldInputProps> = ({
    id,
    label,
    placeholder,
    registerProps,
    showPassword,
    onToggleShowPassword,
    disabled,
    errorText,
    secondaryErrorText,
    testId,
    toggleTestId,
    hidePasswordLabel,
    showPasswordLabel,
}) => {
    return (
        <div className="flex flex-col gap-1">
            <label
                htmlFor={id}
                className="text-sm font-medium text-neutral-700 dark:text-neutral-300"
            >
                {label}
            </label>
            <div className="relative">
                <input
                    id={id}
                    type={showPassword ? 'text' : 'password'}
                    {...registerProps}
                    className="focus:ring-green-450 w-full rounded border border-neutral-300 px-3 py-2 text-base focus:ring-2 focus:outline-none dark:border-neutral-600 dark:bg-neutral-800 dark:text-white"
                    placeholder={placeholder}
                    disabled={disabled}
                    data-testid={testId}
                />
                <button
                    type="button"
                    className="absolute top-1/2 right-3 -translate-y-1/2 text-neutral-400 hover:text-neutral-600 dark:text-neutral-500 dark:hover:text-neutral-300"
                    onClick={onToggleShowPassword}
                    aria-label={
                        showPassword ? hidePasswordLabel : showPasswordLabel
                    }
                    data-testid={toggleTestId}
                >
                    {showPassword ? (
                        <FiEyeOff size={16} />
                    ) : (
                        <FiEye size={16} />
                    )}
                </button>
            </div>
            {errorText && <p className="text-xs text-red-500">{errorText}</p>}
            {secondaryErrorText && (
                <p className="text-xs text-red-500">{secondaryErrorText}</p>
            )}
        </div>
    );
};
