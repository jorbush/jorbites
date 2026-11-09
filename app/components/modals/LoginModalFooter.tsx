'use client';

import React from 'react';
import { useTranslation } from 'react-i18next';
import { signIn } from 'next-auth/react';
import { FcGoogle } from 'react-icons/fc';
import { AiFillGithub } from 'react-icons/ai';
import Button from '@/app/components/buttons/Button';

interface LoginModalFooterProps {
    onToggleRegister: () => void;
}

export const LoginModalFooter: React.FC<LoginModalFooterProps> = ({
    onToggleRegister,
}) => {
    const { t } = useTranslation();

    return (
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
                        onClick={onToggleRegister}
                        className="cursor-pointer border-0 bg-transparent p-0 text-neutral-800 hover:underline focus:outline-hidden"
                    >
                        {t('create_account')}
                    </button>
                </p>
            </div>
        </div>
    );
};
