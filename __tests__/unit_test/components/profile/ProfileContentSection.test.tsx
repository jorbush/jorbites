import { render, screen, waitFor } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import React from 'react';
import ProfileContentSection from '@/app/components/profile/ProfileContentSection';
import { SafeRecipe } from '@/app/types';
import { Blog } from '@/app/utils/markdownUtils';

vi.mock('next/navigation', () => ({
    useRouter: vi.fn(() => ({
        push: vi.fn(),
        query: {},
    })),
    useSearchParams: vi.fn(() => new URLSearchParams()),
    usePathname: vi.fn(() => '/profile/user1'),
}));

vi.mock('@/app/profile/[userId]/ProfileClient', () => ({
    default: ({
        recipes,
        blogs,
        profileUserId,
    }: {
        recipes: any[];
        blogs: any[];
        profileUserId: string;
    }) => (
        <div data-testid="profile-client">
            ProfileClient for {profileUserId}: {recipes.length} recipes,{' '}
            {blogs.length} blogs
        </div>
    ),
}));

const mockRecipe: SafeRecipe = {
    id: 'recipe-1',
    title: 'Test Recipe',
    userId: 'user-1',
    createdAt: new Date().toISOString(),
    imageSrc: 'http://image.png',
    categories: [],
    description: 'Test Description',
    method: 'Test Method',
    minutes: 30,
    numLikes: 0,
    ingredients: ['Ingredient 1'],
    steps: ['Step 1'],
    extraImages: [],
    coCooksIds: [],
    linkedRecipeIds: [],
    youtubeUrl: '',
    questId: null,
};

const mockBlog: Blog = {
    slug: 'test-blog',
    title: 'Test Blog',
    description: 'Blog Description',
    date: '2026-01-01',
    readTime: '3 min',
    image: '/blog.png',
    category: 'Cooking',
    content: 'Blog content',
    tags: [],
    author: {
        id: 'user-1',
        name: 'User 1',
        image: '/user.png',
    },
};

describe('ProfileContentSection', () => {
    it('renders empty state when both recipes and blogs are empty', async () => {
        render(
            <ProfileContentSection
                userId="user-1"
                recipes={[]}
                pinnedRecipes={[]}
                totalPages={0}
                currentPage={1}
                totalRecipes={0}
                searchParams={{}}
                blogs={[]}
            />
        );

        await waitFor(() => {
            expect(screen.getByText('No recipes found')).toBeDefined();
            expect(
                screen.getByText(
                    'Looks like this user has not created recipes.'
                )
            ).toBeDefined();
        });
    });

    it('renders ProfileClient when recipes are present', async () => {
        render(
            <ProfileContentSection
                userId="user-1"
                recipes={[mockRecipe]}
                pinnedRecipes={[]}
                totalPages={1}
                currentPage={1}
                totalRecipes={1}
                searchParams={{}}
                blogs={[]}
            />
        );

        await waitFor(() => {
            expect(screen.getByTestId('profile-client')).toBeDefined();
            expect(
                screen.getByText('ProfileClient for user-1: 1 recipes, 0 blogs')
            ).toBeDefined();
        });
    });

    it('renders ProfileClient when blogs are present with no recipes', async () => {
        render(
            <ProfileContentSection
                userId="user-1"
                recipes={[]}
                pinnedRecipes={[]}
                totalPages={0}
                currentPage={1}
                totalRecipes={0}
                searchParams={{}}
                blogs={[mockBlog]}
            />
        );

        await waitFor(() => {
            expect(screen.getByTestId('profile-client')).toBeDefined();
            expect(
                screen.getByText('ProfileClient for user-1: 0 recipes, 1 blogs')
            ).toBeDefined();
        });
    });
});
