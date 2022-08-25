import Joi from 'joi';

export const A = Joi.valid("foo").required();
export const B = Joi.valid(2).required();
export const C = Joi.valid(true).required();
