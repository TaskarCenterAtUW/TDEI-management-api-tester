import type { Config } from 'jest';

export default async (): Promise<Config> => {
    return {
        verbose: true,
        preset: 'ts-jest',
        testEnvironment: 'node',
        testTimeout: 15000,
        globalSetup: "./global-setup.ts",
        reporters: [
            "default",
            ["./node_modules/jest-html-reporter", {
                "pageTitle": "Test Report",
                "includeFailureMsg": true
            }]
        ],
        transform: {
            '^.+\\.(ts|tsx)?$': 'ts-jest'
        }
    }
}