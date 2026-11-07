# Jorbites UI & Design System Guidelines

This document outlines the core UI standards, design principles, and component patterns for the Jorbites web application. All new views, components, and modernization refactors must adhere to these guidelines to ensure consistency, responsiveness, accessibility, and high visual polish.

---

## 1. Brand Identity & Color Palette

### 1.1 Brand Green

- **Strict Color Token**: Always use `green-450` (`#C5F0A4`).
- **Usage**:
    - Active navigation pill backgrounds: `bg-green-450`
    - Active navigation pill borders: `border border-green-450/50`
    - Price tags & key numerical highlights: `text-green-500` or `text-neutral-900` when on `bg-green-450`
    - Subtle glowing focus rings & highlights: `ring-green-450/30`
- **Strict Rule**: Never use generic or arbitrary greens (e.g. `emerald-500`, `green-600`, `lime-400`) for active states, pills, or highlights.

### 1.2 Neutral Palette & Dark Mode Support

- **Light Theme**:
    - Primary text: `text-neutral-900`
    - Secondary/muted text: `text-neutral-500` or `text-neutral-600`
    - Card surfaces: `bg-white/80` or `bg-neutral-50/80` with `backdrop-blur-xs`
    - Borders: `border-neutral-200/80` or `border-neutral-200/90`
- **Dark Theme**:
    - Primary text: `dark:text-white`
    - Secondary/muted text: `dark:text-neutral-400`
    - Card surfaces: `dark:bg-neutral-900/60` or `dark:bg-neutral-800/60`
    - Borders: `dark:border-neutral-800/80` or `dark:border-neutral-700/60`
- **Rule**: Every component must declare explicit dark mode variants for backgrounds, borders, and text colors.

---

## 2. Page Headers & Iconography

### 2.1 Squircle Icon Container

Every main page header (e.g., Blog, Workshops, Quests, Plannings, Lists, Top Jorbiters) features a standardized squircle icon badge:

```tsx
<div className="flex size-11 shrink-0 items-center justify-center rounded-xl border border-neutral-200/80 bg-neutral-100 shadow-2xs sm:size-12 dark:border-neutral-700/60 dark:bg-neutral-800">
    <FcIconName size={28} />
</div>
```

### 2.2 Header Typography

```tsx
<div>
    <h1 className="text-2xl font-bold tracking-tight text-neutral-900 sm:text-3xl dark:text-white">
        {title}
    </h1>
    <p className="text-sm text-neutral-500 dark:text-neutral-400">
        {description}
    </p>
</div>
```

### 2.3 No Unnecessary Emojis

- **Strict Rule**: Do not use decorative emojis (e.g., 👨‍🍳, 🍲, 📝) in UI elements, headers, action cards, or buttons.
- Use semantic icons from `react-icons` (such as `react-icons/fc` for colorful squircle headers, `react-icons/fi` for outlines and tools, and `react-icons/bi` for interface controls).

---

## 3. Responsive Action Button Patterns (Desktop vs. Mobile)

Actions that create, request, or propose content (e.g. "Create Workshop", "Request Recipe", "Propose Article", "Create Planning") must follow the dual-pattern:

### 3.1 Desktop Viewports (`md+` or `lg+`)

Placed in the top header row on the far right:

```tsx
<div className="hidden md:block md:shrink-0">
    <Button
        onClick={handleAction}
        className="inline-flex items-center gap-2 rounded-xl bg-neutral-900 px-4 py-2.5 text-sm font-semibold text-white shadow-xs transition-colors duration-200 hover:bg-neutral-800 dark:bg-white dark:text-neutral-900 dark:hover:bg-neutral-100"
    >
        <BiPlus size={18} />
        <span>{actionLabel}</span>
    </Button>
</div>
```

### 3.2 Mobile / Tablet Viewports (`< md` or `< lg`)

Rendered as a circular **Floating Action Button (FAB)** fixed to the bottom right of the viewport with safe-area inset protection:

```tsx
<button
    type="button"
    onClick={handleAction}
    className="fixed right-6 bottom-[calc(4rem+env(safe-area-inset-bottom,0px))] z-10 flex size-14 cursor-pointer items-center justify-center rounded-full bg-neutral-900 text-white shadow-lg transition-colors duration-200 hover:bg-neutral-800 md:hidden dark:bg-white dark:text-neutral-900 dark:hover:bg-neutral-100"
    data-cy="action-button-mobile"
    aria-label={actionLabel}
>
    <BiPlus className="size-6" />
</button>
```

