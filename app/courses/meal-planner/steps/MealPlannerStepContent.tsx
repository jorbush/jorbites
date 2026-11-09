'use client';

import React from 'react';
import { SafeCertificate, SafeUser } from '@/app/types';
import MealPlannerOverview from '../MealPlannerOverview';
import MealPlannerWorkflowStep from './MealPlannerWorkflowStep';
import MealPlannerSlotsStep from './MealPlannerSlotsStep';
import MealPlannerExportsStep from './MealPlannerExportsStep';
import MealPlannerTestStep from './MealPlannerTestStep';
import { StepId } from './useMealPlannerSteps';

interface MealPlannerStepContentProps {
    activeStep: StepId;
    completedModules: Record<string, boolean>;
    markModuleCompleted: (id: string) => void;
    setActiveStep: (step: StepId) => void;
    isTestPassed: boolean;
    currentUser?: SafeUser | null;
    initialCertificate?: SafeCertificate | null;
}

export const MealPlannerStepContent: React.FC<MealPlannerStepContentProps> = ({
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
                <MealPlannerOverview
                    completedModules={completedModules}
                    markModuleCompleted={markModuleCompleted}
                    onNext={() => setActiveStep('workflow')}
                />
            );
        case 'workflow':
            return (
                <MealPlannerWorkflowStep
                    onComplete={() => {
                        markModuleCompleted('workflow');
                        setActiveStep('slots');
                    }}
                />
            );
        case 'slots':
            return (
                <MealPlannerSlotsStep
                    onComplete={() => {
                        markModuleCompleted('slots');
                        setActiveStep('exports');
                    }}
                />
            );
        case 'exports':
            return (
                <MealPlannerExportsStep
                    onComplete={() => {
                        markModuleCompleted('exports');
                        setActiveStep('test');
                    }}
                />
            );
        case 'test':
            return (
                <MealPlannerTestStep
                    isTestPassed={isTestPassed}
                    currentUser={currentUser}
                    initialCertificate={initialCertificate}
                    onPass={() => markModuleCompleted('test')}
                />
            );
    }
};

export default MealPlannerStepContent;
