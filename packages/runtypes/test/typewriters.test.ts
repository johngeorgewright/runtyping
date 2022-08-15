import testTypeWriters from '@runtyping/test-type-writers'
import assertNever from 'assert-never'
import { Number, Record, Runtype, String } from 'runtypes'
import RuntypesTypeWriters from '../src/RuntypesTypeWriters'

testTypeWriters<Runtype>({
  createValidator(dataArg) {
    if (dataArg === 'String') return String
    else if (dataArg === 'Number') return Number
    else if (typeof dataArg === 'object')
      return Record(
        Object.fromEntries(
          Object.entries(dataArg).map(([key, value]) => [
            key,
            this.createValidator(value),
          ])
        )
      )
    else return assertNever(dataArg)
  },

  typeWriters: new RuntypesTypeWriters(),

  validate(validator, data) {
    validator.check(data)
  },
})
