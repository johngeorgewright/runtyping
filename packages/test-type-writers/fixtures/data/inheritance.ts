import { TestData } from '../../src/types'
import * as T from '../source/inheritance'

export const C: TestData<T.C> = {
  success: [{ foo: 'bar', bar: 'foo' }],
  failure: ['foo', 1, true, null, undefined, [], {}],
}

export const D: TestData<T.D> = {
  success: [{ foo: 1, bar: 2, car: 'foo', moo: 'bar' }],
  failure: ['foo', 1, true, null, undefined, [], {}],
}

export const E: TestData<T.E> = {
  success: [{ imported: true }],
  failure: ['foo', 1, true, null, undefined, [], { imported: false }],
}
