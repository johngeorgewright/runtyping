import { TestData } from '../../src/types'
import * as T from '../source/transformer'

export const TransformStringToNumber: TestData<T.TransformStringToNumber> = {
  success: ['123'],
  failure: [123],
}
