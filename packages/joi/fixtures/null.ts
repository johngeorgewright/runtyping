import Joi from 'joi';

export const A = Joi.valid(null).required();
export const B = Joi.alternatives().try(Joi.valid(null).required(), Joi.string().required(),).required();
export const C = Joi.object({ a: Joi.valid(null).required(), b: Joi.alternatives().try(Joi.valid(null).required(), Joi.string().required(),).required(), c: Joi.alternatives().try(Joi.valid(null).required(), Joi.string().required(), Joi.valid(null).required(),).required().optional(), }).required();
