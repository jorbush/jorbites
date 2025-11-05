'use client';

import { useRouter } from 'next/navigation';
import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { SafeUser } from '@/app/types';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import ToggleSwitch from '@/app/components/inputs/ToggleSwitch';

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
            <ToggleSwitch
                checked={!!currentUser?.emailNotifications}
                onChange={handleButtonClick}
                label=""
                dataCy="email-notifications-toggle"
                disabled={isLoading || isDisabled}
            />
        </div>
    );
};

export default EmailNotificationsSelector;
