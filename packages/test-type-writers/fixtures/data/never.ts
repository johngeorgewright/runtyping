import { TestData } from '../../src/types'
import * as T from '../source/never'

export const A: TestData<T.A> = {
  success: [],
  failure: [1, 'one', true],
}

export const B: TestData<T.B> = {
  success: [{}],
  failure: [{ foo: 'bar' }],
}

export const C: TestData<T.C> = {
  success: [[]],
  failure: [[1]],
}
