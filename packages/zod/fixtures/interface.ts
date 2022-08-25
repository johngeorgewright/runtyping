import { boolean, function as func, infer as Infer, literal, number, object, string, void as Void } from 'zod';

export const A = object({ foo: string(), bar: number(), [`has spaces`]: boolean(), [`+1`]: boolean(), [`-1`]: boolean(), __underscores__: boolean(), $dollar: boolean(), [`\${escaped template vars}`]: boolean(), });

export type A = Infer<typeof A>;

export const B = object({ a: A, b: literal("B"), });

export type B = Infer<typeof B>;

export const C = object({ foo: func().args().returns(string()), bar: number(), boo: func().args(string(),).returns(Void()), });

export type C = Infer<typeof C>;
