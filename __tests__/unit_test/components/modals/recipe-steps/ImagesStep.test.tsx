import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import ImagesStep from '@/app/components/modals/recipe-steps/ImagesStep';

// Mock react-i18next
vi.mock('react-i18next', () => ({
    useTranslation: vi.fn(() => ({
        t: (key: string) => key, // Return the key itself instead of the translated string
    })),
}));

// Mock Heading component
vi.mock('@/app/components/navigation/Heading', () => ({
    default: ({ title, subtitle }: { title: string; subtitle?: string }) => (
        <div data-testid="heading">
            <h2>{title}</h2>
            {subtitle && <p>{subtitle}</p>}
        </div>
    ),
}));

// Mock ImageUpload component
vi.mock('@/app/components/inputs/ImageUpload', () => ({
    default: ({
        value,
        onChange,
        disabled,
        canRemove,
        text,
        ...props
    }: any) => (
        <div
            data-testid={props['data-testid']}
            data-disabled={disabled}
            data-can-remove={canRemove}
            data-value={value}
        >
            <div>{text}</div>
            <button
                onClick={() => onChange('new-image-url')}
                disabled={disabled}
                data-testid={`${props['data-testid']}-upload-button`}
            >
                Upload Image
            </button>
            {value && (
                <div data-testid={`${props['data-testid']}-current-image`}>
                    Current: {value}
                </div>
            )}
        </div>
    ),
}));

