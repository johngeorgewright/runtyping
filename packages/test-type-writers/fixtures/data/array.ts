import { TestData } from '../../src/types.js'
import * as T from '../source/array.js'

export const B: TestData<T.B> = {
  success: [
    [],
    [1, 2, 3],
    ['one', 'two', 'three'],
    [1, 'two', 3],
    [{ foo: 'bar' }, { foo: 'baz' }],
    [{ foo: 'bar' }, 1, 2],
  ],
  failure: [[1, undefined, 'three'], { foo: 'bar' }, 1],
}
