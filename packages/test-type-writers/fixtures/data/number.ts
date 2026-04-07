import { TestData } from '../../src/types.js'
import * as T from '../source/number.js'

export const A: TestData<T.A> = {
  success: [1],
  failure: [null, 'foo', undefined],
}
