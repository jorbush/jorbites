import {
    render,
    screen,
    fireEvent,
    cleanup,
} from '@testing-library/react';
import {
    describe,
    it,
    expect,
    vi,
    afterEach,
} from 'vitest';
import Avatar from '../app/components/Avatar.tsx';
import React from 'react';

describe('<Avatar/>', () => {
    afterEach(() => {
        cleanup();
    });

    it('should render with default size and placeholder image when src is null', () => {
        render(<Avatar src={null} />);

        const img = screen.getByAltText('Avatar');
        expect(img).toBeDefined();
        expect(img).toHaveProperty(
            'src',
            'http://localhost:3000/_next/image?url=%2Fimages%2Fplaceholder.jpg&w=64&q=75'
        );
        expect(img).toHaveProperty('width', 30);
        expect(img).toHaveProperty('height', 30);
    });

    it('should render with provided src and size', () => {
        const src = 'https://example.com/avatar.jpg';
        const size = 50;
        render(
            <Avatar
                src={src}
                size={size}
            />
        );

        const img = screen.getByAltText('Avatar');
        expect(img).toBeDefined();
        expect(img).toHaveProperty(
            'src',
            'http://localhost:3000/_next/image?url=https%3A%2F%2Fexample.com%2Favatar.jpg&w=128&q=75'
        );
        expect(img).toHaveProperty('width', size);
        expect(img).toHaveProperty('height', size);
    });

    it('should call onClick handler when clicked', () => {
        const handleClick = vi.fn();
        render(
            <Avatar
                src="https://example.com/avatar.jpg"
                onClick={handleClick}
            />
        );

        const img = screen.getByAltText('Avatar');
        fireEvent.click(img);
        expect(handleClick).toHaveBeenCalledTimes(1);
    });

    it('should not have cursor-pointer class when onClick is not provided', () => {
        render(
            <Avatar src="https://example.com/avatar.jpg" />
        );
        expect(
            screen.getByAltText('Avatar')
        ).not.toHaveProperty('cursor-pointer');
    });

    it('should have cursor-pointer class when onClick is provided', () => {
        render(
            <Avatar
                src="https://example.com/avatar.jpg"
                onClick={() => {}}
            />
        );
        expect(
            screen.getByAltText('Avatar').className
        ).include('cursor-pointer');
    });
});
