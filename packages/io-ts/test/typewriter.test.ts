import testTypeWriter from '@runtyping/test-type-writers'
import * as t from 'io-ts'
import IoTsTypeWriters from '../src/IoTsTypeWriters'
import { fold } from 'fp-ts/lib/Either'
import { pipe } from 'fp-ts/lib/function'

testTypeWriter<t.Type<any>>({
  createNumberValidator: () => t.number,
  createStringValidator: () => t.string,
  createObjectValidator: t.type,

  ignore: [
    // TODO: implement advanced version of variadic tuples
    'variadicTuples.B',
    'variadicTuples.C',
    'variadicTuples.D',
  ],

  typeWriters: new IoTsTypeWriters(),

  validate(validator, data) {
    pipe(
      validator.decode(data),
      fold(
        (errors) => {
          throw new Error(errors.map((error) => error.message).join('\n'))
        },
        () => {}
      )
    )
  },
})
