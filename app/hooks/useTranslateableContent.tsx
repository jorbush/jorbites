'use client';

import React, {
    useState,
    useEffect,
    useMemo,
    useRef,
    useCallback,
} from 'react';
import { useTranslation } from 'react-i18next';
import { TranslateButton } from '@/app/components/translation/TranslateButton';
import { FiGlobe } from 'react-icons/fi';
import i18n from '@/app/i18n';

// Extract text content from React node
const getTextContent = (node: string | React.ReactNode): string => {
    if (typeof node === 'string') {
        return node;
    }
    if (React.isValidElement(node)) {
        const props = node.props as any;
        if (props?.children) {
            const childrenText = getTextContent(props.children);
            if (childrenText) return childrenText;
        }
        if (props?.textContent) {
            return String(props.textContent);
        }
    }
    if (Array.isArray(node)) {
        return node.map(getTextContent).join(' ');
    }
    return '';
};

interface UseTranslateableContentProps {
    content: string | React.ReactNode;
    rawText?: string;
    showButton?: boolean;
}

export function useTranslateableContent({
    content,
    rawText,
    showButton = true,
}: UseTranslateableContentProps) {
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

    const textContent = useMemo(
        () => rawText || getTextContent(content),
        [rawText, content]
    );

    const currentLanguage = i18n.language;

    const contentKey = useMemo(
        () => `${textContent}|${currentLanguage}`,
        [textContent, currentLanguage]
    );

    const prevContentKeyRef = useRef('');

    useEffect(() => {
        if (!mounted) {
            setMounted(true);
            const apiAvailable =
                typeof window !== 'undefined' &&
                'Translator' in window &&
                'LanguageDetector' in window;
            setIsAvailable(apiAvailable);
        }

        if (prevContentKeyRef.current === contentKey) {
            return;
        }

        prevContentKeyRef.current = contentKey;

        setTranslatedContent(null);
        setIsTranslated(false);
        setDetectedLanguage(null);

        if (!textContent || textContent.trim().length < 10) {
            return;
        }

        const apiAvailable =
            typeof window !== 'undefined' &&
            'Translator' in window &&
            'LanguageDetector' in window;

        if (!apiAvailable) {
            return;
        }

        let cancelled = false;

        const detectLanguage = async () => {
            try {
                const detector = await window.LanguageDetector.create();
                const results = await detector.detect(textContent);

                if (cancelled) return;

                if (results && results.length > 0) {
                    const topResult = results[0];
                    if (topResult.confidence > 0.5) {
                        if (cancelled) return;
                        const lang = topResult.detectedLanguage;
                        if (['en', 'ca', 'es'].includes(lang)) {
                            setDetectedLanguage(lang);
                        } else {
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
                        type="button"
                        onClick={handleShowOriginal}
                        className="inline-flex cursor-pointer items-center gap-1 text-xs text-neutral-600 hover:text-neutral-800 dark:text-neutral-400 dark:hover:text-neutral-200"
                    >
                        <FiGlobe size={18} />
                        <span>{t('show_original')}</span>
                    </button>
                )
            ) : null,
        [
            showTranslateButton,
            isTranslated,
            textContent,
            handleTranslate,
            handleShowOriginal,
            t,
        ]
    );

    return {
        displayContent,
        translateButtonElement,
        isTranslated,
        isAvailable,
        detectedLanguage,
        needsTranslation,
    };
}
