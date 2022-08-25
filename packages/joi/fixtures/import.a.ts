import Joi from 'joi';

export const A = Joi.object({ foo: Joi.string().required(), }).required();
