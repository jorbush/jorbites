import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import Tabs, { Tab } from '@/app/components/utils/Tabs';
import { FiUser, FiSettings } from 'react-icons/fi';

describe('<Tabs />', () => {
    const mockOnTabChange = vi.fn();

    const defaultTabs: Tab[] = [
        {
            id: 'tab1',
            label: 'Tab 1',
        },
        {
            id: 'tab2',
            label: 'Tab 2',
        },
        {
            id: 'tab3',
            label: 'Tab 3',
            icon: <FiUser data-testid="tab3-icon" />,
        },
    ];

    const defaultProps = {
        tabs: defaultTabs,
        activeTab: 'tab1',
        onTabChange: mockOnTabChange,
    };

    beforeEach(() => {
        vi.clearAllMocks();
    });

    afterEach(() => {
        cleanup();
    });

    it('renders all tabs correctly', () => {
        render(<Tabs {...defaultProps} />);

        expect(screen.getByText('Tab 1')).toBeDefined();
        expect(screen.getByText('Tab 2')).toBeDefined();
        expect(screen.getByText('Tab 3')).toBeDefined();
    });

    it('renders tabs with correct test ids', () => {
        render(
            <Tabs
                {...defaultProps}
                data-testid="test-tabs"
            />
        );

        expect(screen.getByTestId('test-tabs')).toBeDefined();
        expect(screen.getByTestId('tab-tab1')).toBeDefined();
        expect(screen.getByTestId('tab-tab2')).toBeDefined();
        expect(screen.getByTestId('tab-tab3')).toBeDefined();
    });

    it('applies active styling to the active tab', () => {
        render(<Tabs {...defaultProps} />);

        const activeTab = screen.getByTestId('tab-tab1');
        const inactiveTab = screen.getByTestId('tab-tab2');

        // Active tab should have green styling and font-medium
        expect(activeTab.className).toContain('border-green-450');
        expect(activeTab.className).toContain('text-green-450');
        expect(activeTab.className).toContain('border-b-2');
        expect(activeTab.className).toContain('font-medium');

        // Inactive tab should have gray styling and hover effects
        expect(inactiveTab.className).toContain('text-gray-500');
        expect(inactiveTab.className).toContain('hover:text-gray-700');
        expect(inactiveTab.className).toContain('dark:text-zinc-400');
        expect(inactiveTab.className).toContain('dark:hover:text-zinc-100');
    });

    it('changes active tab when different tab is clicked', () => {
        render(<Tabs {...defaultProps} />);

        const tab2 = screen.getByTestId('tab-tab2');
        fireEvent.click(tab2);

        expect(mockOnTabChange).toHaveBeenCalledWith('tab2');
        expect(mockOnTabChange).toHaveBeenCalledTimes(1);
    });

    it('renders tab icons when provided', () => {
        render(<Tabs {...defaultProps} />);

        // Tab 3 has an icon, tabs 1 and 2 don't
        expect(screen.getByTestId('tab3-icon')).toBeDefined();

        const tab1 = screen.getByTestId('tab-tab1');
        const tab2 = screen.getByTestId('tab-tab2');
        const tab3 = screen.getByTestId('tab-tab3');

        // Tab 3 should have both icon and text
        expect(tab3.querySelector('[data-testid="tab3-icon"]')).toBeTruthy();
        expect(screen.getByText('Tab 3')).toBeDefined();

        // Tabs 1 and 2 should only have text
        expect(tab1.querySelector('svg')).toBeFalsy();
        expect(tab2.querySelector('svg')).toBeFalsy();
    });

    it('applies custom className when provided', () => {
        const customClass = 'custom-test-class';
        render(
            <Tabs
                {...defaultProps}
                className={customClass}
            />
        );

        const tabsContainer = screen.getByTestId('tab-tab1').parentElement;
        expect(tabsContainer?.className).toContain(customClass);
    });

    it('handles empty tabs array gracefully', () => {
        render(
            <Tabs
                {...defaultProps}
                tabs={[]}
            />
        );

        // Should render the container but no tab buttons
        const tabsContainer = document.querySelector('.flex.border-b');
        expect(tabsContainer).toBeNull();
        expect(screen.queryByRole('button')).toBeNull();
    });

    it('handles single tab correctly', () => {
        const singleTab: Tab[] = [
            {
                id: 'only-tab',
                label: 'Only Tab',
                icon: <FiSettings data-testid="only-tab-icon" />,
            },
        ];

        render(
            <Tabs
                tabs={singleTab}
                activeTab="only-tab"
                onTabChange={mockOnTabChange}
            />
        );

        // Should not render anything when there's only one tab
        expect(screen.queryByText('Only Tab')).toBeNull();
        expect(screen.queryByTestId('only-tab-icon')).toBeNull();
        expect(screen.queryByRole('tablist')).toBeNull();
    });

    it('maintains flex-1 layout for all tabs regardless of content', () => {
        const mixedTabs: Tab[] = [
            { id: 'short', label: 'A' },
            { id: 'medium', label: 'Medium Length' },
            { id: 'long', label: 'Very Long Tab Label Here', icon: <FiUser /> },
        ];

        render(
            <Tabs
                tabs={mixedTabs}
                activeTab="short"
                onTabChange={mockOnTabChange}
            />
        );

        const shortTab = screen.getByTestId('tab-short');
        const mediumTab = screen.getByTestId('tab-medium');
        const longTab = screen.getByTestId('tab-long');

        // All tabs should have flex-1 class for equal width distribution
        expect(shortTab.className).toContain('flex-1');
        expect(mediumTab.className).toContain('flex-1');
        expect(longTab.className).toContain('flex-1');
    });

    it('supports dark mode styling', () => {
        render(<Tabs {...defaultProps} />);

        const inactiveTab = screen.getByTestId('tab-tab2');

        // Check that dark mode classes are present
        expect(inactiveTab.className).toContain('dark:text-zinc-400');
        expect(inactiveTab.className).toContain('dark:hover:text-zinc-100');

        // Check that the container has dark mode border class
        const container = inactiveTab.parentElement;
        expect(container?.className).toContain('dark:border-neutral-600');
    });

    it('calls onTabChange with correct tab id on click', () => {
        render(<Tabs {...defaultProps} />);

        // Click each tab and verify correct id is passed
        fireEvent.click(screen.getByTestId('tab-tab1'));
        expect(mockOnTabChange).toHaveBeenLastCalledWith('tab1');

        fireEvent.click(screen.getByTestId('tab-tab2'));
        expect(mockOnTabChange).toHaveBeenLastCalledWith('tab2');

        fireEvent.click(screen.getByTestId('tab-tab3'));
        expect(mockOnTabChange).toHaveBeenLastCalledWith('tab3');

        expect(mockOnTabChange).toHaveBeenCalledTimes(3);
    });

    it('handles tab change when clicking already active tab', () => {
        render(<Tabs {...defaultProps} />);

        const activeTab = screen.getByTestId('tab-tab1');
        fireEvent.click(activeTab);

        // Should still call onTabChange even for active tab
        expect(mockOnTabChange).toHaveBeenCalledWith('tab1');
        expect(mockOnTabChange).toHaveBeenCalledTimes(1);
    });
});
