import { describe, it, expect, vi } from 'vitest';
import fs from 'fs';
import * as policyUtils from '@/app/utils/policy-utils';

vi.mock('fs');

describe('policy-utils', () => {
    describe('readPolicyFile', () => {
        it('should read and parse a policy file', () => {
            const mockContent = `---
title: Test Policy
description: A test policy
---
Hello world
`;
            vi.spyOn(fs, 'readFileSync').mockReturnValue(mockContent);

            const result = policyUtils.readPolicyFile('test.md');
            expect(result.frontmatter.title).toBe('Test Policy');
            expect(result.frontmatter.description).toBe('A test policy');
            expect(result.content.trim()).toBe('Hello world');
        });

        it('should handle errors gracefully', () => {
            vi.spyOn(fs, 'readFileSync').mockImplementation(() => {
                throw new Error('File not found');
            });

            const result = policyUtils.readPolicyFile('non-existent.md');
            expect(result.frontmatter.title).toBe('Error');
            expect(result.content).toBe('Error loading policy content.');
        });
    });

    describe('getPolicyBySlug', () => {
        it('should get a policy by slug and language', async () => {
            const mockContent = `---
title: Test Policy
description: A test policy
---
Hello world
`;
            vi.spyOn(fs, 'existsSync').mockReturnValue(true);
            vi.spyOn(fs, 'readFileSync').mockReturnValue(mockContent);

            const result = await policyUtils.getPolicyBySlug(
                'test-policy',
                'en'
            );
            expect(result?.slug).toBe('test-policy');
            expect(result?.language).toBe('en');
            expect(result?.frontmatter.title).toBe('Test Policy');
        });

        it('should return null if the file does not exist', async () => {
            vi.spyOn(fs, 'existsSync').mockReturnValue(false);
            const result = await policyUtils.getPolicyBySlug(
                'non-existent',
                'en'
            );
            expect(result).toBeNull();
        });
    });
});
