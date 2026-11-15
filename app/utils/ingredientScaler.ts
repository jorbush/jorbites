const UNICODE_FRACTIONS: Record<string, number> = {
    '½': 1 / 2,
    '⅓': 1 / 3,
    '⅔': 2 / 3,
    '¼': 1 / 4,
    '¾': 3 / 4,
    '⅕': 1 / 5,
    '⅖': 2 / 5,
    '⅗': 3 / 5,
    '⅘': 4 / 5,
    '⅙': 1 / 6,
    '⅚': 5 / 6,
    '⅛': 1 / 8,
    '⅜': 3 / 8,
    '⅝': 5 / 8,
    '⅞': 7 / 8,
};

const INGREDIENT_TOKEN_REGEX =
    /(https?:\/\/[^\s]+|@[^[\]]+\[[^\]]+\]|\d+(?:[.,]\d+)?\s*%)|(?<![a-zA-Z0-9_])(\d+)\s*([½⅓⅔¼¾⅕⅖⅗⅘⅙⅚⅛⅜⅝⅞])|(?<![a-zA-Z0-9_])(\d+)\s+(\d+)\s*\/\s*(\d+)(?![0-9/])|(?<![a-zA-Z0-9_/])(\d+)\s*\/\s*(\d+)(?![0-9/])|(?<![a-zA-Z0-9_])([½⅓⅔¼¾⅕⅖⅗⅘⅙⅚⅛⅜⅝⅞])|(?<![a-zA-Z0-9_.,])(\d+(?:[.,]\d+)?)(?![0-9.,])/g;

function formatScaledValue(value: number, useCommaDecimal = false): string {
    const rounded = Math.round((value + Number.EPSILON) * 100) / 100;
    const formatted = rounded.toString();
    return useCommaDecimal ? formatted.replace('.', ',') : formatted;
}

/**
 * Scales numeric quantities in a single ingredient string proportionally
 * from `baseServings` to `targetServings`.
 */
export function scaleIngredient(
    ingredient: string,
    baseServings?: number | null,
    targetServings?: number | null
): string {
    if (
        !ingredient ||
        typeof baseServings !== 'number' ||
        typeof targetServings !== 'number' ||
        baseServings <= 0 ||
        targetServings <= 0 ||
        baseServings === targetServings
    ) {
        return ingredient;
    }

    const ratio = targetServings / baseServings;

    return ingredient.replace(
        INGREDIENT_TOKEN_REGEX,
        (
            match,
            protectedToken: string | undefined,
            mixedUnicodeWhole: string | undefined,
            mixedUnicodeFrac: string | undefined,
            mixedAsciiWhole: string | undefined,
            mixedAsciiNum: string | undefined,
            mixedAsciiDenom: string | undefined,
            asciiNum: string | undefined,
            asciiDenom: string | undefined,
            standaloneUnicodeFrac: string | undefined,
            decimalOrInt: string | undefined
        ) => {
            if (protectedToken) {
                return match;
            }

            if (mixedUnicodeWhole && mixedUnicodeFrac) {
                const whole = parseInt(mixedUnicodeWhole, 10);
                const frac = UNICODE_FRACTIONS[mixedUnicodeFrac] ?? 0;
                return formatScaledValue((whole + frac) * ratio);
            }

            if (mixedAsciiWhole && mixedAsciiNum && mixedAsciiDenom) {
                const denom = parseInt(mixedAsciiDenom, 10);
                if (denom <= 0) return match;
                const whole = parseInt(mixedAsciiWhole, 10);
                const num = parseInt(mixedAsciiNum, 10);
                return formatScaledValue((whole + num / denom) * ratio);
            }

            if (asciiNum && asciiDenom) {
                const denom = parseInt(asciiDenom, 10);
                if (denom <= 0) return match;
                const num = parseInt(asciiNum, 10);
                return formatScaledValue((num / denom) * ratio);
            }

            if (standaloneUnicodeFrac) {
                const frac = UNICODE_FRACTIONS[standaloneUnicodeFrac];
                if (!frac) return match;
                return formatScaledValue(frac * ratio);
            }

            if (decimalOrInt) {
                // Keep leading-zero integer codes such as "00" flour intact
                if (/^0\d*$/.test(decimalOrInt)) {
                    return match;
                }
                const useComma = decimalOrInt.includes(',');
                const parsed = parseFloat(decimalOrInt.replace(',', '.'));
                if (isNaN(parsed) || parsed <= 0) {
                    return match;
                }
                return formatScaledValue(parsed * ratio, useComma);
            }

            return match;
        }
    );
}

/**
 * Scales an array of ingredient strings from `baseServings` to `targetServings`.
 */
export function scaleIngredients(
    ingredients: string[],
    baseServings?: number | null,
    targetServings?: number | null
): string[] {
    if (
        !Array.isArray(ingredients) ||
        typeof baseServings !== 'number' ||
        typeof targetServings !== 'number' ||
        baseServings <= 0 ||
        targetServings <= 0 ||
        baseServings === targetServings
    ) {
        return ingredients;
    }

    return ingredients.map((item) =>
        scaleIngredient(item, baseServings, targetServings)
    );
}
