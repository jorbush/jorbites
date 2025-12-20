'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { FiGlobe } from 'react-icons/fi';
import i18n from '@/app/i18n';
import { toast } from 'react-hot-toast';

interface TranslateableRecipeContentProps {
    description: React.ReactNode;
    descriptionText?: string;
    ingredients: React.ReactNode[];
    ingredientsText?: string[];
    steps: React.ReactNode[];
    stepsText?: string[];
    renderDescription: (content: string | React.ReactNode) => React.ReactNode;
    renderIngredients: (items: string[]) => React.ReactNode;
    renderSteps: (items: string[]) => React.ReactNode;
}

export function TranslateableRecipeContent({
    description,
    descriptionText,
    ingredients: _ingredients,
    ingredientsText,
    steps: _steps,
    stepsText,
    renderDescription,
    renderIngredients,
    renderSteps,
}: TranslateableRecipeContentProps) {
    const { t } = useTranslation();
    const [mounted, setMounted] = useState(false);
    const [isAvailable, setIsAvailable] = useState(false);
    const [detectedLanguage, setDetectedLanguage] = useState<string | null>(
        null
    );
    const [isTranslated, setIsTranslated] = useState(false);
    const [isTranslating, setIsTranslating] = useState(false);
    const [translatedDescription, setTranslatedDescription] = useState<
        string | null
    >(null);
    const [translatedIngredients, setTranslatedIngredients] = useState<
        string[] | null
    >(null);
    const [translatedSteps, setTranslatedSteps] = useState<string[] | null>(
        null
    );

    // Extract joined strings for dependency array - memoized to prevent recalculation
    const ingredientsTextJoined = useMemo(
        () => ingredientsText?.join('\n') || '',
        [ingredientsText]
    );
    const stepsTextJoined = useMemo(
        () => stepsText?.join('\n') || '',
        [stepsText]
    );

    // Get current language for dependency tracking
    const currentLanguage = i18n.language;

    // Single useEffect to handle mounting, API availability, language detection, and reset
    useEffect(() => {
        setMounted(true);

        // Check if Translator API is available
        const apiAvailable =
            typeof window !== 'undefined' &&
            'Translator' in window &&
            'LanguageDetector' in window;

        setIsAvailable(apiAvailable);

        // Reset translation state when content or language changes
        setTranslatedDescription(null);
        setTranslatedIngredients(null);
        setTranslatedSteps(null);
        setIsTranslated(false);

        // Detect language if API is available
        if (apiAvailable) {
            const detectLanguage = async () => {
                const sampleText =
                    descriptionText ||
                    ingredientsText?.[0] ||
                    stepsText?.[0] ||
                    '';
                if (!sampleText || sampleText.trim().length < 10) {
                    setDetectedLanguage(null);
                    return;
                }

                try {
                    const detector = await window.LanguageDetector.create();
                    const results = await detector.detect(sampleText);

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
        } else {
            setDetectedLanguage(null);
        }
    }, [
        descriptionText,
        ingredientsTextJoined,
        stepsTextJoined,
        currentLanguage,
    ]);

    // Check if we have content to translate
    const hasContent = Boolean(
        descriptionText ||
            (ingredientsText && ingredientsText.length > 0) ||
            (stepsText && stepsText.length > 0)
    );

    const handleTranslate = async () => {
        if (isTranslating || !isAvailable) return;

        // Double-check API availability
        if (
            typeof window === 'undefined' ||
            !('Translator' in window) ||
            !('LanguageDetector' in window)
        ) {
            console.warn('Translator API not available');
            return;
        }

        setIsTranslating(true);

        try {
            const targetLanguage = i18n.language || 'en';

            // Detect source language for each section
            let sourceLanguage = 'en';
            try {
                const detector = await window.LanguageDetector.create();
                const sampleText =
                    descriptionText ||
                    ingredientsText?.[0] ||
                    stepsText?.[0] ||
                    '';
                if (sampleText) {
                    const results = await detector.detect(sampleText);
                    if (
                        results &&
                        results.length > 0 &&
                        results[0].confidence > 0.5
                    ) {
                        const detected = results[0].detectedLanguage;
                        if (['en', 'ca', 'es'].includes(detected)) {
                            sourceLanguage = detected;
                        }
                    }
                }
            } catch (error) {
                console.error('Language detection failed:', error);
            }

            // If detected language matches target, use fallback
            if (sourceLanguage === targetLanguage) {
                sourceLanguage = targetLanguage === 'en' ? 'es' : 'en';
            }

            // Check availability
            const availability = await window.Translator.availability({
                sourceLanguage,
                targetLanguage,
            });

            if (
                availability !== 'available' &&
                availability !== 'downloadable'
            ) {
                console.warn(
                    'Translation not available for this language pair'
                );
                setIsTranslating(false);
                toast.error('Not available for this language');
                return;
            }

            // Create translator
            const translator = await window.Translator.create({
                sourceLanguage,
                targetLanguage,
            });

            // Translate each section separately
            const descriptionPromise = descriptionText
                ? translator.translate(descriptionText)
                : Promise.resolve('');

            const ingredientsPromise =
                ingredientsText && ingredientsText.length > 0
                    ? Promise.all(
                          ingredientsText.map((item) =>
                              translator.translate(item)
                          )
                      )
                    : Promise.resolve([]);

            const stepsPromise =
                stepsText && stepsText.length > 0
                    ? Promise.all(
                          stepsText.map((item) => translator.translate(item))
                      )
                    : Promise.resolve([]);

            const [translatedDesc, translatedIngArray, translatedStpsArray] =
                await Promise.all([
                    descriptionPromise,
                    ingredientsPromise,
                    stepsPromise,
                ]);

            // Process translated description
            if (descriptionText && translatedDesc) {
                setTranslatedDescription(translatedDesc.trim());
            }

            // Process translated ingredients (already an array)
            if (
                Array.isArray(translatedIngArray) &&
                translatedIngArray.length > 0
            ) {
                const translatedIngredientItems = translatedIngArray
                    .map((item) => item.trim())
                    .filter((item) => item.length > 0);

                console.log(
                    'Translated ingredients array:',
                    translatedIngredientItems
                );

                if (translatedIngredientItems.length > 0) {
                    setTranslatedIngredients(translatedIngredientItems);
                }
            }

            // Process translated steps (already an array)
            if (
                Array.isArray(translatedStpsArray) &&
                translatedStpsArray.length > 0
            ) {
                const translatedStepItems = translatedStpsArray
                    .map((item) => item.trim())
                    .filter((item) => item.length > 0);

                console.log('Translated steps array:', translatedStepItems);

                if (translatedStepItems.length > 0) {
                    setTranslatedSteps(translatedStepItems);
                }
            }

            setIsTranslated(true);
        } catch (error) {
            console.error('Translation failed:', error);
        } finally {
            setIsTranslating(false);
        }
    };

    const handleShowOriginal = () => {
        setIsTranslated(false);
        setTranslatedDescription(null);
        setTranslatedIngredients(null);
        setTranslatedSteps(null);
    };

    const displayDescription =
        isTranslated && translatedDescription
            ? translatedDescription
            : description;

    // For ingredients and steps, use translated arrays if available, otherwise use original
    const displayIngredients =
        isTranslated &&
        translatedIngredients &&
        translatedIngredients.length > 0
            ? translatedIngredients
            : ingredientsText || [];

    const displaySteps =
        isTranslated && translatedSteps && translatedSteps.length > 0
            ? translatedSteps
            : stepsText || [];

    // Check if translation is needed (detected language differs from target)
    const targetLanguage = i18n.language || 'en';
    const needsTranslation =
        detectedLanguage && detectedLanguage !== targetLanguage;
    const showTranslateButton =
        mounted && hasContent && isAvailable && needsTranslation;

    return (
        <>
            {showTranslateButton && (
                <div className="mb-4 flex items-center justify-end">
                    {!isTranslated ? (
                        <button
                            onClick={handleTranslate}
                            disabled={isTranslating}
                            className="inline-flex cursor-pointer items-center gap-1 text-sm text-gray-600 hover:text-gray-800 disabled:cursor-not-allowed disabled:opacity-50 dark:text-neutral-400 dark:hover:text-neutral-200"
                            title={t('translate') || 'Translate'}
                            aria-label={t('translate') || 'Translate'}
                        >
                            <FiGlobe
                                size={18}
                                className={isTranslating ? 'animate-spin' : ''}
                            />
                            <span className="text-xs">
                                {isTranslating
                                    ? t('translating')
                                    : t('translate')}
                            </span>
                        </button>
                    ) : (
                        <button
                            onClick={handleShowOriginal}
                            className="inline-flex cursor-pointer items-center gap-1 text-sm text-gray-600 hover:text-gray-800 dark:text-neutral-400 dark:hover:text-neutral-200"
                        >
                            <FiGlobe size={18} />
                            <span className="text-xs">
                                {t('show_original')}
                            </span>
                        </button>
                    )}
                </div>
            )}
            {renderDescription(displayDescription)}
            {renderIngredients(displayIngredients)}
            {renderSteps(displaySteps)}
        </>
    );
}
