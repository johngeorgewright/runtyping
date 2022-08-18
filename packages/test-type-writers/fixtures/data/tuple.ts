import { TestData } from '../../src/types'
import * as T from '../source/tuple'

export const A: TestData<T.A> = {
  success: [[1, 'foo', 1]],
  failure: [
    [1, 'foo', 'foo'],
    [1, 1, 1],
    [1, 'foo'],
    [1, 'foo', 1, 1],
  ],
}

export const B: TestData<T.B> = {
  success: [
    [
      [1, 'foo', 1],
      [2, 'bar', 2],
    ],
  ],
  failure: [
    [
      [1, 'foo', 1],
      [2, 'bar', 2],
      [1, 'foo', 1],
    ],
  ],
}

export const C: TestData<T.C> = {
  success: [[]],
  failure: [[1]],
}
