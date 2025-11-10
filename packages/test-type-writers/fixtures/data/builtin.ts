import { TestData } from '../../src/types'
import * as T from '../source/builtin'

export const A: TestData<T.A> = {
  success: [{ a: new ReferenceError(':)') }],
  failure: [
    { a: [1, 2, 3] },
    { b: new RangeError(':(') },
    { a: new TypeError(':(') },
  ],
}
