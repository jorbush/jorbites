'use client';

import React from 'react';
import { SafeCertificate, SafeUser } from '@/app/types';
import RecipeBookOverview from '../RecipeBookOverview';
import RecipeBookWorkflowStep from './RecipeBookWorkflowStep';
import RecipeBookStylesStep from './RecipeBookStylesStep';
import RecipeBookSelectionStep from './RecipeBookSelectionStep';
import RecipeBookTestStep from './RecipeBookTestStep';
import { StepId } from './useRecipeBookSteps';

interface RecipeBookStepContentProps {
    activeStep: StepId;
    completedModules: Record<string, boolean>;
    markModuleCompleted: (id: string) => void;
    setActiveStep: (step: StepId) => void;
    isTestPassed: boolean;
    currentUser?: SafeUser | null;
    initialCertificate?: SafeCertificate | null;
}

export const RecipeBookStepContent: React.FC<RecipeBookStepContentProps> = ({
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
                <RecipeBookOverview
                    completedModules={completedModules}
                    markModuleCompleted={markModuleCompleted}
                    onNext={() => setActiveStep('workflow')}
                />
            );
        case 'workflow':
            return (
                <RecipeBookWorkflowStep
                    onComplete={() => {
                        markModuleCompleted('workflow');
                        setActiveStep('styles');
                    }}
                />
            );
        case 'styles':
            return (
                <RecipeBookStylesStep
                    onComplete={() => {
                        markModuleCompleted('styles');
                        setActiveStep('selection');
                    }}
                />
            );
        case 'selection':
            return (
                <RecipeBookSelectionStep
                    onComplete={() => {
                        markModuleCompleted('selection');
                        setActiveStep('test');
                    }}
                />
            );
        case 'test':
            return (
                <RecipeBookTestStep
                    isTestPassed={isTestPassed}
                    currentUser={currentUser}
                    initialCertificate={initialCertificate}
                    onPass={() => markModuleCompleted('test')}
                />
            );
    }
};

export default RecipeBookStepContent;
