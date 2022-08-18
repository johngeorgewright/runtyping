import { TypeOf, tuple, string } from 'io-ts';

export const A = tuple([string,]);

export type A = TypeOf<typeof A>;
