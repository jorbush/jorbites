---
name: ui-guidelines
description: >-
    Use this skill whenever creating, modernizing, styling, or refactoring UI components, pages, cards, headers, or views in the Jorbites application to adhere to the official Jorbites design system and UX patterns.
---

# Jorbites UI & Design System Skill

This skill guides the implementation, modernization, and styling of user interfaces across the Jorbites codebase.

## Core Rules & Design System Tokens

### 1. Color Tokens

- **Brand Green**: Strictly `green-450` (`#C5F0A4`).
    - Active navigation pill background: `bg-green-450`
    - Active navigation pill border: `border border-green-450/50`
    - Price tags & highlights: `text-green-500` or `text-neutral-900`
    - Focus rings: `ring-green-450/30`
    - **Never use** arbitrary greens (e.g., `emerald-500`, `green-600`, `lime-400`).
- **Dark Mode**: Provide explicit dark variants for every visual token:
    - Text: `text-neutral-900 dark:text-white`
    - Muted: `text-neutral-500 dark:text-neutral-400`
    - Surfaces: `bg-white/80 dark:bg-neutral-900/60`
    - Borders: `border-neutral-200/80 dark:border-neutral-800/80`

### 2. Page Headers & Squircle Icon Container

Every main page header must use this layout:

```tsx
<div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
    <div className="flex items-center gap-3.5">
        <div className="flex size-11 sm:size-12 shrink-0 items-center justify-center rounded-xl border border-neutral-200/80 bg-neutral-100 shadow-2xs dark:border-neutral-700/60 dark:bg-neutral-800">
            <FcIconName size={28} />
        </div>
        <div>
            <h1 className="text-2xl font-bold tracking-tight text-neutral-900 sm:text-3xl dark:text-white">
                {title}
            </h1>
            <p className="text-sm text-neutral-500 dark:text-neutral-400">
                {description}
            </p>
        </div>
    </div>
    {/* Optional Desktop Action Slot */}
    <div className="hidden md:block md:shrink-0">
        <Button ... />
    </div>
</div>
```

- **No Decorative Emojis**: Do not use emojis (e.g. 👨‍🍳, 📝) in UI headers, buttons, cards, or labels. Use semantic icons from `react-icons`.

### 3. Action Buttons: Desktop vs. Mobile Dual Pattern

When a page has an action to create or submit content:

- **Desktop (`md+` or `lg+`)**: Top header right slot (`hidden md:block md:shrink-0`).
- **Mobile (`< md` or `< lg`)**: Fixed bottom-right circular Floating Action Button (FAB):
    ```tsx
    <button
        type="button"
        onClick={handleAction}
        className="fixed right-6 bottom-[calc(4rem+env(safe-area-inset-bottom,0px))] z-10 flex size-14 cursor-pointer items-center justify-center rounded-full bg-neutral-900 text-white shadow-lg transition-colors duration-200 hover:bg-neutral-800 md:hidden dark:bg-white dark:text-neutral-900 dark:hover:bg-neutral-100"
        data-cy="action-button-mobile"
        aria-label={label}
    >
        <BiPlus className="size-6" />
    </button>
    ```
- **Separation of Concerns**: Never place action buttons inside the navigation tabs or category filter bar.

### 4. Navigation Tabs & Category Filters

- Dedicated scrollable container:
    ```tsx
    <div className="-mx-4 overflow-x-auto px-4 sm:mx-0 sm:px-0">
        <div className="flex min-w-max gap-2 pb-1">
            {/* Active */}
            <button className="border-green-450/50 bg-green-450 rounded-full border px-4 py-2 text-sm font-semibold text-neutral-900 shadow-xs" />
            {/* Inactive */}
            <button className="rounded-full border border-neutral-200/80 bg-neutral-50/80 px-4 py-2 text-sm font-medium text-neutral-600 hover:border-neutral-300 hover:bg-neutral-100 dark:border-neutral-700/60 dark:bg-neutral-800/60 dark:text-neutral-300 dark:hover:border-neutral-600 dark:hover:bg-neutral-800" />
        </div>
    </div>
    ```

### 5. Cards & Motion

- Container: `rounded-2xl border border-neutral-200/80 bg-white/80 dark:border-neutral-800/80 dark:bg-neutral-900/60`
- Restrained hover zoom: `group-hover:scale-102 transition-transform duration-300 ease-out`. Never use aggressive scaling like `scale-110`.

### 6. SSR & Hydration Safeguards

- Format dates using `useIsMounted()` to eliminate hydration mismatches.
- Ensure semantic DOM nesting: never render `<div>` inside `<p>`.
- Wrap translation keys passed to `aria-label` or `title` with `String(t(...))`.
- Always preserve test hooks: `data-cy`, `data-testid`, and structural `id`s.

## UI Modernization Checklist

When modernizing a page or component:

1. [ ] Squircle icon header added (`Fc*` icon, size 28, `size-11 sm:size-12 rounded-xl`).
2. [ ] Brand green token is strictly `green-450`.
3. [ ] All decorative emojis removed and replaced with React Icons.
4. [ ] Desktop action placed in header; mobile action placed in bottom-right FAB.
5. [ ] Tab/filter row is clean and isolated with horizontal scroll.
6. [ ] Card hover scale is `scale-102` max.
7. [ ] Dark mode styles verified.
8. [ ] Hydration safety checks passed (`useIsMounted()`, valid HTML nesting).
9. [ ] All existing `data-cy` / `data-testid` selectors preserved.
10. [ ] `npx tsc --noEmit && pnpm run format` succeeds with zero errors.
