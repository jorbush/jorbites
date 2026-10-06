'use client';

import React from 'react';
import { useTranslation } from 'react-i18next';
import { FiShield } from 'react-icons/fi';
import CourseInfoStep from '@/app/components/courses/steps/CourseInfoStep';
import RolePermissionSimulator from '../simulators/RolePermissionSimulator';

interface DraftsRolesStepProps {
    onComplete: () => void;
}

export const DraftsRolesStep: React.FC<DraftsRolesStepProps> = ({
    onComplete,
}) => {
    const { t } = useTranslation();

    const paragraphs = [
        t('drafts_course_details.roles_desc1') ||
            'Every kitchen needs good teamwork. As the recipe owner, you decide the level of access each co-cook receives.',
        t('drafts_course_details.roles_desc2') ||
            'Editors can add ingredients, write instructions, and update cooking times. Viewers have a read-only view—perfect for taste testers, family members, or proofreaders who want to review without accidentally modifying the text.',
        t('drafts_course_details.roles_desc3') ||
            "Collaborators can also cleanly click 'Leave draft' whenever their contribution is complete.",
    ];

    return (
        <CourseInfoStep
            title={
                t('drafts_course_details.roles_title') ||
                'Chef Roles: Editor vs. Viewer'
            }
            icon={FiShield}
            paragraphs={paragraphs}
            onComplete={onComplete}
        >
            <RolePermissionSimulator />
        </CourseInfoStep>
    );
};

export default DraftsRolesStep;
