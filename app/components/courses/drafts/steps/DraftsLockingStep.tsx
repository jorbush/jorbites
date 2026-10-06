'use client';

import React from 'react';
import { useTranslation } from 'react-i18next';
import { FiLock } from 'react-icons/fi';
import CourseInfoStep from '@/app/components/courses/steps/CourseInfoStep';
import LockSimulator from '../simulators/LockSimulator';

interface DraftsLockingStepProps {
    onComplete: () => void;
}

export const DraftsLockingStep: React.FC<DraftsLockingStepProps> = ({
    onComplete,
}) => {
    const { t } = useTranslation();

    const paragraphs = [
        t('drafts_course_details.locking_desc1') ||
            'Wondering what happens if two chefs edit the same recipe at the same time? Jorbites features smart Step Locking to keep everyone organized.',
        t('drafts_course_details.locking_desc2') ||
            "When your co-cook enters the 'Ingredients' step, that step displays an orange banner showing their avatar: 'Chef Maria is currently editing this step'.",
        t('drafts_course_details.locking_desc3') ||
            'While your friend is editing, that specific step is gently protected to prevent accidental typing collisions. As soon as your friend moves to the next step, it unlocks immediately for you!',
    ];

    return (
        <CourseInfoStep
            title={
                t('drafts_course_details.locking_title') ||
                'Live Co-Cooking & Step Locking'
            }
            icon={FiLock}
            paragraphs={paragraphs}
            onComplete={onComplete}
        >
            <LockSimulator />
        </CourseInfoStep>
    );
};

export default DraftsLockingStep;
