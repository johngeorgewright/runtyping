import { TestData } from '../../src/types.js'
import * as T from '../source/optional.js'

export const A: TestData<T.A> = {
  success: [{ foo: 'foo' }, {}],
  failure: [{ foo: 1 }, { foo: null }],
}
