import {
    Question,
    contestManagerQuestions,
} from '@/app/courses/contest-manager/contestManagerQuestions';
import { communityEventsQuestions } from '@/app/courses/community-events/communityEventsQuestions';
import { draftsQuestions } from '@/app/courses/drafts/draftsQuestions';
import { jorbitesBasicsQuestions } from '@/app/courses/jorbites-basics/jorbitesBasicsQuestions';
import { mealPlannerQuestions } from '@/app/courses/meal-planner/mealPlannerQuestions';
import { questsQuestions } from '@/app/courses/quests/questsQuestions';
import { recipeBookQuestions } from '@/app/courses/recipe-book-builder/recipeBookQuestions';
import { recipeCreatorQuestions } from '@/app/courses/recipe-creator/recipeCreatorQuestions';
import { recipeListsQuestions } from '@/app/courses/recipe-lists/recipeListsQuestions';
import { workshopsQuestions } from '@/app/courses/workshops/workshopsQuestions';

const COURSE_QUESTIONS: Record<string, Question[]> = {
    'jorbites-basics': jorbitesBasicsQuestions,
    'recipe-creator': recipeCreatorQuestions,
    'recipe-lists': recipeListsQuestions,
    'meal-planner': mealPlannerQuestions,
    'community-events': communityEventsQuestions,
    workshops: workshopsQuestions,
    quests: questsQuestions,
    'recipe-book-builder': recipeBookQuestions,
    'contest-manager': contestManagerQuestions,
    drafts: draftsQuestions,
};

export interface CourseGradeResult {
    passed: boolean;
    score: number;
    total: number;
    passingScore: number;
}

export function getCourseQuestions(courseId: string): Question[] | undefined {
    const trimmed = courseId.trim();
    if (!Object.prototype.hasOwnProperty.call(COURSE_QUESTIONS, trimmed)) {
        return undefined;
    }
    return COURSE_QUESTIONS[trimmed];
}

export function gradeCourseAnswers(
    courseId: string,
    answers: unknown
): CourseGradeResult | null {
    const questions = getCourseQuestions(courseId);
    if (!questions || questions.length === 0) {
        return null;
    }

    if (!answers || typeof answers !== 'object' || Array.isArray(answers)) {
        return null;
    }

    const answerMap = answers as Record<string, unknown>;
    let score = 0;

    for (const question of questions) {
        const submitted = answerMap[question.id];
        if (
            typeof submitted === 'number' &&
            Number.isInteger(submitted) &&
            submitted >= 0 &&
            submitted < question.options.en.length &&
            submitted === question.correctIndex
        ) {
            score++;
        }
    }

    const total = questions.length;
    const passingScore = Math.ceil(total * 0.8);

    return {
        passed: score >= passingScore,
        score,
        total,
        passingScore,
    };
}
