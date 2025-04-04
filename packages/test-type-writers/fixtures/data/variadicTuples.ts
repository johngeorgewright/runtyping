import { TestData } from '../../src/types'
import * as T from '../source/variadicTuples'

export const A: TestData<T.A> = {
  success: [['foo'], ['foo', 'bar'], ['foo', 'bar', 'baz']],
  failure: [[], [1, 'foo']],
}

export const B: TestData<T.B> = {
  success: [
    ['one', 1],
    ['one', 1, 2],
    ['one', 1, 2, 3],
  ],
  failure: [[], [1, 'foo'], [1, 'foo', 2, 3]],
}

export const C: TestData<T.C> = {
  success: [
    ['foo', 1],
    ['foo', 'bar', 1],
  ],
  failure: [[], [1, 'foo'], [1, 'foo', 2, 3]],
}

export const D: TestData<T.D> = {
  success: [
    ['foo', 'bar', 'baz'],
    ['foo', 'bar', 'baz', 'qux'],
  ],
  failure: [[], [1, 'foo'], [1, 'foo', 2, 3]],
}

export const E: TestData<T.E> = {
  success: [
    ['foo', 1, true, 2, false],
    ['foo', 1, true, 'a', 'b', 'c', 'd', 'e', 'f', 10, false],
  ],
  failure: [
    [],
    [1, 'foo'],
    [1, 'foo', 2, 3],
    ['foo', 1, true, 'a', 'b', 4, 'd', 'e', 'f', 10, false],
  ],
}
