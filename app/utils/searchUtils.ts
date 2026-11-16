export function filterBySearchQuery<T>(
    items: T[],
    query: string,
    getSearchableFields: (item: T) => Array<string | null | undefined>
): T[] {
    const normalized = query.trim().toLowerCase();
    if (!normalized) return items;

    return items.filter((item) =>
        getSearchableFields(item).some((field) =>
            field?.toLowerCase().includes(normalized)
        )
    );
}
