'use client';

import { useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { FiGlobe } from 'react-icons/fi';
import i18n from '@/app/i18n';

declare global {
    interface Window {
        LanguageDetector: {
            create(options?: { monitor?: (monitor: any) => void }): Promise<{
                detect(
                    text: string
                ): Promise<
                    Array<{ detectedLanguage: string; confidence: number }>
                >;
            }>;
        };
        Translator: {
            availability(options: {
                sourceLanguage: string;
                targetLanguage: string;
            }): Promise<'available' | 'downloadable' | 'unavailable'>;
            create(options: {
                sourceLanguage: string;
                targetLanguage: string;
                monitor?: (monitor: any) => void;
            }): Promise<{
                translate(text: string): Promise<string>;
                translateStreaming(text: string): AsyncIterable<string>;
            }>;
        };
    }
}

interface TranslateButtonProps {
    text: string;
    onTranslate: (translatedText: string) => void;
    className?: string;
    size?: number;
}

export function TranslateButton({
    text,
    onTranslate,
    className = '',
    size = 18,
}: TranslateButtonProps) {
    const { t } = useTranslation();
    const [mounted, setMounted] = useState(false);
    const [isAvailable, setIsAvailable] = useState(false);
    const [isTranslating, setIsTranslating] = useState(false);
    const [detectedLanguage, setDetectedLanguage] = useState<string | null>(
        null
    );

    const detectLanguage = useCallback(async () => {
        if (!text || text.trim().length === 0) return;

        try {
            const detector = await window.LanguageDetector.create();
            const results = await detector.detect(text);

            if (results && results.length > 0) {
                const topResult = results[0];
                if (topResult.confidence > 0.5) {
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
            console.error('Language detection failed:', error);
        }
    }, [text]);

    useEffect(() => {
        setMounted(true);

        if ('Translator' in window && 'LanguageDetector' in window) {
            setIsAvailable(true);
            detectLanguage();
        }
    }, [text, detectLanguage]);

    const handleTranslate = async () => {
        if (!text || isTranslating) return;

        setIsTranslating(true);

        try {
            const targetLanguage =
                (typeof i18n.language === 'string'
                    ? i18n.language
                    : i18n.resolvedLanguage) || 'es';
            let sourceLanguage = detectedLanguage || 'en';

            if (sourceLanguage === targetLanguage) {
                sourceLanguage = targetLanguage === 'en' ? 'es' : 'en';
            }

            const availability = await window.Translator.availability({
                sourceLanguage,
                targetLanguage,
            });

            if (
                availability === 'available' ||
                availability === 'downloadable'
            ) {
                const translator = await window.Translator.create({
                    sourceLanguage,
                    targetLanguage,
                });

                const translated = await translator.translate(text);
                onTranslate(translated);
            } else {
                console.warn(
                    'Translation not available for this language pair'
                );
            }
        } catch (error) {
            console.error('Translation failed:', error);
        } finally {
            setIsTranslating(false);
        }
    };

    if (!mounted) {
        return null;
    }

    if (!isAvailable) {
        return null;
    }

    if (!text || text.trim().length < 10) {
        return null;
    }
    const targetLanguage =
        (typeof i18n.language === 'string'
            ? i18n.language
            : i18n.resolvedLanguage) || 'es';
    if (detectedLanguage === targetLanguage) {
        return null;
    }

    return (
        <button
            onClick={handleTranslate}
            disabled={isTranslating}
            className={`inline-flex cursor-pointer items-center gap-1 text-sm text-gray-600 hover:text-gray-800 disabled:cursor-not-allowed disabled:opacity-50 dark:text-neutral-400 dark:hover:text-neutral-200 ${className}`}
            title={t('translate') || 'Translate'}
            aria-label={t('translate') || 'Translate'}
        >
            <FiGlobe
                size={size}
                className={isTranslating ? 'animate-spin' : ''}
            />
            <span className="text-xs">
                {isTranslating ? t('translating') : t('translate')}
            </span>
        </button>
    );
}
