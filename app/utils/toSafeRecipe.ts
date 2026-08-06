import { GanttTable } from '@/app/types';

/**
 * Converts a Prisma Recipe (or a recipe with joined relations) into a SafeRecipe.
 *
 * This centralizes the Prisma→SafeRecipe boundary so that:
 * - `createdAt` is serialized to a string
 * - `ganttTable` is cast from Prisma's opaque `JsonValue` to the typed `GanttTable | null`
 *
 * Any extra properties on the input (e.g. a joined `user`) are preserved via the spread.
 */
export function toSafeRecipe<T extends { createdAt: Date }>(
    recipe: T
): Omit<T, 'createdAt' | 'ganttTable'> & {
    createdAt: string;
    ganttTable?: GanttTable | null;
} {
    const { createdAt, ...rest } = recipe as any;
    return {
        ...rest,
        createdAt: createdAt.toISOString(),
        ...('ganttTable' in (recipe as object)
            ? { ganttTable: (rest.ganttTable as GanttTable) ?? null }
            : {}),
    };
}
