import React from 'react';
import { useTranslation } from 'react-i18next';
import { IconType } from 'react-icons';
import { UseFormRegisterReturn } from 'react-hook-form';
import { PasswordFieldInput } from './PasswordFieldInput';

interface TwoFactorPasswordFormProps {
    id: string;
    promptText: string;
    buttonLabel: string;
    buttonIcon?: IconType;
    buttonVariant?: 'green' | 'red';
    currentPassword: string;
    passwordRegisterProps: UseFormRegisterReturn;
    showPassword: boolean;
    onToggleShowPassword: () => void;
    isPending: boolean;
    formTestId: string;
    passwordTestId: string;
    togglePasswordTestId: string;
    buttonTestId: string;
    buttonDataCy?: string;
    requireTwoFactorCode?: boolean;
    twoFactorCode?: string;
    onTwoFactorCodeChange?: (value: string) => void;
    twoFactorCodeId?: string;
    twoFactorCodeTestId?: string;
    onSubmit: (e: React.FormEvent) => void;
}

export const TwoFactorPasswordForm: React.FC<TwoFactorPasswordFormProps> = ({
    id,
    promptText,
    buttonLabel,
    buttonIcon: ButtonIcon,
    buttonVariant = 'green',
    currentPassword,
    passwordRegisterProps,
    showPassword,
    onToggleShowPassword,
    isPending,
    formTestId,
    passwordTestId,
    togglePasswordTestId,
    buttonTestId,
    buttonDataCy,
    requireTwoFactorCode = false,
    twoFactorCode = '',
    onTwoFactorCodeChange,
    twoFactorCodeId,
    twoFactorCodeTestId,
    onSubmit,
}) => {
    const { t } = useTranslation();
    const hidePasswordText = t('hide_password') || 'Hide password';
    const showPasswordText = t('show_password') || 'Show password';
    const isSubmitDisabled =
        isPending ||
        !currentPassword ||
        (requireTwoFactorCode && !twoFactorCode.trim());

    const buttonClasses =
        buttonVariant === 'red'
            ? 'flex cursor-pointer items-center gap-2 rounded-full bg-red-600 px-4 py-2 text-sm font-semibold text-white shadow-xs transition hover:bg-red-700 disabled:opacity-50'
            : 'border-green-450/50 bg-green-450 flex cursor-pointer items-center gap-2 rounded-full border px-4 py-2 text-sm font-semibold text-neutral-900 shadow-xs transition hover:opacity-90 disabled:opacity-50';

    return (
        <form
            onSubmit={onSubmit}
            className="flex flex-col gap-3 rounded-2xl border border-neutral-200/80 bg-white/80 p-4 dark:border-neutral-800/80 dark:bg-neutral-900/60"
            data-testid={formTestId}
        >
            <p className="text-xs text-neutral-600 dark:text-neutral-300">
                {promptText}
            </p>
            <PasswordFieldInput
                id={id}
                label={t('current_password') || 'Current Password'}
                placeholder={
                    t('enter_current_password') || 'Enter current password'
                }
                registerProps={passwordRegisterProps}
                showPassword={showPassword}
                onToggleShowPassword={onToggleShowPassword}
                disabled={isPending}
                testId={passwordTestId}
                toggleTestId={togglePasswordTestId}
                hidePasswordLabel={hidePasswordText}
                showPasswordLabel={showPasswordText}
            />
            {requireTwoFactorCode && (
                <div className="flex flex-col gap-1">
                    <label
                        htmlFor={twoFactorCodeId}
                        className="text-xs font-medium text-neutral-700 dark:text-neutral-300"
                    >
                        {t('verification_code') || 'Verification Code'}
                    </label>
                    <input
                        id={twoFactorCodeId}
                        type="text"
                        inputMode="text"
                        autoComplete="one-time-code"
                        value={twoFactorCode}
                        onChange={(e) =>
                            onTwoFactorCodeChange?.(e.target.value)
                        }
                        disabled={isPending}
                        placeholder="000000 / XXXX-XXXX"
                        data-testid={twoFactorCodeTestId}
                        className="w-full rounded-md border border-neutral-300 bg-white px-3 py-2 font-mono text-sm tracking-widest text-neutral-900 focus:border-neutral-900 focus:outline-hidden disabled:opacity-50 dark:border-neutral-700 dark:bg-neutral-900 dark:text-white dark:focus:border-neutral-300"
                    />
                </div>
            )}
            <div className="flex justify-end">
                <button
                    type="submit"
                    disabled={isSubmitDisabled}
                    data-testid={buttonTestId}
                    data-cy={buttonDataCy}
                    className={buttonClasses}
                >
                    {ButtonIcon && <ButtonIcon className="size-4" />}
                    {isPending ? t('loading') || 'Loading...' : buttonLabel}
                </button>
            </div>
        </form>
    );
};
