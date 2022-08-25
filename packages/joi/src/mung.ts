import Joi from 'joi'

const v = Joi.object({
  foo: Joi.string(),
})

Joi.assert(null, v)
