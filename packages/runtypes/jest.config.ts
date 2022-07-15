import { InitialOptionsTsJest } from 'ts-jest'

const config: InitialOptionsTsJest = {
  globals: {
    'ts-jest': {
      tsconfig: 'tsconfig.test.json',
    },
  },
  preset: 'ts-jest',
  testEnvironment: 'node',
  setupFiles: ['./runtypes/jest/globals.ts'],
  snapshotResolver: './runtypes/jest/snapshotResolver.ts',
  rootDir: '../',
}

export default config
