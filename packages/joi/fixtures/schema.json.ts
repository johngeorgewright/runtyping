import Joi from 'joi';

export const ExampleSchema = Joi.object({ firstName: Joi.string().required(), lastName: Joi.string().required(), age: Joi.alternatives().try(Joi.number().required(), Joi.valid(null).required(),).required().optional(), hairColor: Joi.alternatives().try(Joi.valid("black").required(), Joi.valid("brown").required(), Joi.valid("blue").required(), Joi.valid(null).required(),).required().optional(), }).required();
