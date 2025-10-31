/**
 * Parses plain text input into an array of strings (ingredients or steps).
 * Handles various common formats:
 * - Each line is an item
 * - Numbered lists (1. item, 1) item, etc.)
 * - Bullet points (- item, * item, • item)
 * - Empty lines are ignored
 * - Leading/trailing whitespace is trimmed
 *
 * @param text - The plain text to parse
 * @param maxItems - Maximum number of items allowed (optional)
 * @returns Array of parsed items
 */
export function parseTextToList(text: string, maxItems?: number): string[] {
    if (!text || typeof text !== 'string') {
        return [];
    }

    // Split by newlines and process each line
    const lines = text.split('\n');
    const items: string[] = [];

    for (const line of lines) {
        // Trim whitespace
        let trimmedLine = line.trim();

        // Skip empty lines
        if (!trimmedLine) {
            continue;
        }

        // Remove common list prefixes:
        // - Numbered: "1.", "1)", "1 -", "1 )", etc.
        // - Bullets: "-", "*", "•", "→", "⋅"
        trimmedLine = trimmedLine.replace(/^(?:\d+[\.\)]\s*|[-*•→⋅]\s*)/, '');

        // Trim again after removing prefix
        trimmedLine = trimmedLine.trim();

        // If still has content, add it
        if (trimmedLine) {
            items.push(trimmedLine);

            // Stop if we've reached the max items limit
            if (maxItems && items.length >= maxItems) {
                break;
            }
        }
    }

    return items;
}
