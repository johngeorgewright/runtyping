import assertNever from 'assert-never'
import testTypeWriters from '@runtyping/test-type-writers'
import { z } from 'zod'
import ZodTypeWriters from '../src/ZodTypeWriters'

testTypeWriters<z.ZodTypeAny>({
  createValidator(dataArg) {
    if (dataArg === 'String') return z.string()
    else if (dataArg === 'Number') return z.number()
    else if (typeof dataArg === 'object')
      return z.object(
        Object.fromEntries(
          Object.entries(dataArg).map(([key, value]) => [
            key,
            this.createValidator(value),
          ])
        )
      )
    else return assertNever(dataArg)
  },

  typeWriters: new ZodTypeWriters(),

  validate(validator, data) {
    validator.parse(data)
  },
})
