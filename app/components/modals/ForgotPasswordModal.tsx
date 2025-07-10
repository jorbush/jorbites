'use client';

import { useState } from 'react';
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
    const [isLoading, setIsLoading] = useState(false);
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

        setIsLoading(true);

        axios
            .post('/api/password-reset/request', { email: data.email })
            .then(() => {
                setEmailSent(true);
                toast.success(t('reset_link_sent'));
            })
            .catch(() => {
                toast.error(t('error_sending_email'));
            })
            .finally(() => {
                setIsLoading(false);
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
                <span
                    onClick={onBackToLogin}
                    className="cursor-pointer text-neutral-800 hover:underline"
                >
                    {t('back_to_login')}
                </span>
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
                disabled={isLoading}
                register={register}
                errors={errors}
                required
            />
        </div>
    );

    return (
        <Modal
            disabled={isLoading}
            isOpen={forgotPasswordModal.isOpen}
            title={t('reset_password') ?? 'Reset Password'}
            actionLabel={emailSent ? t('ok') : t('send_reset_link')}
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
