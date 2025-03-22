import testTypeWriter from '@runtyping/test-type-writers'
import { number, object, parse, string } from 'valibot'
import ValibotTypeWriters from '../src/ValibotTypeWriters'

testTypeWriter({
  createNumberValidator: number,
  createStringValidator: string,
  createObjectValidator: object,
  typeWriters: new ValibotTypeWriters(),
  validate: parse,
})
