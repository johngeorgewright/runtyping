import Joi from 'joi';

export const ExampleSchema = Joi.object({ testArray: Joi.alternatives().try(Joi.array().max(0), Joi.array().ordered(Joi.any().required(),).required(), Joi.array().ordered(Joi.any().required(), Joi.any().required(),).required(), Joi.valid(null).required(),).required().optional(), }).required();
