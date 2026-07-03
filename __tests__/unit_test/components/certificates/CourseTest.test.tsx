import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import { describe, it, expect, vi, afterEach } from 'vitest';
import CourseTest from '@/app/components/certificates/CourseTest';
import { Question } from '@/app/certificates/contest-manager/contestManagerQuestions';

afterEach(() => {
    cleanup();
});

// Mock react-i18next
vi.mock('react-i18next', () => ({
    useTranslation: () => ({
        t: (key: string) => key,
        i18n: {
            language: 'en',
        },
    }),
}));

// Mock canvas-confetti
vi.mock('canvas-confetti', () => ({
    default: vi.fn(),
}));

const mockQuestions: Question[] = [
    {
        id: 'q1',
        question: { en: 'Question 1?', es: 'Q1?', ca: 'Q1?' },
        options: {
            en: ['Opt 1', 'Opt 2', 'Opt 3', 'Opt 4'],
            es: ['O1', 'O2', 'O3', 'O4'],
            ca: ['O1', 'O2', 'O3', 'O4'],
        },
        correctIndex: 0,
    },
    {
        id: 'q2',
        question: { en: 'Question 2?', es: 'Q2?', ca: 'Q2?' },
        options: {
            en: ['Opt 1', 'Opt 2', 'Opt 3', 'Opt 4'],
            es: ['O1', 'O2', 'O3', 'O4'],
            ca: ['O1', 'O2', 'O3', 'O4'],
        },
        correctIndex: 1,
    },
    {
        id: 'q3',
        question: { en: 'Question 3?', es: 'Q3?', ca: 'Q3?' },
        options: {
            en: ['Opt 1', 'Opt 2', 'Opt 3', 'Opt 4'],
            es: ['O1', 'O2', 'O3', 'O4'],
            ca: ['O1', 'O2', 'O3', 'O4'],
        },
        correctIndex: 2,
    },
    {
        id: 'q4',
        question: { en: 'Question 4?', es: 'Q4?', ca: 'Q4?' },
        options: {
            en: ['Opt 1', 'Opt 2', 'Opt 3', 'Opt 4'],
            es: ['O1', 'O2', 'O3', 'O4'],
            ca: ['O1', 'O2', 'O3', 'O4'],
        },
        correctIndex: 3,
    },
    {
        id: 'q5',
        question: { en: 'Question 5?', es: 'Q5?', ca: 'Q5?' },
        options: {
            en: ['Opt 1', 'Opt 2', 'Opt 3', 'Opt 4'],
            es: ['O1', 'O2', 'O3', 'O4'],
            ca: ['O1', 'O2', 'O3', 'O4'],
        },
        correctIndex: 0,
    },
    {
        id: 'q6',
        question: { en: 'Question 6?', es: 'Q6?', ca: 'Q6?' },
        options: {
            en: ['Opt 1', 'Opt 2', 'Opt 3', 'Opt 4'],
            es: ['O1', 'O2', 'O3', 'O4'],
            ca: ['O1', 'O2', 'O3', 'O4'],
        },
        correctIndex: 1,
    },
    {
        id: 'q7',
        question: { en: 'Question 7?', es: 'Q7?', ca: 'Q7?' },
        options: {
            en: ['Opt 1', 'Opt 2', 'Opt 3', 'Opt 4'],
            es: ['O1', 'O2', 'O3', 'O4'],
            ca: ['O1', 'O2', 'O3', 'O4'],
        },
        correctIndex: 2,
    },
    {
        id: 'q8',
        question: { en: 'Question 8?', es: 'Q8?', ca: 'Q8?' },
        options: {
            en: ['Opt 1', 'Opt 2', 'Opt 3', 'Opt 4'],
            es: ['O1', 'O2', 'O3', 'O4'],
            ca: ['O1', 'O2', 'O3', 'O4'],
        },
        correctIndex: 3,
    },
    {
        id: 'q9',
        question: { en: 'Question 9?', es: 'Q9?', ca: 'Q9?' },
        options: {
            en: ['Opt 1', 'Opt 2', 'Opt 3', 'Opt 4'],
            es: ['O1', 'O2', 'O3', 'O4'],
            ca: ['O1', 'O2', 'O3', 'O4'],
        },
        correctIndex: 0,
    },
    {
        id: 'q10',
        question: { en: 'Question 10?', es: 'Q10?', ca: 'Q10?' },
        options: {
            en: ['Opt 1', 'Opt 2', 'Opt 3', 'Opt 4'],
            es: ['O1', 'O2', 'O3', 'O4'],
            ca: ['O1', 'O2', 'O3', 'O4'],
        },
        correctIndex: 1,
    },
];

