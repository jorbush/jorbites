'use client';

import React from 'react';
import TranslationControls from './TranslationControls';
import { useRecipeTranslation } from '@/app/hooks/useRecipeTranslation';
import { GanttTable } from '@/app/types';

interface TranslateableRecipeContentProps {
    description: React.ReactNode;
    descriptionText?: string;
    ingredientsText?: string[];
    stepsText?: string[];
    ganttTable?: GanttTable | null;
    recipeTitle?: string;
    RenderDescription: React.ComponentType<{
        content: string | React.ReactNode;
    }>;
    RenderIngredients: React.ComponentType<{ items: string[] }>;
    RenderSteps: React.ComponentType<{ items: string[] }>;
    RenderGanttTable?: React.ComponentType<{
        ganttTable?: GanttTable | null;
        recipeTitle?: string;
    }>;
}

export function TranslateableRecipeContent({
    description,
    descriptionText,
    ingredientsText,
    stepsText,
    ganttTable,
    recipeTitle,
    RenderDescription,
    RenderIngredients,
    RenderSteps,
    RenderGanttTable,
}: TranslateableRecipeContentProps) {
    const {
        isTranslated,
        isTranslating,
        handleTranslate,
        handleShowOriginal,
        displayDescription,
        displayIngredients,
        displaySteps,
        displayGanttTable,
        showTranslateButton,
        t,
    } = useRecipeTranslation({
        description,
        descriptionText,
        ingredientsText,
        stepsText,
        ganttTable,
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
            {RenderGanttTable && (
                <RenderGanttTable
                    ganttTable={displayGanttTable}
                    recipeTitle={recipeTitle}
                />
            )}
        </>
    );
}
