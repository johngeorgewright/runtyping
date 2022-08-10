import { TestData } from '../../src/types'
import * as T from '../source/optional'

export const A: TestData<T.A> = {
  success: [{ foo: 'foo' }, {}],
  failure: [{ foo: 1 }, { foo: null }],
}
