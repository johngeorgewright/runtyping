import { find, getRelativeImportPath, last } from '../src/util'
import * as path from 'path'

test('last', () => {
  expect(last([1, 2, 3, 4])).toBe(4)
})

test('find', () => {
  expect(find([1, 2, 3, 4, 5], (x) => (x === 4 ? x * 2 : false))).toBe(8)
})

test('getRelativeImportPath', () => {
  expect(
    getRelativeImportPath(__dirname, path.resolve('../src/runtypes.ts'))
  ).toBe('../src/runtypes')
  expect(
    getRelativeImportPath(__dirname, path.resolve('../src/runtypes.mts'))
  ).toBe('../src/runtypes.mts')
  expect(getRelativeImportPath(__dirname, 'runtypes')).toBe('runtypes')
})
