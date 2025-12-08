import testTypeWriters from '@runtyping/test-type-writers'
import { Number, Object, Runtype, String } from 'runtypes'
import RuntypesTypeWriters from '../src/RuntypesTypeWriters'

testTypeWriters<Runtype.Base<any>>({
  createNumberValidator: () => Number,
  createStringValidator: () => String,
  createObjectValidator: Object,
  ignore: ['transformer'],
  typeWriters: new RuntypesTypeWriters(),
  validate(validator, data) {
    validator.check(data)
  },
})
