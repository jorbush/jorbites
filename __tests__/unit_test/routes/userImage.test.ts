import { PATCH as UserImagePATCH } from '@/app/api/userImage/[userId]/route';
import getCurrentUser from '@/app/actions/getCurrentUser';
import prisma from '@/app/lib/prismadb';
import { deleteFromCloudinary, isCloudinaryUrl } from '@/app/utils/cloudinary';

jest.mock('@/app/actions/getCurrentUser', () => ({
    __esModule: true,
    default: jest.fn(),
}));

jest.mock('@/app/lib/prismadb', () => ({
    __esModule: true,
    default: {
        user: {
            update: jest.fn(),
        },
    },
}));

jest.mock('@/app/utils/cloudinary', () => ({
    deleteFromCloudinary: jest.fn(),
    isCloudinaryUrl: jest.fn(),
}));

describe('PATCH /api/userImage/[userId]', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('should return 401 when user is not authenticated', async () => {
        jest.mocked(getCurrentUser).mockResolvedValue(null);

        const request = new Request('http://localhost/api/userImage/u1', {
            method: 'PATCH',
            body: JSON.stringify({ userImage: 'http://example.com/new.jpg' }),
        });

        const response = await UserImagePATCH(request);
        const data = await response.json();

        expect(response.status).toBe(401);
        expect(data.error).toBe(
            'User authentication required to update profile image'
        );
    });

    it('should return 400 when userImage is missing or invalid', async () => {
        jest.mocked(getCurrentUser).mockResolvedValue({ id: 'u1' } as any);

        const request = new Request('http://localhost/api/userImage/u1', {
            method: 'PATCH',
            body: JSON.stringify({}),
        });

        const response = await UserImagePATCH(request);
        const data = await response.json();

        expect(response.status).toBe(400);
        expect(data.error).toBe('Valid user image URL is required');
    });

    it('should update image, delete old Cloudinary image, and return updated user', async () => {
        const mockCurrentUser = {
            id: 'u1',
            image: 'https://res.cloudinary.com/demo/image/upload/v123/old.jpg',
        };
        jest.mocked(getCurrentUser).mockResolvedValue(mockCurrentUser as any);
        jest.mocked(isCloudinaryUrl).mockReturnValue(true);
        jest.mocked(deleteFromCloudinary).mockResolvedValue(true);
        jest.mocked(prisma.user.update).mockResolvedValue({
            id: 'u1',
            image: 'https://res.cloudinary.com/demo/image/upload/v124/new.jpg',
        } as any);

        const request = new Request('http://localhost/api/userImage/u1', {
            method: 'PATCH',
            body: JSON.stringify({
                userImage:
                    'https://res.cloudinary.com/demo/image/upload/v124/new.jpg',
            }),
        });

        const response = await UserImagePATCH(request);
        const data = await response.json();

        expect(response.status).toBe(200);
        expect(data).toEqual({
            id: 'u1',
            image: 'https://res.cloudinary.com/demo/image/upload/v124/new.jpg',
        });
        expect(deleteFromCloudinary).toHaveBeenCalledWith(
            mockCurrentUser.image
        );
        expect(prisma.user.update).toHaveBeenCalledWith({
            where: { id: 'u1' },
            data: {
                image: 'https://res.cloudinary.com/demo/image/upload/v124/new.jpg',
            },
            select: { id: true, image: true },
        });
    });

    it('should return 500 when database update fails', async () => {
        jest.mocked(getCurrentUser).mockResolvedValue({ id: 'u1' } as any);
        jest.mocked(prisma.user.update).mockRejectedValue(
            new Error('Update failed')
        );

        const request = new Request('http://localhost/api/userImage/u1', {
            method: 'PATCH',
            body: JSON.stringify({ userImage: 'http://example.com/new.jpg' }),
        });

        const response = await UserImagePATCH(request);
        const data = await response.json();

        expect(response.status).toBe(500);
        expect(data.error).toBe('Failed to update user image');
    });
});
