'use client';

import React from 'react';
import { useTranslateableContent } from '@/app/hooks/useTranslateableContent';

interface TranslateableContentProps {
    content: string | React.ReactNode;
    rawText?: string;
    className?: string;
    showButton?: boolean;
    renderButton?: boolean;
    renderContent?: (content: string | React.ReactNode) => React.ReactNode;
}

export function TranslateableContent({
    content,
    rawText,
    className = '',
    showButton = true,
    renderButton = true,
    renderContent,
}: TranslateableContentProps) {
    const { displayContent, translateButtonElement } = useTranslateableContent({
        content,
        rawText,
        showButton,
    });

    return (
        <div className={`relative ${className}`}>
            {renderButton && translateButtonElement && (
                <div className="flex items-center justify-end">
                    {translateButtonElement}
                </div>
            )}
            <div>
                {renderContent ? renderContent(displayContent) : displayContent}
            </div>
        </div>
    );
}
