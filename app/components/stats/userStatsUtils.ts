export const formatStatNumber = (num: number): string | number => {
    if (num >= 1000) {
        return Math.round(num / 100) / 10 + 'k';
    }
    return num;
};

export const calculateTrend = (
    recipesThisYear: number,
    recipeCount: number
): number => {
    if (recipeCount <= 0) return 0;
    return Math.round((recipesThisYear / recipeCount) * 100);
};

export const calculateCookingTimeInHours = (
    totalMinutes?: number | null
): number => {
    if (!totalMinutes) return 0;
    return Math.round((totalMinutes / 60) * 10) / 10;
};

export const calculateThisYearPercentage = (
    recipesThisYear: number,
    recipeCount: number
): number => {
    const denominator = recipeCount > 0 ? recipeCount : 1;
    return Math.round((recipesThisYear / denominator) * 100);
};

export const resolvePreferenceDisplay = (
    value: string | undefined | null,
    translate: (key: string) => string
): string => {
    if (!value) return '-';
    const translated = translate(value.toLowerCase());
    return translated || value;
};

export const capitalize = (str: string): string => {
    if (!str) return '';
    return str.charAt(0).toUpperCase() + str.slice(1);
};
