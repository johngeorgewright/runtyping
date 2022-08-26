import { Array, Number, Record, Static, String } from 'runtypes';

export const A = Record({ foo: String, });

export type A = Static<typeof A>;

export const B = Array(String.Or(Number).Or(A));

export type B = Static<typeof B>;
