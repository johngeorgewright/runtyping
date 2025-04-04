import { boolean, function as func, InferOutput, literal, number, object, string } from 'valibot';

// This file is generated by runtyping (https://github.com/johngeorgewright/runtyping).
// Manual changes might be lost - proceed with caution!
export const A = object({ foo: string(), bar: number(), [`has spaces`]: boolean(), [`+1`]: boolean(), [`-1`]: boolean(), __underscores__: boolean(), $dollar: boolean(), [`\${escaped template vars}`]: boolean(), });

export type A = InferOutput<typeof A>;

export const B = object({ a: A, b: literal("B"), });

export type B = InferOutput<typeof B>;

export const C = object({ foo: func(), bar: number(), boo: func(), });

export type C = InferOutput<typeof C>;
