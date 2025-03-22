import { enum as Enum, InferOutput, literal, string, union } from 'valibot';
import { A as _A, B as _B, C as _C, E as _E } from '../../../.yarn/__virtual__/@runtyping-test-type-writers-virtual-f1a80c3a62/1/packages/test-type-writers/fixtures/source/enum';

// This file is generated by runtyping (https://github.com/johngeorgewright/runtyping).
// Manual changes might be lost - proceed with caution!
export const A = Enum(_A);

export type A = InferOutput<typeof A>;

export const B = Enum(_B);

export type B = InferOutput<typeof B>;

export const C = Enum(_C);

export type C = InferOutput<typeof C>;

export const D = union([literal(_C.A3), literal(_C.B3)]);

export type D = InferOutput<typeof D>;

export const F = union([string(), literal(_E.S)]);

export type F = InferOutput<typeof F>;

export const G = union([literal(_C.A3), literal(_C.B3), literal(_C.C3), literal(_E.S)]);

export type G = InferOutput<typeof G>;
