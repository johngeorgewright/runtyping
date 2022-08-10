import { TestData } from '../../src/types'
import * as T from '../source/union'

export const C: TestData<T.C> = {
  success: [1, 'foo'],
  failure: [null, undefined],
}
