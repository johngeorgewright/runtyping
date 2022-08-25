import Joi from 'joi';

export const C = Joi.object({ bar: Joi.string().required(), foo: Joi.string().required(), }).required();
export const D = Joi.object({ bar: Joi.number().required(), moo: Joi.string().required(), foo: Joi.number().required(), car: Joi.string().required(), }).required();
export const E = Joi.object({ imported: Joi.valid(true).required(), }).required();
