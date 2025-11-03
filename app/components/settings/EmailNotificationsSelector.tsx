'use client';

import { useRouter } from 'next/navigation';
import React, { useEffect, useState } from 'react';
import { HiThumbUp, HiThumbDown } from 'react-icons/hi';
import { useTranslation } from 'react-i18next';
import { SafeUser } from '@/app/types';
import axios from 'axios';
import { toast } from 'react-hot-toast';

interface EmailNotificationProps {
    currentUser?: SafeUser | null;
}
const EmailNotificationsSelector: React.FC<EmailNotificationProps> = ({
    currentUser,
}) => {
    const router = useRouter();
    const { t } = useTranslation();
    const [isLoading, setIsLoading] = useState(false);
    const [isDisabled, setIsDisabled] = useState(false);

    const handleButtonClick = () => {
        if (!isDisabled) {
            toggleEmailNotifications();
            setIsDisabled(true);
        }
    };

    useEffect(() => {
        if (isDisabled) {
            const timeout = setTimeout(() => {
                setIsDisabled(false);
            }, 2000);

            return () => clearTimeout(timeout);
        }
    }, [isDisabled]);

    const toggleEmailNotifications = () => {
        setIsLoading(true);
        axios
            .put(`/api/emailNotifications/${currentUser?.id}`)
            .then(() => {
                toast.success(t('email_notifications_updated'));
            })
            .catch(() => {
                toast.error(t('something_went_wrong'));
            })
            .finally(() => {
                setIsLoading(false);
                router.refresh();
            });
    };

    return (
        <div className="flex items-center">
            <div className="flex-1">
                <p className="text-left">{t('enable_email_notifications')}</p>
            </div>
            <div className="flex items-center">
                <button
                    disabled={isLoading || isDisabled}
                    onClick={handleButtonClick}
                    className="relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border border-gray-50 transition-colors duration-200 ease-in-out focus:ring-0 focus:outline-hidden"
                >
                    <span className="sr-only">Toggle</span>
                    <span
                        className={`${
                            !currentUser?.emailNotifications
                                ? 'translate-x-5'
                                : 'translate-x-0'
                        } relative mt-[1.2px] ml-[1.2px] inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out`}
                    >
                        <span
                            className={`${
                                !currentUser?.emailNotifications
                                    ? 'opacity-0 duration-100 ease-out'
                                    : 'opacity-100 duration-200 ease-in'
                            } absolute inset-0 flex h-full w-full items-center justify-center transition-opacity`}
                            aria-hidden="true"
                        >
                            <HiThumbUp
                                data-testid="thumb-up-icon"
                                className="h-3 w-3 text-gray-400"
                            />
                        </span>
                        <span
                            className={`${
                                !currentUser?.emailNotifications
                                    ? 'opacity-100 duration-200 ease-in'
                                    : 'opacity-0 duration-100 ease-out'
                            } absolute inset-0 flex h-full w-full items-center justify-center transition-opacity`}
                            aria-hidden="true"
                        >
                            <HiThumbDown
                                data-testid="thumb-down-icon"
                                className="h-3 w-3 text-gray-400"
                            />
                        </span>
                    </span>
                </button>
            </div>
        </div>
    );
};

export default EmailNotificationsSelector;
