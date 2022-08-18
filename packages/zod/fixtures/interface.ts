import { boolean, function as func, infer as Infer, literal, number, object, string } from 'zod';

export const A = object({ foo: string(), bar: number(), [`has spaces`]: boolean(), [`+1`]: boolean(), [`-1`]: boolean(), __underscores__: boolean(), $dollar: boolean(), [`\${escaped template vars}`]: boolean(), });

export type A = Infer<typeof A>;

export const B = object({ a: A, b: literal("B"), });

export type B = Infer<typeof B>;

export const C = object({ foo: func(), bar: number(), boo: func(), });

export type C = Infer<typeof C>;
