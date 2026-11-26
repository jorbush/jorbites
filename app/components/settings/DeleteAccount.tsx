'use client';

import { useRouter } from 'next/navigation';
import React, { useId, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { SafeUser } from '@/app/types';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import { signOut } from 'next-auth/react';
import { FiTrash2 } from 'react-icons/fi';
import WriteToDeleteModal from '@/app/components/modals/WriteToDeleteModal';

interface DeleteAccountProps {
    currentUser?: SafeUser | null;
}

const DeleteAccount: React.FC<DeleteAccountProps> = ({ currentUser }) => {
    const { push, refresh } = useRouter() || {};
    const { t } = useTranslation();
    const [isLoading, setIsLoading] = useState(false);
    const [showConfirmModal, setShowConfirmModal] = useState(false);
    const [twoFactorCode, setTwoFactorCode] = useState('');
    const twoFactorInputId = useId();
    const requiresTwoFactor = Boolean(currentUser?.twoFactorEnabled);

    const handleDeleteAccount = async () => {
        if (isLoading || !currentUser) return;

        if (requiresTwoFactor && !twoFactorCode.trim()) {
            toast.error(
                t('enter_2fa_code_error') ||
                    'Please enter your verification code'
            );
            return;
        }

        setIsLoading(true);
        try {
            if (requiresTwoFactor) {
                await axios.delete(`/api/user/${currentUser.id}`, {
                    data: { twoFactorCode: twoFactorCode.trim() },
                });
            } else {
                await axios.delete(`/api/user/${currentUser.id}`);
            }
            toast.success(
                t('account_deleted_successfully') ||
                    'Account deleted successfully'
            );

            // Sign out the user after successful deletion
            await signOut({ redirect: false });
            setTwoFactorCode('');
            push('/');
            refresh();
        } catch (error: any) {
            const errorMessage =
                error.response?.data?.error || t('something_went_wrong');
            toast.error(errorMessage);
        } finally {
            setIsLoading(false);
        }
    };

    const handleDeleteClick = () => {
        setTwoFactorCode('');
        setShowConfirmModal(true);
    };

    return (
        <>
            <div
                className="flex items-center"
                data-testid="delete-account-selector"
            >
                <div className="flex-1">
                    <p className="text-left text-red-600 dark:text-red-400">
                        {t('delete_account') || 'Delete Account'}
                    </p>
                    <p className="text-xs text-neutral-500 dark:text-neutral-400">
                        {t('action_cannot_be_undone') ||
                            'This action cannot be undone.'}
                    </p>
                </div>
                <div className="flex items-center">
                    <button
                        type="button"
                        onClick={handleDeleteClick}
                        disabled={isLoading}
                        className="flex items-center gap-2 rounded-md bg-red-50 px-3 py-2 text-sm font-medium text-red-700 transition-colors hover:bg-red-100 disabled:opacity-50 dark:bg-red-900/20 dark:text-red-400 dark:hover:bg-red-900/30"
                        data-testid="delete-account-button"
                    >
                        <FiTrash2 className="size-4" />
                        {isLoading
                            ? t('deleting') || 'Deleting...'
                            : t('delete') || 'Delete'}
                    </button>
                </div>
            </div>

            <WriteToDeleteModal
                open={showConfirmModal}
                setIsOpen={setShowConfirmModal}
                onConfirm={handleDeleteAccount}
                title={t('delete_account') || 'Delete Account'}
                description={
                    t('delete_account_warning') ||
                    'This action cannot be undone. All your recipes and data will be permanently deleted.'
                }
                insideModal={true}
                canConfirm={!requiresTwoFactor || Boolean(twoFactorCode.trim())}
                onValidationFailed={() =>
                    toast.error(
                        t('enter_2fa_code_error') ||
                            'Please enter your verification code'
                    )
                }
                extraContent={
                    requiresTwoFactor ? (
                        <div className="flex flex-col gap-1.5">
                            <label
                                htmlFor={twoFactorInputId}
                                className="text-xs font-medium text-neutral-700 dark:text-neutral-300"
                            >
                                {t('delete_account_2fa_prompt') ||
                                    'Enter your 6-digit 2FA code or a backup recovery code'}
                            </label>
                            <input
                                id={twoFactorInputId}
                                type="text"
                                inputMode="text"
                                autoComplete="one-time-code"
                                value={twoFactorCode}
                                onChange={(e) =>
                                    setTwoFactorCode(e.target.value)
                                }
                                disabled={isLoading}
                                placeholder="000000 / XXXX-XXXX"
                                data-testid="delete-account-2fa-input"
                                className="w-full rounded-md border border-neutral-300 bg-white px-3 py-2 font-mono text-sm tracking-widest text-neutral-900 focus:border-neutral-900 focus:outline-hidden disabled:opacity-50 dark:border-neutral-700 dark:bg-neutral-900 dark:text-white dark:focus:border-neutral-300"
                            />
                        </div>
                    ) : undefined
                }
            />
        </>
    );
};

export default DeleteAccount;
