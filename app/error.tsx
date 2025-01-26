'use client';

import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import Button from '@/app/components/Button';

interface ErrorProps {
    error: Error & { statusCode?: number };
    reset: () => void;
}

export default function Error({ error, reset }: ErrorProps) {
    const { t } = useTranslation();

    useEffect(() => {
        console.error('An error occurred:', error);
    }, [error]);

    const handleReset = () => {
        reset();
        window.location.reload();
    };

    const getErrorMessage = (error: Error & { statusCode?: number }) => {
        if (error.message.startsWith('You have made too many requests')) {
            return error.message;
        }

        switch (error.statusCode) {
            case 429:
                return t('too_many_requests');
            case 404:
                return t('not_found');
            case 403:
                return t('forbidden');
            default:
                return t('something_went_wrong');
        }
    };

    return (
        <div className="flex h-[60vh] flex-col items-center justify-center">
            <h2 className="mb-4">{t('something_went_wrong')}</h2>
            <p className="mb-4 text-center">{getErrorMessage(error)}</p>
            <div className="mt-4 w-48">
                <Button
                    outline
                    onClick={handleReset}
                    label={t('reload')}
                />
            </div>
        </div>
    );
}
