import { TestData } from '../../src/types'

export const ExampleSchema: TestData<{ testArray: Array<object> }> = {
  success: [
    { testArray: [] },
    { testArray: [{}] },
    { testArray: [{}, {}] },
    { testArray: [{}, { foo: 'bar' }] },
  ],
  failure: [
    { testArray: [{}, { foo: 'bar' }, { foo: 'bar' }] },
    { testArray: [[]] },
  ],
}
