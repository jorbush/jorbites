'use client';

import React from 'react';
import { useTranslation } from 'react-i18next';
import { FieldErrors, FieldValues, UseFormRegister } from 'react-hook-form';
import Input from '@/app/components/inputs/Input';
import { validateYouTubeUrl } from '@/app/utils/validation';

export interface RelatedYouTubeSectionProps {
    isLoading: boolean;
    register: UseFormRegister<FieldValues>;
    errors: FieldErrors;
}

const RelatedYouTubeSection: React.FC<RelatedYouTubeSectionProps> = ({
    isLoading,
    register,
    errors,
}) => {
    const { t } = useTranslation();

    return (
        <div className="space-y-3">
            <Input
                id="youtubeUrl"
                label={t('youtube_url_optional')}
                type="url"
                disabled={isLoading}
                register={register}
                errors={errors}
                dataCy="youtube-url-input"
                validation={{
                    validate: (value: string) =>
                        validateYouTubeUrl(
                            value,
                            t('invalid_youtube_url') ||
                                'Please enter a valid YouTube URL (e.g., https://youtube.com/watch?v=... or https://youtu.be/...)'
                        ),
                }}
            />
        </div>
    );
};

export default RelatedYouTubeSection;
