import Joi from 'joi';

export namespace A {
  export const B = Joi.object({ C: Joi.string().required(), }).required();
  export const C = Joi.any();
  export const D = Joi.object({ E: Joi.number().required(), }).required();
}

export namespace B {
  export namespace C {
    export const D = Joi.number().required();
  }
}
