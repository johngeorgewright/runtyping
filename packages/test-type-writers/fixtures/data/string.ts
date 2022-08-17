import { TestData } from '../../src/types'
import * as T from '../source/string'

export const A: TestData<T.A> = {
  success: ['foo'],
  failure: [null, 1, undefined],
}
