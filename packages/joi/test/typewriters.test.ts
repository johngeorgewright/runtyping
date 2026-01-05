import testTypeWriters from '@runtyping/test-type-writers'
import TypeWriters from '../src/TypeWriters'
import { assert, number, object, string, type AnySchema } from 'joi'

testTypeWriters<AnySchema>({
  createNumberValidator: number,
  createStringValidator: string,
  createObjectValidator: object,
  typeWriters: new TypeWriters(),
  validate(validator, data) {
    assert(data, validator)
  },
})
