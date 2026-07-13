import {
    useEffect,
    useMemo,
    useRef,
    useSyncExternalStore,
    useReducer,
    useState,
} from 'react';
import { useTranslation } from 'react-i18next';
import { toast } from 'react-hot-toast';
import useIsMounted from '@/app/hooks/useIsMounted';
import i18n from '@/app/i18n';
import { translateableRecipeContentReducer } from '@/app/components/translation/translateableRecipeContentReducer';

const subscribe = () => () => {};

interface UseRecipeTranslationProps {
    description: React.ReactNode;
    descriptionText?: string;
    ingredientsText?: string[];
    stepsText?: string[];
}

export function useRecipeTranslation({
    description,
    descriptionText,
    ingredientsText,
    stepsText,
}: UseRecipeTranslationProps) {
    const { t } = useTranslation();
    const isMounted = useIsMounted();
    const isAvailable = useSyncExternalStore(
        subscribe,
        () =>
            typeof window !== 'undefined' &&
            'Translator' in window &&
            'LanguageDetector' in window,
        () => false
    );
    const [state, dispatch] = useReducer(translateableRecipeContentReducer, {
        detectedLanguage: null,
        isTranslated: false,
        isTranslating: false,
        translatedDescription: null,
        translatedIngredients: null,
        translatedSteps: null,
    });

    const {
        detectedLanguage,
        isTranslated,
        isTranslating,
        translatedDescription,
        translatedIngredients,
        translatedSteps,
    } = state;

    const ingredientsTextJoined = useMemo(
        () => ingredientsText?.join('\n') || '',
        [ingredientsText]
    );
    const stepsTextJoined = useMemo(
        () => stepsText?.join('\n') || '',
        [stepsText]
    );

    const sampleTextForDetection = useMemo(() => {
        if (descriptionText && descriptionText.trim().length >= 10) {
            return descriptionText;
        }
        if (ingredientsTextJoined) {
            const firstIngredient = ingredientsTextJoined.split('\n')[0];
            if (firstIngredient && firstIngredient.trim().length >= 10) {
                return firstIngredient;
            }
        }
        if (stepsTextJoined) {
            const firstStep = stepsTextJoined.split('\n')[0];
            if (firstStep && firstStep.trim().length >= 10) {
                return firstStep;
            }
        }
        return '';
    }, [descriptionText, ingredientsTextJoined, stepsTextJoined]);

    const contentKey = useMemo(() => {
        const currentLang =
            (typeof i18n.language === 'string'
                ? i18n.language
                : i18n.resolvedLanguage) || 'es';
        return `${descriptionText}|${ingredientsTextJoined}|${stepsTextJoined}|${currentLang}`;
    }, [descriptionText, ingredientsTextJoined, stepsTextJoined]);

    // Reset translation state during render when contentKey changes
    const [prevContentKey, setPrevContentKey] = useState(contentKey);
    if (contentKey !== prevContentKey) {
        setPrevContentKey(contentKey);
        dispatch({ type: 'RESET_TRANSLATION' });
    }

    // Scoped language detection effect
    useEffect(() => {
        if (!isAvailable) {
            return;
        }

        if (
            !sampleTextForDetection ||
            sampleTextForDetection.trim().length < 10
        ) {
            return;
        }

        // Only run if we don't have a detected language yet
        if (detectedLanguage !== null) {
            return;
        }

        let cancelled = false;

        const detectLanguage = async () => {
            try {
                const detector = await window.LanguageDetector.create();
                const results = await detector.detect(sampleTextForDetection);

                if (cancelled) {
                    return;
                }

                if (results && results.length > 0) {
                    const topResult = results[0];
                    if (topResult.confidence > 0.5) {
                        if (cancelled) return;
                        const lang = topResult.detectedLanguage;
                        if (['en', 'ca', 'es'].includes(lang)) {
                            dispatch({
                                type: 'SET_DETECTED_LANGUAGE',
                                payload: lang,
                            });
                        } else {
                            const langMap: Record<string, string> = {
                                'en-US': 'en',
                                'en-GB': 'en',
                                'es-ES': 'es',
                                'es-MX': 'es',
                                'ca-ES': 'ca',
                            };
                            dispatch({
                                type: 'SET_DETECTED_LANGUAGE',
                                payload: langMap[lang] || null,
                            });
                        }
                    }
                }
            } catch (error) {
                if (!cancelled) {
                    console.warn('Language detection failed:', error);
                }
            }
        };

        detectLanguage();

        return () => {
            cancelled = true;
        };
    }, [sampleTextForDetection, detectedLanguage, isAvailable]);

    const hasContent = Boolean(
        descriptionText ||
        (ingredientsText && ingredientsText.length > 0) ||
        (stepsText && stepsText.length > 0)
    );

    const handleTranslate = async () => {
        if (isTranslating || !isAvailable) return;

        if (
            typeof window === 'undefined' ||
            !('Translator' in window) ||
            !('LanguageDetector' in window)
        ) {
            console.warn('Translator API not available');
            return;
        }

        dispatch({ type: 'START_TRANSLATING' });

        try {
            const targetLanguage =
                (typeof i18n.language === 'string'
                    ? i18n.language
                    : i18n.resolvedLanguage) || 'es';

            // Reuse the already detected language from state
            let sourceLanguage = detectedLanguage || 'es';

            // If source matches target, use fallback
            if (sourceLanguage === targetLanguage) {
                sourceLanguage = targetLanguage === 'en' ? 'es' : 'en';
            }

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
                dispatch({ type: 'STOP_TRANSLATING' });
                toast.error('Not available for this language');
                return;
            }

            const translator = await window.Translator.create({
                sourceLanguage,
                targetLanguage,
            });

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

            let finalDesc = null;
            if (descriptionText && translatedDesc) {
                finalDesc = translatedDesc.trim();
            }

            let finalIng = null;
            if (
                Array.isArray(translatedIngArray) &&
                translatedIngArray.length > 0
            ) {
                const translatedIngredientItems = translatedIngArray.reduce(
                    (acc: string[], item) => {
                        const trimmed = item.trim();
                        if (trimmed.length > 0) {
                            acc.push(trimmed);
                        }
                        return acc;
                    },
                    []
                );

                console.log(
                    'Translated ingredients array:',
                    translatedIngredientItems
                );

                if (translatedIngredientItems.length > 0) {
                    finalIng = translatedIngredientItems;
                }
            }

            let finalSteps = null;
            if (
                Array.isArray(translatedStpsArray) &&
                translatedStpsArray.length > 0
            ) {
                const translatedStepItems = translatedStpsArray.reduce(
                    (acc: string[], item) => {
                        const trimmed = item.trim();
                        if (trimmed.length > 0) {
                            acc.push(trimmed);
                        }
                        return acc;
                    },
                    []
                );

                console.log('Translated steps array:', translatedStepItems);

                if (translatedStepItems.length > 0) {
                    finalSteps = translatedStepItems;
                }
            }

            dispatch({
                type: 'SET_TRANSLATED_CONTENT',
                payload: {
                    description: finalDesc,
                    ingredients: finalIng,
                    steps: finalSteps,
                },
            });
        } catch (error) {
            console.error('Translation failed:', error);
            toast.error(
                t('translation_failed') ||
                    'Translation failed. Please try again.'
            );
            dispatch({ type: 'STOP_TRANSLATING' });
        }
    };

    const handleShowOriginal = () => {
        dispatch({ type: 'SHOW_ORIGINAL' });
    };

    const displayDescription =
        isTranslated && translatedDescription
            ? translatedDescription
            : description;

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

    const targetLanguage =
        (typeof i18n.language === 'string'
            ? i18n.language
            : i18n.resolvedLanguage) || 'es';
    const needsTranslation =
        !!detectedLanguage && detectedLanguage !== targetLanguage;
    const showTranslateButton =
        isMounted && hasContent && isAvailable && needsTranslation;

    return {
        isTranslated,
        isTranslating,
        handleTranslate,
        handleShowOriginal,
        displayDescription,
        displayIngredients,
        displaySteps,
        showTranslateButton,
        t,
    };
}
