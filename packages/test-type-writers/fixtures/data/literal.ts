import { TestData } from '../../src/types'
import * as T from '../source/literal'

export const A: TestData<T.A> = {
  success: ['foo'],
  failure: ['bar'],
}

export const B: TestData<T.B> = {
  success: [2],
  failure: [3],
}

export const C: TestData<T.C> = {
  success: [true],
  failure: [false],
}
