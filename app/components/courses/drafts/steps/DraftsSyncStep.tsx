'use client';

import React from 'react';
import { useTranslation } from 'react-i18next';
import { FiRefreshCw } from 'react-icons/fi';
import CourseInfoStep from '@/app/components/courses/steps/CourseInfoStep';

interface DraftsSyncStepProps {
    onComplete: () => void;
}

export const DraftsSyncStep: React.FC<DraftsSyncStepProps> = ({
    onComplete,
}) => {
    const { t } = useTranslation();

    const paragraphs = [
        t('drafts_course_details.sync_desc1') ||
            'Jorbites automatically synchronizes recipe edits in the background. When your co-cook adds garlic or adjusts cooking minutes, their updates appear on your screen automatically without having to refresh.',
        t('drafts_course_details.sync_desc2') ||
            'Even better, Jorbites actively protects your in-progress typing—your words will never be erased by incoming updates from other chefs.',
        t('drafts_course_details.sync_desc3') ||
            "Whenever a co-cook makes changes, a friendly toast appears: 'Step updated by a co-cook 👨‍🍳'. Once your culinary creation is complete, hit 'Publish' and share your masterpiece with the world!",
    ];

    return (
        <CourseInfoStep
            title={
                t('drafts_course_details.sync_title') ||
                'Live Updates & Publishing Together'
            }
            icon={FiRefreshCw}
            paragraphs={paragraphs}
            onComplete={onComplete}
        />
    );
};

export default DraftsSyncStep;
