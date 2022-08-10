import { TestData } from '../../src/types'
import * as T from '../source/record'

export const A: TestData<T.A> = {
  success: [{ foo: 'foo' }, {}],
  failure: [{ foo: 1 }, { foo: null }],
}