describe('<ImagesStep />', () => {
    const mockProps = {
        imageSrc: '',
        imageSrc1: '',
        imageSrc2: '',
        imageSrc3: '',
        onImageChange: vi.fn(),
    };

    beforeEach(() => {
        vi.clearAllMocks();
    });

    afterEach(() => {
        cleanup();
    });

    it('renders correctly with default props', () => {
        render(<ImagesStep {...mockProps} />);

        expect(screen.getByTestId('heading')).toBeDefined();
        expect(screen.getByText('images')).toBeDefined();
    });

    it('renders subtitle in heading when available', () => {
        render(<ImagesStep {...mockProps} />);

        expect(screen.getByText('images_subtitle')).toBeDefined();
    });

    it('renders all four image upload components', () => {
        render(<ImagesStep {...mockProps} />);

        expect(screen.getByTestId('image-upload')).toBeDefined();
        expect(screen.getByTestId('image-upload-2')).toBeDefined();
        expect(screen.getByTestId('image-upload-3')).toBeDefined();
        expect(screen.getByTestId('image-upload-4')).toBeDefined();
    });

    it('renders image upload labels correctly', () => {
        render(<ImagesStep {...mockProps} />);

        expect(screen.getByText('finished_recipe')).toBeDefined();
        expect(screen.getByText('first_steps')).toBeDefined();
        expect(screen.getByText('next_steps')).toBeDefined();
        expect(screen.getByText('final_steps')).toBeDefined();
    });

    it('first image upload is always enabled', () => {
        render(<ImagesStep {...mockProps} />);

        const firstUpload = screen.getByTestId('image-upload');
        // First upload doesn't have disabled prop, so data-disabled should be null or not present
        expect(firstUpload.getAttribute('data-disabled')).toBeNull();
    });

    it('second image upload is disabled when first is empty', () => {
        render(<ImagesStep {...mockProps} />);

        const secondUpload = screen.getByTestId('image-upload-2');
        expect(secondUpload.getAttribute('data-disabled')).toBe('true');
    });

    it('second image upload is enabled when first has value', () => {
        const propsWithFirstImage = {
            ...mockProps,
            imageSrc: 'first-image.jpg',
        };

        render(<ImagesStep {...propsWithFirstImage} />);

        const secondUpload = screen.getByTestId('image-upload-2');
        expect(secondUpload.getAttribute('data-disabled')).toBe('false');
    });

    it('third image upload is disabled when second is empty', () => {
        const propsWithFirstImage = {
            ...mockProps,
            imageSrc: 'first-image.jpg',
        };

        render(<ImagesStep {...propsWithFirstImage} />);

        const thirdUpload = screen.getByTestId('image-upload-3');
        expect(thirdUpload.getAttribute('data-disabled')).toBe('true');
    });

    it('third image upload is enabled when second has value', () => {
        const propsWithTwoImages = {
            ...mockProps,
            imageSrc: 'first-image.jpg',
            imageSrc1: 'second-image.jpg',
        };

        render(<ImagesStep {...propsWithTwoImages} />);

        const thirdUpload = screen.getByTestId('image-upload-3');
        expect(thirdUpload.getAttribute('data-disabled')).toBe('false');
    });

    it('fourth image upload is disabled when third is empty', () => {
        const propsWithTwoImages = {
            ...mockProps,
            imageSrc: 'first-image.jpg',
            imageSrc1: 'second-image.jpg',
        };

        render(<ImagesStep {...propsWithTwoImages} />);

        const fourthUpload = screen.getByTestId('image-upload-4');
        expect(fourthUpload.getAttribute('data-disabled')).toBe('true');
    });

    it('fourth image upload is enabled when third has value', () => {
        const propsWithThreeImages = {
            ...mockProps,
            imageSrc: 'first-image.jpg',
            imageSrc1: 'second-image.jpg',
            imageSrc2: 'third-image.jpg',
        };

        render(<ImagesStep {...propsWithThreeImages} />);

        const fourthUpload = screen.getByTestId('image-upload-4');
        expect(fourthUpload.getAttribute('data-disabled')).toBe('false');
    });

    it('calls onImageChange with correct field when first image is uploaded', () => {
        render(<ImagesStep {...mockProps} />);

        const uploadButton = screen.getByTestId('image-upload-upload-button');
        fireEvent.click(uploadButton);

        expect(mockProps.onImageChange).toHaveBeenCalledWith(
            'imageSrc',
            'new-image-url'
        );
    });

    it('calls onImageChange with correct field when second image is uploaded', () => {
        const propsWithFirstImage = {
            ...mockProps,
            imageSrc: 'first-image.jpg',
        };

        render(<ImagesStep {...propsWithFirstImage} />);

        const uploadButton = screen.getByTestId('image-upload-2-upload-button');
        fireEvent.click(uploadButton);

        expect(mockProps.onImageChange).toHaveBeenCalledWith(
            'imageSrc1',
            'new-image-url'
        );
    });

    it('calls onImageChange with correct field when third image is uploaded', () => {
        const propsWithTwoImages = {
            ...mockProps,
            imageSrc: 'first-image.jpg',
            imageSrc1: 'second-image.jpg',
        };

        render(<ImagesStep {...propsWithTwoImages} />);

        const uploadButton = screen.getByTestId('image-upload-3-upload-button');
        fireEvent.click(uploadButton);

        expect(mockProps.onImageChange).toHaveBeenCalledWith(
            'imageSrc2',
            'new-image-url'
        );
    });

    it('calls onImageChange with correct field when fourth image is uploaded', () => {
        const propsWithThreeImages = {
            ...mockProps,
            imageSrc: 'first-image.jpg',
            imageSrc1: 'second-image.jpg',
            imageSrc2: 'third-image.jpg',
        };

        render(<ImagesStep {...propsWithThreeImages} />);

        const uploadButton = screen.getByTestId('image-upload-4-upload-button');
        fireEvent.click(uploadButton);

        expect(mockProps.onImageChange).toHaveBeenCalledWith(
            'imageSrc3',
            'new-image-url'
        );
    });

    it('displays current image values correctly', () => {
        const propsWithImages = {
            ...mockProps,
            imageSrc: 'first-image.jpg',
            imageSrc1: 'second-image.jpg',
        };

        render(<ImagesStep {...propsWithImages} />);

        expect(
            screen.getByTestId('image-upload-current-image').textContent
        ).toBe('Current: first-image.jpg');
        expect(
            screen.getByTestId('image-upload-2-current-image').textContent
        ).toBe('Current: second-image.jpg');
    });

    it('sets canRemove prop correctly for sequential uploads', () => {
        const propsWithTwoImages = {
            ...mockProps,
            imageSrc: 'first-image.jpg',
            imageSrc1: 'second-image.jpg',
        };

        render(<ImagesStep {...propsWithTwoImages} />);

        // First image can't be removed while second image exists
        const firstUpload = screen.getByTestId('image-upload');
        expect(firstUpload.getAttribute('data-can-remove')).toBe('false');

        // Second image can be removed since third is empty
        const secondUpload = screen.getByTestId('image-upload-2');
        expect(secondUpload.getAttribute('data-can-remove')).toBe('true');
    });

    it('renders images in grid layout', () => {
        render(<ImagesStep {...mockProps} />);

        // Check that the grid container exists
        const gridContainer = screen.getByTestId('image-upload').parentElement;
        expect(gridContainer?.className).toContain('grid');
        expect(gridContainer?.className).toContain('grid-cols-2');
    });

    it('handles all images uploaded state correctly', () => {
        const propsWithAllImages = {
            ...mockProps,
            imageSrc: 'first-image.jpg',
            imageSrc1: 'second-image.jpg',
            imageSrc2: 'third-image.jpg',
            imageSrc3: 'fourth-image.jpg',
        };

        render(<ImagesStep {...propsWithAllImages} />);

        // All upload buttons should be available
        expect(screen.getByTestId('image-upload-upload-button')).toBeDefined();
        expect(
            screen.getByTestId('image-upload-2-upload-button')
        ).toBeDefined();
        expect(
            screen.getByTestId('image-upload-3-upload-button')
        ).toBeDefined();
        expect(
            screen.getByTestId('image-upload-4-upload-button')
        ).toBeDefined();

        // All images should be displayed
        expect(
            screen.getByTestId('image-upload-current-image').textContent
        ).toBe('Current: first-image.jpg');
        expect(
            screen.getByTestId('image-upload-2-current-image').textContent
        ).toBe('Current: second-image.jpg');
        expect(
            screen.getByTestId('image-upload-3-current-image').textContent
        ).toBe('Current: third-image.jpg');
        expect(
            screen.getByTestId('image-upload-4-current-image').textContent
        ).toBe('Current: fourth-image.jpg');
    });
});
