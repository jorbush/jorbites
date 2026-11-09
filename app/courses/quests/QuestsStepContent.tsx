'use client';

import React from 'react';
import { useTranslation } from 'react-i18next';
import { FiBookOpen, FiLink, FiClock } from 'react-icons/fi';
import { SafeCertificate, SafeUser } from '@/app/types';

import CourseInfoStep from '@/app/components/courses/steps/CourseInfoStep';
import CourseWorkflowStep from '@/app/components/courses/steps/CourseWorkflowStep';
import QuestsOverview from './QuestsOverview';
import QuestsTestStep from './QuestsTestStep';
import { StepId } from './useQuestsSteps';

interface QuestsStepContentProps {
    activeStep: StepId;
    completedModules: Record<string, boolean>;
    markModuleCompleted: (id: string) => void;
    setActiveStep: (step: StepId) => void;
    isTestPassed: boolean;
    currentUser?: SafeUser | null;
    initialCertificate?: SafeCertificate | null;
}

const QuestsStepContent: React.FC<QuestsStepContentProps> = ({
    activeStep,
    completedModules,
    markModuleCompleted,
    setActiveStep,
    isTestPassed,
    currentUser,
    initialCertificate,
}) => {
    const { t } = useTranslation();

    switch (activeStep) {
        case 'requirements':
            return (
                <QuestsOverview
                    completedModules={completedModules}
                    markModuleCompleted={markModuleCompleted}
                    onNext={() => setActiveStep('workflow')}
                />
            );

        case 'workflow':
            return (
                <CourseWorkflowStep
                    title={
                        t('quests_course_details.workflow_title') ||
                        'Quests Workflow'
                    }
                    icon={FiBookOpen}
                    stepPrefix="quests_course_details.workflow_step"
                    totalSteps={5}
                    onComplete={() => {
                        markModuleCompleted('workflow');
                        setActiveStep('linking');
                    }}
                />
            );

        case 'linking':
            return (
                <CourseInfoStep
                    title={
                        t('quests_course_details.linking_info_title') ||
                        'Linking Recipes & Solutions'
                    }
                    icon={FiLink}
                    paragraphs={[
                        t('quests_course_details.linking_desc1') ||
                            'To fulfill a quest, click into the specific quest details and use the "Link Recipe" option. You can search your published recipes and select the one that matches the request.',
                        t('quests_course_details.linking_desc2') ||
                            'Once linked, the quest status changes to In Progress, and the host is notified to review your cooking guide.',
                    ]}
                    onComplete={() => {
                        markModuleCompleted('linking');
                        setActiveStep('statuses');
                    }}
                />
            );

        case 'statuses':
            return (
                <CourseInfoStep
                    title={
                        t('quests_course_details.status_info_title') ||
                        'Managing Quest Statuses'
                    }
                    icon={FiClock}
                    paragraphs={[
                        t('quests_course_details.status_desc1') ||
                            'Only the quest creator (host) can accept a linked recipe to close the quest. Accepting a recipe automatically transitions the quest status to Completed.',
                        t('quests_course_details.status_desc2') ||
                            'Completed quests remain visible in the archive, allowing the entire community to view and cook the successful recipes.',
                    ]}
                    onComplete={() => {
                        markModuleCompleted('statuses');
                        setActiveStep('test');
                    }}
                />
            );

        case 'test':
            return (
                <QuestsTestStep
                    isTestPassed={isTestPassed}
                    currentUser={currentUser}
                    initialCertificate={initialCertificate}
                    onPass={() => markModuleCompleted('test')}
                />
            );
    }
};

export default QuestsStepContent;
