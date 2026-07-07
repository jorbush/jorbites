'use client';

import React, { useReducer, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Question } from '@/app/courses/contest-manager/contestManagerQuestions';
import { FiCheckCircle, FiXCircle, FiAward } from 'react-icons/fi';
import Button from '@/app/components/buttons/Button';
import confetti from 'canvas-confetti';

interface CourseTestProps {
    questions: Question[];
    onPass: () => void;
    description?: string;
}

// ---------------------------------------------------------------------------
// Reducer
// ---------------------------------------------------------------------------

type QuizStatus = 'idle' | 'testing' | 'results';

interface QuizState {
    shuffledQuestions: Question[];
    currentIndex: number;
    selectedOption: number | null;
    userAnswers: number[];
    status: QuizStatus;
}

type QuizAction =
    | { type: 'START'; shuffled: Question[] }
    | { type: 'SELECT'; index: number }
    | { type: 'NEXT' }
    | { type: 'RESET'; shuffled: Question[] };

const initialState: QuizState = {
    shuffledQuestions: [],
    currentIndex: 0,
    selectedOption: null,
    userAnswers: [],
    status: 'idle',
};

function quizReducer(state: QuizState, action: QuizAction): QuizState {
    switch (action.type) {
        case 'START':
        case 'RESET':
            return {
                shuffledQuestions: action.shuffled,
                currentIndex: 0,
                selectedOption: null,
                userAnswers: [],
                status: 'testing',
            };
        case 'SELECT':
            return { ...state, selectedOption: action.index };
        case 'NEXT': {
            if (state.selectedOption === null) return state;
            const nextAnswers = [...state.userAnswers, state.selectedOption];
            const isLast =
                state.currentIndex >= state.shuffledQuestions.length - 1;

            if (!isLast) {
                return {
                    ...state,
                    userAnswers: nextAnswers,
                    selectedOption: null,
                    currentIndex: state.currentIndex + 1,
                };
            }

            return {
                ...state,
                userAnswers: nextAnswers,
                selectedOption: null,
                status: 'results',
            };
        }
        default:
            return state;
    }
}

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------

interface QuizQuestionProps {
    question: Question;
    currentIndex: number;
    total: number;
    selectedOption: number | null;
    currentLang: 'en' | 'es' | 'ca';
    onSelect: (idx: number) => void;
    onNext: () => void;
}

const QuizQuestion: React.FC<QuizQuestionProps> = ({
    question,
    currentIndex,
    total,
    selectedOption,
    currentLang,
    onSelect,
    onNext,
}) => {
    const progressPercent = ((currentIndex + 1) / total) * 100;

    return (
        <div className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm md:p-8 dark:border-neutral-800 dark:bg-neutral-900">
            {/* Progress bar */}
            <div className="mb-6">
                <div className="flex items-center justify-between text-xs font-semibold text-neutral-500 dark:text-neutral-400">
                    <span>
                        Question {currentIndex + 1} of {total}
                    </span>
                    <span>{Math.round(progressPercent)}%</span>
                </div>
                <div className="mt-2 h-2 w-full rounded-full bg-neutral-100 dark:bg-neutral-800">
                    <div
                        className="bg-green-450 h-full rounded-full transition-all duration-300"
                        style={{ width: `${progressPercent}%` }}
                    />
                </div>
            </div>

            {/* Question */}
            <h3 className="mb-6 text-lg font-semibold text-neutral-900 sm:text-xl dark:text-white">
                {question.question[currentLang]}
            </h3>

            {/* Options list */}
            <div className="mb-8 space-y-3">
                {question.options[currentLang].map((option, idx) => {
                    const isSelected = selectedOption === idx;
                    return (
                        <button
                            key={option}
                            type="button"
                            onClick={() => onSelect(idx)}
                            className={`flex w-full cursor-pointer items-center justify-between rounded-xl border p-4 text-left font-medium transition focus:outline-hidden ${
                                isSelected
                                    ? 'border-green-450 bg-green-450/10 text-neutral-900 dark:text-green-300'
                                    : 'border-neutral-200 text-neutral-700 hover:bg-neutral-50 dark:border-neutral-800 dark:text-neutral-300 dark:hover:bg-neutral-800/40'
                            }`}
                        >
                            <span className="text-sm sm:text-base">
                                {option}
                            </span>
                            <div
                                className={`flex size-5 items-center justify-center rounded-full border-2 ${
                                    isSelected
                                        ? 'border-green-450 bg-green-450 text-neutral-950'
                                        : 'border-neutral-300 dark:border-neutral-700'
                                }`}
                            >
                                {isSelected && (
                                    <div className="size-2 rounded-full bg-white" />
                                )}
                            </div>
                        </button>
                    );
                })}
            </div>

            {/* Footer */}
            <div className="flex justify-end">
                <div className="w-fit">
                    <Button
                        label={currentIndex === total - 1 ? 'Finish' : 'Next'}
                        onClick={onNext}
                        disabled={selectedOption === null}
                        small
                        dataCy="next-question-button"
                    />
                </div>
            </div>
        </div>
    );
};

