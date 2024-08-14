import type { Config } from 'jest';

export default async (): Promise<Config> => {
    return {
        verbose: false,
        preset: 'ts-jest',
        testEnvironment: 'node',
        testTimeout: 15000,
        globalSetup: "./global-setup.ts",
        reporters: [
            "default",
            ["jest-html-reporters", {
                "filename": "test-report.html",
                "urlForTestFiles": "https://github.com/TaskarCenterAtUW/TDEI-management-api-tester/tree/dev",
                "enableMergeData": true
            }]
        ],
        transform: {
            '^.+\\.(ts|tsx)?$': 'ts-jest'
        }
    }
}