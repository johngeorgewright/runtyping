import { TestData } from '../../src/types'

export const ExampleSchema: TestData<{
  firstName: string
  lastName: string
  age?: number
  hairColor?: 'black' | 'brown' | 'blue'
}> = {
  success: [
    { firstName: 'John', lastName: 'Doe' },
    { firstName: 'John', lastName: 'Doe', age: 30, hairColor: 'black' },
  ],
  failure: [
    { firstName: 'John', age: 30 },
    { lastName: 'Doe', age: 30 },
    { firstName: 'John', lastName: 'Doe', hairColor: 'blonde' },
    { firstName: 'John', lastName: 'Doe', age: '30' },
  ],
}