// ---------------------------------------------------------------------------

interface QuizResultsProps {
    shuffledQuestions: Question[];
    userAnswers: number[];
    score: number;
    isPassed: boolean;
    currentLang: 'en' | 'es' | 'ca';
    onRetry: () => void;
}

const QuizResults: React.FC<QuizResultsProps> = ({
    shuffledQuestions,
    userAnswers,
    score,
    isPassed,
    currentLang,
    onRetry,
}) => {
    const { t } = useTranslation();

    return (
        <div className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm md:p-8 dark:border-neutral-800 dark:bg-neutral-900">
            <div className="text-center">
                <div
                    className={`mx-auto mb-4 flex size-16 items-center justify-center rounded-full ${
                        isPassed
                            ? 'bg-green-450/20 dark:bg-green-450/10 text-green-800 dark:text-green-300'
                            : 'bg-rose-50 text-rose-600 dark:bg-rose-950/40 dark:text-rose-400'
                    }`}
                >
                    {isPassed ? (
                        <FiCheckCircle className="size-10" />
                    ) : (
                        <FiXCircle className="size-10" />
                    )}
                </div>

                <h3 className="mb-2 text-2xl font-semibold text-neutral-900 dark:text-white">
                    {isPassed ? 'Test Passed!' : 'Test Failed'}
                </h3>
                <p className="mx-auto mb-6 max-w-md text-sm text-neutral-600 dark:text-neutral-400">
                    {isPassed ? t('pass_message') : t('fail_message')}
                </p>

                {/* Score badge */}
                <div className="mx-auto mb-8 inline-flex flex-col items-center justify-center rounded-2xl bg-neutral-50 px-8 py-4 dark:bg-neutral-800/40">
                    <span className="text-xs font-semibold tracking-wider text-neutral-500 uppercase dark:text-neutral-400">
                        {t('your_score')}
                    </span>
                    <span
                        className={`mt-1 text-4xl font-extrabold ${isPassed ? 'text-green-600 dark:text-green-400' : 'text-rose-500'}`}
                    >
                        {score} / {shuffledQuestions.length}
                    </span>
                    <span className="mt-1 text-xs text-neutral-400 dark:text-neutral-500">
                        ({t('passing_score')}: 8/10)
                    </span>
                </div>

                {/* Retry action */}
                {!isPassed && (
                    <div className="mb-10">
                        <div className="mx-auto w-fit">
                            <Button
                                label={t('retry_test')}
                                onClick={onRetry}
                                small
                                outline
                                dataCy="retry-quiz-button"
                            />
                        </div>
                    </div>
                )}
            </div>

            {/* Questions breakdown review */}
            <div className="mt-8 border-t border-neutral-100 pt-8 dark:border-neutral-800">
                <h4 className="mb-4 text-base font-semibold text-neutral-900 dark:text-white">
                    Review Questions
                </h4>
                <div className="space-y-4">
                    {shuffledQuestions.map((q, idx) => {
                        const isCorrect = userAnswers[idx] === q.correctIndex;
                        return (
                            <div
                                key={q.id}
                                className={`rounded-xl border p-4 ${
                                    isCorrect
                                        ? 'border-green-450/20 bg-green-450/5 dark:border-green-450/10 dark:bg-green-450/5'
                                        : 'border-rose-100 bg-rose-50/10 dark:border-rose-950/20 dark:bg-rose-950/5'
                                }`}
                            >
                                <div className="flex items-start gap-3">
                                    <div className="mt-0.5 flex-shrink-0">
                                        {isCorrect ? (
                                            <FiCheckCircle className="size-4 text-green-600 dark:text-green-400" />
                                        ) : (
                                            <FiXCircle className="size-4 text-rose-600 dark:text-rose-400" />
                                        )}
                                    </div>
                                    <div className="flex-1">
                                        <p className="text-sm font-medium text-neutral-900 dark:text-white">
                                            {q.question[currentLang]}
                                        </p>
                                        <div className="mt-2 space-y-1 text-xs">
                                            <p className="text-neutral-600 dark:text-neutral-400">
                                                {t(
                                                    'contest_manager_course_details.your_answer'
                                                )}
                                                :{' '}
                                                <span className="font-semibold">
                                                    {q.options[currentLang][
                                                        userAnswers[idx]
                                                    ] || 'None'}
                                                </span>
                                            </p>
                                            {!isCorrect && (
                                                <p className="font-semibold text-green-600 dark:text-green-400">
                                                    {t(
                                                        'contest_manager_course_details.correct_answer'
                                                    )}
                                                    :{' '}
                                                    <span>
                                                        {
                                                            q.options[
                                                                currentLang
                                                            ][q.correctIndex]
                                                        }
                                                    </span>
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
};

// ---------------------------------------------------------------------------
// Main component
// ---------------------------------------------------------------------------

const CourseTest: React.FC<CourseTestProps> = ({
    questions,
    onPass,
    description,
}) => {
    const { t, i18n } = useTranslation();
    const currentLang = (
        i18n.language === 'es' || i18n.language === 'ca' ? i18n.language : 'en'
    ) as 'en' | 'es' | 'ca';

    const [state, dispatch] = useReducer(quizReducer, initialState);

    const startQuiz = () => {
        const shuffled = questions.toSorted(() => Math.random() - 0.5);
        dispatch({ type: 'START', shuffled });
    };

    const retryQuiz = () => {
        const shuffled = questions.toSorted(() => Math.random() - 0.5);
        dispatch({ type: 'RESET', shuffled });
    };

    const score = useMemo(() => {
        if (state.status !== 'results') return 0;
        return state.shuffledQuestions.reduce((acc, q, idx) => {
            return acc + (state.userAnswers[idx] === q.correctIndex ? 1 : 0);
        }, 0);
    }, [state.status, state.shuffledQuestions, state.userAnswers]);

    const isPassed = score >= Math.ceil(state.shuffledQuestions.length * 0.8);

    const handleNext = () => {
        if (state.selectedOption === null) return;

        const nextAnswers = [...state.userAnswers, state.selectedOption];
        const isLast = state.currentIndex >= state.shuffledQuestions.length - 1;

        if (isLast) {
            let correctCount = 0;
            state.shuffledQuestions.forEach((q, idx) => {
                if (nextAnswers[idx] === q.correctIndex) {
                    correctCount++;
                }
            });

            const passingScore = Math.ceil(
                state.shuffledQuestions.length * 0.8
            );
            const isPass = correctCount >= passingScore;

            if (isPass) {
                confetti({
                    particleCount: 150,
                    spread: 80,
                    origin: { y: 0.6 },
                });
                onPass();
            }
        }

        dispatch({ type: 'NEXT' });
    };

    if (state.status === 'idle') {
        return (
            <div className="rounded-2xl bg-neutral-50 p-8 text-center dark:bg-neutral-800/30">
                <div className="bg-green-450/20 dark:bg-green-450/10 mx-auto mb-4 flex size-16 items-center justify-center rounded-full text-green-800 dark:text-green-300">
                    <FiAward className="size-8" />
                </div>
                <h3 className="mb-2 text-xl font-semibold text-neutral-900 dark:text-white">
                    {t('final_test')}
                </h3>
                <p className="mx-auto mb-6 max-w-md text-sm text-neutral-600 dark:text-neutral-400">
                    {description ||
                        t(
                            'contest_manager_course_details.final_test_description'
                        )}
                </p>
                <div className="mx-auto w-fit">
                    <Button
                        label={t('start_course')}
                        onClick={startQuiz}
                        small
                        dataCy="start-quiz-button"
                    />
                </div>
            </div>
        );
    }

    if (state.status === 'testing') {
        const currentQuestion = state.shuffledQuestions[state.currentIndex];
        if (!currentQuestion) return null;

        return (
            <QuizQuestion
                question={currentQuestion}
                currentIndex={state.currentIndex}
                total={state.shuffledQuestions.length}
                selectedOption={state.selectedOption}
                currentLang={currentLang}
                onSelect={(idx) => dispatch({ type: 'SELECT', index: idx })}
                onNext={handleNext}
            />
        );
    }

    return (
        <QuizResults
            shuffledQuestions={state.shuffledQuestions}
            userAnswers={state.userAnswers}
            score={score}
            isPassed={isPassed}
            currentLang={currentLang}
            onRetry={retryQuiz}
        />
    );
};

export default CourseTest;
