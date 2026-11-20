import { expect } from '@jest/globals';
import { POST as VerifyTestPOST } from '@/app/api/courses/verify-test/route';
import getCurrentUser from '@/app/actions/getCurrentUser';
import { authenticatedRatelimit } from '@/app/lib/ratelimit';
import { verifyCompletionToken } from '@/app/utils/certificateProof';
import { VALID_COURSE_IDS } from '@/app/utils/courseCatalog';
import { getCourseQuestions } from '@/app/utils/courseQuestions';

jest.mock('@/app/actions/getCurrentUser');

jest.mock('@/app/lib/axiom/server', () => ({
    logger: {
        info: jest.fn(),
        warn: jest.fn(),
        error: jest.fn(),
    },
}));

jest.mock('@/app/lib/ratelimit', () => ({
    authenticatedRatelimit: { limit: jest.fn() },
}));

describe('POST /api/courses/verify-test', () => {
    const mockUser = {
        id: 'user-123',
        name: 'Chef Tester',
        email: 'test@example.com',
    };

    beforeEach(() => {
        jest.clearAllMocks();
        delete process.env.ENV;
    });

    it('has server-side questions registered for every course in COURSE_CATALOG', () => {
        for (const courseId of VALID_COURSE_IDS) {
            const questions = getCourseQuestions(courseId);
            expect(questions).toBeDefined();
            expect(questions!.length).toBeGreaterThan(0);
        }
    });

    it('returns 401 when unauthenticated', async () => {
        jest.mocked(getCurrentUser).mockResolvedValueOnce(null);

        const req = new Request(
            'http://localhost:3000/api/courses/verify-test',
            {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    courseId: 'jorbites-basics',
                    answers: {},
                }),
            }
        );

        const res = await VerifyTestPOST(req);
        expect(res.status).toBe(401);
    });

    it('returns 429 when rate-limited in production', async () => {
        process.env.ENV = 'production';
        jest.mocked(getCurrentUser).mockResolvedValueOnce(mockUser as any);
        jest.mocked(authenticatedRatelimit.limit).mockResolvedValueOnce({
            success: false,
            reset: Date.now() + 5000,
        } as any);

        const req = new Request(
            'http://localhost:3000/api/courses/verify-test',
            {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    courseId: 'jorbites-basics',
                    answers: {},
                }),
            }
        );

        const res = await VerifyTestPOST(req);
        expect(res.status).toBe(429);
    });

    it('returns 400 for invalid courseId or non-object answers', async () => {
        jest.mocked(getCurrentUser).mockResolvedValueOnce(mockUser as any);
        const badCourseReq = new Request(
            'http://localhost:3000/api/courses/verify-test',
            {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    courseId: 'nonexistent-course',
                    answers: {},
                }),
            }
        );
        expect((await VerifyTestPOST(badCourseReq)).status).toBe(400);

        jest.mocked(getCurrentUser).mockResolvedValueOnce(mockUser as any);
        const badAnswersReq = new Request(
            'http://localhost:3000/api/courses/verify-test',
            {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    courseId: 'jorbites-basics',
                    answers: ['not', 'a', 'map'],
                }),
            }
        );
        expect((await VerifyTestPOST(badAnswersReq)).status).toBe(400);
    });

    it('returns passed: false and omits completionToken when score is below 80%', async () => {
        jest.mocked(getCurrentUser).mockResolvedValueOnce(mockUser as any);
        const questions = getCourseQuestions('jorbites-basics')!;
        const wrongAnswers = Object.fromEntries(
            questions.map((q) => [
                q.id,
                (q.correctIndex + 1) % q.options.en.length,
            ])
        );

        const req = new Request(
            'http://localhost:3000/api/courses/verify-test',
            {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    courseId: 'jorbites-basics',
                    answers: wrongAnswers,
                }),
            }
        );

        const res = await VerifyTestPOST(req);
        const data = await res.json();

        expect(res.status).toBe(200);
        expect(data.passed).toBe(false);
        expect(data.score).toBe(0);
        expect(data.completionToken).toBeUndefined();
    });

    it('returns a valid user- and course-bound completionToken when score >= 80%', async () => {
        jest.mocked(getCurrentUser).mockResolvedValueOnce(mockUser as any);
        const questions = getCourseQuestions('jorbites-basics')!;
        const correctAnswers = Object.fromEntries(
            questions.map((q) => [q.id, q.correctIndex])
        );

        const req = new Request(
            'http://localhost:3000/api/courses/verify-test',
            {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    courseId: 'jorbites-basics',
                    answers: correctAnswers,
                }),
            }
        );

        const res = await VerifyTestPOST(req);
        const data = await res.json();

        expect(res.status).toBe(200);
        expect(data.passed).toBe(true);
        expect(data.score).toBe(questions.length);
        expect(typeof data.completionToken).toBe('string');
        expect(
            verifyCompletionToken(
                data.completionToken,
                'user-123',
                'jorbites-basics'
            )
        ).toBe(true);
        expect(
            verifyCompletionToken(
                data.completionToken,
                'other-user',
                'jorbites-basics'
            )
        ).toBe(false);
        expect(
            verifyCompletionToken(data.completionToken, 'user-123', 'drafts')
        ).toBe(false);
    });
});
