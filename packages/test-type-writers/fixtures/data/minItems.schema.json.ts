import { TestData } from '../../src/types'

export const ExampleSchema: TestData<{ testArray: object[] }> = {
  success: [
    { testArray: [{}, {}] },
    { testArray: [{}, { foo: 'bar' }] },
    { testArray: [{}, { foo: 'bar' }, {}] },
  ],
  failure: [{ testArray: [] }, { testArray: [{}] }],
}
