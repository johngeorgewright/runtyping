import testTypeWriters from '@runtyping/test-type-writers'
import TypeWriters from '../src/TypeWriters.js'
import { object, type Schema } from 'yup'
import { number, string } from '../src/index.js'

testTypeWriters<Schema>({
  createNumberValidator: number,
  createStringValidator: string,
  createObjectValidator: object,
  typeWriters: new TypeWriters(),
  validate(validator, data) {
    validator.validateSync(data)
  },
})
