import {
    useCallback,
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
import {
    TranslateableRecipeContentAction,
    translateableRecipeContentReducer,
} from '@/app/components/translation/translateableRecipeContentReducer';
import { GanttTable } from '@/app/types';

const EMPTY_ITEMS: string[] = [];
const DEFAULT_LANGUAGE = 'es';
const MIN_DETECTION_LENGTH = 10;
const CONFIDENCE_THRESHOLD = 0.5;
const SUPPORTED_LANGUAGES = ['en', 'ca', 'es'] as const;
const LANGUAGE_MAP: Record<string, string> = {
    'en-US': 'en',
    'en-GB': 'en',
    'es-ES': 'es',
    'es-MX': 'es',
    'ca-ES': 'ca',
};

const subscribe = () => () => {};

export interface UseRecipeTranslationProps {
    description: React.ReactNode;
    descriptionText?: string;
    ingredientsText?: string[];
    stepsText?: string[];
    ganttTable?: GanttTable | null;
}

function checkIsTranslatorAvailable(): boolean {
    return (
        typeof window !== 'undefined' &&
        'Translator' in window &&
        'LanguageDetector' in window
    );
}

function getCurrentLanguage(): string {
    return (
        (typeof i18n.language === 'string'
            ? i18n.language
            : i18n.resolvedLanguage) || DEFAULT_LANGUAGE
    );
}

function determineSourceLanguage(
    detectedLanguage: string | null,
    targetLanguage: string
): string {
    const sourceLanguage = detectedLanguage || DEFAULT_LANGUAGE;
    if (sourceLanguage === targetLanguage) {
        return targetLanguage === 'en' ? 'es' : 'en';
    }
    return sourceLanguage;
}

function getGanttTextJoined(ganttTable?: GanttTable | null): string {
    if (!ganttTable) return '';
    const pre = (ganttTable.preSteps || []).join('\n');
    const rows = (ganttTable.rows || []).map((r) => r.ingredient).join('\n');
    const cols = (ganttTable.columns || []).map((c) => c.action).join('\n');
    return `${pre}\n${rows}\n${cols}`;
}

function extractSampleText(
    descriptionText?: string,
    ingredientsTextJoined?: string,
    stepsTextJoined?: string,
    ganttTextJoined?: string
): string {
    if (
        descriptionText &&
        descriptionText.trim().length >= MIN_DETECTION_LENGTH
    ) {
        return descriptionText;
    }
    if (ingredientsTextJoined) {
        const firstIngredient = ingredientsTextJoined.split('\n')[0];
        if (
            firstIngredient &&
            firstIngredient.trim().length >= MIN_DETECTION_LENGTH
        ) {
            return firstIngredient;
        }
    }
    if (stepsTextJoined) {
        const firstStep = stepsTextJoined.split('\n')[0];
        if (firstStep && firstStep.trim().length >= MIN_DETECTION_LENGTH) {
            return firstStep;
        }
    }
    if (ganttTextJoined) {
        const firstGanttLine = ganttTextJoined
            .split('\n')
            .find((line) => line.trim().length >= MIN_DETECTION_LENGTH);
        if (firstGanttLine) {
            return firstGanttLine;
        }
    }
    return '';
}

function normalizeDetectedLanguage(
    results?: Array<{ detectedLanguage: string; confidence: number }>
): string | null | undefined {
    if (!results || results.length === 0) {
        return undefined;
    }
    const topResult = results[0];
    if (topResult.confidence <= CONFIDENCE_THRESHOLD) {
        return undefined;
    }
    const lang = topResult.detectedLanguage;
    if ((SUPPORTED_LANGUAGES as readonly string[]).includes(lang)) {
        return lang;
    }
    return LANGUAGE_MAP[lang] || null;
}

async function detectSampleLanguage(
    sampleText: string
): Promise<string | null | undefined> {
    try {
        const detector = await window.LanguageDetector.create();
        const results = await detector.detect(sampleText);
        return normalizeDetectedLanguage(results);
    } catch (error) {
        console.warn('Language detection failed:', error);
        return undefined;
    }
}

function shouldDetectLanguage(
    isAvailable: boolean,
    sampleText: string,
    detectedLanguage: string | null
): boolean {
    if (!isAvailable) return false;
    if (!sampleText || sampleText.trim().length < MIN_DETECTION_LENGTH) {
        return false;
    }
    return detectedLanguage === null;
}

function checkHasRecipeContent(
    descriptionText?: string,
    ingredientsText?: string[],
    stepsText?: string[],
    ganttTable?: GanttTable | null
): boolean {
    return Boolean(
        descriptionText ||
        (ingredientsText && ingredientsText.length > 0) ||
        (stepsText && stepsText.length > 0) ||
        (ganttTable && (ganttTable.rows?.length || ganttTable.preSteps?.length))
    );
}

function cleanTrimmedText(
    originalText?: string,
    translatedText?: string
): string | null {
    if (originalText && translatedText) {
        return translatedText.trim();
    }
    return null;
}

function cleanTrimmedList(items: string[] | null | undefined): string[] | null {
    if (!Array.isArray(items) || items.length === 0) {
        return null;
    }
    const filtered = items.reduce<string[]>((acc, item) => {
        const trimmed = item.trim();
        if (trimmed.length > 0) {
            acc.push(trimmed);
        }
        return acc;
    }, []);
    return filtered.length > 0 ? filtered : null;
}

function translateStringList(
    items: string[] | undefined,
    translator: any
): Promise<string[]> {
    if (!items || items.length === 0) {
        return Promise.resolve([]);
    }
    return Promise.all(items.map((item) => translator.translate(item)));
}

function isGanttValid(
    table?: GanttTable | null
): table is GanttTable & { rows: any[]; columns: any[] } {
    return Boolean(
        table &&
        Array.isArray(table.rows) &&
        Array.isArray(table.columns) &&
        (!table.preSteps || Array.isArray(table.preSteps))
    );
}

async function translateGantt(
    ganttTable: GanttTable | null | undefined,
    translator: any
): Promise<GanttTable | null> {
    if (!isGanttValid(ganttTable)) {
        return null;
    }

    const preStepsPromise = Promise.all(
        (ganttTable.preSteps || []).map((step) =>
            typeof step === 'string' && step.trim()
                ? translator.translate(step)
                : Promise.resolve(step || '')
        )
    );

    const rowsPromise = Promise.all(
        (ganttTable.rows || []).map((row) =>
            typeof row?.ingredient === 'string' && row.ingredient.trim()
                ? translator.translate(row.ingredient)
                : Promise.resolve(row?.ingredient || '')
        )
    );

    const colsPromise = Promise.all(
        (ganttTable.columns || []).map((col) =>
            typeof col?.action === 'string' && col.action.trim()
                ? translator.translate(col.action)
                : Promise.resolve(col?.action || '')
        )
    );

    const [translatedPreSteps, translatedIngs, translatedActions] =
        await Promise.all([preStepsPromise, rowsPromise, colsPromise]);

    return {
        preSteps: (translatedPreSteps || []).map((s) => s.trim()),
        rows: (ganttTable.rows || []).map((row, idx) => ({
            ...row,
            ingredient: translatedIngs[idx]?.trim() || row.ingredient,
        })),
        columns: (ganttTable.columns || []).map((col, idx) => ({
            ...col,
            action: translatedActions[idx]?.trim() || col.action,
        })),
    };
}

interface TranslationParams {
    descriptionText?: string;
    ingredientsText?: string[];
    stepsText?: string[];
    ganttTable?: GanttTable | null;
    detectedLanguage: string | null;
}

type TranslatedContentPayload = Extract<
    TranslateableRecipeContentAction,
    { type: 'SET_TRANSLATED_CONTENT' }
>['payload'];

async function translateRecipeContent({
    descriptionText,
    ingredientsText,
    stepsText,
    ganttTable,
    detectedLanguage,
}: TranslationParams): Promise<TranslatedContentPayload | null> {
    if (!checkIsTranslatorAvailable()) {
        console.warn('Translator API not available');
        return null;
    }

    const targetLanguage = getCurrentLanguage();
    const sourceLanguage = determineSourceLanguage(
        detectedLanguage,
        targetLanguage
    );

    const availability = await window.Translator.availability({
        sourceLanguage,
        targetLanguage,
    });

    if (availability !== 'available' && availability !== 'downloadable') {
        console.warn('Translation not available for this language pair');
        toast.error('Not available for this language');
        return null;
    }

    const translator = await window.Translator.create({
        sourceLanguage,
        targetLanguage,
    });

    const [
        translatedDesc,
        translatedIngArray,
        translatedStpsArray,
        translatedGantt,
    ] = await Promise.all([
        descriptionText
            ? translator.translate(descriptionText)
            : Promise.resolve(''),
        translateStringList(ingredientsText, translator),
        translateStringList(stepsText, translator),
        translateGantt(ganttTable, translator),
    ]);

    return {
        description: cleanTrimmedText(descriptionText, translatedDesc),
        ingredients: cleanTrimmedList(translatedIngArray),
        steps: cleanTrimmedList(translatedStpsArray),
        ganttTable: translatedGantt,
    };
}

function resolveDisplayDescription(
    isTranslated: boolean,
    translatedDescription: string | null,
    originalDescription: React.ReactNode
): React.ReactNode {
    return isTranslated && translatedDescription
        ? translatedDescription
        : originalDescription;
}

function resolveDisplayList(
    isTranslated: boolean,
    translatedList: string[] | null,
    fallbackList?: string[]
): string[] {
    if (isTranslated && translatedList && translatedList.length > 0) {
        return translatedList;
    }
    return fallbackList || EMPTY_ITEMS;
}

function resolveDisplayGantt(
    isTranslated: boolean,
    translatedGantt: GanttTable | null,
    fallbackGantt?: GanttTable | null
): GanttTable | null {
    return isTranslated && translatedGantt
        ? translatedGantt
        : fallbackGantt || null;
}

export function useRecipeTranslation({
    description,
    descriptionText,
    ingredientsText,
    stepsText,
    ganttTable,
}: UseRecipeTranslationProps) {
    const { t } = useTranslation();
    const isMounted = useIsMounted();
    const isAvailable = useSyncExternalStore(
        subscribe,
        checkIsTranslatorAvailable,
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
    const ganttTextJoined = useMemo(
        () => getGanttTextJoined(ganttTable),
        [ganttTable]
    );

    const sampleTextForDetection = useMemo(
        () =>
            extractSampleText(
                descriptionText,
                ingredientsTextJoined,
                stepsTextJoined,
                ganttTextJoined
            ),
        [
            descriptionText,
            ingredientsTextJoined,
            stepsTextJoined,
            ganttTextJoined,
        ]
    );

    const contentKey = useMemo(() => {
        const currentLang = getCurrentLanguage();
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
        if (
            !shouldDetectLanguage(
                isAvailable,
                sampleTextForDetection,
                detectedLanguage
            )
        ) {
            return;
        }

        let cancelled = false;

        detectSampleLanguage(sampleTextForDetection).then((lang) => {
            if (!cancelled && lang !== undefined) {
                dispatch({
                    type: 'SET_DETECTED_LANGUAGE',
                    payload: lang,
                });
            }
        });

        return () => {
            cancelled = true;
        };
    }, [sampleTextForDetection, detectedLanguage, isAvailable]);

    const hasContent = useMemo(
        () =>
            checkHasRecipeContent(
                descriptionText,
                ingredientsText,
                stepsText,
                ganttTable
            ),
        [descriptionText, ingredientsText, stepsText, ganttTable]
    );

    const handleTranslate = useCallback(async () => {
        if (isTranslating || !isAvailable) return;

        dispatch({ type: 'START_TRANSLATING' });

        try {
            const payload = await translateRecipeContent({
                descriptionText,
                ingredientsText,
                stepsText,
                ganttTable,
                detectedLanguage,
            });

            if (payload) {
                dispatch({
                    type: 'SET_TRANSLATED_CONTENT',
                    payload,
                });
            } else {
                dispatch({ type: 'STOP_TRANSLATING' });
            }
        } catch (error) {
            console.error('Translation failed:', error);
            toast.error(
                t('translation_failed') ||
                    'Translation failed. Please try again.'
            );
            dispatch({ type: 'STOP_TRANSLATING' });
        }
    }, [
        isTranslating,
        isAvailable,
        descriptionText,
        ingredientsText,
        stepsText,
        ganttTable,
        detectedLanguage,
        t,
    ]);

    const handleShowOriginal = useCallback(() => {
        dispatch({ type: 'SHOW_ORIGINAL' });
    }, []);

    const displayDescription = resolveDisplayDescription(
        isTranslated,
        translatedDescription,
        description
    );

    const displayIngredients = resolveDisplayList(
        isTranslated,
        translatedIngredients,
        ingredientsText
    );

    const displaySteps = resolveDisplayList(
        isTranslated,
        translatedSteps,
        stepsText
    );

    const displayGanttTable = resolveDisplayGantt(
        isTranslated,
        translatedGanttTable,
        ganttTable
    );

    const targetLanguage = getCurrentLanguage();
    const needsTranslation =
        Boolean(detectedLanguage) && detectedLanguage !== targetLanguage;
    const showTranslateButton = Boolean(
        isMounted && hasContent && isAvailable && needsTranslation
    );

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
