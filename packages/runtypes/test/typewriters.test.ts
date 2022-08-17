import testTypeWriters from '@runtyping/test-type-writers'
import { Number, Record, Runtype, String } from 'runtypes'
import RuntypesTypeWriters from '../src/RuntypesTypeWriters'

testTypeWriters<Runtype>({
  createNumberValidator: () => Number,
  createStringValidator: () => String,
  createObjectValidator: Record,
  typeWriters: new RuntypesTypeWriters(),
  validate(validator, data) {
    validator.check(data)
  },

  ignore: [
    // TODO: implement advanced version of variadic tuples
    'variadicTuples.B',
    'variadicTuples.C',
    'variadicTuples.D',
  ],
})
