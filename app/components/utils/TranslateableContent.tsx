'use client';

import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { TranslateButton } from '@/app/components/translation/TranslateButton';
import { FiGlobe } from 'react-icons/fi';
import i18n from '@/app/i18n';

interface TranslateableContentProps {
    content: string | React.ReactNode;
    rawText?: string;
    className?: string;
    showButton?: boolean;
    renderButton?: boolean;
    renderContent?: (content: string | React.ReactNode) => React.ReactNode;
    onButtonStateChange?: (button: React.ReactNode | null) => void;
}

// Extract text content from React node - defined outside component to avoid recreation
const getTextContent = (node: string | React.ReactNode): string => {
    if (typeof node === 'string') {
        return node;
    }
    if (React.isValidElement(node)) {
        const props = node.props as any;
        // Try to extract text from React element
        if (props?.children) {
            const childrenText = getTextContent(props.children);
            if (childrenText) return childrenText;
        }
        // Try to get text from dangerouslySetInnerHTML if available
        if (props?.dangerouslySetInnerHTML && typeof document !== 'undefined') {
            const html = props.dangerouslySetInnerHTML.__html;
            const div = document.createElement('div');
            div.innerHTML = html;
            return div.textContent || '';
        }
        // Try to get text from textContent prop if available
        if (props?.textContent) {
            return String(props.textContent);
        }
    }
    // Handle arrays of nodes
    if (Array.isArray(node)) {
        return node.map(getTextContent).join(' ');
    }
    return '';
};

export function TranslateableContent({
    content,
    rawText,
    className = '',
    showButton = true,
    renderButton = true,
    renderContent,
    onButtonStateChange,
}: TranslateableContentProps) {
    const { t } = useTranslation();
    const [mounted, setMounted] = useState(false);
    const [isAvailable, setIsAvailable] = useState(false);
    const [detectedLanguage, setDetectedLanguage] = useState<string | null>(
        null
    );
    const [translatedContent, setTranslatedContent] = useState<string | null>(
        null
    );
    const [isTranslated, setIsTranslated] = useState(false);

    // Use rawText if provided, otherwise extract from content
    // Memoize to prevent recalculation on every render
    const textContent = useMemo(
        () => rawText || getTextContent(content),
        [rawText, content]
    );

    // Get current language (i18n.language changes trigger re-renders via useTranslation)
    const currentLanguage = i18n.language;

    // Create a stable content key to track when content actually changes
    const contentKey = useMemo(
        () => `${textContent}|${currentLanguage}`,
        [textContent, currentLanguage]
    );

    // Track previous content key
    const prevContentKeyRef = useRef('');

    // Single useEffect to handle mounting, API availability, language detection, and reset
    useEffect(() => {
        // Mount and API availability check (only on first mount)
        if (!mounted) {
            setMounted(true);
            const apiAvailable =
                typeof window !== 'undefined' &&
                'Translator' in window &&
                'LanguageDetector' in window;
            setIsAvailable(apiAvailable);
        }

        // Check if content actually changed
        if (prevContentKeyRef.current === contentKey) {
            return; // Content hasn't changed, skip
        }

        prevContentKeyRef.current = contentKey;

        // Reset translation state when content or language changes
        setTranslatedContent(null);
        setIsTranslated(false);
        setDetectedLanguage(null);

        // Only detect language if we have valid content
        if (!textContent || textContent.trim().length < 10) {
            return;
        }

        // Check API availability
        const apiAvailable =
            typeof window !== 'undefined' &&
            'Translator' in window &&
            'LanguageDetector' in window;

        if (!apiAvailable) {
            return;
        }

        // Detect language asynchronously
        let cancelled = false;

        const detectLanguage = async () => {
            try {
                const detector = await window.LanguageDetector.create();
                const results = await detector.detect(textContent);

                if (cancelled) return;

                if (results && results.length > 0) {
                    const topResult = results[0];
                    // Only use detection if confidence is high enough
                    if (topResult.confidence > 0.5) {
                        const lang = topResult.detectedLanguage;
                        // Map to supported languages (en, ca, es)
                        if (['en', 'ca', 'es'].includes(lang)) {
                            setDetectedLanguage(lang);
                        } else {
                            // Try to map common language codes
                            const langMap: Record<string, string> = {
                                'en-US': 'en',
                                'en-GB': 'en',
                                'es-ES': 'es',
                                'es-MX': 'es',
                                'ca-ES': 'ca',
                            };
                            setDetectedLanguage(langMap[lang] || null);
                        }
                    }
                }
            } catch (error) {
                if (!cancelled) {
                    console.error('Language detection failed:', error);
                }
            }
        };

        detectLanguage();

        // Cleanup function to prevent state updates if component unmounts
        return () => {
            cancelled = true;
        };
    }, [mounted, contentKey, textContent]);

    const handleTranslate = useCallback((translated: string) => {
        setTranslatedContent(translated);
        setIsTranslated(true);
    }, []);

    const handleShowOriginal = useCallback(() => {
        setIsTranslated(false);
    }, []);

    const displayContent =
        isTranslated && translatedContent ? translatedContent : content;

    // Check if translation is needed (detected language differs from target)
    const targetLanguage = i18n.language || 'en';
    const needsTranslation =
        detectedLanguage && detectedLanguage !== targetLanguage;
    const showTranslateButton =
        mounted &&
        showButton &&
        textContent &&
        isAvailable &&
        (needsTranslation || detectedLanguage === null);

    const translateButtonElement = useMemo(
        () =>
            showTranslateButton ? (
                !isTranslated ? (
                    <TranslateButton
                        text={textContent}
                        onTranslate={handleTranslate}
                    />
                ) : (
                    <button
                        onClick={handleShowOriginal}
                        className="inline-flex cursor-pointer items-center gap-1 text-xs text-gray-600 hover:text-gray-800 dark:text-neutral-400 dark:hover:text-neutral-200"
                    >
                        <FiGlobe size={18} />
                        <span>{t('show_original')}</span>
                    </button>
                )
            ) : null,
        [showTranslateButton, isTranslated, textContent, handleTranslate, handleShowOriginal, t]
    );

    // Track previous button state to avoid infinite loop
    const prevButtonStateRef = useRef<string | null>(null);
    const buttonStateKey = showTranslateButton
        ? isTranslated
            ? 'translated'
            : 'translate'
        : null;

    useEffect(() => {
        if (
            onButtonStateChange &&
            prevButtonStateRef.current !== buttonStateKey
        ) {
            prevButtonStateRef.current = buttonStateKey;
            onButtonStateChange(translateButtonElement);
        }
    }, [buttonStateKey, translateButtonElement, onButtonStateChange]);

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
