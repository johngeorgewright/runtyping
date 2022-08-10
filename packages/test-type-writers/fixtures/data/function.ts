import { TestData } from '../../src/types'
import * as T from '../source/function'

export const A: TestData<T.A> = {
  success: [() => {}],
  failure: ['foo', null, { a: 1, b: 2 }],
}
