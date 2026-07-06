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

    it('applies active styling to the active tab', () => {
        render(
            <TabNavigation
                tabs={mockTabs}
                activeTab="tab1"
                onTabChange={vi.fn()}
            />
        );

        const firstTab = screen.getByText('First Tab');
        const secondTab = screen.getByText('Second Tab');

        // Verify active class names are applied to tab1
        expect(firstTab.className).toContain('border-neutral-900');
        expect(firstTab.className).toContain('text-neutral-900');

        // Verify inactive class names are applied to tab2
        expect(secondTab.className).toContain('border-transparent');
        expect(secondTab.className).toContain('text-neutral-400');
    });
});
