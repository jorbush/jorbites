'use client';

import axios from 'axios';
import { AiFillGithub } from 'react-icons/ai';
import { FcGoogle } from 'react-icons/fc';
import { useCallback, useState, useTransition } from 'react';
import Link from 'next/link';
import { toast } from 'react-hot-toast';
import { FieldValues, SubmitHandler, useForm } from 'react-hook-form';
import { useRouter } from 'next/navigation';
import useRegisterModal from '@/app/hooks/useRegisterModal';
import Modal from '@/app/components/modals/Modal';
import Input from '@/app/components/inputs/Input';
import Heading from '@/app/components/navigation/Heading';
import Button from '@/app/components/buttons/Button';
import { signIn } from 'next-auth/react';
import useLoginModal from '@/app/hooks/useLoginModal';
import { useTranslation } from 'react-i18next';
import { validateEmail } from '@/app/utils/validation';

const RegisterModal = () => {
    const { refresh } = useRouter() || {};
    const registerModal = useRegisterModal();
    const loginModal = useLoginModal();
    const { t } = useTranslation();

    const [isPending, startTransition] = useTransition();
    const [acceptedTerms, setAcceptedTerms] = useState(false);

    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm<FieldValues>({
        defaultValues: {
            name: '',
            email: '',
            password: '',
        },
    });

    const onSubmit: SubmitHandler<FieldValues> = (data) => {
        if (!validateEmail(data.email)) {
            toast.error(t('error_validate_email'));
            return;
        }
        if (!acceptedTerms) {
            toast.error(
                t('error_accept_terms') ||
                    'Please accept the Terms of Service and Privacy Policy to create an account'
            );
            return;
        }
        startTransition(async () => {
            try {
                await axios.post('/api/register', data);
                toast.success(t('registered'));
                registerModal.onClose();
                // Login user after registration
                const callback = await signIn('credentials', {
                    email: data.email,
                    password: data.password,
                    redirect: false,
                });
                if (callback?.ok) {
                    toast.success(t('logged_in'));
                    refresh();
                }
                if (callback?.error) {
                    toast.error(callback.error);
                }
            } catch (error: any) {
                if (error.response?.data?.error === 'Email already exists') {
                    toast.error(
                        t('email_already_exists') || 'Email already exists'
                    );
                } else {
                    toast.error(
                        t('something_went_wrong') || 'Something went wrong'
                    );
                }
            }
        });
    };

    const onToggle = useCallback(() => {
        registerModal.onClose();
        loginModal.onOpen();
    }, [loginModal, registerModal]);

    const bodyContent = (
        <div className="flex flex-col gap-4">
            <Heading
                title={t('welcome_jorbites')}
                subtitle={t('create_an_account') ?? ''}
            />
            <Input
                id="email"
                label={t('email')}
                disabled={isPending}
                register={register}
                errors={errors}
                required
            />
            <Input
                id="name"
                label={t('name')}
                disabled={isPending}
                register={register}
                errors={errors}
                required
            />
            <Input
                id="password"
                label={t('password')}
                type="password"
                disabled={isPending}
                register={register}
                errors={errors}
                required
            />
            <label
                htmlFor="accept-terms"
                className="flex cursor-pointer items-start gap-2.5 text-xs leading-relaxed text-neutral-600 dark:text-neutral-400"
            >
                <input
                    id="accept-terms"
                    type="checkbox"
                    checked={acceptedTerms}
                    onChange={(e) => setAcceptedTerms(e.target.checked)}
                    disabled={isPending}
                    data-testid="accept-terms-checkbox"
                    data-cy="accept-terms-checkbox"
                    className="accent-green-450 focus:ring-green-450/30 mt-0.5 size-4 shrink-0 cursor-pointer rounded border-neutral-300 dark:border-neutral-700"
                />
                <span>
                    {t('register_accept_terms_prefix')}{' '}
                    <Link
                        href="/policies/terms"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="font-medium text-neutral-900 underline underline-offset-2 hover:opacity-80 dark:text-white"
                    >
                        {t('terms_of_service')}
                    </Link>{' '}
                    {t('register_accept_terms_and')}{' '}
                    <Link
                        href="/policies/privacy"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="font-medium text-neutral-900 underline underline-offset-2 hover:opacity-80 dark:text-white"
                    >
                        {t('privacy_policy')}
                    </Link>
                    .
                </span>
            </label>
        </div>
    );

    const footerContent = (
        <div className="mt-3 flex flex-col gap-4">
            <hr className="border-neutral-200/80 dark:border-neutral-800/80" />
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
            <p className="text-center text-xs leading-relaxed text-neutral-500 dark:text-neutral-400">
                {t('register_oauth_terms_notice')}{' '}
                <Link
                    href="/policies/terms"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-medium text-neutral-900 underline underline-offset-2 hover:opacity-80 dark:text-white"
                >
                    {t('terms_of_service')}
                </Link>{' '}
                {t('register_accept_terms_and')}{' '}
                <Link
                    href="/policies/privacy"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-medium text-neutral-900 underline underline-offset-2 hover:opacity-80 dark:text-white"
                >
                    {t('privacy_policy')}
                </Link>
                .
            </p>
            <div className="mt-2 text-center font-light text-neutral-500 dark:text-neutral-400">
                <p>
                    {t('already_account')}{' '}
                    <button
                        type="button"
                        onClick={onToggle}
                        className="cursor-pointer border-0 bg-transparent p-0 text-neutral-800 hover:underline focus:outline-hidden dark:text-white"
                    >
                        {t('login')}
                    </button>
                </p>
            </div>
        </div>
    );

    return (
        <Modal
            disabled={isPending}
            isOpen={registerModal.isOpen}
            title={t('register') ?? ''}
            actionLabel={
                isPending ? t('registering') || 'Registering...' : t('continue')
            }
            onClose={registerModal.onClose}
            onSubmit={handleSubmit(onSubmit)}
            body={bodyContent}
            footer={footerContent}
        />
    );
};

export default RegisterModal;
