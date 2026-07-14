/** @type {import('jest').Config} */
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: ['<rootDir>/tests'],
  transform: {
    '^.+\\.ts$': ['ts-jest', { tsconfig: 'tsconfig.jest.json' }],
  },
  setupFilesAfterEnv: ['<rootDir>/tests/setup.ts'],
  testTimeout: 20000,
  collectCoverageFrom: ['src/**/*.ts', '!src/server.ts', '!src/config/**'],
  coverageThreshold: {
    global: {
      lines: 20,
      statements: 20,
    },
  },
};