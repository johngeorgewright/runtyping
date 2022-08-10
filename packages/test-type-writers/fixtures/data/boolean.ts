import { TestData } from '../../src/types'
import * as T from '../source/boolean'

export const A: TestData<T.A> = {
  success: [true, false],
  failure: [1, 'true', 'false', null, undefined, {}, []],
}
