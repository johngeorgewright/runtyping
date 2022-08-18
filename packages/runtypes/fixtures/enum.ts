import { Guard, Literal, Static, String } from 'runtypes';
import { A as _A, B as _B, C as _C, E as _E } from '../../../.yarn/__virtual__/@runtyping-test-type-writers-virtual-f1a80c3a62/1/packages/test-type-writers/fixtures/source/enum';

export const A = Guard((x: any): x is _A => Object.values(_A).includes(x));

export type A = Static<typeof A>;

export const B = Guard((x: any): x is _B => Object.values(_B).includes(x));

export type B = Static<typeof B>;

export const C = Guard((x: any): x is _C => Object.values(_C).includes(x));

export type C = Static<typeof C>;

export const D = Literal(_C.A3).Or(Literal(_C.B3));

export type D = Static<typeof D>;

export const F = String.Or(Literal(_E.S));

export type F = Static<typeof F>;

export const G = Literal(_C.A3).Or(Literal(_C.B3)).Or(Literal(_C.C3)).Or(Literal(_E.S));

export type G = Static<typeof G>;
