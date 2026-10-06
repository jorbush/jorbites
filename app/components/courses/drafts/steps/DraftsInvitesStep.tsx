'use client';

import React from 'react';
import { useTranslation } from 'react-i18next';
import { FiUserPlus } from 'react-icons/fi';
import CourseInfoStep from '@/app/components/courses/steps/CourseInfoStep';
import DraftQuotaSimulator from '../simulators/DraftQuotaSimulator';

interface DraftsInvitesStepProps {
    onComplete: () => void;
}

export const DraftsInvitesStep: React.FC<DraftsInvitesStepProps> = ({
    onComplete,
}) => {
    const { t } = useTranslation();

    const paragraphs = [
        t('drafts_course_details.invites_desc1') ||
            'Cooking is more fun together! Jorbites makes it easy to invite family and friends to co-author your recipes.',
        t('drafts_course_details.invites_desc2') ||
            'You can share a private invite link directly via chat, or search for friends by their Jorbites username and add them instantly.',
        t('drafts_course_details.invites_desc3') ||
            'Best of all, inviting a co-cook to your solo draft automatically upgrades it into a shared collaborative draft—no manual setup needed.',
    ];

    return (
        <CourseInfoStep
            title={
                t('drafts_course_details.invites_title') ||
                'Inviting Friends & Co-Cooks'
            }
            icon={FiUserPlus}
            paragraphs={paragraphs}
            onComplete={onComplete}
        >
            <DraftQuotaSimulator />
        </CourseInfoStep>
    );
};

export default DraftsInvitesStep;
