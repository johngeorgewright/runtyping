import { TypeOf, number } from 'io-ts';

export const A = number;

export type A = TypeOf<typeof A>;
