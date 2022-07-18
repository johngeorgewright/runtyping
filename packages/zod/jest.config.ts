import { InitialOptionsTsJest } from 'ts-jest'

const config: InitialOptionsTsJest = {
  globals: {
    'ts-jest': {
      tsconfig: 'tsconfig.test.json',
    },
  },
  preset: 'ts-jest',
  testEnvironment: 'node',
  setupFiles: ['./zod/jest/globals.ts'],
  snapshotResolver: './zod/jest/snapshotResolver.ts',
  rootDir: '../',
}

export default config
