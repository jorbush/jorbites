'use client';

import axios from 'axios';
import { AiFillGithub } from 'react-icons/ai';
import { FcGoogle } from 'react-icons/fc';
import { useCallback, useState } from 'react';
import { toast } from 'react-hot-toast';
import {
    FieldValues,
    SubmitHandler,
    useForm,
} from 'react-hook-form';

import useRegisterModal from '@/app/hooks/useRegisterModal';

import Modal from './Modal';
import Input from '../inputs/Input';
import Heading from '../Heading';
import Button from '../Button';
import { signIn } from 'next-auth/react';
import useLoginModal from '@/app/hooks/useLoginModal';
import { useTranslation } from 'react-i18next';

const RegisterModal = () => {
    const registerModal = useRegisterModal();
    const loginModal = useLoginModal();
    const { t } = useTranslation();

    const [isLoading, setIsLoading] = useState(false);

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
        setIsLoading(true);

        axios
            .post('/api/register', data)
            .then(() => {
                toast.success('Registered!');
                registerModal.onClose();
            })
            .catch((error) => {
                toast.error(error);
            })
            .finally(() => {
                setIsLoading(false);
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
                disabled={isLoading}
                register={register}
                errors={errors}
                required
            />
            <Input
                id="name"
                label={t('name')}
                disabled={isLoading}
                register={register}
                errors={errors}
                required
            />
            <Input
                id="password"
                label={t('password')}
                type="password"
                disabled={isLoading}
                register={register}
                errors={errors}
                required
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
                    {t('already_account')}
                    <span
                        onClick={onToggle}
                        className="cursor-pointer text-neutral-800 hover:underline"
                    >
                        {' '}
                        {t('login')}
                    </span>
                </p>
            </div>
        </div>
    );

    return (
        <Modal
            disabled={isLoading}
            isOpen={registerModal.isOpen}
            title={t('register') ?? ''}
            actionLabel={t('continue')}
            onClose={registerModal.onClose}
            onSubmit={handleSubmit(onSubmit)}
            body={bodyContent}
            footer={footerContent}
            minHeight="753px"
        />
    );
};

export default RegisterModal;
