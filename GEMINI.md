# Jorbites Development & UI Design Guidelines

This workspace enforces strict UI, architecture, and coding standards. All agents and developers must follow these principles when writing, refactoring, or reviewing code.

---

## 1. UI & Design System Standards

### 1.1 Brand Color Palette

- **Brand Green**: Strictly use `green-450` (`#C5F0A4`).
    - Active navigation pill backgrounds: `bg-green-450`
    - Active navigation pill borders: `border border-green-450/50`
    - Price tags & key numerical highlights: `text-green-500` or `text-neutral-900` when on `bg-green-450`
    - Focus rings: `ring-green-450/30`
    - **Strict Rule**: Never use generic or arbitrary greens (e.g. `emerald-500`, `green-600`, `lime-400`) for active states, pills, or highlights.
- **Dark Mode Support**: Always specify complementary dark mode styles:
    - Text: `text-neutral-900 dark:text-white`
    - Muted text: `text-neutral-500 dark:text-neutral-400`
    - Surfaces: `bg-white/80 dark:bg-neutral-900/60`
    - Borders: `border-neutral-200/80 dark:border-neutral-800/80`

### 1.2 Headers & Squircle Icons

- All main page headers must include a squircle icon container on the left:
  `flex size-11 sm:size-12 shrink-0 items-center justify-center rounded-xl border border-neutral-200/80 bg-neutral-100 shadow-2xs dark:border-neutral-700/60 dark:bg-neutral-800`
- Use semantic icons (`react-icons/fc` for colorful squircle headers, `react-icons/fi` for outlines and tools, `react-icons/bi` for interface controls).
- **No Decorative Emojis**: Strictly do not use decorative emojis (e.g. 👨‍🍳, 📝, 🍲) in headers, action cards, buttons, or list items.

### 1.3 Action Buttons (Desktop vs. Mobile Dual Pattern)

Actions that create, request, or propose content (e.g. "Create Workshop", "Request Recipe", "Propose Article", "Create Planning") must follow the dual pattern:

- **Desktop (`md+` or `lg+`)**: Rendered in the top header on the far right (`hidden md:block md:shrink-0` or `hidden lg:block lg:shrink-0`).
- **Mobile (`< md` or `< lg`)**: Rendered as a circular **Floating Action Button (FAB)** fixed to the bottom-right of the viewport with safe-area padding:
  `fixed right-6 bottom-[calc(4rem+env(safe-area-inset-bottom,0px))] z-10 flex size-14 cursor-pointer items-center justify-center rounded-full bg-neutral-900 text-white shadow-lg transition-colors duration-200 hover:bg-neutral-800 md:hidden dark:bg-white dark:text-neutral-900 dark:hover:bg-neutral-100`
- **Separation of Concerns**: Never embed action buttons directly inside the tabs or category filter pill row. Tab rows are strictly for navigation/filtering.

### 1.4 Navigation Tabs & Filters

- Tab rows must scroll horizontally without page overflow: `-mx-4 overflow-x-auto px-4 sm:mx-0 sm:px-0`.
- Active tab pill: `border border-green-450/50 bg-green-450 font-semibold text-neutral-900 shadow-xs rounded-full px-4 py-2 text-sm`.
- Inactive tab pill: `border border-neutral-200/80 bg-neutral-50/80 text-neutral-600 hover:border-neutral-300 hover:bg-neutral-100 dark:border-neutral-700/60 dark:bg-neutral-800/60 dark:text-neutral-300 dark:hover:border-neutral-600 dark:hover:bg-neutral-800 rounded-full px-4 py-2 text-sm font-medium`.

### 1.5 Cards & Motion Transitions

- Containers: `rounded-2xl border border-neutral-200/80 bg-white/80 dark:border-neutral-800/80 dark:bg-neutral-900/60`.
- Hover zoom: Use subtle, smooth scaling `group-hover:scale-102 transition-transform duration-300 ease-out`. Avoid aggressive scales like `scale-110`.

---

## 2. SSR, Hydration & Code Quality

### 2.1 Hydration Safety

- When formatting dates with user locale strings, use `useIsMounted()` to eliminate server-client mismatch warnings.
- In Markdown and rich text, never render block elements (`<div>`, `<figure>`, `<pre>`) inside `<p>`.

### 2.2 TypeScript & Translation Attributes

- In JSX properties (`aria-label`, `title`), wrap translation outputs in `String(t(...))` to satisfy TypeScript types (`string | undefined` vs `DefaultTFuncReturn`).

### 2.3 React Doctor Rules

- Avoid complex giant components: decompose data fetching and state into dedicated custom hooks.
- Use module constants (e.g. `const EMPTY_ITEMS = []`) for hook default props to prevent unnecessary re-renderings.
- Avoid initializing state from mount effects (`useState(false)` + `useEffect(setState(true))`) where `useIsMounted()` or `useSyncExternalStore` is appropriate.

### 2.4 Test Hooks & Cypress Attributes

- Always preserve existing test selectors: `data-cy`, `data-testid`, and `id` (e.g. `id="lcp-container"`).
- Run unit tests and format checks (`npx tsc --noEmit && pnpm run format`) before committing changes.
