'use client';

import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import Button from '@/app/components/Button';

interface ErrorProps {
    error: Error;
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

    return (
        <div className="flex h-[60vh] flex-col items-center justify-center">
            <h2 className="mb-4">{t('something_went_wrong')}</h2>
            <p className="mb-4">{error.message}</p>
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
