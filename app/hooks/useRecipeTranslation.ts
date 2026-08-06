import {
    useEffect,
    useMemo,
    useSyncExternalStore,
    useReducer,
    useState,
} from 'react';
import { useTranslation } from 'react-i18next';
import { toast } from 'react-hot-toast';
import useIsMounted from '@/app/hooks/useIsMounted';
import i18n from '@/app/i18n';
import { translateableRecipeContentReducer } from '@/app/components/translation/translateableRecipeContentReducer';
import { GanttTable } from '@/app/types';
import { Prisma } from '@prisma/client';

const subscribe = () => () => {};

interface UseRecipeTranslationProps {
    description: React.ReactNode;
    descriptionText?: string;
    ingredientsText?: string[];
    stepsText?: string[];
    ganttTable?: GanttTable | Prisma.JsonValue | null;
}

export function useRecipeTranslation({
    description,
    descriptionText,
    ingredientsText,
    stepsText,
    ganttTable: rawGanttTable,
}: UseRecipeTranslationProps) {
    const ganttTable = rawGanttTable as unknown as
        | GanttTable
        | null
        | undefined;
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
        translatedGanttTable: null,
    });

    const {
        detectedLanguage,
        isTranslated,
        isTranslating,
        translatedDescription,
        translatedIngredients,
        translatedSteps,
        translatedGanttTable,
    } = state;

    const ingredientsTextJoined = useMemo(
        () => ingredientsText?.join('\n') || '',
        [ingredientsText]
    );
    const stepsTextJoined = useMemo(
        () => stepsText?.join('\n') || '',
        [stepsText]
    );

    const ganttTextJoined = useMemo(() => {
        if (!ganttTable) return '';
        const pre = (ganttTable.preSteps || []).join('\n');
        const rows = (ganttTable.rows || [])
            .map((r) => r.ingredient)
            .join('\n');
        const cols = (ganttTable.columns || []).map((c) => c.action).join('\n');
        return `${pre}\n${rows}\n${cols}`;
    }, [ganttTable]);

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
        if (ganttTextJoined) {
            const firstGanttLine = ganttTextJoined
                .split('\n')
                .find((line) => line.trim().length >= 10);
            if (firstGanttLine) {
                return firstGanttLine;
            }
        }
        return '';
    }, [
        descriptionText,
        ingredientsTextJoined,
        stepsTextJoined,
        ganttTextJoined,
    ]);

    const contentKey = useMemo(() => {
        const currentLang =
            (typeof i18n.language === 'string'
                ? i18n.language
                : i18n.resolvedLanguage) || 'es';
        return `${descriptionText}|${ingredientsTextJoined}|${stepsTextJoined}|${ganttTextJoined}|${currentLang}`;
    }, [
        descriptionText,
        ingredientsTextJoined,
        stepsTextJoined,
        ganttTextJoined,
    ]);

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
        (stepsText && stepsText.length > 0) ||
        (ganttTable && (ganttTable.rows?.length || ganttTable.preSteps?.length))
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

            const isGanttValid =
                ganttTable &&
                Array.isArray(ganttTable.rows) &&
                Array.isArray(ganttTable.columns) &&
                (!ganttTable.preSteps || Array.isArray(ganttTable.preSteps));

            const ganttPromise = isGanttValid
                ? Promise.all([
                      Promise.all(
                          (ganttTable.preSteps || []).map((step) =>
                              typeof step === 'string' && step.trim()
                                  ? translator.translate(step)
                                  : Promise.resolve(step || '')
                          )
                      ),
                      Promise.all(
                          (ganttTable.rows || []).map((row) =>
                              typeof row?.ingredient === 'string' &&
                              row.ingredient.trim()
                                  ? translator.translate(row.ingredient)
                                  : Promise.resolve(row?.ingredient || '')
                          )
                      ),
                      Promise.all(
                          (ganttTable.columns || []).map((col) =>
                              typeof col?.action === 'string' &&
                              col.action.trim()
                                  ? translator.translate(col.action)
                                  : Promise.resolve(col?.action || '')
                          )
                      ),
                  ]).then(
                      ([
                          translatedPreSteps,
                          translatedIngs,
                          translatedActions,
                      ]) => ({
                          preSteps: (translatedPreSteps || []).map((s) =>
                              s.trim()
                          ),
                          rows: (ganttTable.rows || []).map((row, idx) => ({
                              ...row,
                              ingredient:
                                  translatedIngs[idx]?.trim() || row.ingredient,
                          })),
                          columns: (ganttTable.columns || []).map(
                              (col, idx) => ({
                                  ...col,
                                  action:
                                      translatedActions[idx]?.trim() ||
                                      col.action,
                              })
                          ),
                      })
                  )
                : Promise.resolve(null);

            const [
                translatedDesc,
                translatedIngArray,
                translatedStpsArray,
                translatedGantt,
            ] = await Promise.all([
                descriptionPromise,
                ingredientsPromise,
                stepsPromise,
                ganttPromise,
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
                    ganttTable: translatedGantt,
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

    const displayGanttTable =
        isTranslated && translatedGanttTable
            ? translatedGanttTable
            : ganttTable || null;

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
        displayGanttTable,
        showTranslateButton,
        t,
    };
}
