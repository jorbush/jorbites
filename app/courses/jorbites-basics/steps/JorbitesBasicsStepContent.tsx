'use client';

import React from 'react';
import { SafeCertificate, SafeUser } from '@/app/types';
import JorbitesBasicsOverview from '../JorbitesBasicsOverview';
import JorbitesBasicsWorkflowStep from './JorbitesBasicsWorkflowStep';
import JorbitesBasicsInteractionsStep from './JorbitesBasicsInteractionsStep';
import JorbitesBasicsSettingsStep from './JorbitesBasicsSettingsStep';
import JorbitesBasicsPwaStep from './JorbitesBasicsPwaStep';
import JorbitesBasicsTestStep from './JorbitesBasicsTestStep';
import { StepId } from './useJorbitesBasicsSteps';

interface JorbitesBasicsStepContentProps {
    activeStep: StepId;
    completedModules: Record<string, boolean>;
    markModuleCompleted: (id: string) => void;
    setActiveStep: (step: StepId) => void;
    isTestPassed: boolean;
    currentUser?: SafeUser | null;
    initialCertificate?: SafeCertificate | null;
}

export const JorbitesBasicsStepContent: React.FC<
    JorbitesBasicsStepContentProps
> = ({
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
                <JorbitesBasicsOverview
                    completedModules={completedModules}
                    markModuleCompleted={markModuleCompleted}
                    onNext={() => setActiveStep('workflow')}
                />
            );
        case 'workflow':
            return (
                <JorbitesBasicsWorkflowStep
                    onComplete={() => {
                        markModuleCompleted('workflow');
                        setActiveStep('interactions');
                    }}
                />
            );
        case 'interactions':
            return (
                <JorbitesBasicsInteractionsStep
                    onComplete={() => {
                        markModuleCompleted('interactions');
                        setActiveStep('settings');
                    }}
                />
            );
        case 'settings':
            return (
                <JorbitesBasicsSettingsStep
                    onComplete={() => {
                        markModuleCompleted('settings');
                        setActiveStep('pwa');
                    }}
                />
            );
        case 'pwa':
            return (
                <JorbitesBasicsPwaStep
                    onComplete={() => {
                        markModuleCompleted('pwa');
                        setActiveStep('test');
                    }}
                />
            );
        case 'test':
            return (
                <JorbitesBasicsTestStep
                    isTestPassed={isTestPassed}
                    currentUser={currentUser}
                    initialCertificate={initialCertificate}
                    onPass={() => markModuleCompleted('test')}
                />
            );
    }
};

export default JorbitesBasicsStepContent;
