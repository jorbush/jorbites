'use client';

import { useState, useTransition } from 'react';
import { toast } from 'react-hot-toast';
import { FieldValues, SubmitHandler, useForm } from 'react-hook-form';
import axios from 'axios';
import useForgotPasswordModal from '@/app/hooks/useForgotPasswordModal';
import useLoginModal from '@/app/hooks/useLoginModal';
import Modal from '@/app/components/modals/Modal';
import Input from '@/app/components/inputs/Input';
import Heading from '@/app/components/navigation/Heading';
import { useTranslation } from 'react-i18next';
import { validateEmail } from '@/app/utils/validation';

const ForgotPasswordModal = () => {
    const forgotPasswordModal = useForgotPasswordModal();
    const loginModal = useLoginModal();
    const [isPending, startTransition] = useTransition();
    const [emailSent, setEmailSent] = useState(false);
    const { t } = useTranslation();

    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm<FieldValues>({
        defaultValues: {
            email: '',
        },
    });

    const onSubmit: SubmitHandler<FieldValues> = (data) => {
        if (!validateEmail(data.email)) {
            toast.error(t('error_validate_email'));
            return;
        }

        startTransition(async () => {
            try {
                await axios.post('/api/password-reset/request', {
                    email: data.email,
                });
                setEmailSent(true);
                toast.success(t('reset_link_sent'));
            } catch {
                toast.error(t('error_sending_email'));
            }
        });
    };

    const onBackToLogin = () => {
        forgotPasswordModal.onClose();
        loginModal.onOpen();
    };

    const bodyContent = emailSent ? (
        <div className="flex flex-col gap-4">
            <Heading
                title={t('check_your_email')}
                subtitle={t('reset_link_sent_desc') ?? ''}
            />
            <div className="mt-6 text-center">
                <button
                    type="button"
                    onClick={onBackToLogin}
                    className="cursor-pointer border-0 bg-transparent p-0 text-neutral-800 hover:underline focus:outline-hidden"
                >
                    {t('back_to_login')}
                </button>
            </div>
        </div>
    ) : (
        <div className="flex flex-col gap-4">
            <Heading
                title={t('forgot_password')}
                subtitle={t('forgot_password_desc') ?? ''}
            />
            <Input
                id="email"
                label={t('email')}
                disabled={isPending}
                register={register}
                errors={errors}
                required
            />
        </div>
    );

    return (
        <Modal
            disabled={isPending}
            isOpen={forgotPasswordModal.isOpen}
            title={t('reset_password') ?? 'Reset Password'}
            actionLabel={
                emailSent
                    ? t('ok')
                    : isPending
                      ? t('sending') || 'Sending...'
                      : t('send_reset_link')
            }
            onClose={forgotPasswordModal.onClose}
            onSubmit={
                emailSent
                    ? () => {
                          forgotPasswordModal.onClose();
                      }
                    : handleSubmit(onSubmit)
            }
            body={bodyContent}
        />
    );
};

export default ForgotPasswordModal;
