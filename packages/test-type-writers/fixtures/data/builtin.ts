import { TestData } from '../../src/types'
import * as T from '../source/builtin'

export const A: TestData<T.A> = {
  success: [{ a: new Uint8Array([1, 2, 3]) }],
  failure: [
    { a: [1, 2, 3] },
    { b: new Uint8Array([1, 2, 3]) },
    { a: new Uint16Array([1, 2, 3]) },
  ],
}
