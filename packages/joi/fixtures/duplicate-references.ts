import Joi from 'joi';

export const FooType = Joi.alternatives().try(Joi.valid(null).required(), Joi.string().required(),).required();
export const HorseType = Joi.object({ a: FooType, b: FooType, }).required();
