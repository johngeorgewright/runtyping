import { TestData } from '../../src/types'
import * as T from '../source/null'

export const A: TestData<T.A> = {
  success: [null],
  failure: [1, 'foo', undefined],
}

export const B: TestData<T.B> = {
  success: [null, 'foo'],
  failure: [1, undefined],
}

export const C: TestData<T.C> = {
  success: [{ a: null, b: 'foo', c: 'mung' }],
  failure: [{ a: null, b: undefined, c: 'mung' }],
}
