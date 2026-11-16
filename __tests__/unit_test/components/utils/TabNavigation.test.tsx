import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import { describe, it, expect, vi, afterEach } from 'vitest';
import TabNavigation, {
    NavigationTab,
} from '@/app/components/utils/TabNavigation';

const mockTabs: NavigationTab[] = [
    { id: 'tab1', label: 'First Tab' },
    { id: 'tab2', label: 'Second Tab' },
];

describe('TabNavigation', () => {
    afterEach(() => {
        cleanup();
    });

    it('renders all tab labels', () => {
        render(
            <TabNavigation
                tabs={mockTabs}
                activeTab="tab1"
                onTabChange={vi.fn()}
            />
        );

        expect(screen.getByText('First Tab')).toBeDefined();
        expect(screen.getByText('Second Tab')).toBeDefined();
    });

    it('calls onTabChange when tab button is clicked', () => {
        const onTabChangeMock = vi.fn();
        render(
            <TabNavigation
                tabs={mockTabs}
                activeTab="tab1"
                onTabChange={onTabChangeMock}
            />
        );

        const secondTab = screen.getByText('Second Tab');
        fireEvent.click(secondTab);

        expect(onTabChangeMock).toHaveBeenCalledWith('tab2');
    });

    it('applies active pill styling and aria-pressed to the active tab', () => {
        render(
            <TabNavigation
                tabs={mockTabs}
                activeTab="tab1"
                onTabChange={vi.fn()}
            />
        );

        const firstTab = screen.getByText('First Tab');
        const secondTab = screen.getByText('Second Tab');

        // Verify active pill class names and aria-pressed are applied to tab1
        expect(firstTab.className).toContain('bg-green-450');
        expect(firstTab.className).toContain('border-green-450/50');
        expect(firstTab.className).toContain('text-neutral-900');
        expect(firstTab.className).toContain('rounded-full');
        expect(firstTab.getAttribute('aria-pressed')).toBe('true');

        // Verify inactive pill class names and aria-pressed are applied to tab2
        expect(secondTab.className).toContain('bg-neutral-50/80');
        expect(secondTab.className).toContain('text-neutral-600');
        expect(secondTab.className).toContain('rounded-full');
        expect(secondTab.getAttribute('aria-pressed')).toBe('false');
    });
});
