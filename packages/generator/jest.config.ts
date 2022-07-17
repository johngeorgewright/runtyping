import { InitialOptionsTsJest } from 'ts-jest'

const config: InitialOptionsTsJest = {
  preset: 'ts-jest',
  testPathIgnorePatterns: ['test-typewriter/.+\\.test\\.ts'],
  testEnvironment: 'node',
  globals: {
    'ts-jest': {
      tsconfig: 'tsconfig.test.json',
    },
  },
}

export default config
