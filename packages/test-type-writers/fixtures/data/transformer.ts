import { TestData } from '../../src/types.js'
import * as T from '../source/transformer.js'

export const TransformStringToNumber: TestData<T.TransformStringToNumber> = {
  success: ['123'],
  failure: [123],
}
