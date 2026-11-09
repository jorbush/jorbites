'use client';

import React from 'react';
import { SafeCertificate, SafeUser } from '@/app/types';
import WorkshopsOverview from './WorkshopsOverview';
import WorkshopsWorkflowStep from './WorkshopsWorkflowStep';
import WorkshopsWhitelistStep from './WorkshopsWhitelistStep';
import WorkshopsApprovalsStep from './WorkshopsApprovalsStep';
import WorkshopsTestStep from './WorkshopsTestStep';
import { StepId } from './useWorkshopsSteps';

interface WorkshopsStepContentProps {
    activeStep: StepId;
    completedModules: Record<string, boolean>;
    markModuleCompleted: (id: string) => void;
    setActiveStep: (step: StepId) => void;
    isTestPassed: boolean;
    currentUser?: SafeUser | null;
    initialCertificate?: SafeCertificate | null;
}

export const WorkshopsStepContent: React.FC<WorkshopsStepContentProps> = ({
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
                <WorkshopsOverview
                    completedModules={completedModules}
                    markModuleCompleted={markModuleCompleted}
                    onNext={() => setActiveStep('workflow')}
                />
            );
        case 'workflow':
            return (
                <WorkshopsWorkflowStep
                    onComplete={() => {
                        markModuleCompleted('workflow');
                        setActiveStep('whitelist');
                    }}
                />
            );
        case 'whitelist':
            return (
                <WorkshopsWhitelistStep
                    onComplete={() => {
                        markModuleCompleted('whitelist');
                        setActiveStep('approvals');
                    }}
                />
            );
        case 'approvals':
            return (
                <WorkshopsApprovalsStep
                    onComplete={() => {
                        markModuleCompleted('approvals');
                        setActiveStep('test');
                    }}
                />
            );
        case 'test':
            return (
                <WorkshopsTestStep
                    isTestPassed={isTestPassed}
                    currentUser={currentUser}
                    initialCertificate={initialCertificate}
                    onPass={() => markModuleCompleted('test')}
                />
            );
    }
};

export default WorkshopsStepContent;
