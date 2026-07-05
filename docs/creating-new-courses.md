# Creating New Courses Guide

This guide outlines the architecture, best practices, and reuse of common logic when adding a new course to the Jorbites platform.

---

## 1. Course Architecture & Directory Structure

Every course is structured as a client-side component placed inside `app/courses/[course-id]/`.

```
app/courses/[course-id]/
├── page.tsx                       # Next.js page route importing the Client component
├── [CourseId]Client.tsx           # Main course container using CourseLayout and useCourseProgress
├── [CourseId]Overview.tsx         # Course-specific checklist or requirements component
├── [courseId]Questions.ts         # Array of CourseTest questions (for the final exam)
```

---

## 2. Reusing Core Logic & Shared Components

To ensure design consistency and avoid code duplication, always leverage the unified courses infrastructure under `app/components/courses/` and `app/hooks/`.

### A. Progress State Management (`useCourseProgress`)
The custom hook `useCourseProgress` abstracts progress tracking, localStorage persistence, and user feedback toast alerts.

```typescript
import { useCourseProgress } from '@/app/hooks/useCourseProgress';

const MODULES_KEY = 'jorbites_course_[course_name]_modules:v2';
const PROGRESS_KEY = 'jorbites_course_[course_name]_progress:v2';

const allStepIds = ['overview', 'workflow', 'sharing', 'test'];

const {
    completedModules,
    markModuleCompleted,
    isTestPassed,
} = useCourseProgress(MODULES_KEY, PROGRESS_KEY, allStepIds);
```

### B. Standard Layout Structure (`CourseLayout`)
Unify back buttons, icons, page headers, sticky steppers, and content sidebars.

```typescript
import CourseLayout from '@/app/components/courses/CourseLayout';

return (
    <CourseLayout
        courseTitle={t('course_title_key')}
        courseDescription={t('course_desc_key')}
        headerIcon={FiBookOpen}
        steps={steps}
        activeStep={activeStep}
        onSelectStep={setActiveStep}
    >
        {/* Step-specific components render here */}
    </CourseLayout>
);
```

### C. Informational Steps (`CourseInfoStep`)
For steps that simply present paragraphs of information or custom layouts.

```typescript
import CourseInfoStep from '@/app/components/courses/CourseInfoStep';

{activeStep === 'sharing' && (
    <CourseInfoStep
        title={t('sharing_title')}
        icon={FiShare2}
        paragraphs={[
            t('sharing_desc_paragraph_1'),
            t('sharing_desc_paragraph_2'),
        ]}
        onComplete={() => {
            markModuleCompleted('sharing');
            setActiveStep('test');
        }}
    />
)}
```
*Note: If you need to render complex custom grids, tables, or buttons, pass them as React elements in the `children` of `CourseInfoStep`.*

### D. Interactive Walkthroughs (`CourseWorkflowStep`)
For multi-step timelines that let users step through instructions.

```typescript
import CourseWorkflowStep from '@/app/components/courses/CourseWorkflowStep';

{activeStep === 'creation' && (
    <CourseWorkflowStep
        title={t('workflow_title')}
        icon={PiListPlusBold}
        stepPrefix="recipe_lists_course_details.workflow_step"
        totalSteps={5}
        onComplete={() => {
            markModuleCompleted('creation');
            setActiveStep('sharing');
        }}
    />
)}
```
*Note: The component automatically resolves translation keys for titles and descriptions by combining the prefix with the step index: `${stepPrefix}${index}_title` / `${stepPrefix}${index}_desc`.*

### E. Course Completion Alert (`CourseCompleted`)
When a user passes the test, show the standard green success box and the printable PDF certificate generator.

```typescript
import CourseCompleted from '@/app/components/courses/CourseCompleted';

{isTestPassed && (
    <CourseCompleted
        courseTitle="My Course Title"
        currentUserNames={currentUser?.name}
        badgePath="/badges/my_course_badge.jpg"
    />
)}
```

---

## 3. Best Practices & Pitfalls to Avoid

### 1. Avoid Parent State Updates During Child Render Pass
When updating the status of checkboxes in child components (e.g. requirements overview pages), **never** call parent updates like `markModuleCompleted` inside React's state-set function:

```typescript
// ❌ WRONG: Triggers React warnings and hydration errors
setOverviewChecked((prev) => {
    const next = { ...prev, [key]: true };
    if (Object.values(next).every(Boolean)) {
        markModuleCompleted('overview'); // State update during render pass!
    }
    return next;
});

//   CORRECT: Perform parent callbacks in the event handler itself
const handleCheck = (key: string) => {
    const next = { ...overviewChecked, [key]: true };
    setOverviewChecked(next);
    if (Object.values(next).every(Boolean)) {
        markModuleCompleted('overview');
    }
};
```

### 2. Standalone Unit Tests
Every new course screen and helper subcomponent must have a corresponding test suite file under `__tests__/unit_test/components/courses/` written with Vitest.

When testing, remember:
- Use `afterEach(() => cleanup())` to reset JSDOM elements between tests.
- When query selectors match multiple items (e.g., matching the same button labels in both mobile and desktop steppers), select the active index via `screen.getAllByRole('button', { name: ... })[0]`.

### 3. Localization Consistency
Keep all course titles, step names, descriptions, and checklists in localized files:
- `public/locales/en/translation.json`
- `public/locales/es/translation.json`
- `public/locales/ca/translation.json`
