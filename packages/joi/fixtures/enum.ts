import { A as _A, B as _B, C as _C, E as _E } from '../../../.yarn/__virtual__/@runtyping-test-type-writers-virtual-f1a80c3a62/1/packages/test-type-writers/fixtures/source/enum';
import Joi from 'joi';

export const A = Joi.alternatives().try(...Object.values(_A));
export const B = Joi.alternatives().try(...Object.values(_B));
export const C = Joi.alternatives().try(...Object.values(_C));
export const D = Joi.alternatives().try(Joi.valid(_C.A3).required(), Joi.valid(_C.B3).required(),).required();
export const F = Joi.alternatives().try(Joi.string().required(), Joi.valid(_E.S).required(),).required();
export const G = Joi.alternatives().try(Joi.valid(_C.A3).required(), Joi.valid(_C.B3).required(), Joi.valid(_C.C3).required(), Joi.valid(_E.S).required(),).required();
