import { TestData } from '../../src/types.js'

export const ExampleSchema: TestData<{ testArray: object[] }> = {
  success: [
    { testArray: [{}, {}] },
    { testArray: [{}, { foo: 'bar' }] },
    { testArray: [{}, { foo: 'bar' }, {}] },
  ],
  failure: [{ testArray: [] }, { testArray: [{}] }],
}
