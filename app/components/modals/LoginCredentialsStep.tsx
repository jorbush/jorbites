'use client';

import React from 'react';
import { useTranslation } from 'react-i18next';
import { FieldErrors, FieldValues, UseFormRegister } from 'react-hook-form';
import Input from '@/app/components/inputs/Input';
import Heading from '@/app/components/navigation/Heading';

interface LoginCredentialsStepProps {
    register: UseFormRegister<FieldValues>;
    errors: FieldErrors<FieldValues>;
    isPending: boolean;
    onForgotPassword: () => void;
}

export const LoginCredentialsStep: React.FC<LoginCredentialsStepProps> = ({
    register,
    errors,
    isPending,
    onForgotPassword,
}) => {
    const { t } = useTranslation();

    return (
        <div className="flex flex-col gap-4">
            <Heading
                title={t('welcome_back')}
                subtitle={t('login_subtitle') ?? ''}
            />
            <Input
                id="email"
                label={t('email')}
                disabled={isPending}
                register={register}
                errors={errors}
                required
                dataCy="login-email"
            />
            <Input
                id="password"
                label={t('password')}
                type="password"
                disabled={isPending}
                register={register}
                errors={errors}
                required
                dataCy="login-password"
            />
            <div className="text-right">
                <button
                    type="button"
                    onClick={onForgotPassword}
                    className="cursor-pointer border-0 bg-transparent p-0 text-sm text-neutral-600 hover:underline focus:outline-hidden"
                >
                    {t('forgot_password') ||
                        'Have you forgotten your password?'}
                </button>
            </div>
        </div>
    );
};
