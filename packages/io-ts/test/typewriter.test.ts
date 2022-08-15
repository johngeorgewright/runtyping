import assertNever from 'assert-never'
import testTypeWriter from '@runtyping/test-type-writers'
import * as t from 'io-ts'
import IoTsTypeWriters from '../src/IoTsTypeWriters'
import { fold } from 'fp-ts/lib/Either'
import { pipe } from 'fp-ts/lib/function'

testTypeWriter<t.Type<any>>({
  createValidator(dataArg) {
    if (dataArg === 'String') return t.string
    else if (dataArg === 'Number') return t.number
    else if (typeof dataArg === 'object')
      return t.type(
        Object.fromEntries(
          Object.entries(dataArg).map(([key, value]) => [
            key,
            this.createValidator(value),
          ])
        )
      )
    else return assertNever(dataArg)
  },

  // Tuples are broken in io-ts. https://github.com/gcanti/io-ts/issues/503
  ignore: ['tuple.A', 'tuple.B'],

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
