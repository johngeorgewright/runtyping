import { InitialOptionsTsJest } from 'ts-jest'

const config: InitialOptionsTsJest = {
  globals: {
    'ts-jest': {
      tsconfig: 'tsconfig.test.json',
    },
  },
  preset: 'ts-jest',
  rootDir: '../',
  setupFiles: ['./runtypes/jest/globals.ts'],
  snapshotResolver: './runtypes/jest/snapshotResolver.ts',
  testEnvironment: 'node',
}

export default config
