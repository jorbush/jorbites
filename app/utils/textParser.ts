/**
 * Cleans an item by removing common bullet/number prefixes and trailing punctuation.
 */
function cleanItem(line: string, removeTrailingPeriod = true): string {
    let trimmed = line.trim();
    // Remove prefixes: "1.", "1)", "1 -", "-", "*", "•", "→", "⋅"
    trimmed = trimmed.replace(/^(?:\d+[.)]\s*|[-*•→⋅]\s*)/, '').trim();
    if (removeTrailingPeriod) {
        trimmed = trimmed.replace(/\.$/, '').trim();
    }
    return trimmed;
}

/**
 * Parses plain text ingredients into an array of strings.
 * - Handles multiline inputs (one per line, numbered, bullets)
 * - If single line/paragraph, intelligently splits by commas/semicolons (protecting decimal numbers like 1,5 kg)
 *   or sentence boundaries.
 */
export function parseIngredientsText(
    text: string,
    maxItems?: number
): string[] {
    if (!text || typeof text !== 'string') {
        return [];
    }

    const rawLines = text
        .split('\n')
        .map((l) => l.trim())
        .filter(Boolean);

    let itemsToProcess: string[] = [];

    // If single line or all content is in one line, check for comma/semicolon separation
    if (rawLines.length === 1) {
        const singleLine = rawLines[0];
        // Split on commas/semicolons not between digits, or period before a capitalized word
        const splitItems = singleLine
            .split(/(?<!\d)[,;](?!\d)|(?<=[a-zÀ-ÿ0-9])\.(?=[A-ZÀ-ÿ])/)
            .map((item) => cleanItem(item, true))
            .filter(Boolean);

        if (splitItems.length > 1) {
            itemsToProcess = splitItems;
        } else {
            itemsToProcess = rawLines;
        }
    } else {
        itemsToProcess = rawLines;
    }

    const items: string[] = [];
    for (const rawItem of itemsToProcess) {
        const cleaned = cleanItem(rawItem, true);
        if (cleaned) {
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
 * - If single line/paragraph, splits by sentence delimiters (. ! ?) and inline numbers.
 */
export function parseStepsText(text: string, maxItems?: number): string[] {
    if (!text || typeof text !== 'string') {
        return [];
    }

    const rawLines = text
        .split('\n')
        .map((l) => l.trim())
        .filter(Boolean);

    let itemsToProcess: string[] = [];

    // If single line or all content is in one line, check for sentence/period separation
    if (rawLines.length === 1) {
        const singleLine = rawLines[0];
        // Split by:
        // 1. Inline numbering (e.g. "1. First step 2. Second step")
        // 2. Sentence end followed by space/punctuation: (?<=[.!?])\s+
        // 3. Period between word and letter/digit without space (e.g. "35mn.a Mèdia" or "horno.Poner")
        const splitItems = singleLine
            .split(
                /(?<=\D)(?=\d+[.)]\s+)|(?<=[.!?])\s+|(?<=[a-zÀ-ÿ0-9])\.(?=[a-zA-ZÀ-ÿ])/
            )
            .map((item) => cleanItem(item, true))
            .filter(Boolean);

        if (splitItems.length > 1) {
            itemsToProcess = splitItems;
        } else {
            itemsToProcess = rawLines;
        }
    } else {
        itemsToProcess = rawLines;
    }

    const items: string[] = [];
    for (const rawItem of itemsToProcess) {
        const cleaned = cleanItem(rawItem, true);
        if (cleaned) {
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
