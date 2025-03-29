'use client';

import { useCallback, useState } from 'react';
import { toast } from 'react-hot-toast';
import { signIn } from 'next-auth/react';
import { FieldValues, SubmitHandler, useForm } from 'react-hook-form';
import { FcGoogle } from 'react-icons/fc';
import { AiFillGithub } from 'react-icons/ai';
import { useRouter } from 'next/navigation';

import useRegisterModal from '@/app/hooks/useRegisterModal';
import useLoginModal from '@/app/hooks/useLoginModal';

import Modal from '@/app/components/modals/Modal';
import Input from '@/app/components/inputs/Input';
import Heading from '@/app/components/navigation/Heading';
import Button from '@/app/components/buttons/Button';
import { useTranslation } from 'react-i18next';
import { validateEmail } from '@/app/utils/validation';

const LoginModal = () => {
    const router = useRouter();
    const loginModal = useLoginModal();
    const registerModal = useRegisterModal();
    const [isLoading, setIsLoading] = useState(false);
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

    const onSubmit: SubmitHandler<FieldValues> = (data) => {
        if (!validateEmail(data.email)) {
            toast.error(t('error_validate_email'));
            return;
        }
        setIsLoading(true);
        signIn('credentials', {
            ...data,
            redirect: false,
        }).then((callback) => {
            setIsLoading(false);

            if (callback?.ok) {
                toast.success(t('logged_in'));
                router.refresh();
                loginModal.onClose();
            }

            if (callback?.error) {
                toast.error(callback.error);
            }
        });
    };

    const onToggle = useCallback(() => {
        loginModal.onClose();
        registerModal.onOpen();
    }, [loginModal, registerModal]);

    const bodyContent = (
        <div className="flex flex-col gap-4">
            <Heading
                title={t('welcome_back')}
                subtitle={t('login_subtitle') ?? ''}
            />
            <Input
                id="email"
                label={t('email')}
                disabled={isLoading}
                register={register}
                errors={errors}
                required
                dataCy="login-email"
            />
            <Input
                id="password"
                label={t('password')}
                type="password"
                disabled={isLoading}
                register={register}
                errors={errors}
                required
                dataCy="login-password"
            />
        </div>
    );

    const footerContent = (
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
                    {t('first_jorbites')}
                    <span
                        onClick={onToggle}
                        className="cursor-pointer text-neutral-800 hover:underline"
                    >
                        {' '}
                        {t('create_account')}
                    </span>
                </p>
            </div>
        </div>
    );

    return (
        <Modal
            disabled={isLoading}
            isOpen={loginModal.isOpen}
            title={t('login') ?? ''}
            actionLabel={t('continue')}
            onClose={loginModal.onClose}
            onSubmit={handleSubmit(onSubmit)}
            body={bodyContent}
            footer={footerContent}
            minHeight="700px"
        />
    );
};

export default LoginModal;
