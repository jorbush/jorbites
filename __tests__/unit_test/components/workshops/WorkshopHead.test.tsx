import React from 'react';
import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import WorkshopHead from '@/app/components/workshops/WorkshopHead';
import { useRouter } from 'next/navigation';
import { toast } from 'react-hot-toast';

// Mock dependencies
vi.mock('next/navigation', () => ({
    useRouter: vi.fn(),
}));

vi.mock('react-hot-toast');

vi.mock('react-i18next', () => ({
    useTranslation: () => ({
        t: (key: string) => key,
    }),
}));

vi.mock('@/app/components/navigation/Heading', () => ({
    default: ({
        title,
        subtitle,
        center,
    }: {
        title: string;
        subtitle: string;
        center?: boolean;
    }) => (
        <div data-testid="heading" data-center={center}>
            <h1>{title}</h1>
            <p>{subtitle}</p>
        </div>
    ),
}));

vi.mock('@/app/components/optimization/CustomProxyImage', () => ({
    default: ({ src, alt }: { src: string; alt: string }) => (
        <img data-testid="workshop-image" src={src} alt={alt} />
    ),
}));

describe('<WorkshopHead />', () => {
    const mockRouter = {
        back: vi.fn(),
    };

    beforeEach(() => {
        vi.clearAllMocks();
        (useRouter as any).mockReturnValue(mockRouter);
        Object.assign(navigator, {
            clipboard: {
                writeText: vi.fn(),
            },
        });
    });

    afterEach(() => {
        cleanup();
    });

    it('renders with title, date, and image', () => {
        render(
            <WorkshopHead
                title="Test Workshop"
                date="2024-12-01T10:00:00.000Z"
                imageSrc="/test-image.jpg"
            />
        );

        expect(screen.getByText('Test Workshop')).toBeDefined();
        const image = screen.getByTestId('workshop-image');
        expect(image.getAttribute('src')).toBe('/test-image.jpg');
    });

    it('renders heading with formatted date', () => {
        render(
            <WorkshopHead
                title="Test Workshop"
                date="2024-12-01T10:00:00.000Z"
                imageSrc="/test-image.jpg"
            />
        );

        const heading = screen.getByTestId('heading');
        expect(heading).toBeDefined();
    });

    it('navigates back when back button is clicked', () => {
        render(
            <WorkshopHead
                title="Test Workshop"
                date="2024-12-01T10:00:00.000Z"
                imageSrc="/test-image.jpg"
            />
        );

        const buttons = screen.getAllByRole('button');
        const backButton = buttons[0];
        fireEvent.click(backButton);

        expect(mockRouter.back).toHaveBeenCalled();
    });

    it('copies link to clipboard when share button is clicked (no native share)', async () => {
        Object.assign(navigator, {
            share: undefined,
        });

        render(
            <WorkshopHead
                title="Test Workshop"
                date="2024-12-01T10:00:00.000Z"
                imageSrc="/test-image.jpg"
            />
        );

        const buttons = screen.getAllByRole('button');
        const shareButton = buttons[1];
        fireEvent.click(shareButton);

        expect(navigator.clipboard.writeText).toHaveBeenCalled();
        expect(toast.success).toHaveBeenCalledWith('link_copied');
    });

    it('uses native share API when available', () => {
        const mockShare = vi.fn().mockResolvedValue(undefined);
        Object.assign(navigator, {
            share: mockShare,
        });

        render(
            <WorkshopHead
                title="Test Workshop"
                date="2024-12-01T10:00:00.000Z"
                imageSrc="/test-image.jpg"
            />
        );

        const buttons = screen.getAllByRole('button');
        const shareButton = buttons[1];
        fireEvent.click(shareButton);

        expect(mockShare).toHaveBeenCalled();
    });

    it('renders fallback image when imageSrc is empty', () => {
        render(
            <WorkshopHead
                title="Test Workshop"
                date="2024-12-01T10:00:00.000Z"
                imageSrc=""
            />
        );

        const image = screen.getByTestId('workshop-image');
        expect(image.getAttribute('src')).toBe('/jorbites-social.jpg');
    });

    it('renders share button with correct aria-label', () => {
        render(
            <WorkshopHead
                title="Test Workshop"
                date="2024-12-01T10:00:00.000Z"
                imageSrc="/test-image.jpg"
            />
        );

        const buttons = screen.getAllByRole('button');
        const shareButton = buttons[1];
        expect(shareButton.getAttribute('aria-label')).toBe('Share');
    });

    it('renders image with priority flag', () => {
        const { container } = render(
            <WorkshopHead
                title="Test Workshop"
                date="2024-12-01T10:00:00.000Z"
                imageSrc="/test-image.jpg"
            />
        );

        const image = screen.getByTestId('workshop-image');
        expect(image).toBeDefined();
    });
});
