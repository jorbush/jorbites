'use client';

import React from 'react';
import { SafeCertificate, SafeUser } from '@/app/types';
import DraftsCourseOverview from '../DraftsCourseOverview';
import DraftsWorkflowStep from './DraftsWorkflowStep';
import DraftsInvitesStep from './DraftsInvitesStep';
import DraftsRolesStep from './DraftsRolesStep';
import DraftsLockingStep from './DraftsLockingStep';
import DraftsSyncStep from './DraftsSyncStep';
import DraftsTestStep from './DraftsTestStep';
import { StepId } from './useDraftsSteps';

interface DraftsStepContentProps {
    activeStep: StepId;
    completedModules: Record<string, boolean>;
    markModuleCompleted: (id: string) => void;
    setActiveStep: (step: StepId) => void;
    isTestPassed: boolean;
    currentUser?: SafeUser | null;
    initialCertificate?: SafeCertificate | null;
}

export const DraftsStepContent: React.FC<DraftsStepContentProps> = ({
    activeStep,
    completedModules,
    markModuleCompleted,
    setActiveStep,
    isTestPassed,
    currentUser,
    initialCertificate,
}) => {
    switch (activeStep) {
        case 'requirements':
            return (
                <DraftsCourseOverview
                    completedModules={completedModules}
                    markModuleCompleted={markModuleCompleted}
                    onNext={() => setActiveStep('workflow')}
                />
            );
        case 'workflow':
            return (
                <DraftsWorkflowStep
                    onComplete={() => {
                        markModuleCompleted('workflow');
                        setActiveStep('invites');
                    }}
                />
            );
        case 'invites':
            return (
                <DraftsInvitesStep
                    onComplete={() => {
                        markModuleCompleted('invites');
                        setActiveStep('roles');
                    }}
                />
            );
        case 'roles':
            return (
                <DraftsRolesStep
                    onComplete={() => {
                        markModuleCompleted('roles');
                        setActiveStep('locking');
                    }}
                />
            );
        case 'locking':
            return (
                <DraftsLockingStep
                    onComplete={() => {
                        markModuleCompleted('locking');
                        setActiveStep('sync');
                    }}
                />
            );
        case 'sync':
            return (
                <DraftsSyncStep
                    onComplete={() => {
                        markModuleCompleted('sync');
                        setActiveStep('test');
                    }}
                />
            );
        case 'test':
            return (
                <DraftsTestStep
                    isTestPassed={isTestPassed}
                    currentUser={currentUser}
                    initialCertificate={initialCertificate}
                    onPass={() => markModuleCompleted('test')}
                />
            );
    }
};

export default DraftsStepContent;
