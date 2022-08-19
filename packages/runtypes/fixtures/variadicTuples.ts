import { A as _A, B as _B, C as _C, D as _D, E as _E } from '../../../.yarn/__virtual__/@runtyping-test-type-writers-virtual-f1a80c3a62/1/packages/test-type-writers/fixtures/source/variadicTuples';
import { Array, Boolean, Number, Static, String, Unknown } from 'runtypes';

export const A = Array(Unknown).withConstraint<_A>(data =>
  data.length >= 1 && String.guard(data[0]) && Array(String).guard(data.slice(1, undefined))
);

export type A = Static<typeof A>;

export const B = Array(Unknown).withConstraint<_B>(data =>
  data.length >= 2 && String.guard(data[0]) && Number.guard(data[1]) && Array(Number).guard(data.slice(2, undefined))
);

export type B = Static<typeof B>;

export const C = Array(Unknown).withConstraint<_C>(data =>
  data.length >= 1 && Array(String).guard(data.slice(0, -1)) && Number.guard(data.slice(-1)[0])
);

export type C = Static<typeof C>;

export const D = Array(Unknown).withConstraint<_D>(data =>
  data.length >= 2 && String.guard(data[0]) && Array(String).guard(data.slice(1, -1)) && String.guard(data.slice(-1)[0])
);

export type D = Static<typeof D>;

export const E = Array(Unknown).withConstraint<_E>(data =>
  data.length >= 5 && String.guard(data[0]) && Number.guard(data[1]) && Boolean.guard(data[2]) && Array(String).guard(data.slice(3, -2)) && Number.guard(data.slice(-2)[0]) && Boolean.guard(data.slice(-1)[0])
);

export type E = Static<typeof E>;
