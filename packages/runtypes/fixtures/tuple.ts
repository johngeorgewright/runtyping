import { Number, Static, String, Tuple } from 'runtypes';

export const A = Tuple(Number, String, Number,);

export type A = Static<typeof A>;

export const B = Tuple(A, A,);

export type B = Static<typeof B>;

export const C = Tuple();

export type C = Static<typeof C>;
