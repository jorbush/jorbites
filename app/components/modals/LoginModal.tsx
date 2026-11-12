'use client';

import { useCallback, useState, useTransition } from 'react';
import { toast } from 'react-hot-toast';
import { signIn } from 'next-auth/react';
import { FieldValues, SubmitHandler, useForm } from 'react-hook-form';
import { useRouter } from 'next/navigation';

import useRegisterModal from '@/app/hooks/useRegisterModal';
import useLoginModal from '@/app/hooks/useLoginModal';
import useForgotPasswordModal from '@/app/hooks/useForgotPasswordModal';

import Modal from '@/app/components/modals/Modal';
import { useTranslation } from 'react-i18next';
import { validateEmail } from '@/app/utils/validation';
import { LoginCredentialsStep } from './LoginCredentialsStep';
import { LoginTwoFactorStep } from './LoginTwoFactorStep';
import { LoginModalFooter } from './LoginModalFooter';

const EMPTY_FOOTER = <div />;

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

    const resetState = useCallback(() => {
        setShowTwoFactorStep(false);
        setTwoFactorCode('');
    }, []);

    const handleCloseModal = useCallback(() => {
        resetState();
        loginModal.onClose();
    }, [loginModal, resetState]);

    const onToggle = useCallback(() => {
        resetState();
        loginModal.onClose();
        registerModal.onOpen();
    }, [loginModal, registerModal, resetState]);

    const onForgotPassword = useCallback(() => {
        resetState();
        loginModal.onClose();
        forgotPasswordModal.onOpen();
    }, [loginModal, forgotPasswordModal, resetState]);

    const handleSignInResult = (callback: any) => {
        if (callback?.ok && !callback?.error) {
            toast.success(t('logged_in'));
            resetState();
            refresh();
            loginModal.onClose();
            return;
        }

        if (callback?.error === '2FA_REQUIRED') {
            setShowTwoFactorStep(true);
            return;
        }

        if (callback?.error === 'TOO_MANY_2FA_ATTEMPTS') {
            toast.error(
                t('too_many_2fa_attempts') ||
                    'Too many verification attempts. Please try again later.'
            );
            return;
        }

        if (callback?.error === 'INVALID_2FA_CODE') {
            toast.error(t('invalid_2fa_code') || 'Invalid verification code');
            return;
        }

        if (callback?.error === 'Invalid credentials') {
            toast.error(callback.error);
            return;
        }

        if (callback?.error) {
            toast.error(t('something_went_wrong') || 'Something went wrong');
        }
    };

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
            handleSignInResult(callback);
        });
    };

    const actionLabel = isPending
        ? t('logging_in') || 'Logging in...'
        : showTwoFactorStep
          ? t('verify') || 'Verify'
          : t('continue');

    const bodyContent = showTwoFactorStep ? (
        <LoginTwoFactorStep
            twoFactorCode={twoFactorCode}
            isPending={isPending}
            onChangeCode={setTwoFactorCode}
            onBackToLogin={resetState}
        />
    ) : (
        <LoginCredentialsStep
            register={register}
            errors={errors}
            isPending={isPending}
            onForgotPassword={onForgotPassword}
        />
    );

    const footerContent = showTwoFactorStep ? (
        EMPTY_FOOTER
    ) : (
        <LoginModalFooter onToggleRegister={onToggle} />
    );

    return (
        <Modal
            key={showTwoFactorStep ? 'two-factor' : 'credentials'}
            disabled={isPending}
            isOpen={loginModal.isOpen}
            title={t('login') ?? ''}
            actionLabel={actionLabel}
            onClose={handleCloseModal}
            onSubmit={handleSubmit(onSubmit)}
            body={bodyContent}
            footer={footerContent}
        />
    );
};

export default LoginModal;
