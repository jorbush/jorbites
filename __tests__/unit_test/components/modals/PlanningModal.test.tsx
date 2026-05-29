import { describe, it, expect, vi, afterEach } from 'vitest';
import {
    render,
    screen,
    fireEvent,
    waitFor,
    cleanup,
} from '@testing-library/react';
import PlanningModal from '@/app/components/modals/PlanningModal';

describe('PlanningModal', () => {
    afterEach(() => {
        cleanup();
    });

    it('renders name, description and private switch when open', () => {
        render(
            <PlanningModal
                isOpen={true}
                onClose={vi.fn()}
                onSubmit={vi.fn()}
                title="Create Diet"
                actionLabel="Submit"
            />
        );

        expect(screen.getByText('Create Diet')).toBeDefined();
        expect(screen.getByLabelText('plan_name')).toBeDefined();
        expect(screen.getByLabelText('plan_description')).toBeDefined();
        expect(screen.getByText('private_list')).toBeDefined();
    });

    it('does not render when closed', () => {
        const { container } = render(
            <PlanningModal
                isOpen={false}
                onClose={vi.fn()}
                onSubmit={vi.fn()}
                title="Create Diet"
                actionLabel="Submit"
            />
        );

        expect(container.firstChild).toBeNull();
    });

    it('prepopulates fields with initialValues', () => {
        const initialValues = {
            name: 'Keto Diet',
            description: 'Low carb planning description',
            isPrivate: false,
        };

        render(
            <PlanningModal
                isOpen={true}
                onClose={vi.fn()}
                onSubmit={vi.fn()}
                title="Edit Diet"
                actionLabel="Update"
                initialValues={initialValues}
            />
        );

        const nameInput = screen.getByLabelText(
            'plan_name'
        ) as HTMLInputElement;
        const descInput = screen.getByLabelText(
            'plan_description'
        ) as HTMLTextAreaElement;

        expect(nameInput.value).toBe('Keto Diet');
        expect(descInput.value).toBe('Low carb planning description');
        expect(screen.getByText('plan_is_public')).toBeDefined();
    });

    it('submits form with user inputs', async () => {
        const mockSubmit = vi.fn();
        render(
            <PlanningModal
                isOpen={true}
                onClose={vi.fn()}
                onSubmit={mockSubmit}
                title="Create Diet"
                actionLabel="Submit"
            />
        );

        const nameInput = screen.getByLabelText('plan_name');
        const descInput = screen.getByLabelText('plan_description');

        fireEvent.change(nameInput, { target: { value: 'Bulk diet' } });
        fireEvent.change(descInput, {
            target: { value: 'High calorie planning' },
        });

        const submitButton = screen.getByTestId('modal-action-button');
        fireEvent.click(submitButton);

        await waitFor(() => {
            expect(mockSubmit).toHaveBeenCalledWith({
                name: 'Bulk diet',
                description: 'High calorie planning',
                isPrivate: true,
            });
        });
    });
});
