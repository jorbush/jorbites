const BULLET_PATTERN = /[•⋅◦▪▫●○◆◇➔➢]|(?<![a-zA-ZÀ-ÿ0-9])·|·(?![a-zA-ZÀ-ÿ0-9])/;
const BULLET_SPLIT_REGEX =
    /\s*(?:[•⋅◦▪▫●○◆◇➔➢]|(?<![a-zA-ZÀ-ÿ0-9])·|·(?![a-zA-ZÀ-ÿ0-9]))\s*/;

/**
 * Checks if a string is an introductory header rather than an item.
 * e.g., "Solo necesitas:", "Ingredientes:", "Para la masa:"
 */
function isHeader(item: string): boolean {
    const trimmed = item.trim();
    if (!trimmed) return false;
    if (/:\s*$/.test(trimmed)) return true;
    return /^(?:solo necesitas|només necessites|nomes necessites|ingredientes|ingredients|necesitas|you (?:will )?need|things you need|pasos(?: a seguir)?|steps|instrucciones|instructions)\s*:?$/i.test(
        trimmed
    );
}

/**
 * Removes introductory labels from an item if present.
 * e.g., "Solo necesitas: 2 plátanos" -> "2 plátanos"
 */
function stripIntroPrefix(text: string): string {
    return text.replace(
        /^(?:solo necesitas|només necessites|nomes necessites|ingredientes|ingredients|necesitas|you (?:will )?need|things you need|pasos(?: a seguir)?|steps|instrucciones|instructions)\s*:\s*/i,
        ''
    );
}

/**
 * Cleans an item by removing common bullet/number prefixes and trailing punctuation.
 */
function cleanItem(line: string, removeTrailingPeriod = true): string {
    let trimmed = line.trim();
    // Remove prefixes: "1.", "1)", "1 -", "-", "*", "•", "→", "⋅", etc.
    trimmed = trimmed
        .replace(/^(?:\d+[.)]\s*|[-*•→⋅·◦▪▫●○◆◇➔➢]\s*)/, '')
        .trim();
    if (removeTrailingPeriod) {
        trimmed = trimmed.replace(/\.$/, '').trim();
    }
    return trimmed;
}

/**
 * Splits a text containing inline bullets into cleaned non-header items.
 */
function splitByBullets(text: string): string[] {
    return text.split(BULLET_SPLIT_REGEX).flatMap((item) => {
        const trimmed = item.trim();
        if (!trimmed || isHeader(trimmed)) return [];
        const stripped = stripIntroPrefix(trimmed);
        const cleaned = cleanItem(stripped, true);
        return cleaned && !isHeader(cleaned) ? [cleaned] : [];
    });
}

/**
 * Parses plain text ingredients into an array of strings.
 * - Handles multiline inputs (one per line, numbered, bullets)
 * - If single line/paragraph, intelligently splits by inline bullets (e.g. "Solo necesitas: • item 1 • item 2"),
 *   commas/semicolons (protecting decimal numbers like 1,5 kg), or sentence boundaries.
 */
export function parseIngredientsText(
    text: string,
    maxItems?: number
): string[] {
    if (!text || typeof text !== 'string') {
        return [];
    }

    const rawLines = text.split('\n').flatMap((l) => {
        const trimmed = l.trim();
        return trimmed ? [trimmed] : [];
    });

    let itemsToProcess: string[] = [];

    // If single line or all content is in one line, check for bullet or comma/semicolon separation
    if (rawLines.length === 1) {
        const singleLine = rawLines[0];
        if (BULLET_PATTERN.test(singleLine)) {
            const bulletItems = splitByBullets(singleLine);
            if (bulletItems.length > 0) {
                itemsToProcess = bulletItems;
            } else {
                itemsToProcess = rawLines;
            }
        } else {
            // Split on commas/semicolons not between digits, or period before a capitalized word
            const splitItems = singleLine
                .split(/(?<!\d)[,;](?!\d)|(?<=[a-zÀ-ÿ0-9])\.(?=[A-ZÀ-ÿ])/)
                .flatMap((item) => {
                    const trimmed = item.trim();
                    if (!trimmed || isHeader(trimmed)) return [];
                    const stripped = stripIntroPrefix(trimmed);
                    const cleaned = cleanItem(stripped, true);
                    return cleaned && !isHeader(cleaned) ? [cleaned] : [];
                });

            if (splitItems.length > 1) {
                itemsToProcess = splitItems;
            } else {
                itemsToProcess = rawLines;
            }
        }
    } else {
        itemsToProcess = rawLines.flatMap((line) => {
            const trimmed = line.trim();
            if (!trimmed || isHeader(trimmed)) return [];
            if (BULLET_PATTERN.test(trimmed)) {
                return splitByBullets(trimmed);
            }
            const stripped = stripIntroPrefix(trimmed);
            const cleaned = cleanItem(stripped, true);
            return cleaned && !isHeader(cleaned) ? [cleaned] : [];
        });
    }

    const items: string[] = [];
    for (const rawItem of itemsToProcess) {
        const cleaned = cleanItem(rawItem, true);
        if (cleaned && !isHeader(cleaned)) {
            items.push(cleaned);
            if (maxItems && items.length >= maxItems) {
                break;
            }
        }
    }

    return items;
}

