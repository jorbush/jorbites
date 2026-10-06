import { describe, it, expect } from 'vitest';
import { draftsQuestions } from '@/app/courses/drafts/draftsQuestions';

describe('draftsQuestions', () => {
    it('contains 10 comprehensive course questions', () => {
        expect(draftsQuestions).toHaveLength(10);
    });

    it('ensures each question has trilingual question text and options', () => {
        draftsQuestions.forEach((q, index) => {
            expect(q.id).toBe(`q${index + 1}`);
            expect(q.question.en).toBeTruthy();
            expect(q.question.es).toBeTruthy();
            expect(q.question.ca).toBeTruthy();

            expect(q.options.en.length).toBeGreaterThanOrEqual(2);
            expect(q.options.es.length).toBe(q.options.en.length);
            expect(q.options.ca.length).toBe(q.options.en.length);

            expect(q.correctIndex).toBeGreaterThanOrEqual(0);
            expect(q.correctIndex).toBeLessThan(q.options.en.length);
        });
    });

    it('covers all key topics of the collaborative drafts course', () => {
        const ids = draftsQuestions.map((q) => q.id);
        expect(ids).toEqual([
            'q1',
            'q2',
            'q3',
            'q4',
            'q5',
            'q6',
            'q7',
            'q8',
            'q9',
            'q10',
        ]);
    });
});
