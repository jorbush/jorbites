import { describe, it, expect, vi } from 'vitest';
import { dynamicImport } from '@/app/utils/dynamicImport';
import React from 'react';

// Mock next/dynamic
vi.mock('next/dynamic', () => ({
    default: vi.fn((importFunc: any, options: any) => {
        // Return a mock component that captures the call
        const MockComponent = (props: any) => {
            return React.createElement('div', { 'data-testid': 'dynamic-component' }, 'Dynamic Component');
        };
        // Attach metadata to verify options were passed correctly
        (MockComponent as any)._dynamicOptions = options;
        (MockComponent as any)._importFunc = importFunc;
        return MockComponent;
    }),
}));

describe('dynamicImport', () => {
    it('should call next/dynamic with the correct import function', () => {
        const mockImportFunc = vi.fn(() => 
            Promise.resolve({ default: () => <div>Test Component</div> })
        );
        
        const Component = dynamicImport(mockImportFunc);
        
        // Verify the import function was passed through
        expect((Component as any)._importFunc).toBe(mockImportFunc);
    });

    it('should disable SSR by default', () => {
        const mockImportFunc = () => 
            Promise.resolve({ default: () => <div>Test Component</div> });
        
        const Component = dynamicImport(mockImportFunc);
        
        // Verify SSR is disabled
        expect((Component as any)._dynamicOptions.ssr).toBe(false);
    });

    it('should have a loading component', () => {
        const mockImportFunc = () => 
            Promise.resolve({ default: () => <div>Test Component</div> });
        
        const Component = dynamicImport(mockImportFunc);
        
        // Verify loading component exists
        expect((Component as any)._dynamicOptions.loading).toBeDefined();
        expect(typeof (Component as any)._dynamicOptions.loading).toBe('function');
    });

    it('should return null from loading component', () => {
        const mockImportFunc = () => 
            Promise.resolve({ default: () => <div>Test Component</div> });
        
        const Component = dynamicImport(mockImportFunc);
        
        // Verify loading component returns null
        const loadingComponent = (Component as any)._dynamicOptions.loading();
        expect(loadingComponent).toBeNull();
    });

    it('should allow custom options to override defaults', () => {
        const mockImportFunc = () => 
            Promise.resolve({ default: () => <div>Test Component</div> });
        
        const customLoading = () => <div>Loading...</div>;
        const Component = dynamicImport(mockImportFunc, { 
            ssr: true, 
            loading: customLoading 
        });
        
        // Verify custom options override defaults
        expect((Component as any)._dynamicOptions.ssr).toBe(true);
        expect((Component as any)._dynamicOptions.loading).toBe(customLoading);
    });

    it('should preserve other options when provided', () => {
        const mockImportFunc = () => 
            Promise.resolve({ default: () => <div>Test Component</div> });
        
        const Component = dynamicImport(mockImportFunc, { 
            ssr: false,
            suspense: true
        } as any);
        
        // Verify options are preserved
        expect((Component as any)._dynamicOptions.ssr).toBe(false);
        expect((Component as any)._dynamicOptions.suspense).toBe(true);
    });

    it('should work with TypeScript generic types', () => {
        interface TestProps {
            title: string;
            count: number;
        }
        
        const mockImportFunc = () => 
            Promise.resolve({ 
                default: ({ title, count }: TestProps) => (
                    <div>{title}: {count}</div>
                ) 
            });
        
        // This should type-check correctly
        const Component = dynamicImport<TestProps>(mockImportFunc);
        
        // Component should exist
        expect(Component).toBeDefined();
    });

    it('should handle import functions that return components with different export patterns', () => {
        // Test with default export pattern
        const mockImportFunc1 = () => 
            Promise.resolve({ default: () => <div>Default Export</div> });
        
        const Component1 = dynamicImport(mockImportFunc1);
        expect((Component1 as any)._importFunc).toBe(mockImportFunc1);

        // Test with transformed export pattern (like SpeedInsights in layout.tsx)
        const mockImportFunc2 = () => 
            Promise.resolve({ SpeedInsights: () => <div>Named Export</div> })
                .then((mod: any) => ({ default: mod.SpeedInsights }));
        
        const Component2 = dynamicImport(mockImportFunc2);
        expect((Component2 as any)._importFunc).toBe(mockImportFunc2);
    });

    it('should be a wrapper around next/dynamic', async () => {
        const next_dynamic = await import('next/dynamic');
        const mockImportFunc = () => 
            Promise.resolve({ default: () => <div>Test</div> });
        
        dynamicImport(mockImportFunc);
        
        // Verify next/dynamic was called
        expect(next_dynamic.default).toHaveBeenCalled();
    });
});
