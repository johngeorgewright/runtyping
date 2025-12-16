import testTypeWriters from '@runtyping/test-type-writers'
import TypeWriters from '../src/TypeWriters'
import { object, type Schema } from 'yup'
import { number, string } from '../src'

testTypeWriters<Schema>({
  createNumberValidator: number,
  createStringValidator: string,
  createObjectValidator: object,
  typeWriters: new TypeWriters(),
  validate(validator, data) {
    validator.validateSync(data)
  },
})
