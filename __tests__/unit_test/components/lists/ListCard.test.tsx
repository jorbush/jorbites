import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import React from 'react';
import { ListCard } from '@/app/components/lists/ListCard';

vi.mock('@/app/components/utils/Avatar', () => ({
    default: () => <div data-testid="avatar" />,
}));

vi.mock('@/app/utils/date-utils', () => ({
    formatDate: (date: any, lang: string) => `formatted-date-${lang}`,
}));

describe('ListCard', () => {
    const mockList = {
        id: 'list-123',
        name: 'My Special List',
        userId: 'user-1',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        isPrivate: false,
        isDefault: false,
        recipeIds: ['recipe-1', 'recipe-2'],
        recipes: [
            {
                id: 'recipe-1',
                title: 'Recipe 1',
                imageSrc: 'img1.png',
            },
            {
                id: 'recipe-2',
                title: 'Recipe 2',
                imageSrc: 'img2.png',
            },
        ],
        user: {
            id: 'user-1',
            name: 'John Doe',
            image: 'john.png',
        },
    } as any;

    const t = (key: string) => key;
    const push = vi.fn();
    const onDeleteClick = vi.fn();

    beforeEach(() => {
        vi.clearAllMocks();
    });

    afterEach(() => {
        cleanup();
    });

    it('renders basic info and preview recipes correctly', () => {
        render(
            <ListCard
                list={mockList}
                showDelete={false}
                onDeleteClick={onDeleteClick}
                push={push}
                t={t}
                language="en"
            />
        );

        expect(screen.getByText('My Special List')).toBeDefined();
        expect(screen.getByText('public')).toBeDefined();
        expect(screen.getByText('2 recipes')).toBeDefined();
        expect(screen.getByText('John Doe')).toBeDefined();
        expect(screen.getByAltText('Recipe 1')).toBeDefined();
        expect(screen.getByAltText('Recipe 2')).toBeDefined();
    });

    it('renders fallback when list has no preview recipes', () => {
        const emptyList = {
            ...mockList,
            recipes: [],
            recipeIds: [],
        };

        render(
            <ListCard
                list={emptyList}
                showDelete={false}
                onDeleteClick={onDeleteClick}
                push={push}
                t={t}
                language="en"
            />
        );

        expect(screen.getByText('no_recipes_yet')).toBeDefined();
        expect(screen.queryByAltText('Recipe 1')).toBeNull();
    });

    it('handles redirect to list details on title click', () => {
        render(
            <ListCard
                list={mockList}
                showDelete={false}
                onDeleteClick={onDeleteClick}
                push={push}
                t={t}
                language="en"
            />
        );

        fireEvent.click(screen.getByText('My Special List'));
        expect(push).toHaveBeenCalledWith('/lists/list-123');
    });

    it('applies updated link styling and hover effect on title link', () => {
        render(
            <ListCard
                list={mockList}
                showDelete={false}
                onDeleteClick={onDeleteClick}
                push={push}
                t={t}
                language="en"
            />
        );

        const titleLink = screen.getByText('My Special List');
        expect(titleLink.className).not.toContain('hover:text-green-450');
        expect(titleLink.className).not.toContain('group-hover:text-green-450');
        expect(titleLink.className).toContain('hover:underline');
        expect(titleLink.className).toContain('group-hover:underline');
        expect(titleLink.className).toContain('decoration-green-450');
        expect(titleLink.className).toContain('decoration-2');
        expect(titleLink.className).toContain('underline-offset-4');
    });

    it('calls onDeleteClick when delete button is clicked', () => {
        render(
            <ListCard
                list={mockList}
                showDelete={true}
                onDeleteClick={onDeleteClick}
                push={push}
                t={t}
                language="en"
            />
        );

        const deleteBtn = screen.getByTitle('delete_list');
        fireEvent.click(deleteBtn);
        expect(onDeleteClick).toHaveBeenCalledWith('list-123');
    });

    it('navigates to author profile when clicking on author', () => {
        render(
            <ListCard
                list={mockList}
                showDelete={false}
                onDeleteClick={onDeleteClick}
                push={push}
                t={t}
                language="en"
            />
        );

        fireEvent.click(screen.getByText('John Doe'));
        expect(push).toHaveBeenCalledWith('/profile/user-1');
    });

    it('renders default list title when isDefault is true', () => {
        const defaultList = {
            ...mockList,
            isDefault: true,
            isPrivate: true,
        };

        render(
            <ListCard
                list={defaultList}
                showDelete={false}
                onDeleteClick={onDeleteClick}
                push={push}
                t={t}
                language="en"
            />
        );

        expect(screen.getByText('to_cook_later')).toBeDefined();
        expect(screen.getByText('private')).toBeDefined();
    });

    it('renders date when list has no author', () => {
        const listWithoutAuthor = {
            ...mockList,
            user: null,
        };

        render(
            <ListCard
                list={listWithoutAuthor}
                showDelete={false}
                onDeleteClick={onDeleteClick}
                push={push}
                t={t}
                language="en"
            />
        );

        expect(screen.getByText('formatted-date-en')).toBeDefined();
    });
});
