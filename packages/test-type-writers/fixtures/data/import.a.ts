import { TestData } from '../../src/types'
import * as T from '../source/import.a'

export const A: TestData<T.A> = {
  success: [{ foo: 'bar', schema: {} }],
  failure: ['foo', 1, true, null, undefined, [], {}],
}