/**
 * Parses plain text steps into an array of strings.
 * - Handles multiline inputs (one per line, numbered, bullets)
 * - If single line/paragraph, splits by inline bullets, sentence delimiters (. ! ?) and inline numbers.
 */
export function parseStepsText(text: string, maxItems?: number): string[] {
    if (!text || typeof text !== 'string') {
        return [];
    }

    const rawLines = text.split('\n').flatMap((l) => {
        const trimmed = l.trim();
        return trimmed ? [trimmed] : [];
    });

    let itemsToProcess: string[] = [];

    // If single line or all content is in one line, check for bullet or sentence/period separation
    if (rawLines.length === 1) {
        const singleLine = rawLines[0];
        if (BULLET_PATTERN.test(singleLine)) {
            const bulletItems = splitByBullets(singleLine);
            if (bulletItems.length > 0) {
                itemsToProcess = bulletItems;
            } else {
                itemsToProcess = rawLines;
            }
        } else {
            // Split by:
            // 1. Inline numbering (e.g. "1. First step 2. Second step")
            // 2. Sentence end followed by space/punctuation: (?<=[.!?])\s+
            // 3. Period between word and letter/digit without space (e.g. "35mn.a Mèdia" or "horno.Poner")
            const splitItems = singleLine
                .split(
                    /(?<=\D)(?=\d+[.)]\s+)|(?<=[.!?])\s+|(?<=[a-zÀ-ÿ0-9])\.(?=[a-zA-ZÀ-ÿ])/
                )
                .flatMap((item) => {
                    const trimmed = item.trim();
                    if (!trimmed || isHeader(trimmed)) return [];
                    const stripped = stripIntroPrefix(trimmed);
                    const cleaned = cleanItem(stripped, true);
                    return cleaned && !isHeader(cleaned) ? [cleaned] : [];
                });

            if (splitItems.length > 1) {
                itemsToProcess = splitItems;
            } else {
                itemsToProcess = rawLines;
            }
        }
    } else {
        itemsToProcess = rawLines.flatMap((line) => {
            const trimmed = line.trim();
            if (!trimmed || isHeader(trimmed)) return [];
            if (BULLET_PATTERN.test(trimmed)) {
                return splitByBullets(trimmed);
            }
            const stripped = stripIntroPrefix(trimmed);
            const cleaned = cleanItem(stripped, true);
            return cleaned && !isHeader(cleaned) ? [cleaned] : [];
        });
    }

    const items: string[] = [];
    for (const rawItem of itemsToProcess) {
        const cleaned = cleanItem(rawItem, true);
        if (cleaned && !isHeader(cleaned)) {
            items.push(cleaned);
            if (maxItems && items.length >= maxItems) {
                break;
            }
        }
    }

    return items;
}

/**
 * Parses plain text input into an array of strings (ingredients or steps).
 * Handles various common formats:
 * - Each line is an item
 * - Numbered lists (1. item, 1) item, etc.)
 * - Bullet points (- item, * item, • item)
 * - Empty lines are ignored
 * - Leading/trailing whitespace is trimmed
 * - If mode is specified, applies specialized delimiter detection for single lines
 *
 * @param text - The plain text to parse
 * @param maxItems - Maximum number of items allowed (optional)
 * @param mode - Parsing mode ('default' | 'ingredient' | 'step')
 * @returns Array of parsed items
 */
export function parseTextToList(
    text: string,
    maxItems?: number,
    mode: 'default' | 'ingredient' | 'step' = 'default'
): string[] {
    if (!text || typeof text !== 'string') {
        return [];
    }

    if (mode === 'ingredient') {
        return parseIngredientsText(text, maxItems);
    }

    if (mode === 'step') {
        return parseStepsText(text, maxItems);
    }

    // Default mode: split by newlines
    const lines = text.split('\n');
    const items: string[] = [];

    for (const line of lines) {
        const cleaned = cleanItem(line, false);
        if (cleaned) {
            items.push(cleaned);
            if (maxItems && items.length >= maxItems) {
                break;
            }
        }
    }

    return items;
}
