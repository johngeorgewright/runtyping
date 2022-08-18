import { Function, TypeOf } from 'io-ts';

export const A = Function;

export type A = TypeOf<typeof A>;
