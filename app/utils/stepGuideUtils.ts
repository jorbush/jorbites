export type CulinaryActionType =
    | 'bake'
    | 'boil'
    | 'heat'
    | 'chop'
    | 'mix'
    | 'chill'
    | 'plate'
    | 'general';

export interface StepTimerPreset {
    id: string;
    label: string;
    seconds: number;
}

const BOUNDARY_START = '(?:^|[^\\p{L}\\p{N}_])';
const BOUNDARY_END = '(?=$|[^\\p{L}\\p{N}_])';

function createKeywordRegex(pattern: string): RegExp {
    return new RegExp(`${BOUNDARY_START}(?:${pattern})${BOUNDARY_END}`, 'iu');
}

const ACTION_KEYWORDS: Record<
    Exclude<CulinaryActionType, 'general'>,
    RegExp
> = {
    bake: createKeywordRegex(
        'bake|baking|oven|roast|roasting|broil|preheat|hornear|horno|asar|precalentar|fornejar|forn|rostir|preescalfar'
    ),
    boil: createKeywordRegex(
        'boil|boiling|simmer|simmering|steam|steaming|poach|blanch|hervir|hirviendo|cocer|vapor|escalfar|bullir|coure'
    ),
    heat: createKeywordRegex(
        'fry|frying|saut[eé]|sear|searing|pan|grill|toast|browning|brown(?!\\s+(?:sugar|rice|butter|flour|bread|lentils))|caramelize|melt|skillet|wok|fre[ií]r|saltear|dorar|sart[eé]n|plancha|tostar|fundir|fregir|saltar|daurar|paella|torrar|fondre'
    ),
    chop: createKeywordRegex(
        'chop|chopping|slice|slicing|dice|dicing|mince|mincing|cut|cutting|peel|grate|julienne|crush|cortar|picar|trocear|pelar|rallar|rebanar|tallar|trossejar|ratllar'
    ),
    mix: createKeywordRegex(
        'mix|mixing|whisk|whisking|stir|stirring|blend|blending|fold|folding|beat|beating|knead|combine|toss|mash|mezclar|batir|remover|integrar|amasar|triturar|combinar|barrejar|batre|remenar|pastar'
    ),
    chill: createKeywordRegex(
        'chill|chilling|freeze|freezing|cool|cooling|refrigerate|fridge|freezer|ice|marinate|resting|rest(?!\\s+of\\b)|enfriar|congelar|refrigerar|nevera|reposar|marinar|refredar|congelador'
    ),
    plate: createKeywordRegex(
        'serve|serving|plate|plating|garnish|decorate|drizzle|sprinkle|enjoy|servir|emplatar|decorar|espolvorear|disfrutar|gaudir|empolvorar'
    ),
};

/**
 * Detects the primary culinary action in a recipe step across English, Spanish, and Catalan.
 */
export function detectStepAction(stepText: string): CulinaryActionType {
    if (!stepText) return 'general';

    const order: Exclude<CulinaryActionType, 'general'>[] = [
        'bake',
        'boil',
        'heat',
        'chop',
        'mix',
        'chill',
        'plate',
    ];

    for (const action of order) {
        if (ACTION_KEYWORDS[action].test(stepText)) {
            return action;
        }
    }

    return 'general';
}

/**
 * Cleans markdown, user mention tags (@name[id]), and raw URLs for speech synthesis.
 */
export function sanitizeStepTextForSpeech(stepText: string): string {
    if (!stepText) return '';
    return stepText
        .replace(/@([^[\]]+)\[([^\]]+)\]/g, '@$1')
        .replace(/https?:\/\/[^\s]+/g, '')
        .replace(/[*_]/g, '')
        .replace(/\s+/g, ' ')
        .trim();
}

/**
 * Maps an i18n language code to a BCP-47 speech synthesis locale tag.
 */
export function resolveSpeechLang(language?: string): string {
    const normalized = (language || 'en').toLowerCase();
    if (normalized.startsWith('ca')) return 'ca-ES';
    if (normalized.startsWith('es')) return 'es-ES';
    return 'en-US';
}

/**
 * Extracts time durations mentioned in a recipe step (supports EN, ES, CA).
 * Examples: "Bake for 25 minutes", "simmer 5-10 min", "rest 30 seconds", "hornear 1 hora"
 */
export function extractStepTimers(stepText: string): StepTimerPreset[] {
    if (!stepText) return [];

    const presets: StepTimerPreset[] = [];
    const seenSeconds = new Set<number>();

    // Match number or range (e.g. "10", "5-10", "5 to 10", "5 a 10", "1.5") followed by time unit
    const timeRegex =
        /\b(\d+(?:[.,]\d+)?)(?:\s*(?:-|–|to|a|o|or)\s*(\d+(?:[.,]\d+)?))?\s*(hours?|hrs?|hr|horas?|hores|minutes?|mins?|min|minutos?|minuts?|seconds?|secs?|sec|segundos?|segons?)\b/gi;

    let match: RegExpExecArray | null;
    while ((match = timeRegex.exec(stepText)) !== null) {
        const firstRaw = parseFloat(match[1].replace(',', '.'));
        const secondRaw = match[2]
            ? parseFloat(match[2].replace(',', '.'))
            : null;
        const unitRaw = match[3].toLowerCase();

        const value = secondRaw !== null ? secondRaw : firstRaw;
        if (isNaN(value) || value <= 0) continue;

        let multiplier = 60;
        let shortUnit = 'min';

        if (/^(h|hr|hrs|hour|hours|hora|horas|hores)$/.test(unitRaw)) {
            multiplier = 3600;
            shortUnit = 'h';
        } else if (
            /^(s|sec|secs|second|seconds|segundo|segundos|segon|segons)$/.test(
                unitRaw
            )
        ) {
            multiplier = 1;
            shortUnit = 's';
        }

        const seconds = Math.round(value * multiplier);
        // Cap between 5 seconds and 12 hours
        if (seconds < 5 || seconds > 43200 || seenSeconds.has(seconds)) {
            continue;
        }

        seenSeconds.add(seconds);
        const displayValue =
            secondRaw !== null ? `${firstRaw}-${secondRaw}` : `${value}`;
        presets.push({
            id: `timer-${seconds}-${presets.length}`,
            label: `${displayValue} ${shortUnit}`,
            seconds,
        });
    }

    return presets;
}

/**
 * Formats a duration in seconds as MM:SS or HH:MM:SS.
 */
export function formatTimerDisplay(totalSeconds: number): string {
    const clamped = Math.max(0, Math.floor(totalSeconds));
    const hours = Math.floor(clamped / 3600);
    const minutes = Math.floor((clamped % 3600) / 60);
    const seconds = clamped % 60;

    const pad = (n: number) => n.toString().padStart(2, '0');
    if (hours > 0) {
        return `${hours}:${pad(minutes)}:${pad(seconds)}`;
    }
    return `${pad(minutes)}:${pad(seconds)}`;
}