### 3.3 Rule on Separation of Concerns

- **NEVER** insert action buttons into the navigation/category tab row.
- Tab rows are reserved strictly for filtering and switching views. Overlapping or sharing a row with action buttons causes horizontal squishing and breaks mobile usability.

---

## 4. Tabs & Filter Navigation

### 4.1 Pill Style & States

- **Active Pill**:
    ```tsx
    className =
        'border border-green-450/50 bg-green-450 font-semibold text-neutral-900 shadow-xs rounded-full px-4 py-2 text-sm';
    ```
- **Inactive Pill**:
    ```tsx
    className =
        'border border-neutral-200/80 bg-neutral-50/80 text-neutral-600 hover:border-neutral-300 hover:bg-neutral-100 dark:border-neutral-700/60 dark:bg-neutral-800/60 dark:text-neutral-300 dark:hover:border-neutral-600 dark:hover:bg-neutral-800 rounded-full px-4 py-2 text-sm font-medium';
    ```

### 4.2 Horizontal Scroll Container

Tab navigation rows must cleanly scroll horizontally on small screens without page overflow:

```tsx
<div className="-mx-4 overflow-x-auto px-4 sm:mx-0 sm:px-0">
    <div className="flex min-w-max gap-2 pb-1">{/* Pills */}</div>
</div>
```

---

## 5. Cards, Grids & Motion Transitions

### 5.1 Card Containers

- Containers must use `rounded-2xl` with border and background tokens:
    ```tsx
    className =
        'group relative flex flex-col overflow-hidden rounded-2xl border border-neutral-200/80 bg-white/80 p-5 shadow-2xs backdrop-blur-xs transition-colors duration-200 dark:border-neutral-800/80 dark:bg-neutral-900/60';
    ```

### 5.2 Hover Transitions

- **Restrained Motion**: Use subtle scaling for card hover effects: `group-hover:scale-102 transition-transform duration-300 ease-out`.
- **Prohibited**: Avoid aggressive scales such as `scale-110` or unconstrained zooms that induce jitter or cover adjacent card content.

### 5.3 Badges & Status Indicators

- Use micro-pills with standard borders for statuses:
    - Private: `border border-neutral-300/80 bg-neutral-100/90 text-neutral-600 dark:border-neutral-700/80 dark:bg-neutral-800/90 dark:text-neutral-300`
    - Passed / Completed: `border border-neutral-300/80 bg-neutral-100/80 text-neutral-500 dark:border-neutral-700/80 dark:bg-neutral-800/80 dark:text-neutral-400`
    - Active / Live: `border border-green-450/50 bg-green-450/20 text-neutral-900 dark:text-neutral-100`

---

## 6. Skeletons & Suspense Fallbacks

Every page with asynchronous data loading must provide a visual skeleton matching the real layout:

1. Header skeleton matching the squircle icon badge and title height.
2. Filter tabs skeleton matching pill dimensions.
3. Card grid skeleton with identical grid column gaps and heights.
4. Maintain dashed borders (`border-dashed border-neutral-300 dark:border-neutral-700`) where existing tests assert them.

---

## 7. SSR & Hydration Guidelines

1. **Locale Dates**: When formatting dates with `Intl.DateTimeFormat` or locale strings, use `useIsMounted()` to prevent server/client mismatch errors.
2. **Semantic DOM Nesting**:
    - In Markdown renderers, never render block elements (`<div>`, `<figure>`, `<pre>`) inside `<p>`. Use block detection to emit `<div className="mb-5">` when paragraph children contain block elements.
3. **Accessibility Attributes in TypeScript**:
    - Wrap `t(...)` translations with `String(t(...))` when passed to `aria-label` or `title` to avoid `DefaultTFuncReturn` vs `string` type mismatches.

---

## 8. Test Attribute Preservation

Never remove or break existing test hooks during a UI redesign:

- `data-cy` attributes (e.g. `data-cy="create-workshop"`, `data-cy="workshop-card-title"`)
- `data-testid` attributes (e.g. `data-testid="workshop-card"`, `data-testid="propose-blog-button"`)
- Key structural IDs (e.g. `id="lcp-container"`)
