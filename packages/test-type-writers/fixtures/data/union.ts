import { TestData } from '../../src/types.js'
import * as T from '../source/union.js'

export const C: TestData<T.C> = {
  success: [1, 'foo'],
  failure: [null, undefined],
}