describe('<CourseTest />', () => {
    const mockOnPass = vi.fn();

    it('renders start screen initially', () => {
        render(
            <CourseTest
                questions={mockQuestions}
                onPass={mockOnPass}
            />
        );
        expect(screen.getByText('final_test')).toBeDefined();
        expect(screen.getByText('start_course')).toBeDefined();
    });

    it('starts quiz on start button click', () => {
        render(
            <CourseTest
                questions={mockQuestions}
                onPass={mockOnPass}
            />
        );
        fireEvent.click(screen.getByText('start_course'));
        expect(screen.queryByText('start_course')).toBeNull();
        expect(screen.getByText(/Question \d of 10/)).toBeDefined();
    });

    it('calculates fail score correctly (< 80%)', () => {
        render(
            <CourseTest
                questions={mockQuestions}
                onPass={mockOnPass}
            />
        );
        fireEvent.click(screen.getByText('start_course'));

        // Answer incorrectly (correct for q1 is index 0, we select index 1)
        for (let i = 0; i < 10; i++) {
            fireEvent.click(screen.getByText('Opt 2')); // Opt 2 is index 1
            fireEvent.click(screen.getByText(i === 9 ? 'Finish' : 'Next'));
        }

        // 80% passing requires 8/10. Answering 'Opt 2' consistently results in:
        // q1: index 1 (incorrect, correct: 0)
        // q2: index 1 (correct, correct: 1)
        // q3: index 1 (incorrect, correct: 2)
        // q4: index 1 (incorrect, correct: 3)
        // q5: index 1 (incorrect, correct: 0)
        // q6: index 1 (correct, correct: 1)
        // q7: index 1 (incorrect, correct: 2)
        // q8: index 1 (incorrect, correct: 3)
        // q9: index 1 (incorrect, correct: 0)
        // q10: index 1 (correct, correct: 1)
        // Total score = 3/10 (Fail)
        expect(screen.getByText('Test Failed')).toBeDefined();
        expect(screen.getByText('fail_message')).toBeDefined();
        expect(screen.getByText('3 / 10')).toBeDefined();
        expect(screen.getByText('retry_test')).toBeDefined();
        expect(mockOnPass).not.toHaveBeenCalled();
    });

    it('calculates pass score correctly (>= 80%) and triggers onPass', () => {
        render(
            <CourseTest
                questions={mockQuestions}
                onPass={mockOnPass}
            />
        );
        fireEvent.click(screen.getByText('start_course'));

        // Retrieve current questions from DOM to answer them correctly
        for (let i = 0; i < 10; i++) {
            const questionText = screen.getByRole('heading', {
                level: 3,
            }).textContent;
            // Match the question to retrieve the correct option index
            const qObj = mockQuestions.find(
                (q) => q.question.en === questionText
            );
            const correctOpt = qObj?.options.en[qObj.correctIndex] || '';

            fireEvent.click(screen.getByText(correctOpt));
            fireEvent.click(screen.getByText(i === 9 ? 'Finish' : 'Next'));
        }

        expect(screen.getByText('Test Passed!')).toBeDefined();
        expect(screen.getByText('pass_message')).toBeDefined();
        expect(screen.getByText('10 / 10')).toBeDefined();
        expect(mockOnPass).toHaveBeenCalledTimes(1);
    });
});
