import { expect, test } from 'vitest'
import {
  find,
  getRelativeImportPath,
  last,
  resolveVirtualPath,
  setHas,
} from '../src/util'
import * as path from 'path'
import { fileURLToPath } from 'url'
import { dirname } from 'path'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

test('last', () => {
  expect(last([1, 2, 3, 4])).toBe(4)
})

test('find', () => {
  expect(find([1, 2, 3, 4, 5], (x) => (x === 4 ? x * 2 : false))).toBe(8)
})

test('getRelativeImportPath', () => {
  expect(
    getRelativeImportPath(__dirname, path.resolve('../src/runtypes.ts')),
  ).toBe('../src/runtypes')
  expect(
    getRelativeImportPath(__dirname, path.resolve('../src/runtypes.mts')),
  ).toBe('../src/runtypes.mts')
  expect(getRelativeImportPath(__dirname, 'runtypes')).toBe('runtypes')
  expect(getRelativeImportPath('./test.ts', './test/recursive.ts')).toBe(
    './test/recursive.ts',
  )
  expect(
    getRelativeImportPath(
      './test.ts',
      '../../.yarn/cache/ts-morph-npm-15.1.0-604b2a3760-95e0262142.zip/node_modules/ts-morph/lib/ts-morph.d.ts',
    ),
  ).toBe('ts-morph/lib/ts-morph')
  expect(
    getRelativeImportPath(
      './test.ts',
      '../../.yarn/cache/ts-morph-npm-15.1.0-604b2a3760-95e0262142.zip/node_modules/@types/ts-morph__common/lib/ts-morph.d.ts',
    ),
  ).toBe('ts-morph/common/lib/ts-morph')
  expect(
    getRelativeImportPath(
      'C:/Users/jonah/WebstormProjects/test/test.runtyping.ts',
      'C:/Users/jonah/WebstormProjects/test/test.ts',
    ),
  ).toBe('./test')
})

test('resolveVirtualPath', () => {
  expect(
    resolveVirtualPath(
      '/project/.yarn/__virtual__/@runtyping-test-type-writers-virtual-f1a80c3a62/1/packages/test-type-writers/fixtures/source/variadicTuples.ts',
    ),
  ).toBe(
    '/project/packages/test-type-writers/fixtures/source/variadicTuples.ts',
  )
  expect(
    resolveVirtualPath(
      '/project/foo/bar/__virtual__/pkg-virtual-abc123/2/some/file.ts',
    ),
  ).toBe('/project/some/file.ts')
  expect(resolveVirtualPath('/project/src/file.ts')).toBe(
    '/project/src/file.ts',
  )
})

test('getRelativeImportPath resolves __virtual__ to package specifier', () => {
  const projectRoot = path.resolve(__dirname, '../../..')
  expect(
    getRelativeImportPath(
      path.join(projectRoot, 'packages/yup/fixtures/variadicTuples.ts'),
      path.join(
        projectRoot,
        '.yarn/__virtual__/@runtyping-test-type-writers-virtual-f1a80c3a62/1/packages/test-type-writers/fixtures/source/variadicTuples.ts',
      ),
    ),
  ).toBe('@runtyping/test-type-writers/fixtures/source/variadicTuples')
})

test('setHas', () => {
  const set = new Set([{ mung: 'face' }])
  expect(setHas(set, ({ mung }) => mung === 'face')).toBe(true)
  expect(setHas(set, ({ mung }) => mung === 'mung')).toBe(false)
})
