import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { useAllCoursesProgress } from '@/app/hooks/useAllCoursesProgress';

describe('useAllCoursesProgress', () => {
    beforeEach(() => {
        vi.stubGlobal('localStorage', {
            getItem: vi.fn(),
            setItem: vi.fn(),
            clear: vi.fn(),
        });
    });

    it('should initialize with 0 when no data in localStorage', () => {
        (localStorage.getItem as any).mockReturnValue(null);
        const { result } = renderHook(() => useAllCoursesProgress());

        expect(result.current.progress.contest).toBe(0);
        expect(result.current.progress.basics).toBe(0);
        expect(result.current.progress.drafts).toBe(0);
    });

    it('should initialize with values from localStorage', () => {
        (localStorage.getItem as any).mockImplementation((key: string) => {
            if (key === 'jorbites_course_contest_manager_progress:v2')
                return '50';
            if (key === 'jorbites_course_basics_progress:v2') return '100';
            if (key === 'jorbites_course_drafts_progress:v2') return '75';
            return null;
        });

        const { result } = renderHook(() => useAllCoursesProgress());

        expect(result.current.progress.contest).toBe(50);
        expect(result.current.progress.basics).toBe(100);
        expect(result.current.progress.drafts).toBe(75);
        expect(result.current.progress.lists).toBe(0);
    });

    it('should refresh state when refresh is called', () => {
        (localStorage.getItem as any).mockReturnValueOnce('10'); // contest initial
        const { result } = renderHook(() => useAllCoursesProgress());
        expect(result.current.progress.contest).toBe(10);

        (localStorage.getItem as any).mockReturnValueOnce('20'); // contest refresh
        act(() => {
            result.current.refresh();
        });

        expect(result.current.progress.contest).toBe(20);
    });

    it('should set progress to 100 for courses present in initialCertificates', () => {
        (localStorage.getItem as any).mockReturnValue(null);
        const mockCerts = [
            {
                id: 'c1',
                certId: 'JRBT-2026-B1',
                userId: 'u1',
                courseId: 'jorbites-basics',
                courseTitle: 'Jorbites Basics',
                userName: 'Alice',
                issuedAt: '2026-01-01T00:00:00.000Z',
                createdAt: '2026-01-01T00:00:00.000Z',
                updatedAt: '2026-01-01T00:00:00.000Z',
            },
            {
                id: 'c2',
                certId: 'JRBT-2026-C1',
                userId: 'u1',
                courseId: 'contest-manager',
                courseTitle: 'Contest Manager',
                userName: 'Alice',
                issuedAt: '2026-01-01T00:00:00.000Z',
                createdAt: '2026-01-01T00:00:00.000Z',
                updatedAt: '2026-01-01T00:00:00.000Z',
            },
        ];

        const { result } = renderHook(() =>
            useAllCoursesProgress(mockCerts as any)
        );

        expect(result.current.progress.basics).toBe(100);
        expect(result.current.progress.contest).toBe(100);
        expect(result.current.progress.drafts).toBe(0);
    });

    it('should override local storage progress with 100 when certificate exists in database', () => {
        (localStorage.getItem as any).mockImplementation((key: string) => {
            if (key === 'jorbites_course_basics_progress:v2') return '40';
            return null;
        });

        const mockCerts = [
            {
                id: 'c1',
                certId: 'JRBT-2026-B1',
                userId: 'u1',
                courseId: 'jorbites-basics',
                courseTitle: 'Jorbites Basics',
                userName: 'Alice',
                issuedAt: '2026-01-01T00:00:00.000Z',
                createdAt: '2026-01-01T00:00:00.000Z',
                updatedAt: '2026-01-01T00:00:00.000Z',
            },
        ];

        const { result } = renderHook(() =>
            useAllCoursesProgress(mockCerts as any)
        );

        expect(result.current.progress.basics).toBe(100);
    });
});
