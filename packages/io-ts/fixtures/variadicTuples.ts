import { TypeOf, tuple, string, number } from 'io-ts';

export const A = tuple([string,]);

export type A = TypeOf<typeof A>;

export const B = tuple([string, number,]);

export type B = TypeOf<typeof B>;

export const D = tuple([string,]);

export type D = TypeOf<typeof D>;
