'use client';

import { useRouter } from 'next/navigation';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { SafeUser } from '@/app/types';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import { signOut } from 'next-auth/react';
import { FiTrash2 } from 'react-icons/fi';
import ConfirmModal from '@/app/components/modals/ConfirmModal';

interface DeleteAccountProps {
    currentUser?: SafeUser | null;
}

const DeleteAccount: React.FC<DeleteAccountProps> = ({ currentUser }) => {
    const router = useRouter();
    const { t } = useTranslation();
    const [isLoading, setIsLoading] = useState(false);
    const [showConfirmModal, setShowConfirmModal] = useState(false);

    const handleDeleteAccount = async () => {
        if (isLoading || !currentUser) return;

        setIsLoading(true);
        try {
            await axios.delete(`/api/user/${currentUser.id}`);
            toast.success(
                t('account_deleted_successfully') ||
                    'Account deleted successfully'
            );

            // Sign out the user after successful deletion
            await signOut({ redirect: false });
            router.push('/');
            router.refresh();
        } catch (error: any) {
            const errorMessage =
                error.response?.data?.error || t('something_went_wrong');
            toast.error(errorMessage);
        } finally {
            setIsLoading(false);
        }
    };

    const handleDeleteClick = () => {
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
                    <p className="text-xs text-gray-500 dark:text-zinc-400">
                        {t('delete_account_warning') ||
                            'This action cannot be undone. All your recipes and data will be permanently deleted.'}
                    </p>
                </div>
                <div className="flex items-center">
                    <button
                        onClick={handleDeleteClick}
                        disabled={isLoading}
                        className="flex items-center gap-2 rounded-md bg-red-50 px-3 py-2 text-sm font-medium text-red-700 transition-colors hover:bg-red-100 disabled:opacity-50 dark:bg-red-900/20 dark:text-red-400 dark:hover:bg-red-900/30"
                        data-testid="delete-account-button"
                    >
                        <FiTrash2 className="h-4 w-4" />
                        {isLoading
                            ? t('deleting') || 'Deleting...'
                            : t('delete') || 'Delete'}
                    </button>
                </div>
            </div>

            <ConfirmModal
                open={showConfirmModal}
                setIsOpen={setShowConfirmModal}
                onConfirm={handleDeleteAccount}
            />
        </>
    );
};

export default DeleteAccount;
