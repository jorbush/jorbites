import {
    render,
    screen,
    fireEvent,
    waitFor,
    cleanup,
} from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import ChangeUserImageSelector from '@/app/components/settings/ChangeUserImage';
import axios from 'axios';
import { toast } from 'react-hot-toast';

// Mock the dependencies
vi.mock('next/navigation', () => ({
    useRouter: () => ({
        refresh: vi.fn(),
    }),
}));

vi.mock('react-i18next', () => ({
    useTranslation: () => ({ t: (key: string) => key }),
}));

vi.mock('axios');
vi.mock('react-hot-toast');

// Mock the CldUploadWidget
vi.mock('next-cloudinary', () => ({
    CldUploadWidget: ({
        onSuccess,
        children,
    }: {
        onSuccess: (result: any) => void;
        children: any;
    }) => {
        const handleClick = () => {
            onSuccess({
                info: {
                    secure_url: 'https://example.com/new-image.jpg',
                },
            });
        };
        return children({ open: handleClick });
    },
}));

describe('<ChangeUserImageSelector />', () => {
    const mockCurrentUser = {
        id: '1',
        name: 'John Doe',
        email: 'john@example.com',
        emailVerified: new Date().toISOString(),
        image: 'https://example.com/current-image.jpg',
        hashedPassword: 'hashedPassword',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        favoriteIds: [],
        emailNotifications: true,
        level: 1,
        verified: true,
    };

    const mockProps = {
        currentUser: mockCurrentUser,
        saveImage: false,
        setSaveImage: vi.fn(),
        onSave: vi.fn(),
    };

    beforeEach(() => {
        vi.clearAllMocks();
    });

    afterEach(() => {
        cleanup();
        vi.restoreAllMocks();
    });

    it('renders the component with current user image', () => {
        render(<ChangeUserImageSelector {...mockProps} />);
        const image = screen.getByAltText('Upload');
        expect(image).toHaveProperty(
            'src',
            'https://example.com/current-image.jpg'
        );
    });

    it('renders placeholder image when currentUser has no image', () => {
        const propsWithoutImage = {
            ...mockProps,
            currentUser: {
                ...mockCurrentUser,
                image: null,
            },
        };
        render(<ChangeUserImageSelector {...propsWithoutImage} />);
        const image = screen.getByAltText('Upload');
        expect(image).toHaveProperty(
            'src',
            'http://localhost:3000/images/placeholder.webp'
        );
    });

    it('handles image upload', async () => {
        render(<ChangeUserImageSelector {...mockProps} />);
        const uploadWidget = screen.getByAltText('Upload');

        fireEvent.click(uploadWidget);

        await waitFor(() => {
            const saveIcon = screen.getByTestId('save-icon');
            expect(saveIcon).toBeDefined();
        });
    });

    it('updates user profile when save button is clicked', async () => {
        (axios.put as any).mockResolvedValue({});

        render(<ChangeUserImageSelector {...mockProps} />);
        const uploadWidget = screen.getByAltText('Upload');

        fireEvent.click(uploadWidget);

        await waitFor(() => {
            const saveIcon = screen.getByTestId('save-icon');
            fireEvent.click(saveIcon);
        });

        await waitFor(() => {
            expect(axios.put).toHaveBeenCalledWith(
                `/api/userImage/${mockCurrentUser.id}`,
                {
                    userImage: 'https://example.com/new-image.jpg',
                }
            );
            expect(toast.success).toHaveBeenCalledWith('image_updated');
        });
    });

    it('handles API error when updating profile', async () => {
        (axios.put as any).mockRejectedValue(new Error('API Error'));

        render(<ChangeUserImageSelector {...mockProps} />);
        const uploadWidget = screen.getByAltText('Upload');

        fireEvent.click(uploadWidget);

        await waitFor(() => {
            const saveIcon = screen.getByTestId('save-icon');
            fireEvent.click(saveIcon);
        });

        await waitFor(() => {
            expect(toast.error).toHaveBeenCalledWith('something_went_wrong');
        });
    });
});
