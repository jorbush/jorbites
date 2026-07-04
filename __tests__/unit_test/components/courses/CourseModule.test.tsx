import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import { describe, it, expect, vi, afterEach } from 'vitest';
import CourseModule from '@/app/components/courses/CourseModule';
import { FiBookOpen } from 'react-icons/fi';

afterEach(() => {
    cleanup();
});

describe('<CourseModule />', () => {
    const mockOnToggle = vi.fn();

    it('renders title and children when open', () => {
        render(
            <CourseModule
                title="Requirements module"
                isOpen={true}
                onToggle={mockOnToggle}
                isCompleted={false}
                icon={FiBookOpen}
            >
                <div>Module content detail</div>
            </CourseModule>
        );

        expect(screen.getByText('Requirements module')).toBeDefined();
        expect(screen.getByText('Module content detail')).toBeDefined();
    });

    it('does not render children when closed', () => {
        render(
            <CourseModule
                title="Requirements module"
                isOpen={false}
                onToggle={mockOnToggle}
                isCompleted={false}
                icon={FiBookOpen}
            >
                <div>Module content detail</div>
            </CourseModule>
        );

        expect(screen.getByText('Requirements module')).toBeDefined();
        expect(screen.queryByText('Module content detail')).toBeNull();
    });

    it('displays completed status when isCompleted is true', () => {
        render(
            <CourseModule
                title="Requirements module"
                isOpen={false}
                onToggle={mockOnToggle}
                isCompleted={true}
                icon={FiBookOpen}
            >
                <div>Module content detail</div>
            </CourseModule>
        );

        expect(screen.getByText('Completed')).toBeDefined();
    });

    it('calls onToggle when header is clicked', () => {
        render(
            <CourseModule
                title="Requirements module"
                isOpen={false}
                onToggle={mockOnToggle}
                isCompleted={false}
                icon={FiBookOpen}
            >
                <div>Module content detail</div>
            </CourseModule>
        );

        fireEvent.click(screen.getByRole('button'));
        expect(mockOnToggle).toHaveBeenCalledTimes(1);
    });
});
