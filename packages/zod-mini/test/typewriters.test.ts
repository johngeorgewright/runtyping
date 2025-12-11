import testTypeWriters from '@runtyping/test-type-writers'
import { z } from 'zod'
import ZodMiniTypeWriters from '../src/ZodMiniTypeWriters'

testTypeWriters<z.ZodTypeAny>({
  createNumberValidator: z.number,
  createStringValidator: z.string,
  createObjectValidator: z.strictObject,
  typeWriters: new ZodMiniTypeWriters(),
  validate(validator, data) {
    return validator.parse(data)
  },
})
