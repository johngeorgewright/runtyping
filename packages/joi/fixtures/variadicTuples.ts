import Joi from 'joi';

export const A = Joi.array().ordered(Joi.string().required()).items(Joi.string().required()));
export const B = Joi.array().ordered(Joi.string().required()Joi.number().required()).items(Joi.number().required()));
export const C = Joi.array().ordered().items(Joi.string().required()).ordered(Joi.number().required());
export const D = Joi.array().ordered(Joi.string().required()).items(Joi.string().required()).ordered(Joi.string().required());
export const E = Joi.array().ordered(Joi.string().required()Joi.number().required()Joi.valid(true, false).required()).items(Joi.string().required()).ordered(Joi.number().required()Joi.valid(true, false).required());
