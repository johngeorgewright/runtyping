import Joi from 'joi';

export const A = Joi.object({ foo: Joi.string().required(), bar: Joi.number().required(), [`has spaces`]: Joi.valid(true, false).required(), [`+1`]: Joi.valid(true, false).required(), [`-1`]: Joi.valid(true, false).required(), __underscores__: Joi.valid(true, false).required(), $dollar: Joi.valid(true, false).required(), [`\${escaped template vars}`]: Joi.valid(true, false).required(), }).required();
export const B = Joi.object({ a: A, b: Joi.valid("B").required(), }).required();
export const C = Joi.object({ foo: Joi.function(), bar: Joi.number().required(), boo: Joi.function(), }).required();
