import type { JestConfigWithTsJest } from 'ts-jest';

const config: JestConfigWithTsJest = {
  preset: 'ts-jest/presets/default-esm', 
  globalSetup: '<rootDir>/test/setup.ts',
  testEnvironment: 'node',
  extensionsToTreatAsEsm: ['.ts'], 
  
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
  },
  testPathIgnorePatterns: ['/node_modules/', '/dist/'],
  
  transform: {
    '^.+\\.ts$': [
      'ts-jest',
      {
        useESM: true, 
        tsconfig: '<rootDir>/tsconfig.test.json', 
        diagnostics: {
          ignoreCodes: [5107] 
        }
      },
    ],
  },
};

export default config;