import { Static, Record, String } from 'runtypes';

export const A = Record({ foo: String, });

export type A = Static<typeof A>;

export const B = Record({ bar: String, });

export type B = Static<typeof B>;

export const C = A.And(B);

export type C = Static<typeof C>;
