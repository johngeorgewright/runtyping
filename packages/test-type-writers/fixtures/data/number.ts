import { TestData } from '../../src/types'
import * as T from '../source/number'

export const A: TestData<T.A> = {
  success: [1],
  failure: [null, 'foo', undefined],
}
