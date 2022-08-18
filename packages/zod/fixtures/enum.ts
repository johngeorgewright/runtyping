import { infer as Infer, literal, nativeEnum, string } from 'zod';
import { A as _A, B as _B, C as _C, E as _E } from '../../../.yarn/__virtual__/@runtyping-test-type-writers-virtual-f1a80c3a62/1/packages/test-type-writers/fixtures/source/enum';

export const A = nativeEnum(_A);

export type A = Infer<typeof A>;

export const B = nativeEnum(_B);

export type B = Infer<typeof B>;

export const C = nativeEnum(_C);

export type C = Infer<typeof C>;

export const D = literal(_C.A3).or(literal(_C.B3));

export type D = Infer<typeof D>;

export const F = string().or(literal(_E.S));

export type F = Infer<typeof F>;

export const G = literal(_C.A3).or(literal(_C.B3)).or(literal(_C.C3)).or(literal(_E.S));

export type G = Infer<typeof G>;
