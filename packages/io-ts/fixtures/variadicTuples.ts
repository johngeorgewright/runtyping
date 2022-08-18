import { TypeOf, tuple, string, number } from 'io-ts';

export const A = tuple([string, string,]);

export type A = TypeOf<typeof A>;

export const B = tuple([string, number, number,]);

export type B = TypeOf<typeof B>;

export const D = tuple([string, string,]);

export type D = TypeOf<typeof D>;
