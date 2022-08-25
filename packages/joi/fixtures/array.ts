import Joi from 'joi';

export const A = Joi.object({ foo: Joi.string().required(), }).required();
export const B = Joi.array().items(Joi.alternatives().try(Joi.string().required(), Joi.number().required(), A,).required();
