'use client';

import React from 'react';
import TranslationControls from './TranslationControls';
import { useRecipeTranslation } from '@/app/hooks/useRecipeTranslation';

interface TranslateableRecipeContentProps {
    description: React.ReactNode;
    descriptionText?: string;
    ingredients: React.ReactNode[];
    ingredientsText?: string[];
    steps: React.ReactNode[];
    stepsText?: string[];
    RenderDescription: React.ComponentType<{
        content: string | React.ReactNode;
    }>;
    RenderIngredients: React.ComponentType<{ items: string[] }>;
    RenderSteps: React.ComponentType<{ items: string[] }>;
}

export function TranslateableRecipeContent({
    description,
    descriptionText,
    ingredientsText,
    stepsText,
    RenderDescription,
    RenderIngredients,
    RenderSteps,
}: TranslateableRecipeContentProps) {
    const {
        isTranslated,
        isTranslating,
        handleTranslate,
        handleShowOriginal,
        displayDescription,
        displayIngredients,
        displaySteps,
        showTranslateButton,
        t,
    } = useRecipeTranslation({
        description,
        descriptionText,
        ingredientsText,
        stepsText,
    });

    return (
        <>
            <div className="mb-2">
                <hr className="mb-2" />
                <div className="mb-2 flex min-h-[28px] items-center justify-end">
                    <TranslationControls
                        showTranslateButton={showTranslateButton}
                        isTranslated={isTranslated}
                        isTranslating={isTranslating}
                        onTranslate={handleTranslate}
                        onShowOriginal={handleShowOriginal}
                        t={t}
                    />
                </div>
                <RenderDescription content={displayDescription} />
            </div>
            <RenderIngredients items={displayIngredients} />
            <RenderSteps items={displaySteps} />
        </>
    );
}
