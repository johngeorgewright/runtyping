import Joi from 'joi';

export const A = Joi.array().ordered(Joi.number().required().required(), Joi.string().required().required(), Joi.number().required().required(),).required();
export const B = Joi.array().ordered(A.required(), A.required(),).required();
export const C = Joi.array().max(0);
