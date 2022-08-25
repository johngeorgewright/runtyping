import Joi from 'joi';

export const A = Joi.object({ a: Joi.any(), }).required();
