import Joi from 'joi';

export const ExampleSchema = Joi.object({ testArray: Joi.alternatives().try(Joi.array().ordered(Joi.any()Joi.any()).items(Joi.any())), Joi.valid(null).required(), ).required().optional(),}).required();
