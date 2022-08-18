import { Boolean, Function, Literal, Number, Record, Static, String } from 'runtypes';

export const A = Record({ foo: String, bar: Number, [`has spaces`]: Boolean, [`+1`]: Boolean, [`-1`]: Boolean, __underscores__: Boolean, $dollar: Boolean, [`\${escaped template vars}`]: Boolean, });

export type A = Static<typeof A>;

export const B = Record({ a: A, b: Literal("B"), });

export type B = Static<typeof B>;

export const C = Record({ foo: Function, bar: Number, boo: Function, });

export type C = Static<typeof C>;
