

export default {
  preset: 'ts-jest',
  testEnvironment: 'node',
  transform: {
    '^.+\\.tsx?$': [
      'ts-jest',
      {
        useESM: true,
      },
    ],
  },
  globals: { 'ts-jest': { diagnostics: false } },
  extensionsToTreatAsEsm: ['.ts', '.tsx'],
};