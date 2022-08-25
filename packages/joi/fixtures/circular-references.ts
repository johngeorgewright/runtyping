import Joi from 'joi';

export const Student = Joi.any();
export const Teacher = Joi.any();
export const User = Joi.alternatives().try(Student, Teacher,).required();
