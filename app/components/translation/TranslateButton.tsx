'use client';

import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { FiGlobe } from 'react-icons/fi';
import i18n from '@/app/i18n';

// Chrome's built-in AI APIs
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

    useEffect(() => {
        // Mark as mounted to prevent hydration mismatch
        setMounted(true);

        // Check if APIs are available
        if ('Translator' in window && 'LanguageDetector' in window) {
            setIsAvailable(true);
            detectLanguage();
        }
    }, [text]);

    const detectLanguage = async () => {
        if (!text || text.trim().length === 0) return;

        try {
            const detector = await window.LanguageDetector.create();
            const results = await detector.detect(text);

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
            console.error('Language detection failed:', error);
        }
    };

    const handleTranslate = async () => {
        if (!text || isTranslating) return;

        setIsTranslating(true);

        try {
            const targetLanguage = i18n.language || 'en';
            let sourceLanguage = detectedLanguage || 'en';

            // If detected language is same as target, try to detect again or use fallback
            if (sourceLanguage === targetLanguage) {
                // Try to use a different source language if available
                sourceLanguage = targetLanguage === 'en' ? 'es' : 'en';
            }

            // Check availability for the language pair
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
                    monitor(m: any) {
                        m.addEventListener('downloadprogress', (e: any) => {
                            // Optional: show download progress
                            console.log(`Downloaded ${e.loaded * 100}%`);
                        });
                    },
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

    // Don't render until mounted to prevent hydration mismatch
    if (!mounted) {
        return null;
    }

    if (!isAvailable) {
        return null;
    }

    // Don't show button if text is empty or too short
    if (!text || text.trim().length < 10) {
        return null;
    }

    // Don't show button if detected language matches target language
    const targetLanguage = i18n.language || 'en';
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
