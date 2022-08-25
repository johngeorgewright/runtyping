import Joi from 'joi';

export const A = Joi.object({ foo: Joi.string().required(), }).required();
export const C = Joi.alternatives().match('all').try(A.append({ bar: Joi.string().required(), }),);
