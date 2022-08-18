import { array, number, string, type, TypeOf, union } from 'io-ts';

export const A = type({ foo: string, });

export type A = TypeOf<typeof A>;

export const B = array(union([string, number, A,]));

export type B = TypeOf<typeof B>;
