import { TestData } from '../../src/types.js'
import * as T from '../source/builtin.js'

export const A: TestData<T.A> = {
  success: [{ a: new ReferenceError(':)') }],
  failure: [
    { a: [1, 2, 3] },
    { b: new RangeError(':(') },
    { a: new TypeError(':(') },
  ],
}
