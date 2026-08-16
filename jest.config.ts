import type { Config } from 'jest'
import nextJest from 'next/jest.js'
import { pathsToModuleNameMapper } from 'ts-jest';
import { compilerOptions } from './tsconfig.json';

const createJestConfig = nextJest({
  // Provide the path to your Next.js app to load next.config.js and .env files in your test environment
  dir: './',
})

// Add any custom config to be passed to Jest
const config: Config = {
  coverageProvider: 'v8',
  testEnvironment: 'node',
  collectCoverageFrom: [
    'app/api/**/*.ts',
    'app/actions/**/*.ts',
    '!**/node_modules/**',
    '!**/*.d.ts',
  ],
  // Add more setup options before each test is run
  setupFilesAfterEnv: ['<rootDir>/jest.setup.ts'],
  moduleNameMapper: pathsToModuleNameMapper(compilerOptions.paths, { prefix: '<rootDir>/' }),
  testMatch: [
    '<rootDir>/__tests__/unit_test/routes/**/*.test.ts',
    '<rootDir>/__tests__/unit_test/actions/**/*.test.ts',
    '<rootDir>/__tests__/unit_test/api/**/*.test.ts',
    '<rootDir>/__tests__/unit_test/lib/**/*.test.ts',
  ],
  testPathIgnorePatterns: [
    '<rootDir>/.next/',
    '<rootDir>/node_modules/',
    '<rootDir>/__tests__/e2e/',
    '<rootDir>/__tests__/unit_test/components/',
    '<rootDir>/__tests__/unit_test/pages/',
    '<rootDir>/__tests__/unit_test/utils/',
    '<rootDir>/__tests__/unit_test/hooks/',
  ],
}

// createJestConfig is exported this way to ensure that next/jest can load the Next.js config which is async
export default createJestConfig(config)
