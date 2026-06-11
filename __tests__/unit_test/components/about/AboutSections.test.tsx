import React from 'react';
import { cleanup, render, screen } from '@testing-library/react';
import { describe, it, expect, vi, afterEach } from 'vitest';
import {
    WhatIsJorbitesSection,
    WhyJorbitesSection,
    FeaturesSection,
    ArchitectureSection,
    DocumentationSection,
    DeveloperSection,
    GetStartedSection,
} from '@/app/about/AboutSections';
import { SafeUser } from '@/app/types';

// Mock dependencies
vi.mock('next/image', () => ({
    default: ({ src, alt, width, height, className }: any) => (
        <img
            src={src}
            alt={alt}
            width={width}
            height={height}
            className={className}
            data-testid="next-image"
        />
    ),
}));

vi.mock('next/link', () => ({
    default: ({ href, className, children, target, rel }: any) => (
        <a
            href={href}
            className={className}
            data-testid="next-link"
            target={target}
            rel={rel}
        >
            {children}
        </a>
    ),
}));

vi.mock('react-icons/fa', () => ({
    FaGithub: () => <div data-testid="fa-github-icon" />,
    FaEnvelope: () => <div data-testid="fa-envelope-icon" />,
    FaHeart: () => <div data-testid="fa-heart-icon" />,
}));

vi.mock('react-icons/ri', () => ({
    RiGitRepositoryLine: () => <div data-testid="ri-repository-icon" />,
}));

const mockTranslations: Record<string, string> = {
    what_is_jorbites: 'What is Jorbites?',
    jorbites_description: 'Jorbites description content',
    jorbites_mission: 'Jorbites mission content',
    why_jorbites: 'Why Jorbites?',
    why_jorbites_description: 'Why Jorbites description content',
    why_jorbites_recipe: 'Why Jorbites recipe',
    features: 'Features',
    share_recipes: 'Share Recipes',
    share_recipes_description: 'Share recipes description',
    discover_recipes: 'Discover Recipes',
    discover_recipes_description: 'Discover recipes description',
    level_system: 'Level System',
    level_system_description: 'Level system description',
    community: 'Community',
    community_description: 'Community description',
    architecture: 'Architecture',
    architecture_description: 'Architecture description',
    core_platform: 'Core Platform',
    core_platform_nextjs: 'Next.js',
    core_platform_mongodb: 'MongoDB',
    core_platform_nextauth: 'NextAuth',
    core_platform_cloudinary: 'Cloudinary',
    core_platform_redis: 'Redis',
    microservices: 'Microservices',
    microservices_notifier: 'Notifier',
    microservices_badge: 'Badge',
    microservices_pantry: 'Pantry',
    videogames: 'Videogames',
    videogames_paltin_dash: 'Paltin Dash',
    documentation: 'Documentation',
    doc_development_setup: 'Development Setup',
    doc_development_setup_desc: 'Development Setup desc',
    doc_architecture_details: 'Architecture Details',
    doc_architecture_details_desc: 'Architecture Details desc',
    doc_api_documentation: 'API Documentation',
    doc_api_documentation_desc: 'API Documentation desc',
    doc_image_optimization: 'Image Optimization',
    doc_image_optimization_desc: 'Image Optimization desc',
    the_project: 'The Project',
    developer_description: 'Developer description',
    github: 'GitHub',
    contact: 'Contact',
    repository: 'Repository',
    sponsor_on_github: 'Sponsor on GitHub',
    get_started: 'Get Started',
    get_started_description: 'Get started description',
    explore_recipes: 'Explore Recipes',
    sign_up: 'Sign Up',
};

const mockT = (key: string) => mockTranslations[key] || key;

describe('AboutSections', () => {
    afterEach(() => {
        cleanup();
    });

    describe('WhatIsJorbitesSection', () => {
        it('renders what is jorbites content', () => {
            render(<WhatIsJorbitesSection t={mockT} />);
            expect(screen.getByText('What is Jorbites?')).toBeDefined();
            expect(
                screen.getByText('Jorbites description content')
            ).toBeDefined();
            expect(screen.getByText('Jorbites mission content')).toBeDefined();
        });
    });

    describe('WhyJorbitesSection', () => {
        it('renders why jorbites content and recipe link', () => {
            render(<WhyJorbitesSection t={mockT} />);
            expect(screen.getByText('Why Jorbites?')).toBeDefined();
            expect(
                screen.getByText('Why Jorbites description content')
            ).toBeDefined();
            const link = screen.getByTestId('next-link');
            expect(link.getAttribute('href')).toBe(
                '/recipes/68b194a84e84cb9eabfb4350'
            );
        });
    });

    describe('FeaturesSection', () => {
        it('renders all feature items', () => {
            render(<FeaturesSection t={mockT} />);
            expect(screen.getByText('Features')).toBeDefined();
            expect(screen.getByText('Share Recipes')).toBeDefined();
            expect(screen.getByText('Discover Recipes')).toBeDefined();
            expect(screen.getByText('Level System')).toBeDefined();
            expect(screen.getByText('Community')).toBeDefined();
        });
    });

    describe('ArchitectureSection', () => {
        it('renders architecture tech stack and microservices links', () => {
            render(<ArchitectureSection t={mockT} />);
            expect(screen.getByText('Architecture')).toBeDefined();
            expect(screen.getByText('Core Platform')).toBeDefined();
            expect(screen.getByText('Microservices')).toBeDefined();
            expect(screen.getByText('Videogames')).toBeDefined();
        });
    });

    describe('DocumentationSection', () => {
        it('renders all doc links', () => {
            render(<DocumentationSection t={mockT} />);
            expect(screen.getByText('Documentation')).toBeDefined();
            expect(screen.getByText('Development Setup')).toBeDefined();
            expect(screen.getByText('Architecture Details')).toBeDefined();
        });
    });

    describe('DeveloperSection', () => {
        it('renders project developers profile and external links', () => {
            render(<DeveloperSection t={mockT} />);
            expect(screen.getByText('The Project')).toBeDefined();
            expect(screen.getByText('Developer description')).toBeDefined();
            expect(screen.getByTestId('fa-github-icon')).toBeDefined();
            expect(screen.getByTestId('fa-envelope-icon')).toBeDefined();
            expect(screen.getByTestId('ri-repository-icon')).toBeDefined();
        });
    });

    describe('GetStartedSection', () => {
        const mockUser: SafeUser = {
            id: '1',
            name: 'Test',
            email: 'test@test.com',
            image: null,
            hashedPassword: null,
            createdAt: '',
            updatedAt: '',
            favoriteIds: [],
            emailNotifications: true,
            level: 1,
            verified: false,
            badges: [],
            resetToken: null,
            resetTokenExpiry: null,
        };

        it('renders without sign up button if user logged in', () => {
            const mockRegisterOpen = vi.fn();
            render(
                <GetStartedSection
                    t={mockT}
                    currentUser={mockUser}
                    onRegisterOpen={mockRegisterOpen}
                />
            );
            expect(screen.getByText('Explore Recipes')).toBeDefined();
            expect(screen.queryByText('Sign Up')).toBeNull();
        });

        it('renders sign up button and triggers onRegisterOpen when clicked if no user', () => {
            const mockRegisterOpen = vi.fn();
            render(
                <GetStartedSection
                    t={mockT}
                    currentUser={null}
                    onRegisterOpen={mockRegisterOpen}
                />
            );
            const signUpButton = screen.getByText('Sign Up');
            expect(signUpButton).toBeDefined();
            signUpButton.click();
            expect(mockRegisterOpen).toHaveBeenCalledTimes(1);
        });
    });
});
