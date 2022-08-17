import testTypeWriters from '@runtyping/test-type-writers'
import { z } from 'zod'
import ZodTypeWriters from '../src/ZodTypeWriters'

testTypeWriters<z.ZodTypeAny>({
  createNumberValidator: z.number,
  createStringValidator: z.string,
  createObjectValidator: z.strictObject,
  typeWriters: new ZodTypeWriters(),
  validate(validator, data) {
    validator.parse(data)
  },

  ignore: [
    // TODO: implement advanced version of variadic tuples
    'variadicTuples.B',
    'variadicTuples.C',
    'variadicTuples.D',
  ],
})
