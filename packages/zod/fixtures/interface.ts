import { boolean, function as func, infer as Infer, literal, number, object, string } from 'zod';
import { boo as _boo, foo as _foo } from '../../../.yarn/__virtual__/@runtyping-test-type-writers-virtual-f1a80c3a62/1/packages/test-type-writers/fixtures/source/interface';

export const A = object({ foo: string(), bar: number(), [`has spaces`]: boolean(), [`+1`]: boolean(), [`-1`]: boolean(), __underscores__: boolean(), $dollar: boolean(), [`\${escaped template vars}`]: boolean(), });

export type A = Infer<typeof A>;

export const B = object({ a: A, b: literal("B"), });

export type B = Infer<typeof B>;

export const C = object({ foo: func(), bar: number(), boo: func(), });

export type C = Infer<typeof C>;
