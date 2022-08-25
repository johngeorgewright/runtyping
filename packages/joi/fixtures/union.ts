import Joi from 'joi';

export const C = Joi.alternatives().try(Joi.string().required(), Joi.number().required(),).required();
