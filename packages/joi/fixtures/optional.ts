import Joi from 'joi';

export const A = Joi.object({ foo: Joi.alternatives().try(Joi.string().required(), Joi.valid(null).required(),).required().optional(), }).required();
