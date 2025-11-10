import { cleanup, render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, afterEach } from 'vitest';
import CallToAction from '@/app/components/utils/CallToAction';

describe('<CallToAction />', () => {
    afterEach(() => {
        cleanup();
    });

    it('renders all props correctly', () => {
        const onClick = vi.fn();
        render(
            <CallToAction
                icon="🚀"
                title="Test Title"
                subtitle="Test Subtitle"
                buttonText="Test Button"
                onClick={onClick}
            />
        );

        expect(screen.getByText('🚀')).toBeInTheDocument();
        expect(screen.getByText('Test Title')).toBeInTheDocument();
        expect(screen.getByText('Test Subtitle')).toBeInTheDocument();
        expect(screen.getByText('Test Button')).toBeInTheDocument();
    });

    it('calls onClick when the button is clicked', () => {
        const onClick = vi.fn();
        render(
            <CallToAction
                title="Test Title"
                subtitle="Test Subtitle"
                buttonText="Test Button"
                onClick={onClick}
            />
        );

        const button = screen.getByText('Test Button');
        fireEvent.click(button);
        expect(onClick).toHaveBeenCalledTimes(1);
    });
});
