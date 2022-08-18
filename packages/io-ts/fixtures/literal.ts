import { literal, TypeOf } from 'io-ts';

export const A = literal("foo");

export type A = TypeOf<typeof A>;

export const B = literal(2);

export type B = TypeOf<typeof B>;

export const C = literal(true);

export type C = TypeOf<typeof C>;
