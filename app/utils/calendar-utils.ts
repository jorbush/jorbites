import { SafePlanningMeal } from '@/app/types';
import { JORBITES_URL } from '@/app/utils/constants';

const formatIcsDate = (date: Date, hours: number, minutes: number) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hh = String(hours).padStart(2, '0');
    const mm = String(minutes).padStart(2, '0');
    const ss = '00';
    return `${year}${month}${day}T${hh}${mm}${ss}`;
};

const dayOffsets: Record<string, number> = {
    monday: 0,
    tuesday: 1,
    wednesday: 2,
    thursday: 3,
    friday: 4,
    saturday: 5,
    sunday: 6,
};

const mealTimes: Record<
    string,
    { start: [number, number]; end: [number, number]; label: string }
> = {
    breakfast: { start: [8, 0], end: [8, 45], label: 'Breakfast' },
    lunch: { start: [13, 0], end: [14, 0], label: 'Lunch' },
    dinner: { start: [20, 0], end: [21, 0], label: 'Dinner' },
    snack: { start: [17, 0], end: [17, 30], label: 'Snack' },
};

export function generateIcsContent(
    planningName: string,
    meals: SafePlanningMeal[],
    startMondayDate: Date
): string {
    const baseDomain =
        typeof window !== 'undefined' ? window.location.origin : JORBITES_URL;

    const icsContent = [
        'BEGIN:VCALENDAR',
        'VERSION:2.0',
        'PRODID:-//Jorbites//Meal Planner//EN',
        'CALSCALE:GREGORIAN',
        'METHOD:PUBLISH',
    ];

    meals.forEach((meal) => {
        const offset = dayOffsets[meal.day.toLowerCase()];
        if (offset === undefined) return;

        const timeInfo = mealTimes[meal.mealType.toLowerCase()];
        if (!timeInfo) return;

        // Calculate event start/end dates
        const eventDate = new Date(startMondayDate);
        eventDate.setDate(startMondayDate.getDate() + offset);

        const dtStart = formatIcsDate(
            eventDate,
            timeInfo.start[0],
            timeInfo.start[1]
        );
        const dtEnd = formatIcsDate(
            eventDate,
            timeInfo.end[0],
            timeInfo.end[1]
        );
        const recipeTitle = meal.recipe?.title || 'Unknown Recipe';
        const recipeUrl = meal.recipe?.id
            ? `${baseDomain}/recipes/${meal.recipe.id}`
            : '';

        const summary = `${timeInfo.label}: ${recipeTitle}`;
        const description = meal.recipe?.description
            ? `${meal.recipe.description.substring(0, 100)}...\\n\\nRecipe Link: ${recipeUrl}`
            : `Recipe Link: ${recipeUrl}`;

        const uid = `${meal.day}-${meal.mealType}-${meal.recipeId}-${eventDate.getTime()}@jorbites.com`;

        icsContent.push('BEGIN:VEVENT');
        icsContent.push(`UID:${uid}`);
        icsContent.push(`DTSTAMP:${formatIcsDate(new Date(), 0, 0)}Z`); // Stamp in UTC
        icsContent.push(`DTSTART:${dtStart}`);
        icsContent.push(`DTEND:${dtEnd}`);
        icsContent.push(`SUMMARY:${summary}`);
        icsContent.push(`DESCRIPTION:${description}`);
        if (recipeUrl) {
            icsContent.push(`URL:${recipeUrl}`);
        }
        icsContent.push('END:VEVENT');
    });

    icsContent.push('END:VCALENDAR');

    return icsContent.join('\r\n');
}
