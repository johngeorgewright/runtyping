import testTypeWriter from '@runtyping/test-type-writers'
import Joi from 'joi'
import JoiTypeWriters from '../src/JoiTypeWriters'

testTypeWriter<Joi.Schema>({
  createNumberValidator: () => Joi.number(),
  createStringValidator: () => Joi.string(),
  createObjectValidator: (shape) => Joi.object(shape),
  typeWriters: new JoiTypeWriters(),
  validate(validator, data) {
    Joi.assert(data, validator)
  },
})
