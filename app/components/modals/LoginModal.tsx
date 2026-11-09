'use client';

import { useCallback, useState, useTransition } from 'react';
import { toast } from 'react-hot-toast';
import { signIn } from 'next-auth/react';
import { FieldValues, SubmitHandler, useForm } from 'react-hook-form';
import { FcGoogle } from 'react-icons/fc';
import { AiFillGithub } from 'react-icons/ai';
import { FiArrowLeft, FiShield } from 'react-icons/fi';
import { useRouter } from 'next/navigation';

import useRegisterModal from '@/app/hooks/useRegisterModal';
import useLoginModal from '@/app/hooks/useLoginModal';

import Modal from '@/app/components/modals/Modal';
import Input from '@/app/components/inputs/Input';
import Heading from '@/app/components/navigation/Heading';
import Button from '@/app/components/buttons/Button';
import { useTranslation } from 'react-i18next';
import { validateEmail } from '@/app/utils/validation';
import useForgotPasswordModal from '@/app/hooks/useForgotPasswordModal';

const LoginModal = () => {
    const { refresh } = useRouter() || {};
    const loginModal = useLoginModal();
    const registerModal = useRegisterModal();
    const forgotPasswordModal = useForgotPasswordModal();
    const [isPending, startTransition] = useTransition();
    const [showTwoFactorStep, setShowTwoFactorStep] = useState(false);
    const [twoFactorCode, setTwoFactorCode] = useState('');
    const { t } = useTranslation();

    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm<FieldValues>({
        defaultValues: {
            email: '',
            password: '',
        },
    });

    const handleCloseModal = useCallback(() => {
        setShowTwoFactorStep(false);
        setTwoFactorCode('');
        loginModal.onClose();
    }, [loginModal]);

    const onSubmit: SubmitHandler<FieldValues> = (data) => {
        if (!validateEmail(data.email)) {
            toast.error(t('error_validate_email'));
            return;
        }

        if (showTwoFactorStep && !twoFactorCode.trim()) {
            toast.error(
                t('enter_2fa_code_error') ||
                    'Please enter your verification code'
            );
            return;
        }

        startTransition(async () => {
            const payload = showTwoFactorStep
                ? {
                      email: data.email,
                      password: data.password,
                      twoFactorCode: twoFactorCode.trim(),
                      redirect: false,
                  }
                : {
                      ...data,
                      redirect: false,
                  };

            const callback = await signIn('credentials', payload);

            if (callback?.ok && !callback?.error) {
                toast.success(t('logged_in'));
                setShowTwoFactorStep(false);
                setTwoFactorCode('');
                refresh();
                loginModal.onClose();
                return;
            }

            if (callback?.error === '2FA_REQUIRED') {
                setShowTwoFactorStep(true);
                return;
            }

            if (callback?.error === 'INVALID_2FA_CODE') {
                toast.error(
                    t('invalid_2fa_code') || 'Invalid verification code'
                );
                return;
            }

            if (callback?.error) {
                toast.error(callback.error);
            }
        });
    };

    const onToggle = useCallback(() => {
        setShowTwoFactorStep(false);
        setTwoFactorCode('');
        loginModal.onClose();
        registerModal.onOpen();
    }, [loginModal, registerModal]);

    const onForgotPassword = useCallback(() => {
        setShowTwoFactorStep(false);
        setTwoFactorCode('');
        loginModal.onClose();
        forgotPasswordModal.onOpen();
    }, [loginModal, forgotPasswordModal]);

    const bodyContent = showTwoFactorStep ? (
        <div
            className="flex flex-col gap-4"
            data-testid="login-2fa-step"
        >
            <div className="flex items-center gap-3">
                <div className="flex size-11 shrink-0 items-center justify-center rounded-xl border border-neutral-200/80 bg-neutral-100 shadow-2xs dark:border-neutral-700/60 dark:bg-neutral-800">
                    <FiShield className="size-5 text-neutral-900 dark:text-white" />
                </div>
                <div>
                    <h3 className="text-lg font-bold text-neutral-900 dark:text-white">
                        {t('two_factor_auth') || 'Two-Factor Authentication'}
                    </h3>
                    <p className="text-sm text-neutral-500 dark:text-neutral-400">
                        {t('enter_2fa_code_subtitle') ||
                            'Enter the 6-digit code from your authenticator app or a backup recovery code.'}
                    </p>
                </div>
            </div>

            <div className="flex flex-col gap-1.5">
                <label
                    htmlFor="login-two-factor-code"
                    className="text-sm font-medium text-neutral-700 dark:text-neutral-300"
                >
                    {t('verification_code') || 'Verification Code'}
                </label>
                <input
                    id="login-two-factor-code"
                    type="text"
                    inputMode="text"
                    autoComplete="one-time-code"
                    value={twoFactorCode}
                    onChange={(e) => setTwoFactorCode(e.target.value)}
                    placeholder="000000 / XXXX-XXXX"
                    disabled={isPending}
                    data-cy="login-2fa-code"
                    data-testid="login-2fa-code-input"
                    className="focus:ring-green-450/30 w-full rounded-xl border border-neutral-200/80 bg-white/80 px-4 py-3 font-mono text-base tracking-widest text-neutral-900 transition outline-none focus:border-neutral-400 focus:ring-2 disabled:opacity-50 dark:border-neutral-800/80 dark:bg-neutral-900/60 dark:text-white"
                />
            </div>

            <div>
                <button
                    type="button"
                    onClick={() => {
                        setShowTwoFactorStep(false);
                        setTwoFactorCode('');
                    }}
                    disabled={isPending}
                    data-testid="back-to-login-button"
                    className="inline-flex cursor-pointer items-center gap-1.5 text-sm text-neutral-600 hover:text-neutral-900 hover:underline dark:text-neutral-400 dark:hover:text-white"
                >
                    <FiArrowLeft className="size-4" />
                    {t('back_to_login') || 'Back to login'}
                </button>
            </div>
        </div>
    ) : (
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

    const footerContent = showTwoFactorStep ? (
        <div />
    ) : (
        <div className="mt-3 flex flex-col gap-4">
            <hr />
            <Button
                outline
                label={t('login_google')}
                icon={FcGoogle}
                onClick={() => signIn('google')}
            />
            <Button
                outline
                label={t('login_github')}
                icon={AiFillGithub}
                onClick={() => signIn('github')}
            />
            <div className="mt-4 text-center font-light text-neutral-500">
                <p>
                    {t('first_jorbites')}{' '}
                    <button
                        type="button"
                        onClick={onToggle}
                        className="cursor-pointer border-0 bg-transparent p-0 text-neutral-800 hover:underline focus:outline-hidden"
                    >
                        {t('create_account')}
                    </button>
                </p>
            </div>
        </div>
    );

    return (
        <Modal
            key={showTwoFactorStep ? 'two-factor' : 'credentials'}
            disabled={isPending}
            isOpen={loginModal.isOpen}
            title={t('login') ?? ''}
            actionLabel={
                isPending
                    ? t('logging_in') || 'Logging in...'
                    : showTwoFactorStep
                      ? t('verify') || 'Verify'
                      : t('continue')
            }
            onClose={handleCloseModal}
            onSubmit={handleSubmit(onSubmit)}
            body={bodyContent}
            footer={footerContent}
        />
    );
};

export default LoginModal;
