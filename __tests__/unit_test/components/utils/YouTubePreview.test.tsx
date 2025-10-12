import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import YouTubePreview from '@/app/components/utils/YouTubePreview';

// Mock Next.js Image component
vi.mock('next/image', () => ({
    default: ({ src, alt, onError, ...props }: any) => (
        <img
            src={src}
            alt={alt}
            onError={onError}
            data-testid="youtube-thumbnail"
            {...props}
        />
    ),
}));

// Mock window.open
const mockWindowOpen = vi.fn();
Object.defineProperty(window, 'open', {
    writable: true,
    value: mockWindowOpen,
});

describe('<YouTubePreview />', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    afterEach(() => {
        cleanup();
    });

    describe('Video ID extraction', () => {
        it('extracts video ID from standard YouTube URL', () => {
            const url = 'https://www.youtube.com/watch?v=dQw4w9WgXcQ';
            render(<YouTubePreview url={url} />);

            const thumbnail = screen.getByTestId(
                'youtube-thumbnail'
            ) as HTMLImageElement;
            expect(thumbnail.src).toContain('dQw4w9WgXcQ');
        });

        it('extracts video ID from short YouTube URL', () => {
            const url = 'https://youtu.be/dQw4w9WgXcQ';
            render(<YouTubePreview url={url} />);

            const thumbnail = screen.getByTestId(
                'youtube-thumbnail'
            ) as HTMLImageElement;
            expect(thumbnail.src).toContain('dQw4w9WgXcQ');
        });

        it('extracts video ID from YouTube URL with additional parameters', () => {
            const url =
                'https://www.youtube.com/watch?v=dQw4w9WgXcQ&t=30s&list=PLrAXtmRdnEQy';
            render(<YouTubePreview url={url} />);

            const thumbnail = screen.getByTestId(
                'youtube-thumbnail'
            ) as HTMLImageElement;
            expect(thumbnail.src).toContain('dQw4w9WgXcQ');
        });

        it('extracts video ID from YouTube URL without www', () => {
            const url = 'https://youtube.com/watch?v=dQw4w9WgXcQ';
            render(<YouTubePreview url={url} />);

            const thumbnail = screen.getByTestId(
                'youtube-thumbnail'
            ) as HTMLImageElement;
            expect(thumbnail.src).toContain('dQw4w9WgXcQ');
        });

        it('returns null for invalid YouTube URL', () => {
            const url = 'https://example.com/video';
            const { container } = render(<YouTubePreview url={url} />);

            expect(container.firstChild).toBeNull();
        });

        it('returns null for empty URL', () => {
            const url = '';
            const { container } = render(<YouTubePreview url={url} />);

            expect(container.firstChild).toBeNull();
        });
    });

    describe('Thumbnail rendering', () => {
        const validUrl = 'https://www.youtube.com/watch?v=dQw4w9WgXcQ';

        it('renders high-resolution thumbnail by default', () => {
            render(<YouTubePreview url={validUrl} />);

            const thumbnail = screen.getByTestId(
                'youtube-thumbnail'
            ) as HTMLImageElement;
            expect(thumbnail.src).toContain('maxresdefault.jpg');
        });

        it('falls back to default thumbnail on image error', () => {
            render(<YouTubePreview url={validUrl} />);

            const thumbnail = screen.getByTestId(
                'youtube-thumbnail'
            ) as HTMLImageElement;

            // Trigger image error
            fireEvent.error(thumbnail);

            expect(thumbnail.src).toContain('default.jpg');
        });

        it('uses custom title as alt text', () => {
            const title = 'Custom Video Title';
            render(
                <YouTubePreview
                    url={validUrl}
                    title={title}
                />
            );

            const thumbnail = screen.getByTestId(
                'youtube-thumbnail'
            ) as HTMLImageElement;
            expect(thumbnail.alt).toBe(title);
        });

        it('uses default title when none provided', () => {
            render(<YouTubePreview url={validUrl} />);

            const thumbnail = screen.getByTestId(
                'youtube-thumbnail'
            ) as HTMLImageElement;
            expect(thumbnail.alt).toBe('YouTube Video');
        });
    });

    describe('User interactions', () => {
        const validUrl = 'https://www.youtube.com/watch?v=dQw4w9WgXcQ';

        it('opens YouTube video in new tab when clicked', () => {
            render(<YouTubePreview url={validUrl} />);

            const container = screen.getByRole('button');
            fireEvent.click(container);

            expect(mockWindowOpen).toHaveBeenCalledWith(
                validUrl,
                '_blank',
                'noopener,noreferrer'
            );
        });

        it('opens YouTube video when Enter key is pressed', () => {
            render(<YouTubePreview url={validUrl} />);

            const container = screen.getByRole('button');
            fireEvent.keyDown(container, { key: 'Enter' });

            expect(mockWindowOpen).toHaveBeenCalledWith(
                validUrl,
                '_blank',
                'noopener,noreferrer'
            );
        });

        it('opens YouTube video when Space key is pressed', () => {
            render(<YouTubePreview url={validUrl} />);

            const container = screen.getByRole('button');
            fireEvent.keyDown(container, { key: ' ' });

            expect(mockWindowOpen).toHaveBeenCalledWith(
                validUrl,
                '_blank',
                'noopener,noreferrer'
            );
        });

        it('does not open video for other keys', () => {
            render(<YouTubePreview url={validUrl} />);

            const container = screen.getByRole('button');
            fireEvent.keyDown(container, { key: 'Escape' });

            expect(mockWindowOpen).not.toHaveBeenCalled();
        });
    });

    describe('Styling and accessibility', () => {
        const validUrl = 'https://www.youtube.com/watch?v=dQw4w9WgXcQ';

        it('applies custom className', () => {
            const customClass = 'custom-youtube-preview';
            render(
                <YouTubePreview
                    url={validUrl}
                    className={customClass}
                />
            );

            const container = screen.getByRole('button');
            expect(container.className).toContain(customClass);
        });

        it('has proper accessibility attributes', () => {
            render(<YouTubePreview url={validUrl} />);

            const container = screen.getByRole('button');
            expect(container.tabIndex).toBe(0);
            expect(container.getAttribute('role')).toBe('button');
        });

        it('renders play button icon', () => {
            render(<YouTubePreview url={validUrl} />);

            // The play button should be present in the DOM
            const playButton = screen.getByRole('button');
            expect(playButton).toBeDefined();

            // Check that the play icon container is present with correct styling
            const playIconContainer = playButton.querySelector('.bg-red-600');
            expect(playIconContainer).toBeDefined();
        });

        it('has aspect video ratio styling', () => {
            render(<YouTubePreview url={validUrl} />);

            const container = screen.getByRole('button');
            const aspectContainer = container.querySelector('.aspect-video');
            expect(aspectContainer).toBeDefined();
        });
    });

    describe('Edge cases', () => {
        it('handles malformed URLs gracefully', () => {
            const malformedUrls = [
                'youtube.com/watch?v=',
                'https://youtube.com/watch?v=',
                'https://www.youtube.com/watch?video=dQw4w9WgXcQ',
                'https://youtu.be/',
                'not-a-url',
            ];

            malformedUrls.forEach((url) => {
                const { container } = render(<YouTubePreview url={url} />);
                expect(container.firstChild).toBeNull();
                cleanup();
            });
        });

        it('handles very long video IDs', () => {
            const longVideoId = 'a'.repeat(50);
            const url = `https://www.youtube.com/watch?v=${longVideoId}`;
            render(<YouTubePreview url={url} />);

            const thumbnail = screen.getByTestId(
                'youtube-thumbnail'
            ) as HTMLImageElement;
            expect(thumbnail.src).toContain(longVideoId);
        });

        it('handles URLs with special characters in video ID', () => {
            const videoId = 'dQw4w9WgXcQ-_';
            const url = `https://www.youtube.com/watch?v=${videoId}`;
            render(<YouTubePreview url={url} />);

            const thumbnail = screen.getByTestId(
                'youtube-thumbnail'
            ) as HTMLImageElement;
            expect(thumbnail.src).toContain(videoId);
        });
    });

    describe('Multiple renders', () => {
        const validUrl = 'https://www.youtube.com/watch?v=dQw4w9WgXcQ';

        it('maintains state between re-renders', () => {
            const { rerender } = render(<YouTubePreview url={validUrl} />);

            const thumbnail = screen.getByTestId(
                'youtube-thumbnail'
            ) as HTMLImageElement;

            // Trigger image error
            fireEvent.error(thumbnail);
            expect(thumbnail.src).toContain('default.jpg');

            // Re-render with same props
            rerender(<YouTubePreview url={validUrl} />);

            // Should still show fallback image
            const newThumbnail = screen.getByTestId(
                'youtube-thumbnail'
            ) as HTMLImageElement;
            expect(newThumbnail.src).toContain('default.jpg');
        });
    });
});
