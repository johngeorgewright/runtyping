import { TestData } from '../../src/types.js'
import * as T from '../source/boolean.js'

export const A: TestData<T.A> = {
  success: [true, false],
  failure: [1, 'true', 'false', null, undefined, {}, []],
}
