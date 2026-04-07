import { TestData } from '../../src/types.js'
import * as T from '../source/import.a.js'

export const A: TestData<T.A> = {
  success: [{ foo: 'bar', schema: {} }],
  failure: ['foo', 1, true, null, undefined, [], {}],
}
