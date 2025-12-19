'use client';

import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { TranslateButton } from '@/app/components/translation/TranslateButton';
import { FiGlobe } from 'react-icons/fi';
import i18n from '@/app/i18n';

interface TranslateableContentProps {
    content: string | React.ReactNode;
    rawText?: string; // Raw text for translation (if content is a React node)
    className?: string;
    showButton?: boolean;
    renderContent?: (content: string | React.ReactNode) => React.ReactNode;
}

export function TranslateableContent({
    content,
    rawText,
    className = '',
    showButton = true,
    renderContent,
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

    useEffect(() => {
        setMounted(true);

        // Check if Translator API is available
        if (
            typeof window !== 'undefined' &&
            'Translator' in window &&
            'LanguageDetector' in window
        ) {
            setIsAvailable(true);
        }
    }, []);

    // Extract text content if it's a React node
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
            if (
                props?.dangerouslySetInnerHTML &&
                typeof document !== 'undefined'
            ) {
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

    // Use rawText if provided, otherwise extract from content
    const textContent = rawText || getTextContent(content);

    // Detect language when API becomes available and content changes
    useEffect(() => {
        if (!isAvailable || !mounted) return;

        const detectLanguage = async () => {
            if (!textContent || textContent.trim().length < 10) {
                setDetectedLanguage(null);
                return;
            }

            try {
                const detector = await window.LanguageDetector.create();
                const results = await detector.detect(textContent);

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
                    } else {
                        setDetectedLanguage(null);
                    }
                } else {
                    setDetectedLanguage(null);
                }
            } catch (error) {
                console.error('Language detection failed:', error);
                setDetectedLanguage(null);
            }
        };

        detectLanguage();
    }, [isAvailable, mounted, textContent]);

    // Get current language for dependency tracking
    const currentLanguage = i18n.language;

    // Reset translation when content or language changes
    useEffect(() => {
        setTranslatedContent(null);
        setIsTranslated(false);
    }, [textContent, currentLanguage]);

    const handleTranslate = (translated: string) => {
        setTranslatedContent(translated);
        setIsTranslated(true);
    };

    const handleShowOriginal = () => {
        setIsTranslated(false);
    };

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

    return (
        <div className={`relative ${className}`}>
            {showTranslateButton && (
                <div className="flex items-center justify-end">
                    {!isTranslated ? (
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
                    )}
                </div>
            )}
            <div>
                {renderContent ? renderContent(displayContent) : displayContent}
            </div>
        </div>
    );
}
