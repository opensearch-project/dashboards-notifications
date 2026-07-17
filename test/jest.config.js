/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

module.exports = {
  rootDir: '../',
  setupFiles: ['<rootDir>/test/setupTests.ts'],
  setupFilesAfterEnv: ['jest-location-mock', '<rootDir>/test/setup.jest.ts'],
  roots: ['<rootDir>'],
  testMatch: ['**/*.test.js', '**/*.test.jsx', '**/*.test.ts', '**/*.test.tsx'],
  clearMocks: true,
  modulePathIgnorePatterns: ['<rootDir>/offline-module-cache/'],
  testEnvironment: 'jest-environment-jsdom',
  testPathIgnorePatterns: ['<rootDir>/build/', '<rootDir>/node_modules/'],
  snapshotSerializers: ['enzyme-to-json/serializer'],
  coveragePathIgnorePatterns: [
    '<rootDir>/build/',
    '<rootDir>/node_modules/',
    '<rootDir>/test/',
    '<rootDir>/public/services/',
  ],
  transformIgnorePatterns: ['<rootDir>/node_modules'],
  moduleNameMapper: {
    '\\.(css|less|sass|scss)$': '<rootDir>/test/mocks/styleMock.ts',
    '\\.(gif|ttf|eot|svg)$': '<rootDir>/test/mocks/fileMock.ts',
    '../../../src/core/server/utils': '<rootDir>/common/__tests__/mocks/workspaceStateMock.ts',
  },
  testEnvironmentOptions: {
    // Set the default URL so window.location.origin is 'http://localhost:5601' rather than
    // 'http://localhost', avoiding the need for tests to mock window.location.origin.
    url: 'http://localhost:5601',
  },
  // Retain Jest 28 snapshot defaults; Jest 29 flipped escapeString and printBasicPrototype to false,
  // which would invalidate existing snapshots. See https://jestjs.io/docs/upgrading-to-jest29
  snapshotFormat: {
    escapeString: true,
    printBasicPrototype: true,
  },
};
