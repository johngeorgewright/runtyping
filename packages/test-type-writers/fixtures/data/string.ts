import { TestData } from '../../src/types.js'
import * as T from '../source/string.js'

export const A: TestData<T.A> = {
  success: ['foo'],
  failure: [null, 1, undefined],
}
